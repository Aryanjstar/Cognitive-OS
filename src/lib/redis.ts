import Redis from "ioredis";
import { createChildLogger } from "./logger";

const log = createChildLogger("redis");

let redis: Redis | null = null;

function getRedisClient(): Redis | null {
  if (redis) return redis;

  const url = process.env.REDIS_URL;
  if (!url) {
    log.warn("REDIS_URL not set — caching disabled, using in-memory fallback");
    return null;
  }

  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redis.on("error", (err) => {
      log.error({ err: err.message }, "Redis connection error");
    });

    redis.on("connect", () => {
      log.info("Redis connected");
    });

    redis.connect().catch(() => {
      log.warn("Redis connect failed — caching disabled");
      redis = null;
    });

    return redis;
  } catch {
    log.warn("Redis init failed — caching disabled");
    return null;
  }
}

const memoryCache = new Map<string, { value: string; expiresAt: number }>();

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (client) {
    try {
      const val = await client.get(`cos:${key}`);
      return val ? (JSON.parse(val) as T) : null;
    } catch {
      // fall through to memory cache
    }
  }
  const entry = memoryCache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return JSON.parse(entry.value) as T;
  }
  memoryCache.delete(key);
  return null;
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number = 300
): Promise<void> {
  const serialized = JSON.stringify(value);
  const client = getRedisClient();
  if (client) {
    try {
      await client.setex(`cos:${key}`, ttlSeconds, serialized);
      return;
    } catch {
      // fall through to memory cache
    }
  }
  memoryCache.set(key, {
    value: serialized,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export async function cacheInvalidate(pattern: string): Promise<void> {
  const client = getRedisClient();
  if (client) {
    try {
      const keys = await client.keys(`cos:${pattern}`);
      if (keys.length > 0) await client.del(...keys);
    } catch {
      // ignore
    }
  }
  for (const k of memoryCache.keys()) {
    if (k.startsWith(pattern.replace("*", ""))) {
      memoryCache.delete(k);
    }
  }
}
