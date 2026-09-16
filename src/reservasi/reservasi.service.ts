import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservasi } from '../entities/reservasi.entity';
import { Space } from '../entities/space.entity';
import { Diskon } from '../entities/diskon.entity';
import { Member } from '../entities/member.entity';
import { SpaceOwner } from '../entities/space-owner.entity';
import { CreateReservasiDto } from './dto/create-reservasi.dto';
import { UpdateReservasiDto } from './dto/update-reservasi.dto';

@Injectable()
export class ReservasiService {
  constructor(
    @InjectRepository(Reservasi)
    private readonly resRepo: Repository<Reservasi>,
    @InjectRepository(Space)
    private readonly spaceRepo: Repository<Space>,
    @InjectRepository(Diskon)
    private readonly diskonRepo: Repository<Diskon>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(SpaceOwner)
    private readonly spaceOwnerRepo: Repository<SpaceOwner>,
  ) {}

  // 1. Buat Reservasi Baru
  async create(dto: CreateReservasiDto, memberId: number, makerKey: string) {
    const space = await this.spaceRepo.findOne({
      where: { id: dto.id_space, makerKey },
    });
    if (!space) throw new NotFoundException('Space tidak ditemukan!');

    // Hitung Jam Selesai
    const [h, m] = dto.jam_mulai.split(':').map(Number);
    const endHour = h + Number(dto.durasi_jam);
    const jam_selesai = `${endHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

    // Cek Bentrok Jadwal
    const overlap = await this.resRepo
      .createQueryBuilder('r')
      .where('r.id_space = :spaceId', { spaceId: space.id })
      .andWhere('r.tanggal_reservasi = :tgl', { tgl: dto.tanggal_reservasi })
      .andWhere('r.status IN (:...st)', {
        st: ['belum_dikonfirm', 'disetujui', 'aktif'],
      })
      .andWhere('r.jam_mulai < :selesai AND r.jam_selesai > :mulai', {
        mulai: dto.jam_mulai,
        selesai: jam_selesai,
      })
      .getOne();

    if (overlap) {
      throw new BadRequestException(
        'Space tidak tersedia pada tanggal dan rentang jam tersebut!',
      );
    }

    // Kalkulasi Harga & Diskon
    const total_harga_awal = space.harga_per_jam * Number(dto.durasi_jam);
    let potongan_diskon = 0;
    let id_diskon: number | undefined = dto.id_diskon || undefined;

    if (dto.kode_promo || dto.id_diskon) {
      const promo = await this.diskonRepo.findOne({
        where: dto.kode_promo
          ? { nama_diskon: dto.kode_promo, makerKey }
          : { id: dto.id_diskon, makerKey },
      });

      if (promo) {
        id_diskon = promo.id;
        potongan_diskon = (promo.persentase_diskon / 100) * total_harga_awal;
      }
    }

    const total_bayar = total_harga_awal - potongan_diskon;
    const kode_booking = `BOOK-${dto.tanggal_reservasi.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const reservasi = this.resRepo.create({
      kode_booking,
      idMember: memberId,
      idSpace: space.id,
      idDiskon: id_diskon,
      tanggal_reservasi: dto.tanggal_reservasi,
      jam_mulai: dto.jam_mulai,
      jam_selesai,
      durasi_jam: Number(dto.durasi_jam),
      harga_per_jam: space.harga_per_jam,
      total_harga_awal,
      potongan_diskon,
      total_bayar,
      status: 'belum_dikonfirm',
      makerKey,
    });

    const saved = await this.resRepo.save(reservasi);

    return {
      message: 'Reservasi berhasil dibuat! Silakan tunggu konfirmasi admin.',
      data: {
        id: saved.id,
        kode_booking: saved.kode_booking,
        id_member: saved.idMember,
        id_space: saved.idSpace,
        id_diskon: saved.idDiskon,
        tanggal_reservasi: saved.tanggal_reservasi,
        jam_mulai: saved.jam_mulai,
        jam_selesai: saved.jam_selesai,
        durasi_jam: saved.durasi_jam,
        harga_per_jam: saved.harga_per_jam,
        total_harga_awal: saved.total_harga_awal,
        potongan_diskon: saved.potongan_diskon,
        total_bayar: saved.total_bayar,
        status: saved.status,
        created_at: saved.createdAt,
      },
    };
  }

  // 2. Lihat Status Semua Pemesanan Milik Sendiri (Member)
  async findMyReservations(memberId: number, makerKey: string) {
    const list = await this.resRepo.find({
      where: { idMember: memberId, makerKey },
      relations: { space: true },
      order: { id: 'DESC' },
    });

    return list.map((r) => ({
      id: r.id,
      kode_booking: r.kode_booking,
      tanggal_reservasi: r.tanggal_reservasi,
      jam_mulai: r.jam_mulai,
      jam_selesai: r.jam_selesai,
      durasi_jam: r.durasi_jam,
      total_bayar: r.total_bayar,
      status: r.status,
      space: r.space
        ? {
            id: r.space.id,
            nama_space: r.space.nama_space,
            tipe: r.space.tipe,
          }
        : null,
    }));
  }

  // 3. Histori Pemesanan Berdasarkan Bulan & Tahun (Member)
  async findMyHistory(
    memberId: number,
    makerKey: string,
    month?: number,
    year?: number,
  ) {
    const qb = this.resRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.space', 'space')
      .where('r.id_member = :memberId', { memberId })
      .andWhere('r.maker_key = :makerKey', { makerKey });

    const selectedYear = year ? Number(year) : new Date().getFullYear();
    const selectedMonth = month ? Number(month) : new Date().getMonth() + 1;

    const monthStr = selectedMonth.toString().padStart(2, '0');
    const datePrefix = `${selectedYear}-${monthStr}`;

    qb.andWhere('r.tanggal_reservasi LIKE :datePrefix', {
      datePrefix: `${datePrefix}%`,
    });

    qb.orderBy('r.id', 'DESC');

    const items = await qb.getMany();
    const totalPengeluaran = items.reduce(
      (sum, item) => sum + item.total_bayar,
      0,
    );

    return {
      month: selectedMonth,
      year: selectedYear,
      total_reservasi: items.length,
      total_pengeluaran: totalPengeluaran,
      items: items.map((r) => ({
        id: r.id,
        kode_booking: r.kode_booking,
        tanggal_reservasi: r.tanggal_reservasi,
        jam_mulai: r.jam_mulai,
        jam_selesai: r.jam_selesai,
        durasi_jam: r.durasi_jam,
        total_bayar: r.total_bayar,
        status: r.status,
        space_name: r.space ? r.space.nama_space : 'Space',
      })),
    };
  }

  // 4. Cetak E-Ticket / Bukti Nota Digital Reservasi
  async getETicket(id: number, makerKey: string) {
    const reservasi = await this.resRepo.findOne({
      where: { id, makerKey },
      relations: {
        member: true,
        space: {
          owner: true,
        },
      },
    });

    if (!reservasi) {
      throw new NotFoundException('Data reservasi tidak ditemukan');
    }

    let diskonPromoText = '0%';
    if (reservasi.idDiskon) {
      const diskon = await this.diskonRepo.findOne({
        where: { id: reservasi.idDiskon },
      });
      if (diskon) {
        diskonPromoText = `${diskon.persentase_diskon}% (${diskon.nama_diskon})`;
      }
    }

    const spaceTypeLabel =
      reservasi.space?.tipe === 'desk'
        ? 'Personal Desk'
        : reservasi.space?.tipe === 'meeting_room'
          ? 'Meeting Room'
          : 'Private Office';

    const cleanDate = (reservasi.tanggal_reservasi || '')
      .toString()
      .replace(/-/g, '');
    const eTicketNumber = `TICKET-MOKLET-${cleanDate}-${reservasi.id.toString().padStart(4, '0')}`;

    return {
      message: 'E-Ticket berhasil dimuat',
      data: {
        e_ticket_number: eTicketNumber,
        kode_booking: reservasi.kode_booking,
        coworking_space: {
          nama:
            reservasi.space?.owner?.nama_coworking ||
            'Moklet Hub Coworking Space',
          telepon: reservasi.space?.owner?.telp || '081298765432',
        },
        member: {
          nama: reservasi.member?.nama_member || 'Member',
          instansi: reservasi.member?.instansi || '',
          telp: reservasi.member?.telp || '',
        },
        space: {
          nama: reservasi.space?.nama_space || 'Space',
          tipe: spaceTypeLabel,
          harga_per_jam: reservasi.harga_per_jam,
        },
        jadwal: {
          tanggal: reservasi.tanggal_reservasi,
          jam_mulai: reservasi.jam_mulai,
          jam_selesai: reservasi.jam_selesai,
          durasi: `${reservasi.durasi_jam} Jam`,
        },
        rincian_pembayaran: {
          tarif_kotor: reservasi.total_harga_awal,
          diskon_promo: diskonPromoText,
          potongan: reservasi.potongan_diskon,
          total_dibayar: reservasi.total_bayar,
        },
        status_reservasi: reservasi.status,
        qr_code_payload: `VERIFY-RESERVASI-${reservasi.id}-${reservasi.makerKey}`,
      },
    };
  }

  // 5. Lihat Detail Reservasi Berdasarkan ID
  async findOne(id: number, makerKey: string) {
    const reservasi = await this.resRepo.findOne({
      where: { id, makerKey },
      relations: {
        member: true,
        space: true,
      },
    });

    if (!reservasi) {
      throw new NotFoundException('Data reservasi tidak ditemukan');
    }

    return {
      id: reservasi.id,
      kode_booking: reservasi.kode_booking,
      id_member: reservasi.idMember,
      id_space: reservasi.idSpace,
      tanggal_reservasi: reservasi.tanggal_reservasi,
      jam_mulai: reservasi.jam_mulai,
      jam_selesai: reservasi.jam_selesai,
      durasi_jam: reservasi.durasi_jam,
      total_bayar: reservasi.total_bayar,
      status: reservasi.status,
      member: reservasi.member
        ? {
            nama_member: reservasi.member.nama_member,
            telp: reservasi.member.telp,
          }
        : null,
      space: reservasi.space
        ? {
            nama_space: reservasi.space.nama_space,
            harga_per_jam: reservasi.space.harga_per_jam,
          }
        : null,
    };
  }

  // 6. Batalkan Pemesanan (Member)
  async cancel(id: number, memberId: number, makerKey: string) {
    const reservasi = await this.resRepo.findOne({
      where: { id, idMember: memberId, makerKey },
    });

    if (!reservasi) {
      throw new NotFoundException('Data reservasi tidak ditemukan');
    }

    if (reservasi.status === 'selesai' || reservasi.status === 'dibatalkan') {
      throw new BadRequestException(
        `Reservasi dengan status '${reservasi.status}' tidak dapat dibatalkan!`,
      );
    }

    reservasi.status = 'dibatalkan';
    const saved = await this.resRepo.save(reservasi);

    return {
      message: 'Reservasi berhasil dibatalkan oleh pengguna',
      data: {
        id: saved.id,
        status: saved.status,
        updated_at: new Date().toISOString(),
      },
    };
  }

  // 7. Ambil Semua Reservasi (Bisa difilter)
  async findAll(makerKey: string, memberId?: number) {
    const where: any = { makerKey };
    if (memberId) where.idMember = memberId;

    return await this.resRepo.find({
      where,
      relations: { member: true, space: true },
      order: { id: 'DESC' },
    });
  }

  // 8. Update Status Umum
  async updateStatus(id: number, status: string, makerKey: string) {
    const reservasi = await this.resRepo.findOne({ where: { id, makerKey } });
    if (!reservasi) {
      throw new NotFoundException('Data reservasi tidak ditemukan');
    }
    reservasi.status = status;
    return await this.resRepo.save(reservasi);
  }

  // 9. Update Reservasi Lengkap
  async update(id: number, dto: UpdateReservasiDto, makerKey: string) {
    const reservasi = await this.resRepo.findOne({ where: { id, makerKey } });
    if (!reservasi) {
      throw new NotFoundException('Data reservasi tidak ditemukan');
    }
    Object.assign(reservasi, dto);
    return await this.resRepo.save(reservasi);
  }

  // 10. Hapus Reservasi
  async remove(id: number, makerKey: string) {
    const reservasi = await this.resRepo.findOne({ where: { id, makerKey } });
    if (!reservasi) {
      throw new NotFoundException('Data reservasi tidak ditemukan');
    }
    await this.resRepo.remove(reservasi);
    return { message: 'Data reservasi berhasil dihapus', id, deleted: true };
  }

  // 11. Laporan Pendapatan Sederhana
  async getReport(makerKey: string) {
    const totalStats = await this.resRepo
      .createQueryBuilder('r')
      .select('SUM(r.total_bayar)', 'total_pendapatan')
      .addSelect('COUNT(r.id)', 'total_transaksi')
      .where('r.maker_key = :makerKey', { makerKey })
      .andWhere('r.status IN (:...st)', { st: ['aktif', 'selesai'] })
      .getRawOne();

    const rincian = await this.resRepo.find({
      where: { makerKey },
      relations: { member: true, space: true },
      order: { id: 'DESC' },
    });

    return {
      total_pendapatan: totalStats?.total_pendapatan
        ? parseFloat(totalStats.total_pendapatan)
        : 0,
      total_transaksi: totalStats?.total_transaksi
        ? parseInt(totalStats.total_transaksi, 10)
        : 0,
      rincian,
    };
  }
}
