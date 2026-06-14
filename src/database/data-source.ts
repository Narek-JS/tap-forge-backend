import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserUpgrade } from '../upgrades/entities/user-upgrade.entity';

config();

const url = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;
if (!url)
  throw new Error(
    'DIRECT_DATABASE_URL or DATABASE_URL must be set for migrations',
  );

export const AppDataSource = new DataSource({
  type: 'postgres',
  url,
  ssl: true,
  entities: [User, UserUpgrade],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
