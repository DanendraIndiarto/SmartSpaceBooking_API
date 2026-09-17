import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('diskon')
export class Diskon {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nama_diskon!: string;

  @Column('double')
  persentase_diskon!: number;

  @Column({ type: 'datetime' })
  tanggal_awal!: Date;

  @Column({ type: 'datetime' })
  tanggal_akhir!: Date;
}
