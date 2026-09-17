import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Member } from '../entities/member.entity';
import { SpaceOwner } from '../entities/space-owner.entity';

export interface JwtPayload {
  sub: number;
  username: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(SpaceOwner)
    private readonly spaceOwnerRepo: Repository<SpaceOwner>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super_secret_key_ukk_2026',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepo.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Token tidak valid atau pengguna tidak ditemukan',
      );
    }

    let memberId: number | undefined;
    let ownerId: number | undefined;

    if (user.role === 'member') {
      const member = await this.memberRepo.findOne({
        where: { idUser: user.id },
      });
      if (member) memberId = member.id;
    } else if (user.role === 'admin_space') {
      const owner = await this.spaceOwnerRepo.findOne({
        where: { idUser: user.id },
      });
      if (owner) ownerId = owner.id;
    }

    return {
      id: user.id,
      userId: user.id,
      username: user.username,
      role: user.role,
      memberId,
      ownerId,
    };
  }
}
