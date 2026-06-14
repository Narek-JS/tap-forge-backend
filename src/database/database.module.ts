import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const nodeEnv = config.get<string>('nodeEnv', 'production');
        const isDev = nodeEnv === 'development';
        return {
          type: 'postgres' as const,
          url: config.get<string>('database.url'),
          autoLoadEntities: true,
          ssl: true,
          synchronize: false,
          logging: isDev,
          extra: { max: 10 },
          retryAttempts: 3,
          retryDelay: 3000,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
