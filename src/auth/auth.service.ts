import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Member } from '../entities/member.entity';
import { SpaceOwner } from '../entities/space-owner.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Member) private readonly memberRepo: Repository<Member>,
    @InjectRepository(SpaceOwner)
    private readonly spaceOwnerRepo: Repository<SpaceOwner>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto, makerKey: string) {
    const existing = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (existing) {
      throw new BadRequestException('Username sudah digunakan');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      username: dto.username,
      password: hashedPassword,
      role: dto.role,
      makerKey,
    });

    const savedUser = await this.userRepo.save(user);

    let profile: Member | SpaceOwner | null = null;

    if (dto.role === 'member') {
      const member = this.memberRepo.create({
        nama_member: dto.nama_member || dto.username,
        instansi: dto.instansi || '',
        alamat: dto.alamat || '',
        telp: dto.telp || '',
        foto: dto.foto || '',
        idUser: savedUser.id,
        makerKey,
      });
      profile = await this.memberRepo.save(member);
    } else if (dto.role === 'admin_space') {
      const spaceOwner = this.spaceOwnerRepo.create({
        nama_coworking: dto.nama_coworking || `${dto.username} Coworking`,
        nama_pemilik: dto.nama_pemilik || dto.username,
        telp: dto.telp || '',
        idUser: savedUser.id,
        makerKey,
      });
      profile = await this.spaceOwnerRepo.save(spaceOwner);
    }

    return {
      id: savedUser.id,
      username: savedUser.username,
      role: savedUser.role,
      profile,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (!user) {
      throw new UnauthorizedException('Kredensial salah');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Kredensial salah');
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

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      makerKey: user.makerKey,
      memberId,
      ownerId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        memberId,
        ownerId,
      },
    };
  }
}
