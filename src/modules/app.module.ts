import { Module } from '@nestjs/common';
import { FilmModule } from './film/film.module';

@Module({
  imports: [FilmModule],



})
export class AppModule {}
