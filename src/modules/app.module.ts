import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-ioredis';

import { Config, PostgresConfig, RedisConfig } from '../config/config.type';
import configuration from '../config/configuration';
import { FilmModule } from './film/film.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService<Config>) => {
        const config = configService.get<PostgresConfig>('postgres');
        return {
          type: 'postgres',
          host: config.host,
          port: config.port,
          username: config.user,
          password: config.password,
          database: config.dbName,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService<Config>) => {
        const config = configService.get<RedisConfig>('redis');
        return {
          store: redisStore,
          host: config.host,
          port: config.port,
          password: config.password,
          ttl: 30,
        };
      },
      inject: [ConfigService],
    }),
    FilmModule,
  ],
})
export class AppModule {}
