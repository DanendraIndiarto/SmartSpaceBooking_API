import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('member')
export class Member {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nama_member!: string;

  @Column({ nullable: true })
  instansi!: string;

  @Column('text', { nullable: true })
  alamat!: string;

  @Column({ nullable: true })
  telp!: string;

  @Column({ nullable: true })
  foto!: string;

  @Column({ name: 'id_user' })
  idUser!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  user!: User;
}
