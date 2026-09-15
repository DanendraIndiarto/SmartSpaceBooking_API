import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Maker } from '../entities/maker.entity';
import { Reservasi } from '../entities/reservasi.entity';

@Injectable()
export class MakerService {
  constructor(
    @InjectRepository(Maker)
    private readonly makerRepo: Repository<Maker>,
    @InjectRepository(Reservasi)
    private readonly reservasiRepo: Repository<Reservasi>,
  ) {}

  async register(data: { name: string; email: string; app_name: string }) {
    const existing = await this.makerRepo.findOne({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException('Email maker sudah terdaftar');
    }

    const appKey = `MK-${crypto.randomBytes(12).toString('hex')}`;
    const maker = this.makerRepo.create({
      name: data.name,
      email: data.email,
      appName: data.app_name,
      appKey,
    });

    return await this.makerRepo.save(maker);
  }

  async login(data: { email: string; app_key: string }) {
    const maker = await this.makerRepo.findOne({
      where: { email: data.email, appKey: data.app_key },
    });
    if (!maker) {
      throw new UnauthorizedException('Kredensial maker tidak valid');
    }

    return { status: true, message: 'Login maker berhasil', maker };
  }

  async getProfile(identifier: number | string) {
    let maker: Maker | null = null;
    if (typeof identifier === 'number') {
      maker = await this.makerRepo.findOne({ where: { id: identifier } });
    }
    if (!maker && typeof identifier === 'string') {
      maker = await this.makerRepo.findOne({ where: { appKey: identifier } });
    }
    if (!maker) {
      throw new NotFoundException('Maker tidak ditemukan');
    }
    return maker;
  }

  async getStats() {
    const totalMakers = await this.makerRepo.count();
    const totalReservations = await this.reservasiRepo.count();
    return {
      total_makers: totalMakers,
      total_reservations: totalReservations,
    };
  }

  async getAllMakers() {
    return await this.makerRepo.find({
      order: { id: 'DESC' },
    });
  }
}
