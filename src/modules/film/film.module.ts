import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Film } from './entities/film.entity';
import { FilmController } from './film.controller';
import { FilmService } from './film.service';
import { redisProvider } from './redis.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([Film]),
    CacheModule.register(),
    ConfigModule,
  ],
  providers: [FilmService, redisProvider],
  controllers: [FilmController],
})
export class FilmModule {}
