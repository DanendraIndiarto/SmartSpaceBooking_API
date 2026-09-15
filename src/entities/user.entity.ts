import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @Column({ type: 'enum', enum: ['member', 'admin_space'] })
  role!: string;

  @Column({ name: 'maker_key', nullable: true })
  makerKey!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
