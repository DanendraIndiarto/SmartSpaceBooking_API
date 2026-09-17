import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from '../entities/space.entity';
import { Reservasi } from '../entities/reservasi.entity';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';

@Injectable()
export class SpacesService {
  constructor(
    @InjectRepository(Space)
    private readonly spaceRepo: Repository<Space>,
    @InjectRepository(Reservasi)
    private readonly resRepo: Repository<Reservasi>,
  ) {}

  getTypes() {
    return [
      {
        tipe: 'desk',
        label: 'Personal Desk',
        deskripsi:
          'Meja kerja individual yang nyaman dengan fasilitas colokan listrik, WiFi kencang, dan air minum.',
      },
      {
        tipe: 'meeting_room',
        label: 'Meeting Room',
        deskripsi:
          'Ruang rapat tertutup dengan fasilitas proyektor/TV LED, whiteboard, sound system, dan AC dingin.',
      },
      {
        tipe: 'private_office',
        label: 'Private Office',
        deskripsi:
          'Ruang kantor privat eksklusif untuk tim kecil hingga menengah dengan akses fleksibel dan keamanan 24 jam.',
      },
    ];
  }

  async checkAvailability(
    idSpace: number,
    tanggal: string,
    jamMulai: string,
    durasiJam: number,
  ) {
    const space = await this.spaceRepo.findOne({
      where: { id: idSpace },
    });
    if (!space) {
      throw new NotFoundException('Space dengan ID tersebut tidak ditemukan!');
    }

    const [h, m] = jamMulai.split(':').map(Number);
    const endHour = h + Number(durasiJam);
    const jamSelesai = `${endHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

    const overlap = await this.resRepo
      .createQueryBuilder('r')
      .where('r.id_space = :spaceId', { spaceId: space.id })
      .andWhere('r.tanggal_reservasi = :tgl', { tgl: tanggal })
      .andWhere('r.status IN (:...st)', {
        st: ['belum_dikonfirm', 'disetujui', 'aktif'],
      })
      .andWhere('r.jam_mulai < :selesai AND r.jam_selesai > :mulai', {
        selesai: jamSelesai,
        mulai: jamMulai,
      })
      .getOne();

    return {
      available: !overlap,
      space_id: space.id,
      nama_space: space.nama_space,
      harga_per_jam: space.harga_per_jam,
      estimasi_total: space.harga_per_jam * Number(durasiJam),
    };
  }

  async findAll(
    tipe?: string,
    search?: string,
    baseUrl = 'http://localhost:3000',
  ) {
    const qb = this.spaceRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.owner', 'owner');

    if (tipe) {
      qb.andWhere('s.tipe = :tipe', { tipe });
    }

    if (search) {
      qb.andWhere(
        '(s.nama_space LIKE :search OR s.deskripsi LIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('s.id', 'ASC');

    const spaces = await qb.getMany();

    return spaces.map((space) => {
      const fotoUrl = space.foto
        ? (space.foto.startsWith('http') ? space.foto : `${baseUrl}/uploads/spaces/${space.foto}`)
        : null;

      return {
        id: space.id,
        nama_space: space.nama_space,
        harga_per_jam: space.harga_per_jam,
        tipe: space.tipe,
        kapasitas: space.kapasitas,
        foto: space.foto,
        deskripsi: space.deskripsi,
        id_owner: space.idOwner,
        owner: space.owner
          ? {
              id: space.owner.id,
              nama_coworking: space.owner.nama_coworking,
              nama_pemilik: space.owner.nama_pemilik,
              telp: space.owner.telp,
            }
          : null,
        foto_url: fotoUrl,
      };
    });
  }

  async findOne(id: number, baseUrl = 'http://localhost:3000') {
    const space = await this.spaceRepo.findOne({
      where: { id },
      relations: { owner: true },
    });
    if (!space) {
      throw new NotFoundException('Space dengan ID tersebut tidak ditemukan!');
    }

    const fotoUrl = space.foto
      ? (space.foto.startsWith('http') ? space.foto : `${baseUrl}/uploads/spaces/${space.foto}`)
      : null;

    return {
      id: space.id,
      nama_space: space.nama_space,
      harga_per_jam: space.harga_per_jam,
      tipe: space.tipe,
      kapasitas: space.kapasitas,
      foto: space.foto,
      deskripsi: space.deskripsi,
      id_owner: space.idOwner,
      owner: space.owner
        ? {
            id: space.owner.id,
            nama_coworking: space.owner.nama_coworking,
            nama_pemilik: space.owner.nama_pemilik,
            telp: space.owner.telp,
          }
        : null,
      foto_url: fotoUrl,
    };
  }

  async create(dto: CreateSpaceDto, ownerId: number) {
    const space = this.spaceRepo.create({
      ...dto,
      idOwner: ownerId,
    });
    return await this.spaceRepo.save(space);
  }

  async update(id: number, dto: UpdateSpaceDto) {
    const space = await this.spaceRepo.findOne({ where: { id } });
    if (!space) {
      throw new NotFoundException('Space dengan ID tersebut tidak ditemukan!');
    }
    Object.assign(space, dto);
    return await this.spaceRepo.save(space);
  }

  async remove(id: number) {
    const space = await this.spaceRepo.findOne({ where: { id } });
    if (!space) {
      throw new NotFoundException('Space dengan ID tersebut tidak ditemukan!');
    }
    await this.spaceRepo.remove(space);
    return { message: 'Space berhasil dihapus!', id, deleted: true };
  }
}
