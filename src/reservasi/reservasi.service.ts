import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { Reservasi } from '../entities/reservasi.entity';
import { Space } from '../entities/space.entity';
import { Diskon } from '../entities/diskon.entity';
import { CreateReservasiDto } from './dto/create-reservasi.dto';
import { UpdateReservasiDto } from './dto/update-reservasi.dto';

interface ReportQueryResult {
  total_pendapatan: string | null;
  total_transaksi: string | null;
}

@Injectable()
export class ReservasiService {
  constructor(
    @InjectRepository(Reservasi)
    private readonly resRepo: Repository<Reservasi>,
    @InjectRepository(Space)
    private readonly spaceRepo: Repository<Space>,
    @InjectRepository(Diskon)
    private readonly diskonRepo: Repository<Diskon>,
  ) {}

  // 1. Buat Reservasi Baru
  async create(dto: CreateReservasiDto, memberId: number, makerKey: string) {
    const space = await this.spaceRepo.findOne({
      where: { id: dto.id_space, makerKey },
    });
    if (!space) throw new BadRequestException('Space tidak ditemukan!');

    // Hitung Jam Selesai
    const [h, m] = dto.jam_mulai.split(':').map(Number);
    const endHour = h + dto.durasi_jam;
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
    const total_harga_awal = space.harga_per_jam * dto.durasi_jam;
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
      durasi_jam: dto.durasi_jam,
      harga_per_jam: space.harga_per_jam,
      total_harga_awal,
      potongan_diskon,
      total_bayar,
      status: 'belum_dikonfirm',
      makerKey,
    });

    return await this.resRepo.save(reservasi);
  }

  // 2. Ambil Semua Daftar Reservasi (Filter berdasarkan App/Maker Key, opsional per member)
  async findAll(makerKey: string, memberId?: number) {
    const whereCondition: FindOptionsWhere<Reservasi> = { makerKey };
    if (memberId) {
      whereCondition.idMember = memberId;
    }

    return await this.resRepo.find({
      where: whereCondition,
      relations: {
        member: true,
        space: true,
      },
      order: { id: 'DESC' },
    });
  }

  // 3. Ambil Detail Reservasi Berdasarkan ID
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
    return reservasi;
  }

  // 4. Update Status (Konfirmasi, Check-In / Aktif, Selesai, Batal)
  async updateStatus(id: number, status: string, makerKey: string) {
    const validStatus = [
      'belum_dikonfirm',
      'disetujui',
      'aktif',
      'selesai',
      'dibatalkan',
    ];
    if (!validStatus.includes(status)) {
      throw new BadRequestException('Status tidak valid');
    }

    const reservasi = await this.findOne(id, makerKey);
    reservasi.status = status;
    return await this.resRepo.save(reservasi);
  }

  // 5. Update Reservasi Lengkap (Jadwal, Space, Diskon, dsb)
  async update(id: number, dto: UpdateReservasiDto, makerKey: string) {
    const reservasi = await this.findOne(id, makerKey);

    const spaceId = dto.id_space || reservasi.idSpace;
    const tanggalReservasi =
      dto.tanggal_reservasi || reservasi.tanggal_reservasi;
    const jamMulai = dto.jam_mulai || reservasi.jam_mulai;
    const durasiJam = dto.durasi_jam || reservasi.durasi_jam;

    const space = await this.spaceRepo.findOne({
      where: { id: spaceId, makerKey },
    });
    if (!space) throw new BadRequestException('Space tidak ditemukan!');

    // Hitung Jam Selesai
    const [h, m] = jamMulai.split(':').map(Number);
    const endHour = h + durasiJam;
    const jam_selesai = `${endHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

    // Cek Bentrok Jadwal
    if (
      dto.id_space ||
      dto.tanggal_reservasi ||
      dto.jam_mulai ||
      dto.durasi_jam
    ) {
      const overlap = await this.resRepo
        .createQueryBuilder('r')
        .where('r.id_space = :spaceId', { spaceId })
        .andWhere('r.tanggal_reservasi = :tgl', { tgl: tanggalReservasi })
        .andWhere('r.id != :resId', { resId: reservasi.id })
        .andWhere('r.status IN (:...st)', {
          st: ['belum_dikonfirm', 'disetujui', 'aktif'],
        })
        .andWhere('r.jam_mulai < :selesai AND r.jam_selesai > :mulai', {
          mulai: jamMulai,
          selesai: jam_selesai,
        })
        .getOne();

      if (overlap) {
        throw new BadRequestException(
          'Space tidak tersedia pada tanggal dan rentang jam tersebut!',
        );
      }
    }

    const total_harga_awal = space.harga_per_jam * durasiJam;
    let potongan_diskon = 0;
    let id_diskon: number | undefined =
      dto.id_diskon !== undefined ? dto.id_diskon : reservasi.idDiskon;

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
    } else if (reservasi.idDiskon) {
      const promo = await this.diskonRepo.findOne({
        where: { id: reservasi.idDiskon, makerKey },
      });
      if (promo) {
        potongan_diskon = (promo.persentase_diskon / 100) * total_harga_awal;
      }
    }

    const total_bayar = total_harga_awal - potongan_diskon;

    reservasi.idSpace = spaceId;
    reservasi.tanggal_reservasi = tanggalReservasi;
    reservasi.jam_mulai = jamMulai;
    reservasi.jam_selesai = jam_selesai;
    reservasi.durasi_jam = durasiJam;
    reservasi.harga_per_jam = space.harga_per_jam;
    reservasi.total_harga_awal = total_harga_awal;
    reservasi.potongan_diskon = potongan_diskon;
    reservasi.total_bayar = total_bayar;
    if (id_diskon !== undefined) reservasi.idDiskon = id_diskon;
    if (dto.status) reservasi.status = dto.status;

    return await this.resRepo.save(reservasi);
  }

  // 6. Hapus Reservasi
  async remove(id: number, makerKey: string) {
    const reservasi = await this.findOne(id, makerKey);
    await this.resRepo.remove(reservasi);
    return { message: 'Data reservasi berhasil dihapus', id };
  }

  // 7. Laporan Pendapatan & Statistik Admin
  async getReport(makerKey: string) {
    const totalStats = await this.resRepo
      .createQueryBuilder('r')
      .select('SUM(r.total_bayar)', 'total_pendapatan')
      .addSelect('COUNT(r.id)', 'total_transaksi')
      .where('r.maker_key = :makerKey', { makerKey })
      .andWhere('r.status IN (:...st)', { st: ['aktif', 'selesai'] })
      .getRawOne<ReportQueryResult>();

    const rincian = await this.resRepo.find({
      where: {
        makerKey,
        status: In(['aktif', 'selesai']),
      },
      relations: {
        member: true,
        space: true,
      },
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
