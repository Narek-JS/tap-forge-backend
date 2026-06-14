import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TelegramAuthDto {
  @ApiProperty({
    description:
      'Telegram WebApp initData string from window.Telegram.WebApp.initData',
    example: 'query_id=...&user=...&auth_date=...&hash=...',
  })
  @IsString()
  initData: string;
}
