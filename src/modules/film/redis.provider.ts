import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

import { RedisConfig } from '../../config/config.type';

export const redisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: async (configService: ConfigService) => {
    const config = configService.get<RedisConfig>('redis');
    const client = createClient({
      url: config.url,
      password: config.password,
    });
    await client.connect();
    return client;
  },
  inject: [ConfigService],
};
