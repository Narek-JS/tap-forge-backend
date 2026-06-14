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
import { UserUpgrade } from './entities/user-upgrade.entity';
import {
  UPGRADE_DEFINITIONS,
  UpgradeType,
} from './constants/upgrade-definitions';

@Injectable()
export class UpgradesService {
  private readonly logger = new Logger(UpgradesService.name);

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(UserUpgrade)
    private readonly userUpgrades: Repository<UserUpgrade>,
    private readonly dataSource: DataSource,
  ) {}

  async getUserUpgrades(userId: number) {
    const owned = await this.userUpgrades.find({ where: { userId } });

    return UPGRADE_DEFINITIONS.map((def) => {
      const existing = owned.find((u) => u.upgradeType === def.type);
      const currentLevel = existing?.level ?? 0;
      const isMaxed = currentLevel >= def.maxLevel;

      return {
        type: def.type,
        name: def.name,
        description: def.description,
        currentLevel,
        maxLevel: def.maxLevel,
        isMaxed,
        nextLevelCost: isMaxed ? null : def.getCost(currentLevel),
        currentEffect: def.getEffect(currentLevel),
        nextEffect: isMaxed ? null : def.getEffect(currentLevel + 1),
      };
    });
  }

  async buyUpgrade(userId: number, upgradeType: UpgradeType) {
    const definition = UPGRADE_DEFINITIONS.find((d) => d.type === upgradeType);
    if (!definition) throw new BadRequestException('Unknown upgrade type');

    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user) throw new NotFoundException('User not found');

      const existing = await manager.findOne(UserUpgrade, {
        where: { userId, upgradeType },
        lock: { mode: 'pessimistic_write' },
      });

      const currentLevel = existing?.level ?? 0;

      if (currentLevel >= definition.maxLevel) {
        throw new BadRequestException(
          `${definition.name} is already at max level`,
        );
      }

      const cost = definition.getCost(currentLevel);
      if (user.coins < cost) {
        throw new BadRequestException(
          `Not enough coins. Need: ${cost}, have: ${user.coins}`,
        );
      }

      const newLevel = currentLevel + 1;
      const newEffect = definition.getEffect(newLevel);

      user.coins = user.coins - cost;

      if (upgradeType === UpgradeType.TAP_POWER) user.tapPower = newEffect;
      else if (upgradeType === UpgradeType.ENERGY_CAPACITY)
        user.maxEnergy = newEffect;
      else if (upgradeType === UpgradeType.ENERGY_REGEN)
        user.energyRegenRate = newEffect;

      await manager.save(User, user);

      if (existing) {
        existing.level = newLevel;
        await manager.save(UserUpgrade, existing);
      } else {
        await manager.save(
          UserUpgrade,
          manager.create(UserUpgrade, { userId, upgradeType, level: 1 }),
        );
      }

      return {
        upgradeType,
        newLevel,
        costPaid: cost,
        newEffect,
        remainingCoins: user.coins,
        message: `${definition.name} upgraded to level ${newLevel}!`,
      };
    });
  }
}
