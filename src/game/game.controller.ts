import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GameService } from './game.service';
import { TapDto } from './dto/tap.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Game')
@ApiBearerAuth()
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('state')
  @ApiOperation({
    summary: 'Get current game state (energy, coins, tap power)',
  })
  getState(@CurrentUser() user: JwtPayload) {
    return this.gameService.getUserState(user.sub);
  }

  @Post('tap')
  @ApiOperation({ summary: 'Register taps and earn coins' })
  tap(@CurrentUser() user: JwtPayload, @Body() dto: TapDto) {
    return this.gameService.tap(user.sub, dto.count);
  }

  @Public()
  @Get('leaderboard')
  @ApiOperation({ summary: 'Get top 100 players by coins (public)' })
  getLeaderboard() {
    return this.gameService.getLeaderboard();
  }
}
