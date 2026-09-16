import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MakerController } from './maker.controller';
import { MakerService } from './maker.service';
import { Maker } from '../entities/maker.entity';
import { Reservasi } from '../entities/reservasi.entity';
import { Member } from '../entities/member.entity';
import { Space } from '../entities/space.entity';
import { Diskon } from '../entities/diskon.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Maker, Reservasi, Member, Space, Diskon]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super_secret_key_ukk_2026',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [MakerController],
  providers: [MakerService],
  exports: [MakerService],
})
export class MakerModule {}
