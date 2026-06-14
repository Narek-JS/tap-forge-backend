import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpgradeType } from '../constants/upgrade-definitions';

export class BuyUpgradeDto {
  @ApiProperty({
    enum: UpgradeType,
    description: 'The type of upgrade to purchase',
    example: UpgradeType.TAP_POWER,
  })
  @IsEnum(UpgradeType)
  type: UpgradeType;
}
