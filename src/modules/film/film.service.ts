import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { RedisClientType } from 'redis';
import { Repository } from 'typeorm';

import { Film } from './entities/film.entity';

@Injectable()
export class FilmService {
  constructor(
    @InjectRepository(Film)
    private filmRepository: Repository<Film>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('REDIS_CLIENT') private redisClient: RedisClientType,
  ) {}

  private pendingCache: { [key: string]: Promise<Film> } = {};

  /**
   * Return a film by its title.
   *
   * The film is searched in the following order:
   * 1. In-memory cache
   * 2. Redis cache
   * 3. Database
   *
   * If the film is not found, `null` is returned.
   *
   * @param title The title of the film to search for.
   */
  async getFilmByTitle(title: string): Promise<Film | null> {
    const inMemoryCacheKey = `film:${title}`;

    // 1. Check in-memory cache
    const inMemoryCache = await this.cacheManager.get<Film>(inMemoryCacheKey);
    if (inMemoryCache) {
      return inMemoryCache;
    }

    // 2. Check Redis cache
    const redisCache = await this.redisClient.get(inMemoryCacheKey);
    if (redisCache) {
      const film = JSON.parse(redisCache);
      await this.cacheManager.set(inMemoryCacheKey, film, 15000);
      return film;
    }

    // 3. Check if the request is already in progress
    if (this.pendingCache[inMemoryCacheKey]) {
      return await this.pendingCache[inMemoryCacheKey];
    }

    // 4. Retrieve the film from the database
    const promise = this.filmRepository
      .findOne({ where: { title } })
      .then((film) => {
        if (film) {
          this.cacheManager.set(inMemoryCacheKey, film, 15000);
          this.redisClient.set(inMemoryCacheKey, JSON.stringify(film), {
            EX: 30,
          });
        }
        delete this.pendingCache[inMemoryCacheKey];
        return film;
      });

    this.pendingCache[inMemoryCacheKey] = promise;
    return await promise;
  }
}
