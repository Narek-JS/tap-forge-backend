import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { User } from './entities/user.entity';

interface FindOrCreateInput {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async findOrCreate(data: FindOrCreateInput): Promise<User> {
    const existing = await this.users.findOne({
      where: { telegramId: data.telegramId },
    });

    if (existing) {
      existing.username = data.username ?? existing.username;
      existing.firstName = data.firstName ?? existing.firstName;
      existing.lastName = data.lastName ?? existing.lastName;
      return this.users.save(existing);
    }

    try {
      const user = this.users.create({
        telegramId: data.telegramId,
        username: data.username ?? null,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        lastEnergyUpdate: new Date(),
      });
      return await this.users.save(user);
    } catch (err: unknown) {
      if (isUniqueViolation(err)) {
        const user = await this.users.findOne({
          where: { telegramId: data.telegramId },
        });
        if (user) return user;
      }
      this.logger.error('Failed to create user', err);
      throw err;
    }
  }

  async findById(id: number): Promise<User> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === '23505'
  );
}
