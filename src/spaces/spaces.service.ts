import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from '../entities/space.entity';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';

@Injectable()
export class SpacesService {
  constructor(
    @InjectRepository(Space)
    private readonly spaceRepo: Repository<Space>,
  ) {}

  async create(dto: CreateSpaceDto, ownerId: number, makerKey: string) {
    const space = this.spaceRepo.create({
      ...dto,
      idOwner: ownerId,
      makerKey,
    });
    return await this.spaceRepo.save(space);
  }

  async findAll(makerKey: string) {
    return await this.spaceRepo.find({
      where: { makerKey },
      relations: { owner: true },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number, makerKey: string) {
    const space = await this.spaceRepo.findOne({
      where: { id, makerKey },
      relations: { owner: true },
    });
    if (!space) throw new NotFoundException('Space tidak ditemukan');
    return space;
  }

  async update(id: number, dto: UpdateSpaceDto, makerKey: string) {
    const space = await this.findOne(id, makerKey);
    Object.assign(space, dto);
    return await this.spaceRepo.save(space);
  }

  async remove(id: number, makerKey: string) {
    const space = await this.findOne(id, makerKey);
    await this.spaceRepo.remove(space);
    return { message: 'Space berhasil dihapus', id };
  }
}
