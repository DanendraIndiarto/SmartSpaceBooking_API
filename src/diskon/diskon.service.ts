import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diskon } from '../entities/diskon.entity';
import { CreateDiskonDto } from './dto/create-diskon.dto';
import { UpdateDiskonDto } from './dto/update-diskon.dto';

@Injectable()
export class DiskonService {
  constructor(
    @InjectRepository(Diskon)
    private readonly diskonRepo: Repository<Diskon>,
  ) {}

  async create(dto: CreateDiskonDto, makerKey: string) {
    const diskon = this.diskonRepo.create({
      ...dto,
      tanggal_awal: new Date(dto.tanggal_awal),
      tanggal_akhir: new Date(dto.tanggal_akhir),
      makerKey,
    });
    return await this.diskonRepo.save(diskon);
  }

  async findAll(makerKey: string) {
    return await this.diskonRepo.find({
      where: { makerKey },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number, makerKey: string) {
    const diskon = await this.diskonRepo.findOne({
      where: { id, makerKey },
    });
    if (!diskon) {
      throw new NotFoundException('Data diskon tidak ditemukan');
    }
    return diskon;
  }

  async update(id: number, dto: UpdateDiskonDto, makerKey: string) {
    const diskon = await this.findOne(id, makerKey);
    if (dto.nama_diskon !== undefined) diskon.nama_diskon = dto.nama_diskon;
    if (dto.persentase_diskon !== undefined)
      diskon.persentase_diskon = dto.persentase_diskon;
    if (dto.tanggal_awal !== undefined)
      diskon.tanggal_awal = new Date(dto.tanggal_awal);
    if (dto.tanggal_akhir !== undefined)
      diskon.tanggal_akhir = new Date(dto.tanggal_akhir);

    return await this.diskonRepo.save(diskon);
  }

  async remove(id: number, makerKey: string) {
    const diskon = await this.findOne(id, makerKey);
    await this.diskonRepo.remove(diskon);
    return { message: 'Diskon berhasil dihapus', id };
  }
}
