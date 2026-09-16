import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasiService } from './reservasi.service';
import { ReservasiController } from './reservasi.controller';
import { Reservasi } from '../entities/reservasi.entity';
import { Space } from '../entities/space.entity';
import { Diskon } from '../entities/diskon.entity';
import { Member } from '../entities/member.entity';
import { SpaceOwner } from '../entities/space-owner.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reservasi,
      Space,
      Diskon,
      Member,
      SpaceOwner,
    ]),
  ],
  controllers: [ReservasiController],
  providers: [ReservasiService],
  exports: [ReservasiService],
})
export class ReservasiModule {}
