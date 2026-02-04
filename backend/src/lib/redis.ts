import IORedis, { RedisOptions } from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Configure options compatible with BullMQ / rate-limiter-flexible
const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
};

const redis = new IORedis(redisUrl, redisOptions);

redis.on("error", (err: Error) => {
  console.warn("Redis error:", err?.message || err);
});
redis.on("connect", () => {
  console.info("Redis client connected");
});

export default redis;
