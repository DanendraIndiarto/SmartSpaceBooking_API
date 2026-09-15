import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MakerController } from './maker.controller';
import { MakerService } from './maker.service';
import { Maker } from '../entities/maker.entity';
import { Reservasi } from '../entities/reservasi.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Maker, Reservasi])],
  controllers: [MakerController],
  providers: [MakerService],
  exports: [MakerService],
})
export class MakerModule {}
