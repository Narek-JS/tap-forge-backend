import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpgradesService } from './upgrades.service';
import { BuyUpgradeDto } from './dto/buy-upgrade.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Upgrades')
@ApiBearerAuth()
@Controller('upgrades')
export class UpgradesController {
  constructor(private readonly upgradesService: UpgradesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all upgrades with current user progress and costs',
  })
  getUpgrades(@CurrentUser() user: JwtPayload) {
    return this.upgradesService.getUserUpgrades(user.sub);
  }

  @Post('buy')
  @ApiOperation({ summary: 'Purchase an upgrade using coins' })
  buyUpgrade(@CurrentUser() user: JwtPayload, @Body() dto: BuyUpgradeDto) {
    return this.upgradesService.buyUpgrade(user.sub, dto.type);
  }
}
