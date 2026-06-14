import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpgradesService } from './upgrades.service';
import { UpgradesController } from './upgrades.controller';
import { User } from '../users/entities/user.entity';
import { UserUpgrade } from './entities/user-upgrade.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserUpgrade])],
  controllers: [UpgradesController],
  providers: [UpgradesService],
})
export class UpgradesModule {}
