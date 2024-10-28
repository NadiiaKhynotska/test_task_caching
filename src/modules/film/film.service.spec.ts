import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RedisClientType } from 'redis';
import { Repository } from 'typeorm';

import { Film } from './entities/film.entity';
import { FilmService } from './film.service';

// Змокніть модуль Redis
jest.mock('redis', () => {
  const mockRedisClient = {
    get: jest.fn(),
    set: jest.fn(),
    connect: jest.fn(),
    on: jest.fn(),
    // Додайте інші методи, які ви використовуєте
  };

  return {
    createClient: jest.fn(() => mockRedisClient),
  };
});

describe('FilmService', () => {
  let service: FilmService;
  let filmRepository: Repository<Film>;
  let cacheManager: any;
  let redisClient: RedisClientType;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmService,
        {
          provide: getRepositoryToken(Film),
          useClass: Repository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: 'REDIS_CLIENT',
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FilmService>(FilmService);
    filmRepository = module.get<Repository<Film>>(getRepositoryToken(Film));
    cacheManager = module.get<any>(CACHE_MANAGER);
    redisClient = module.get<RedisClientType>('REDIS_CLIENT');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFilmByTitle', () => {
    it('should return film from in-memory cache', async () => {
      const film = new Film();
      film.title = 'Test Film';

      cacheManager.get.mockResolvedValue(film);

      const result = await service.getFilmByTitle('Test Film');

      expect(result).toEqual(film);
      expect(cacheManager.get).toHaveBeenCalledWith('film:Test Film');
    });

    it('should return film from Redis cache', async () => {
      const film = new Film();
      film.title = 'Test Film';

      cacheManager.get.mockResolvedValue(null);
      (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(film));

      const result = await service.getFilmByTitle('Test Film');

      expect(result).toEqual(film);
      expect(cacheManager.get).toHaveBeenCalledWith('film:Test Film');
      expect(redisClient.get).toHaveBeenCalledWith('film:Test Film');
      expect(cacheManager.set).toHaveBeenCalledWith(
        'film:Test Film',
        film,
        15000,
      );
    });

    it('should fetch film from database and update caches', async () => {
      const film = new Film();
      film.title = 'Test Film';

      cacheManager.get.mockResolvedValue(null);
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      jest.spyOn(filmRepository, 'findOne').mockResolvedValue(film);

      const result = await service.getFilmByTitle('Test Film');

      expect(result).toEqual(film);
      expect(cacheManager.get).toHaveBeenCalledWith('film:Test Film');
      expect(redisClient.get).toHaveBeenCalledWith('film:Test Film');
      expect(filmRepository.findOne).toHaveBeenCalledWith({
        where: { title: 'Test Film' },
      });
      expect(cacheManager.set).toHaveBeenCalledWith(
        'film:Test Film',
        film,
        15000,
      );
      expect(redisClient.set).toHaveBeenCalledWith(
        'film:Test Film',
        JSON.stringify(film),
        { EX: 30 },
      );
    });

    it('should handle concurrent requests', async () => {
      const film = new Film();
      film.title = 'Test Film';

      cacheManager.get.mockResolvedValue(null);
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      jest.spyOn(filmRepository, 'findOne').mockResolvedValue(film);

      const promise1 = service.getFilmByTitle('Test Film');
      const promise2 = service.getFilmByTitle('Test Film');

      const result1 = await promise1;
      const result2 = await promise2;

      expect(result1).toEqual(film);
      expect(result2).toEqual(film);
      expect(filmRepository.findOne).toHaveBeenCalledTimes(1);
      expect(cacheManager.set).toHaveBeenCalledWith(
        'film:Test Film',
        film,
        15000,
      );
      expect(redisClient.set).toHaveBeenCalledWith(
        'film:Test Film',
        JSON.stringify(film),
        { EX: 30 },
      );
    });
  });
});
