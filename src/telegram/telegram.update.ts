import { Start, Update, Ctx, Command } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ConfigService } from '@nestjs/config';

@Update()
export class TelegramUpdate {
  constructor(private readonly configService: ConfigService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    const miniAppUrl = this.configService.get<string>(
      'miniApp.url',
      'https://t.me/TapForgeAI_bot/app',
    );
    const firstName = ctx.from?.first_name ?? 'Forger';

    await ctx.reply(
      `Welcome, ${firstName}! 🔨\n\n` +
        `TapForge is a tap-to-earn game where you forge coins and build your empire.\n\n` +
        `Tap as fast as you can to earn coins, then spend them on upgrades to multiply your power!\n\n` +
        `Ready to forge? Click below to start:`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🎮 Play TapForge', web_app: { url: miniAppUrl } }],
          ],
        },
      },
    );
  }

  @Command('stats')
  async onStats(@Ctx() ctx: Context) {
    await ctx.reply(
      '📊 Open the game to see your stats!\n\nClick /start to launch TapForge.',
    );
  }

  @Command('help')
  async onHelp(@Ctx() ctx: Context) {
    await ctx.reply(
      '🔨 *TapForge Help*\n\n' +
        '*Commands:*\n' +
        '/start - Launch the game\n' +
        '/stats - View your stats\n' +
        '/help - Show this help\n\n' +
        '*How to play:*\n' +
        '1. Tap the forge button to earn coins\n' +
        '2. Each tap costs 1 energy\n' +
        '3. Energy regenerates over time\n' +
        '4. Spend coins on upgrades to earn more per tap\n' +
        '5. Climb the leaderboard!',
      { parse_mode: 'Markdown' },
    );
  }
}
