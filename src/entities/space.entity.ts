import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SpaceOwner } from './space-owner.entity';

@Entity('space')
export class Space {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nama_space!: string;

  @Column('double')
  harga_per_jam!: number;

  @Column({ type: 'enum', enum: ['desk', 'meeting_room', 'private_office'] })
  tipe!: string;

  @Column()
  kapasitas!: number;

  @Column('text')
  deskripsi!: string;

  @Column({ nullable: true })
  foto!: string;

  @Column({ name: 'id_owner' })
  idOwner!: number;

  @Column({ name: 'maker_key', nullable: true })
  makerKey!: string;

  @ManyToOne(() => SpaceOwner)
  @JoinColumn({ name: 'id_owner' })
  owner!: SpaceOwner;
}
