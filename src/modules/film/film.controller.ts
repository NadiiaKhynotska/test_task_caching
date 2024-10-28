import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Film } from './entities/film.entity';
import { FilmService } from './film.service';

@ApiTags('Films')
@Controller('film')
export class FilmController {
  constructor(private readonly filmService: FilmService) {}

  @Get(':title')
  async getFilmByTitle(@Param('title') title: string): Promise<Film> {
    return await this.filmService.getFilmByTitle(title);
  }
}
