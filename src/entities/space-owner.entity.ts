import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('space_owner')
export class SpaceOwner {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nama_coworking!: string;

  @Column()
  nama_pemilik!: string;

  @Column({ nullable: true })
  telp!: string;

  @Column({ name: 'id_user' })
  idUser!: number;

  @Column({ name: 'maker_key', nullable: true })
  makerKey!: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  user!: User;
}
