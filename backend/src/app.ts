import express from "express";
import { Request, Response, NextFunction } from "express";
import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";

import { setupSwagger } from "./swagger-docs/swagger";
import { errorHandler } from "./middlewares/errorHandler";
import authRouter from "./routes/auth.route";
import eventRouter from "./routes/event.route";
import ticketRouter from "./routes/ticket.route";
import paymentRouter from "./routes/payment.route";
import reminderRouter from "./routes/reminder.route";

const app = express();

// Rate Limiter setup
const redisClient = new Redis();

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: 100, // max 100 points
  duration: 60, // per 60 seconds
});

// parse JSON request bodies
app.use(express.json());

// parse application/x-www-form-urlencoded (HTML form submissions)
app.use(express.urlencoded({ extended: true }));

// Swagger setup
setupSwagger(app);

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

// Global error handling middleware
app.use(errorHandler);

export default app;
