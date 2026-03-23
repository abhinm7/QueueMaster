import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { config } from 'process';

@Module({
  imports: [
    // global config initialization
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // postgres connection configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
        ssl: { rejectUnauthorized: false },
      }),
    }),
    // redis connection via BullMQ
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = new URL(config.getOrThrow<string>('REDIS_URL'));
        return {
          connection: {
            host: redisUrl.hostname,
            port: Number(redisUrl.port),
            password: redisUrl.password || undefined,
            db: Number(redisUrl.pathname.replace('/', '')) || 1,
            tls: redisUrl.protocol === 'rediss:' ? {} : undefined,
          }
        }
      }
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
