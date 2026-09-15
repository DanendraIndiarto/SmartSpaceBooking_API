import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('maker')
export class Maker {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'app_name' })
  appName!: string;

  @Column({ name: 'app_key', unique: true })
  appKey!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
