import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../entities/user.entity';
import { Member } from '../entities/member.entity';
import { SpaceOwner } from '../entities/space-owner.entity';
import { Space } from '../entities/space.entity';
import { Diskon } from '../entities/diskon.entity';
import { Reservasi } from '../entities/reservasi.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Member,
      SpaceOwner,
      Space,
      Diskon,
      Reservasi,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
