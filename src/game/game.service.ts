import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  private regenEnergy(user: User): { energy: number; changed: boolean } {
    const now = Date.now();
    const last =
      user.lastEnergyUpdate instanceof Date
        ? user.lastEnergyUpdate.getTime()
        : new Date(user.lastEnergyUpdate).getTime();

    if (isNaN(last) || last > now)
      return { energy: user.energy, changed: false };

    const seconds = Math.floor((now - last) / 1000);
    if (seconds <= 0) return { energy: user.energy, changed: false };

    const newEnergy = Math.min(
      user.energy + seconds * user.energyRegenRate,
      user.maxEnergy,
    );
    return { energy: newEnergy, changed: newEnergy !== user.energy };
  }

  async getUserState(userId: number) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const { energy, changed } = this.regenEnergy(user);
    if (changed) {
      await this.users.update(userId, { energy, lastEnergyUpdate: new Date() });
    }

    return {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      coins: user.coins,
      energy,
      maxEnergy: user.maxEnergy,
      tapPower: user.tapPower,
      energyRegenRate: user.energyRegenRate,
    };
  }

  async tap(userId: number, tapCount: number) {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user) throw new NotFoundException('User not found');

      const { energy } = this.regenEnergy(user);

      if (energy < tapCount) {
        throw new BadRequestException(
          `Not enough energy. Have: ${energy}, need: ${tapCount}`,
        );
      }

      const coinsEarned = tapCount * user.tapPower;
      user.coins = user.coins + coinsEarned;
      user.energy = energy - tapCount;
      user.lastEnergyUpdate = new Date();

      await manager.save(User, user);

      return {
        coinsEarned,
        totalCoins: user.coins,
        energy: user.energy,
        maxEnergy: user.maxEnergy,
        tapPower: user.tapPower,
      };
    });
  }

  async getLeaderboard() {
    const top = await this.users
      .createQueryBuilder('u')
      .select(['u.id', 'u.username', 'u.firstName', 'u.coins'])
      .orderBy('u.coins', 'DESC')
      .take(100)
      .getMany();

    return top.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      coins: user.coins,
    }));
  }
}
