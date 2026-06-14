export default () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl)
    throw new Error('DATABASE_URL environment variable is required');

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken)
    throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret)
    throw new Error('JWT_SECRET environment variable is required');

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT ?? '3000', 10) || 3000,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    database: {
      url: databaseUrl,
      directUrl: process.env.DIRECT_DATABASE_URL ?? databaseUrl,
    },
    telegram: {
      botToken,
      botUsername: process.env.TELEGRAM_BOT_USERNAME || 'TapForgeAI_bot',
    },
    jwt: {
      secret: jwtSecret,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    miniApp: {
      url: process.env.MINI_APP_URL || 'https://tap-forge-front.vercel.app/',
    },
  };
};
