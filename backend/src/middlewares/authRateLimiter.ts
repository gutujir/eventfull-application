import { Request, Response, NextFunction } from "express";
import { RateLimiterRedis, RateLimiterMemory } from "rate-limiter-flexible";
import redisClient from "../lib/redis";

// Limits
// Login: 5 attempts per 15 minutes (per IP and per email)
// Signup: 3 attempts per hour (per IP and per email)

let loginLimiterIP: any;
let loginLimiterEmail: any;
let signupLimiterIP: any;
let signupLimiterEmail: any;

const initLimiters = () => {
  try {
    loginLimiterIP = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: "login_ip",
      points: 5,
      duration: 15 * 60, // 15 minutes
    });

    loginLimiterEmail = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: "login_email",
      points: 5,
      duration: 15 * 60,
    });

    signupLimiterIP = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: "signup_ip",
      points: 3,
      duration: 60 * 60, // 1 hour
    });

    signupLimiterEmail = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: "signup_email",
      points: 3,
      duration: 60 * 60,
    });

    console.info("Auth rate limiters using Redis");
  } catch (err) {
    // Fallback to in-memory
    loginLimiterIP = new RateLimiterMemory({ points: 5, duration: 15 * 60 });
    loginLimiterEmail = new RateLimiterMemory({ points: 5, duration: 15 * 60 });
    signupLimiterIP = new RateLimiterMemory({ points: 3, duration: 60 * 60 });
    signupLimiterEmail = new RateLimiterMemory({
      points: 3,
      duration: 60 * 60,
    });
    console.warn("Auth rate limiters using in-memory fallback");
  }
};

initLimiters();

export const rateLimitLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ip = String(
    req.ip ??
      req.headers["x-forwarded-for"] ??
      req.socket?.remoteAddress ??
      "unknown",
  );
  const rawEmail = (req.body?.email || "") as string;
  const email = rawEmail.trim().toLowerCase();

  // Allow bypass during local development for quick testing
  const bypassHeader = String(
    req.headers["x-bypass-rate-limit"] || "",
  ).toLowerCase();
  const isLocalhost =
    ip.includes("127.0.0.1") || ip === "::1" || ip.includes("::ffff:127.0.0.1");
  if (
    process.env.NODE_ENV !== "production" &&
    (isLocalhost || bypassHeader === "true")
  ) {
    return next();
  }

  try {
    // Consume points from both IP and email limiters
    await Promise.allSettled([
      loginLimiterIP.consume(ip),
      email ? loginLimiterEmail.consume(email) : Promise.resolve(),
    ]).then((results) => {
      const rejected = results.find(
        (r) => r && (r as any).status === "rejected",
      );
      if (rejected) {
        throw rejected;
      }
    });

    next();
  } catch (err: any) {
    // When rejected, rate-limiter-flexible returns an object with msBeforeNext
    const ms = err?.msBeforeNext || (err && err.msBeforeNext) || 0;
    const seconds = Math.ceil(ms / 1000);
    res.set("Retry-After", String(seconds));
    // Log details for monitoring
    try {
      console.warn(`Rate limit hit (login) ip=${ip} email=${email} ms=${ms}`);
      // increment a simple counter for monitoring
      redisClient.incr("rate_limit_hits:login").catch(() => {});
    } catch (e) {
      // ignore logging errors
    }

    res.status(429).json({
      success: false,
      message: "Too many login attempts. Try again later.",
    });
  }
};

export const rateLimitSignup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ip = String(
    req.ip ??
      req.headers["x-forwarded-for"] ??
      req.socket?.remoteAddress ??
      "unknown",
  );
  const rawEmail = (req.body?.email || "") as string;
  const email = rawEmail.trim().toLowerCase();

  // Allow bypass during local development for quick testing
  const bypassHeader = String(
    req.headers["x-bypass-rate-limit"] || "",
  ).toLowerCase();
  const isLocalhost =
    ip.includes("127.0.0.1") || ip === "::1" || ip.includes("::ffff:127.0.0.1");
  if (
    process.env.NODE_ENV !== "production" &&
    (isLocalhost || bypassHeader === "true")
  ) {
    return next();
  }

  try {
    await Promise.allSettled([
      signupLimiterIP.consume(ip),
      email ? signupLimiterEmail.consume(email) : Promise.resolve(),
    ]).then((results) => {
      const rejected = results.find(
        (r) => r && (r as any).status === "rejected",
      );
      if (rejected) {
        throw rejected;
      }
    });

    next();
  } catch (err: any) {
    const ms = err?.msBeforeNext || (err && err.msBeforeNext) || 0;
    const seconds = Math.ceil(ms / 1000);
    res.set("Retry-After", String(seconds));
    try {
      console.warn(`Rate limit hit (signup) ip=${ip} email=${email} ms=${ms}`);
      redisClient.incr("rate_limit_hits:signup").catch(() => {});
    } catch (e) {}

    res.status(429).json({
      success: false,
      message: "Too many signup attempts. Try again later.",
    });
  }
};
