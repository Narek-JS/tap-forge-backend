import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { UsersService } from '../users/users.service';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

const AUTH_DATE_MAX_AGE_SECONDS = 300;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateTelegramInitData(
    initData: string,
  ): Promise<{ accessToken: string }> {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) throw new UnauthorizedException('Missing hash in initData');

    const authDateStr = params.get('auth_date');
    if (!authDateStr)
      throw new UnauthorizedException('Missing auth_date in initData');

    const authDate = parseInt(authDateStr, 10);
    if (isNaN(authDate)) throw new UnauthorizedException('Invalid auth_date');

    const ageSeconds = Math.floor(Date.now() / 1000) - authDate;
    if (ageSeconds > AUTH_DATE_MAX_AGE_SECONDS || ageSeconds < -60) {
      throw new UnauthorizedException('Telegram initData has expired');
    }

    params.delete('hash');

    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const botToken = this.configService.get<string>('telegram.botToken');
    if (!botToken) throw new UnauthorizedException('Bot token not configured');

    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    const computedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    const hashBuf = Buffer.from(hash, 'hex');
    const computedBuf = Buffer.from(computedHash, 'hex');

    if (
      hashBuf.length !== computedBuf.length ||
      !timingSafeEqual(hashBuf, computedBuf)
    ) {
      throw new UnauthorizedException('Invalid initData signature');
    }

    const userDataStr = params.get('user');
    if (!userDataStr)
      throw new UnauthorizedException('Missing user data in initData');

    let telegramUser: {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
    try {
      telegramUser = JSON.parse(userDataStr) as typeof telegramUser;
    } catch {
      throw new UnauthorizedException('Invalid user data in initData');
    }

    if (!telegramUser?.id)
      throw new UnauthorizedException('Missing user ID in initData');

    const user = await this.usersService.findOrCreate({
      telegramId: String(telegramUser.id),
      username: telegramUser.username,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name,
    });

    const payload: JwtPayload = { sub: user.id, telegramId: user.telegramId };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
