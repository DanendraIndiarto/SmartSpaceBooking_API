import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasiService } from './reservasi.service';
import { ReservasiController } from './reservasi.controller';
import { Reservasi } from '../entities/reservasi.entity';
import { Space } from '../entities/space.entity';
import { Diskon } from '../entities/diskon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reservasi, Space, Diskon])],
  controllers: [ReservasiController],
  providers: [ReservasiService],
  exports: [ReservasiService],
})
export class ReservasiModule {}
