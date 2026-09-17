import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Member } from '../entities/member.entity';
import { SpaceOwner } from '../entities/space-owner.entity';
import { Space } from '../entities/space.entity';
import { Diskon } from '../entities/diskon.entity';
import { Reservasi } from '../entities/reservasi.entity';
import { UpdateCoworkingProfileDto } from './dto/update-profile.dto';
import { CreateMemberAdminDto } from './dto/create-member-admin.dto';
import { UpdateMemberAdminDto } from './dto/update-member-admin.dto';
import { CreateSpaceDto } from '../spaces/dto/create-space.dto';
import { UpdateSpaceDto } from '../spaces/dto/update-space.dto';
import { CreateDiskonDto } from '../diskon/dto/create-diskon.dto';
import { UpdateDiskonDto } from '../diskon/dto/update-diskon.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Member) private readonly memberRepo: Repository<Member>,
    @InjectRepository(SpaceOwner)
    private readonly spaceOwnerRepo: Repository<SpaceOwner>,
    @InjectRepository(Space) private readonly spaceRepo: Repository<Space>,
    @InjectRepository(Diskon) private readonly diskonRepo: Repository<Diskon>,
    @InjectRepository(Reservasi)
    private readonly resRepo: Repository<Reservasi>,
  ) {}

  // 1. Profil Lokasi Coworking Space
  async getProfile(userId: number) {
    let owner = await this.spaceOwnerRepo.findOne({
      where: { idUser: userId },
    });

    if (!owner) {
      // Fallback create default owner profile if none
      const user = await this.userRepo.findOne({ where: { id: userId } });
      owner = this.spaceOwnerRepo.create({
        idUser: userId,
        nama_coworking: 'Moklet Hub Coworking Space',
        nama_pemilik: user ? user.username : 'Admin Coworking',
        telp: '081298765432',
      });
      owner = await this.spaceOwnerRepo.save(owner);
    }

    return {
      id: owner.id,
      nama_coworking: owner.nama_coworking,
      nama_pemilik: owner.nama_pemilik,
      telp: owner.telp,
    };
  }

  async updateProfile(
    userId: number,
    dto: UpdateCoworkingProfileDto,
  ) {
    let owner = await this.spaceOwnerRepo.findOne({
      where: { idUser: userId },
    });

    if (!owner) {
      owner = this.spaceOwnerRepo.create({
        idUser: userId,
        ...dto,
      });
    } else {
      owner.nama_coworking = dto.nama_coworking;
      owner.nama_pemilik = dto.nama_pemilik;
      owner.telp = dto.telp;
    }

    const saved = await this.spaceOwnerRepo.save(owner);

    return {
      message: 'Profil Coworking Space berhasil diperbarui!',
      data: {
        id: saved.id,
        nama_coworking: saved.nama_coworking,
        nama_pemilik: saved.nama_pemilik,
        telp: saved.telp,
      },
    };
  }

  // 2. Manajemen Member / Pelanggan
  async getMembers(search?: string) {
    const qb = this.memberRepo
      .createQueryBuilder('m');

    if (search) {
      qb.where(
        '(m.nama_member LIKE :s OR m.instansi LIKE :s OR m.telp LIKE :s)',
        { s: `%${search}%` },
      );
    }

    qb.orderBy('m.id', 'ASC');

    const members = await qb.getMany();
    return members.map((m) => ({
      id: m.id,
      nama_member: m.nama_member,
      instansi: m.instansi,
      alamat: m.alamat,
      telp: m.telp,
      foto: m.foto,
      created_at: m.createdAt,
    }));
  }

  async createMember(dto: CreateMemberAdminDto) {
    const existing = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (existing) {
      throw new BadRequestException(
        'Username sudah digunakan oleh akun lain!',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      username: dto.username,
      password: hashedPassword,
      role: 'member',
    });
    const savedUser = await this.userRepo.save(user);

    const member = this.memberRepo.create({
      nama_member: dto.nama_member,
      instansi: dto.instansi,
      alamat: dto.alamat,
      telp: dto.telp,
      foto: dto.foto || '',
      idUser: savedUser.id,
    });
    const savedMember = await this.memberRepo.save(member);

    return {
      message: 'Data member baru berhasil ditambahkan!',
      data: {
        id: savedMember.id,
        nama_member: savedMember.nama_member,
        instansi: savedMember.instansi,
        alamat: savedMember.alamat,
        telp: savedMember.telp,
        foto: savedMember.foto,
      },
    };
  }

  async getMemberById(id: number) {
    const member = await this.memberRepo.findOne({
      where: { id },
    });
    if (!member) {
      throw new NotFoundException('Data member tidak ditemukan');
    }
    return {
      id: member.id,
      nama_member: member.nama_member,
      instansi: member.instansi,
      alamat: member.alamat,
      telp: member.telp,
      foto: member.foto,
    };
  }

  async updateMember(
    id: number,
    dto: UpdateMemberAdminDto,
  ) {
    const member = await this.memberRepo.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!member) {
      throw new NotFoundException('Data member tidak ditemukan');
    }

    if (dto.nama_member !== undefined) member.nama_member = dto.nama_member;
    if (dto.instansi !== undefined) member.instansi = dto.instansi;
    if (dto.alamat !== undefined) member.alamat = dto.alamat;
    if (dto.telp !== undefined) member.telp = dto.telp;
    if (dto.foto !== undefined) member.foto = dto.foto;

    if (dto.password && member.idUser) {
      const user = await this.userRepo.findOne({
        where: { id: member.idUser },
      });
      if (user) {
        user.password = await bcrypt.hash(dto.password, 10);
        await this.userRepo.save(user);
      }
    }

    const saved = await this.memberRepo.save(member);

    return {
      message: 'Data member berhasil diperbarui!',
      data: {
        id: saved.id,
        nama_member: saved.nama_member,
        instansi: saved.instansi,
        alamat: saved.alamat,
        telp: saved.telp,
      },
    };
  }

  async deleteMember(id: number) {
    const member = await this.memberRepo.findOne({
      where: { id },
    });
    if (!member) {
      throw new NotFoundException('Data member tidak ditemukan');
    }

    if (member.idUser) {
      await this.userRepo.delete({ id: member.idUser });
    } else {
      await this.memberRepo.remove(member);
    }

    return {
      message: 'Data member berhasil dihapus!',
      data: {
        id,
        deleted: true,
      },
    };
  }

  // 3. Manajemen Space Ruangan & Meja (Panel Admin)
  async getSpaces(baseUrl = 'http://localhost:3000') {
    const spaces = await this.spaceRepo.find({
      order: { id: 'ASC' },
    });

    return spaces.map((s) => ({
      id: s.id,
      nama_space: s.nama_space,
      harga_per_jam: s.harga_per_jam,
      tipe: s.tipe,
      kapasitas: s.kapasitas,
      foto: s.foto,
      foto_url: s.foto
        ? (s.foto.startsWith('http') ? s.foto : `${baseUrl}/uploads/spaces/${s.foto}`)
        : null,
    }));
  }

  async createSpace(
    dto: CreateSpaceDto,
    ownerId: number,
  ) {
    const space = this.spaceRepo.create({
      ...dto,
      idOwner: ownerId,
    });
    const saved = await this.spaceRepo.save(space);

    return {
      message: 'Space baru berhasil ditambahkan!',
      data: {
        id: saved.id,
        nama_space: saved.nama_space,
        harga_per_jam: saved.harga_per_jam,
        tipe: saved.tipe,
        kapasitas: saved.kapasitas,
        deskripsi: saved.deskripsi,
        foto: saved.foto,
        id_owner: saved.idOwner,
      },
    };
  }

  async getSpaceById(id: number, _baseUrl?: string) {
    const space = await this.spaceRepo.findOne({
      where: { id },
    });
    if (!space) {
      throw new NotFoundException('Space dengan ID tersebut tidak ditemukan!');
    }
    return {
      id: space.id,
      nama_space: space.nama_space,
      harga_per_jam: space.harga_per_jam,
      tipe: space.tipe,
      kapasitas: space.kapasitas,
      deskripsi: space.deskripsi,
      foto: space.foto,
    };
  }

  async updateSpace(id: number, dto: UpdateSpaceDto) {
    const space = await this.spaceRepo.findOne({ where: { id } });
    if (!space) {
      throw new NotFoundException('Space dengan ID tersebut tidak ditemukan!');
    }
    Object.assign(space, dto);
    const saved = await this.spaceRepo.save(space);

    return {
      message: 'Data space berhasil diperbarui!',
      data: {
        id: saved.id,
        nama_space: saved.nama_space,
        harga_per_jam: saved.harga_per_jam,
        tipe: saved.tipe,
        kapasitas: saved.kapasitas,
        deskripsi: saved.deskripsi,
      },
    };
  }

  async deleteSpace(id: number) {
    const space = await this.spaceRepo.findOne({ where: { id } });
    if (!space) {
      throw new NotFoundException('Space dengan ID tersebut tidak ditemukan!');
    }
    await this.spaceRepo.remove(space);
    return {
      message: 'Space berhasil dihapus!',
      data: {
        id,
        deleted: true,
      },
    };
  }

  // 4. Manajemen Kode Promo & Diskon (Panel Admin)
  async getDiskon() {
    const list = await this.diskonRepo.find({
      order: { id: 'ASC' },
    });
    return list.map((d) => ({
      id: d.id,
      nama_diskon: d.nama_diskon,
      persentase_diskon: d.persentase_diskon,
      tanggal_awal: d.tanggal_awal,
      tanggal_akhir: d.tanggal_akhir,
    }));
  }

  async createDiskon(dto: CreateDiskonDto) {
    const diskon = this.diskonRepo.create({
      ...dto,
      tanggal_awal: new Date(dto.tanggal_awal),
      tanggal_akhir: new Date(dto.tanggal_akhir),
    });
    const saved = await this.diskonRepo.save(diskon);

    return {
      message: 'Kode promo baru berhasil dibuat!',
      data: {
        id: saved.id,
        nama_diskon: saved.nama_diskon,
        persentase_diskon: saved.persentase_diskon,
        tanggal_awal: saved.tanggal_awal,
        tanggal_akhir: saved.tanggal_akhir,
      },
    };
  }

  async getDiskonById(id: number) {
    const diskon = await this.diskonRepo.findOne({ where: { id } });
    if (!diskon) {
      throw new NotFoundException('Data diskon tidak ditemukan');
    }
    return {
      id: diskon.id,
      nama_diskon: diskon.nama_diskon,
      persentase_diskon: diskon.persentase_diskon,
      tanggal_awal: diskon.tanggal_awal,
      tanggal_akhir: diskon.tanggal_akhir,
    };
  }

  async updateDiskon(id: number, dto: UpdateDiskonDto) {
    const diskon = await this.diskonRepo.findOne({ where: { id } });
    if (!diskon) {
      throw new NotFoundException('Data diskon tidak ditemukan');
    }
    if (dto.nama_diskon !== undefined) diskon.nama_diskon = dto.nama_diskon;
    if (dto.persentase_diskon !== undefined)
      diskon.persentase_diskon = dto.persentase_diskon;
    if (dto.tanggal_awal !== undefined)
      diskon.tanggal_awal = new Date(dto.tanggal_awal);
    if (dto.tanggal_akhir !== undefined)
      diskon.tanggal_akhir = new Date(dto.tanggal_akhir);

    const saved = await this.diskonRepo.save(diskon);

    return {
      message: 'Data promo diskon berhasil diperbarui!',
      data: {
        id: saved.id,
        nama_diskon: saved.nama_diskon,
        persentase_diskon: saved.persentase_diskon,
        tanggal_akhir: saved.tanggal_akhir,
      },
    };
  }

  async deleteDiskon(id: number) {
    const diskon = await this.diskonRepo.findOne({ where: { id } });
    if (!diskon) {
      throw new NotFoundException('Data diskon tidak ditemukan');
    }
    await this.diskonRepo.remove(diskon);
    return {
      message: 'Kode promo berhasil dihapus!',
      data: {
        id,
        deleted: true,
      },
    };
  }

  // 5. Transaksi Reservasi & Check-In / Check-Out
  async getReservasi(
    month?: number,
    year?: number,
    status?: string,
    id_space?: number,
    tanggal?: string,
  ) {
    const qb = this.resRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.member', 'member')
      .leftJoinAndSelect('r.space', 'space');

    if (month && year) {
      const monthStr = Number(month).toString().padStart(2, '0');
      qb.andWhere('r.tanggal_reservasi LIKE :datePattern', {
        datePattern: `${year}-${monthStr}%`,
      });
    } else if (year) {
      qb.andWhere('r.tanggal_reservasi LIKE :datePattern', {
        datePattern: `${year}-%`,
      });
    }

    if (status) {
      qb.andWhere('r.status = :status', { status });
    }

    if (id_space) {
      qb.andWhere('r.id_space = :id_space', { id_space });
    }

    if (tanggal) {
      qb.andWhere('r.tanggal_reservasi = :tanggal', { tanggal });
    }

    qb.orderBy('r.id', 'DESC');

    const list = await qb.getMany();

    return list.map((r) => ({
      id: r.id,
      kode_booking: r.kode_booking,
      tanggal_reservasi: r.tanggal_reservasi,
      jam_mulai: r.jam_mulai,
      jam_selesai: r.jam_selesai,
      durasi_jam: r.durasi_jam,
      total_harga_awal: r.total_harga_awal,
      potongan_diskon: r.potongan_diskon,
      total_bayar: r.total_bayar,
      status: r.status,
      member: r.member
        ? {
            id: r.member.id,
            nama_member: r.member.nama_member,
            telp: r.member.telp,
          }
        : null,
      space: r.space
        ? {
            id: r.space.id,
            nama_space: r.space.nama_space,
            tipe: r.space.tipe,
          }
        : null,
    }));
  }

  async updateReservasiStatus(id: number, status: string) {
    const reservasi = await this.resRepo.findOne({ where: { id } });
    if (!reservasi) {
      throw new NotFoundException('Data reservasi tidak ditemukan');
    }

    reservasi.status = status;
    const saved = await this.resRepo.save(reservasi);

    return {
      message: `Status reservasi berhasil diperbarui menjadi ${status}`,
      data: {
        id: saved.id,
        status: saved.status,
        updated_at: new Date().toISOString(),
      },
    };
  }

  async checkIn(id: number) {
    const reservasi = await this.resRepo.findOne({ where: { id } });
    if (!reservasi) {
      throw new NotFoundException('Data reservasi tidak ditemukan');
    }

    const checkInTime = new Date();
    reservasi.status = 'aktif';
    reservasi.checkInTime = checkInTime;

    const saved = await this.resRepo.save(reservasi);

    return {
      message: 'Check-in member berhasil! Status reservasi aktif.',
      data: {
        id: saved.id,
        status: saved.status,
        check_in_time: saved.checkInTime?.toISOString() || checkInTime.toISOString(),
      },
    };
  }

  async checkOut(id: number) {
    const reservasi = await this.resRepo.findOne({ where: { id } });
    if (!reservasi) {
      throw new NotFoundException('Data reservasi tidak ditemukan');
    }

    const checkOutTime = new Date();
    reservasi.status = 'selesai';
    reservasi.checkOutTime = checkOutTime;

    const saved = await this.resRepo.save(reservasi);

    return {
      message: 'Check-out member berhasil! Reservasi telah selesai.',
      data: {
        id: saved.id,
        status: saved.status,
        check_out_time: saved.checkOutTime?.toISOString() || checkOutTime.toISOString(),
      },
    };
  }

  // 6. Rekapitulasi Laporan Pendapatan Bulanan (Panel Admin)
  async getMonthlyReport(month?: number, year?: number) {
    const selectedYear = year ? Number(year) : new Date().getFullYear();
    const selectedMonth = month ? Number(month) : new Date().getMonth() + 1;
    const monthStr = selectedMonth.toString().padStart(2, '0');
    const datePrefix = `${selectedYear}-${monthStr}`;

    const qb = this.resRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.space', 'space')
      .where('r.tanggal_reservasi LIKE :datePrefix', {
        datePrefix: `${datePrefix}%`,
      });

    const list = await qb.getMany();

    const totalTransaksi = list.length;
    let totalJamTerpakai = 0;
    let estimasiPendapatanKotor = 0;
    let totalPotonganDiskon = 0;
    let realisasiPendapatanBersih = 0;

    const tipeSummary: Record<
      string,
      { label: string; total_booking: number; total_jam: number; total_pendapatan: number }
    > = {
      desk: {
        label: 'Personal Desk',
        total_booking: 0,
        total_jam: 0,
        total_pendapatan: 0,
      },
      meeting_room: {
        label: 'Meeting Room',
        total_booking: 0,
        total_jam: 0,
        total_pendapatan: 0,
      },
      private_office: {
        label: 'Private Office',
        total_booking: 0,
        total_jam: 0,
        total_pendapatan: 0,
      },
    };

    for (const r of list) {
      totalJamTerpakai += r.durasi_jam || 0;
      estimasiPendapatanKotor += r.total_harga_awal || 0;
      totalPotonganDiskon += r.potongan_diskon || 0;

      // Realisasi jika status aktif atau selesai (atau disetujui)
      if (r.status === 'aktif' || r.status === 'selesai' || r.status === 'disetujui') {
        realisasiPendapatanBersih += r.total_bayar || 0;
      }

      const spaceType = r.space?.tipe || 'desk';
      if (tipeSummary[spaceType]) {
        tipeSummary[spaceType].total_booking += 1;
        tipeSummary[spaceType].total_jam += r.durasi_jam || 0;
        tipeSummary[spaceType].total_pendapatan += r.total_bayar || 0;
      }
    }

    const rincianPerTipeSpace = Object.keys(tipeSummary).map((tipe) => ({
      tipe,
      label: tipeSummary[tipe].label,
      total_booking: tipeSummary[tipe].total_booking,
      total_jam: tipeSummary[tipe].total_jam,
      total_pendapatan: tipeSummary[tipe].total_pendapatan,
    }));

    return {
      month: selectedMonth,
      year: selectedYear,
      total_transaksi: totalTransaksi,
      total_jam_terpakai: totalJamTerpakai,
      estimasi_pendapatan_kotor: estimasiPendapatanKotor,
      total_potongan_diskon: totalPotonganDiskon,
      realisasi_pendapatan_bersih: realisasiPendapatanBersih,
      rincian_per_tipe_space: rincianPerTipeSpace,
    };
  }

  async getIncomeReport(month?: number, year?: number) {
    const report = await this.getMonthlyReport(month, year);
    return {
      month: report.month,
      year: report.year,
      realisasi_pendapatan_bersih: report.realisasi_pendapatan_bersih,
    };
  }
}
