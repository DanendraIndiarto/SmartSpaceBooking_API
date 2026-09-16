import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Maker } from '../entities/maker.entity';
import { Reservasi } from '../entities/reservasi.entity';
import { Member } from '../entities/member.entity';
import { Space } from '../entities/space.entity';
import { Diskon } from '../entities/diskon.entity';

@Injectable()
export class MakerService {
  constructor(
    @InjectRepository(Maker)
    private readonly makerRepo: Repository<Maker>,
    @InjectRepository(Reservasi)
    private readonly reservasiRepo: Repository<Reservasi>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(Space)
    private readonly spaceRepo: Repository<Space>,
    @InjectRepository(Diskon)
    private readonly diskonRepo: Repository<Diskon>,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: {
    name: string;
    username?: string;
    email: string;
    password?: string;
    app_name?: string;
  }) {
    const existing = await this.makerRepo.findOne({
      where: data.username
        ? [{ email: data.email }, { username: data.username }]
        : [{ email: data.email }],
    });
    if (existing) {
      throw new BadRequestException(
        'Username atau Email sudah terdaftar sebagai App Maker!',
      );
    }

    const appKey = `mk_${crypto.randomBytes(16).toString('hex')}`;
    const hashedPassword = data.password
      ? await bcrypt.hash(data.password, 10)
      : undefined;

    const maker = this.makerRepo.create({
      name: data.name,
      username: data.username || data.email.split('@')[0],
      email: data.email,
      password: hashedPassword,
      appName: data.app_name || 'Smart Space',
      appKey,
    });

    const saved = await this.makerRepo.save(maker);

    const token = this.jwtService.sign({
      sub: saved.id,
      email: saved.email,
      makerKey: saved.appKey,
      role: 'maker',
    });

    return {
      message:
        'Registrasi App Maker berhasil! Simpan app_key Anda dengan baik.',
      data: {
        id: saved.id,
        name: saved.name,
        username: saved.username,
        email: saved.email,
        app_key: saved.appKey,
        created_at: saved.createdAt,
        updated_at: saved.updatedAt || saved.createdAt,
        access_token: token,
      },
    };
  }

  async login(data: {
    usernameOrEmail?: string;
    email?: string;
    password?: string;
    app_key?: string;
  }) {
    const identifier = data.usernameOrEmail || data.email;
    if (!identifier) {
      throw new BadRequestException('Username atau Email wajib diisi!');
    }

    const maker = await this.makerRepo.findOne({
      where: [{ email: identifier }, { username: identifier }],
    });

    if (!maker) {
      throw new UnauthorizedException('Kredensial login App Maker salah!');
    }

    if (data.password && maker.password) {
      const match = await bcrypt.compare(data.password, maker.password);
      if (!match) {
        throw new UnauthorizedException('Kredensial login App Maker salah!');
      }
    } else if (data.app_key && maker.appKey !== data.app_key) {
      throw new UnauthorizedException('Kredensial login App Maker salah!');
    }

    const token = this.jwtService.sign({
      sub: maker.id,
      email: maker.email,
      makerKey: maker.appKey,
      role: 'maker',
    });

    return {
      message: 'Login App Maker berhasil!',
      data: {
        id: maker.id,
        name: maker.name,
        username: maker.username,
        email: maker.email,
        app_key: maker.appKey,
        access_token: token,
      },
    };
  }

  async getProfile(identifier: number | string) {
    let maker: Maker | null = null;
    if (typeof identifier === 'number') {
      maker = await this.makerRepo.findOne({ where: { id: identifier } });
    }
    if (!maker && typeof identifier === 'string') {
      maker = await this.makerRepo.findOne({
        where: [{ appKey: identifier }, { email: identifier }],
      });
    }
    if (!maker) {
      throw new NotFoundException('Maker tidak ditemukan');
    }
    return {
      id: maker.id,
      name: maker.name,
      username: maker.username,
      email: maker.email,
      app_key: maker.appKey,
      created_at: maker.createdAt,
    };
  }

  async getStats(makerKey?: string) {
    const whereKey = makerKey ? { makerKey } : {};

    const totalMembers = await this.memberRepo.count({
      where: whereKey as any,
    });
    const totalSpaces = await this.spaceRepo.count({ where: whereKey as any });
    const totalDiskon = await this.diskonRepo.count({ where: whereKey as any });
    const totalReservasi = await this.reservasiRepo.count({
      where: whereKey as any,
    });

    let qb = this.reservasiRepo.createQueryBuilder('r');
    if (makerKey) {
      qb = qb.where('r.maker_key = :makerKey', { makerKey });
    }
    const sumResult = await qb
      .select('SUM(r.total_bayar)', 'total_pendapatan')
      .getRawOne();

    const totalPendapatan = sumResult?.total_pendapatan
      ? parseFloat(sumResult.total_pendapatan)
      : 0;

    return {
      total_members: totalMembers,
      total_spaces: totalSpaces,
      total_diskon: totalDiskon,
      total_reservasi: totalReservasi,
      total_pendapatan: totalPendapatan,
    };
  }

  async getAllMakers() {
    const list = await this.makerRepo.find({
      order: { id: 'ASC' },
    });
    return list.map((m) => ({
      id: m.id,
      name: m.name,
      username: m.username || m.email.split('@')[0],
      email: m.email,
      app_key: m.appKey,
      created_at: m.createdAt,
    }));
  }
}
