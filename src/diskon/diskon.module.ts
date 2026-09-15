import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiskonService } from './diskon.service';
import { DiskonController } from './diskon.controller';
import { Diskon } from '../entities/diskon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Diskon])],
  controllers: [DiskonController],
  providers: [DiskonService],
  exports: [DiskonService],
})
export class DiskonModule {}
