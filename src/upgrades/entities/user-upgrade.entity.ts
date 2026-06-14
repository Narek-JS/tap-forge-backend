import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { UpgradeType } from '../constants/upgrade-definitions';
import type { User } from '../../users/entities/user.entity';

@Entity('user_upgrades')
@Unique(['userId', 'upgradeType'])
export class UserUpgrade {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @ManyToOne('User', 'upgrades', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'upgrade_type', type: 'varchar' })
  upgradeType: UpgradeType;

  @Column({ type: 'int', default: 1 })
  level: number;

  @CreateDateColumn({ name: 'purchased_at', type: 'timestamptz' })
  purchasedAt: Date;
}
