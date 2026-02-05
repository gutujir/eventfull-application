import IORedis, { RedisOptions } from "ioredis";
import dotenv from "dotenv";

// Ensure env vars are loaded even if this module is imported early
dotenv.config();

const getRedisUrl = () => {
  if (process.env.REDIS_URL) return process.env.REDIS_URL;
  if (process.env.NODE_ENV === "production") {
    console.error("REDIS_URL is not defined in production!");
  }
  return "redis://127.0.0.1:6379";
};

export const REDIS_URL = getRedisUrl();

// Configure options compatible with BullMQ / rate-limiter-flexible
export const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  // If using rediss:// (SSL) or if provider requires TLS, ensure it's handled.
  // For Upstash, if the URL starts with redis://, it might still require TLS on port 6379?
  // Usually Upstash uses rediss:// for TLS.
  // We can force TLS if needed, but let's rely on the URL scheme first.
};

const redis = new IORedis(REDIS_URL, redisOptions);

redis.on("error", (err: Error) => {
  console.warn("Redis error:", err?.message || err);
});
redis.on("connect", () => {
  console.info("Redis client connected");
});

export default redis;
