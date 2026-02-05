import express from "express";
import { Request, Response, NextFunction } from "express";
import { RateLimiterRedis, RateLimiterMemory } from "rate-limiter-flexible";
import Redis from "ioredis";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

import { setupSwagger } from "./swagger-docs/swagger";
import { errorHandler } from "./middlewares/errorHandler";
import authRouter from "./routes/auth.route";
import eventRouter from "./routes/event.route";
import ticketRouter from "./routes/ticket.route";
import paymentRouter from "./routes/payment.route";
import reminderRouter from "./routes/reminder.route";
import shareRouter from "./routes/share.route";
import analyticsRouter from "./routes/analytics.route";
import { createBearerAuthMiddleware } from "./middlewares/bearerAuth";

const app = express();

// Security and logging middleware
app.use(helmet()); // Security headers
app.use(morgan("dev")); // HTTP request logging

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true, // Allow cookies
  }),
);

// Cookie parser for JWT
app.use(cookieParser());

// Rate Limiter setup
const redisClient = new Redis();

// Add listeners so ioredis errors don't become unhandled
redisClient.on("error", (err: Error) => {
  console.warn("Redis error:", err.message || err);
});
redisClient.on("connect", () => {
  console.info("Redis client connected");
});
redisClient.on("close", () => {
  console.info("Redis connection closed");
});

// Default to an in-memory rate limiter; we'll try to switch to Redis if available
let rateLimiter: any = new RateLimiterMemory({ points: 100, duration: 60 });

// Try to use Redis-backed limiter if Redis is reachable
redisClient
  .ping()
  .then(() => {
    rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      points: 100, // max 100 points
      duration: 60, // per 60 seconds
    });
    console.info("Rate limiter now using Redis");
  })
  .catch((err) => {
    console.warn(
      "Redis ping failed, continuing with in-memory rate limiter:",
      err.message || err,
    );
  });

// parse JSON request bodies
app.use(express.json());

// parse application/x-www-form-urlencoded (HTML form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

// Swagger setup
setupSwagger(app);

// Global Bearer auth middleware: enforces auth except for specified public routes
app.use(
  createBearerAuthMiddleware({
    excludedRoutes: [
      "/api/v1/auth/login",
      "/api/v1/auth/signup",
      "/api/v1/auth/refresh",
      "/api/v1/payments/webhook",
    ],
    publicRules: [
      // Public: List events (exact match)
      { path: "^/api/v1/events$", method: "GET", isRegex: true },
      // Public: Get Event by ID (one segment after /events/, e.g., UUID)
      { path: "^/api/v1/events/[^/]+$", method: "GET", isRegex: true },
      // Public: Get Event by Slug (prefix)
      { path: "/api/v1/events/slug/", method: "GET" },
      // Public: Shared pages
      { path: "/api/v1/share", method: "GET" },
      // Public: Documentation
      { path: "/api-docs", method: "GET" },
    ],
  }),
);

// Middleware to apply rate limiting
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = String(
      req.ip ??
        req.headers["x-forwarded-for"] ??
        req.socket?.remoteAddress ??
        "unknown",
    );
    await rateLimiter.consume(key); // Consume a point for each request
    next();
  } catch (rateLimiterRes) {
    res.status(429).send("Too Many Requests");
  }
});

// Define your routes here
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/tickets", ticketRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/reminders", reminderRouter);
app.use("/api/v1/share", shareRouter);
app.use("/api/v1/analytics", analyticsRouter);

// Global error handling middleware

app.use(errorHandler);

export default app;
