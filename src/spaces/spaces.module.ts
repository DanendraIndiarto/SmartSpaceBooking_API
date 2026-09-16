import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpacesService } from './spaces.service';
import { SpacesController } from './spaces.controller';
import { Space } from '../entities/space.entity';
import { Reservasi } from '../entities/reservasi.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Space, Reservasi])],
  controllers: [SpacesController],
  providers: [SpacesService],
  exports: [SpacesService],
})
export class SpacesModule {}
