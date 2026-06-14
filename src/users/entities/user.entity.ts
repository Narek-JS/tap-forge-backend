import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { UserUpgrade } from '../../upgrades/entities/user-upgrade.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'telegram_id', unique: true })
  telegramId: string;

  @Column({ nullable: true, type: 'varchar' })
  username: string | null;

  @Column({ name: 'first_name', nullable: true, type: 'varchar' })
  firstName: string | null;

  @Column({ name: 'last_name', nullable: true, type: 'varchar' })
  lastName: string | null;

  @Column({
    type: 'bigint',
    default: 0,
    transformer: {
      to: (v: number): number => v,
      from: (v: string): number => Number(v),
    },
  })
  coins: number;

  @Column({ type: 'int', default: 500 })
  energy: number;

  @Column({ name: 'max_energy', type: 'int', default: 500 })
  maxEnergy: number;

  @Column({ name: 'tap_power', type: 'int', default: 1 })
  tapPower: number;

  @Column({ name: 'energy_regen_rate', type: 'int', default: 1 })
  energyRegenRate: number;

  @Column({
    name: 'last_energy_update',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  lastEnergyUpdate: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany('UserUpgrade', 'user')
  upgrades: UserUpgrade[];
}
