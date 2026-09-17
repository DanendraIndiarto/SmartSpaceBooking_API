import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Member } from '../entities/member.entity';
import { SpaceOwner } from '../entities/space-owner.entity';
import { RegisterDto } from './dto/register.dto';
import { RegisterMemberDto } from './dto/register-member.dto';
import { RegisterAdminSpaceDto } from './dto/register-admin-space.dto';
import { LoginDto } from './dto/login.dto';
import { AuthUser } from '../common/interfaces/auth-user.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Member) private readonly memberRepo: Repository<Member>,
    @InjectRepository(SpaceOwner)
    private readonly spaceOwnerRepo: Repository<SpaceOwner>,
    private readonly jwtService: JwtService,
  ) {}

  async registerMember(dto: RegisterMemberDto) {
    const existing = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (existing) {
      throw new BadRequestException('Username sudah digunakan oleh akun lain!');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      username: dto.username,
      password: hashedPassword,
      role: 'member',
    });
    const savedUser = await this.userRepo.save(user);

    const member = this.memberRepo.create({
      nama_member: dto.nama_member,
      instansi: dto.instansi,
      alamat: dto.alamat,
      telp: dto.telp,
      foto: dto.foto || '',
      idUser: savedUser.id,
    });
    const savedMember = await this.memberRepo.save(member);

    const payload = {
      sub: savedUser.id,
      username: savedUser.username,
      role: savedUser.role,
      memberId: savedMember.id,
    };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Registrasi member berhasil!',
      data: {
        id: savedUser.id,
        username: savedUser.username,
        role: savedUser.role,
        member: {
          id: savedMember.id,
          nama_member: savedMember.nama_member,
          instansi: savedMember.instansi,
          alamat: savedMember.alamat,
          telp: savedMember.telp,
          foto: savedMember.foto,
        },
        access_token: token,
      },
    };
  }

  async registerAdminSpace(dto: RegisterAdminSpaceDto) {
    const existing = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (existing) {
      throw new BadRequestException('Username sudah digunakan oleh akun lain!');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      username: dto.username,
      password: hashedPassword,
      role: 'admin_space',
    });
    const savedUser = await this.userRepo.save(user);

    const spaceOwner = this.spaceOwnerRepo.create({
      nama_coworking: dto.nama_coworking,
      nama_pemilik: dto.nama_pemilik,
      telp: dto.telp,
      idUser: savedUser.id,
    });
    const savedOwner = await this.spaceOwnerRepo.save(spaceOwner);

    const payload = {
      sub: savedUser.id,
      username: savedUser.username,
      role: savedUser.role,
      ownerId: savedOwner.id,
    };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Registrasi Admin Space berhasil!',
      data: {
        id: savedUser.id,
        username: savedUser.username,
        role: savedUser.role,
        space_owner: {
          id: savedOwner.id,
          nama_coworking: savedOwner.nama_coworking,
          nama_pemilik: savedOwner.nama_pemilik,
          telp: savedOwner.telp,
        },
        access_token: token,
      },
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (existing) {
      throw new BadRequestException('Username sudah digunakan oleh akun lain!');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      username: dto.username,
      password: hashedPassword,
      role: dto.role,
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
      });
      profile = await this.memberRepo.save(member);
    } else if (dto.role === 'admin_space') {
      const spaceOwner = this.spaceOwnerRepo.create({
        nama_coworking: dto.nama_coworking || `${dto.username} Coworking`,
        nama_pemilik: dto.nama_pemilik || dto.username,
        telp: dto.telp || '',
        idUser: savedUser.id,
      });
      profile = await this.spaceOwnerRepo.save(spaceOwner);
    }

    const payload = {
      sub: savedUser.id,
      username: savedUser.username,
      role: savedUser.role,
      memberId: (profile as Member)?.id,
      ownerId: (profile as SpaceOwner)?.id,
    };
    const token = this.jwtService.sign(payload);

    return {
      id: savedUser.id,
      username: savedUser.username,
      role: savedUser.role,
      profile,
      access_token: token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (!user) {
      throw new UnauthorizedException('Username atau Password salah!');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Username atau Password salah!');
    }

    let member: Member | null = null;
    let spaceOwner: SpaceOwner | null = null;

    if (user.role === 'member') {
      member = await this.memberRepo.findOne({
        where: { idUser: user.id },
      });
    } else if (user.role === 'admin_space') {
      spaceOwner = await this.spaceOwnerRepo.findOne({
        where: { idUser: user.id },
      });
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      memberId: member?.id,
      ownerId: spaceOwner?.id,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Login berhasil!',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        member: member
          ? {
              id: member.id,
              nama_member: member.nama_member,
              instansi: member.instansi,
              alamat: member.alamat,
              telp: member.telp,
              foto: member.foto,
            }
          : null,
        space_owner: spaceOwner
          ? {
              id: spaceOwner.id,
              nama_coworking: spaceOwner.nama_coworking,
              nama_pemilik: spaceOwner.nama_pemilik,
              telp: spaceOwner.telp,
            }
          : null,
        access_token: token,
      },
    };
  }

  async getProfile(currentUser: AuthUser) {
    const user = await this.userRepo.findOne({
      where: { id: currentUser.userId || currentUser.id },
    });
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    let member: Member | null = null;
    let spaceOwner: SpaceOwner | null = null;

    if (user.role === 'member') {
      member = await this.memberRepo.findOne({
        where: { idUser: user.id },
      });
    } else if (user.role === 'admin_space') {
      spaceOwner = await this.spaceOwnerRepo.findOne({
        where: { idUser: user.id },
      });
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      member: member
        ? {
            id: member.id,
            nama_member: member.nama_member,
            instansi: member.instansi,
            alamat: member.alamat,
            telp: member.telp,
            foto: member.foto,
          }
        : undefined,
      space_owner: spaceOwner
        ? {
            id: spaceOwner.id,
            nama_coworking: spaceOwner.nama_coworking,
            nama_pemilik: spaceOwner.nama_pemilik,
            telp: spaceOwner.telp,
          }
        : undefined,
    };
  }
}
