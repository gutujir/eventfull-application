import IORedis, { RedisOptions } from "ioredis";

export const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Configure options compatible with BullMQ / rate-limiter-flexible
export const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
};

const redis = new IORedis(REDIS_URL, redisOptions);

redis.on("error", (err: Error) => {
  console.warn("Redis error:", err?.message || err);
});
redis.on("connect", () => {
  console.info("Redis client connected");
});

export default redis;
