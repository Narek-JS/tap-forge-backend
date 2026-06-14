import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { Public } from './decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('telegram')
  @ApiOperation({
    summary: 'Authenticate via Telegram WebApp initData',
    description:
      'Validates the initData string from window.Telegram.WebApp.initData and returns a JWT token.',
  })
  authenticate(@Body() dto: TelegramAuthDto) {
    return this.authService.validateTelegramInitData(dto.initData);
  }
}
