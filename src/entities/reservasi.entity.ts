import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Member } from './member.entity';
import { Space } from './space.entity';

@Entity('reservasi')
export class Reservasi {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  kode_booking!: string;

  @Column({ name: 'id_member' })
  idMember!: number;

  @Column({ name: 'id_space' })
  idSpace!: number;

  @Column({ name: 'id_diskon', nullable: true })
  idDiskon!: number;

  @Column({ type: 'date' })
  tanggal_reservasi!: string;

  @Column({ type: 'time' })
  jam_mulai!: string;

  @Column({ type: 'time' })
  jam_selesai!: string;

  @Column()
  durasi_jam!: number;

  @Column('double')
  harga_per_jam!: number;

  @Column('double')
  total_harga_awal!: number;

  @Column('double', { default: 0 })
  potongan_diskon!: number;

  @Column('double')
  total_bayar!: number;

  @Column({
    type: 'enum',
    enum: ['belum_dikonfirm', 'disetujui', 'aktif', 'selesai', 'dibatalkan'],
    default: 'belum_dikonfirm',
  })
  status!: string;

  @Column({ name: 'maker_key', nullable: true })
  makerKey!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'check_in_time', type: 'datetime', nullable: true })
  checkInTime?: Date;

  @Column({ name: 'check_out_time', type: 'datetime', nullable: true })
  checkOutTime?: Date;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'id_member' })
  member!: Member;

  @ManyToOne(() => Space)
  @JoinColumn({ name: 'id_space' })
  space!: Space;
}
