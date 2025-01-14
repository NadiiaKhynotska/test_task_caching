export type Config = {
  app: AppConfig;
  postgres: PostgresConfig;
  redis: RedisConfig;
};

export type AppConfig = {
  host: string;
  port: number;
};
export type PostgresConfig = {
  port: number;
  host: string;
  user: string;
  password: string;
  dbName: string;
};

export type RedisConfig = {
  port: number;
  host: string;
  password: string;
  url: string;
};
