import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
    const saved = await this.diskonRepo.save(diskon);
    return {
      message: 'Kode promo baru berhasil dibuat!',
      data: saved,
    };
  }

  async findAll(makerKey: string) {
    return await this.diskonRepo.find({
      where: { makerKey },
      order: { id: 'ASC' },
    });
  }

  async findActive(makerKey: string) {
    const now = new Date();
    return await this.diskonRepo
      .createQueryBuilder('d')
      .where('d.maker_key = :makerKey', { makerKey })
      .andWhere('d.tanggal_awal <= :now AND d.tanggal_akhir >= :now', { now })
      .orderBy('d.id', 'ASC')
      .getMany();
  }

  async checkPromo(namaDiskon: string, makerKey: string) {
    const diskon = await this.diskonRepo.findOne({
      where: { nama_diskon: namaDiskon, makerKey },
    });

    if (!diskon) {
      throw new BadRequestException(
        'Kode promo tidak ditemukan atau sudah kedaluwarsa!',
      );
    }

    const now = new Date();
    const start = new Date(diskon.tanggal_awal);
    const end = new Date(diskon.tanggal_akhir);

    if (now < start || now > end) {
      throw new BadRequestException(
        'Kode promo tidak ditemukan atau sudah kedaluwarsa!',
      );
    }

    return {
      message: 'Kode promo valid dan masih berlaku!',
      data: {
        id: diskon.id,
        nama_diskon: diskon.nama_diskon,
        persentase_diskon: diskon.persentase_diskon,
        tanggal_awal: diskon.tanggal_awal,
        tanggal_akhir: diskon.tanggal_akhir,
        is_active: true,
      },
    };
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

    const updated = await this.diskonRepo.save(diskon);
    return {
      message: 'Data promo diskon berhasil diperbarui!',
      data: updated,
    };
  }

  async remove(id: number, makerKey: string) {
    const diskon = await this.findOne(id, makerKey);
    await this.diskonRepo.remove(diskon);
    return { message: 'Kode promo berhasil dihapus!', id, deleted: true };
  }
}
