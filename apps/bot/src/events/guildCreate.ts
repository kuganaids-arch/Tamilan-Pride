import { createClient } from 'redis';
import { env } from '../config/env';

class RedisService {
  private client = createClient({ url: env.REDIS_URL });

  async connect() {
    await this.client.connect();
    console.log('Redis connected');
  }

  async disconnect() {
    await this.client.disconnect();
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      await this.client.set(key, value, { EX: ttlSeconds });
      return;
    }

    await this.client.set(key, value);
  }

  async get(key: string) {
    return this.client.get(key);
  }
}

export const redisService = new RedisService();
