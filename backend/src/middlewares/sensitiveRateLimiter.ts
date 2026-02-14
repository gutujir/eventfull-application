import { Request, Response, NextFunction } from "express";
import { RateLimiterMemory, RateLimiterRedis } from "rate-limiter-flexible";
import redisClient from "../lib/redis";

type Limiter = RateLimiterMemory | RateLimiterRedis;

const createLimiter = (
  keyPrefix: string,
  points: number,
  duration: number,
): Limiter => {
  try {
    return new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix,
      points,
      duration,
    });
  } catch {
    return new RateLimiterMemory({ keyPrefix, points, duration });
  }
};

const resolveClientKey = (req: Request) =>
  String(
    req.ip ??
      req.headers["x-forwarded-for"] ??
      req.socket?.remoteAddress ??
      "unknown",
  );

const buildLimiterMiddleware = (
  limiter: Limiter,
  message: string,
  keyResolver?: (req: Request) => string,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = keyResolver ? keyResolver(req) : resolveClientKey(req);
      await limiter.consume(key);
      next();
    } catch (error: any) {
      const ms = error?.msBeforeNext || 0;
      const retryAfter = Math.ceil(ms / 1000);
      if (retryAfter > 0) {
        res.set("Retry-After", String(retryAfter));
      }
      res.status(429).json({ success: false, message });
    }
  };
};

const paymentInitLimiter = createLimiter("pay_init", 10, 60);
const paymentVerifyLimiter = createLimiter("pay_verify", 20, 60);
const paymentWebhookLimiter = createLimiter("pay_webhook", 120, 60);
const ticketValidateLimiter = createLimiter("ticket_validate", 30, 60);
const reminderCreateLimiter = createLimiter("reminder_create", 12, 60);

export const rateLimitPaymentInitialize = buildLimiterMiddleware(
  paymentInitLimiter,
  "Too many payment initialization attempts. Please try again shortly.",
  (req) => `${resolveClientKey(req)}:${(req as any).userId || "anon"}`,
);

export const rateLimitPaymentVerify = buildLimiterMiddleware(
  paymentVerifyLimiter,
  "Too many payment verification attempts. Please try again shortly.",
  (req) => `${resolveClientKey(req)}:${(req as any).userId || "anon"}`,
);

export const rateLimitPaymentWebhook = buildLimiterMiddleware(
  paymentWebhookLimiter,
  "Webhook rate limit exceeded.",
);

export const rateLimitTicketValidate = buildLimiterMiddleware(
  ticketValidateLimiter,
  "Too many ticket validation attempts. Please slow down.",
  (req) => `${resolveClientKey(req)}:${(req as any).userId || "anon"}`,
);

export const rateLimitReminderCreate = buildLimiterMiddleware(
  reminderCreateLimiter,
  "Too many reminder requests. Please try again shortly.",
  (req) => `${resolveClientKey(req)}:${(req as any).userId || "anon"}`,
);
