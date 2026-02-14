import request from "supertest";
import jwt from "jsonwebtoken";

const mockHandler = (name: string) => async (_req: any, res: any) =>
  res.status(200).json({ ok: true, route: name });

jest.mock("rate-limiter-flexible", () => {
  class MockRateLimiter {
    consume = jest.fn().mockResolvedValue({});
  }

  return {
    RateLimiterRedis: MockRateLimiter,
    RateLimiterMemory: MockRateLimiter,
  };
});

jest.mock("../../src/lib/redis", () => ({
  __esModule: true,
  default: {
    ping: jest.fn().mockResolvedValue("PONG"),
    incr: jest.fn().mockResolvedValue(1),
  },
}));

jest.mock("../../src/middlewares/verifyToken", () => ({
  verifyToken: (_req: any, _res: any, next: any) => next(),
}));

jest.mock("../../src/middlewares/checkRole", () => ({
  requireCreator: (_req: any, _res: any, next: any) => next(),
}));

jest.mock("../../src/middlewares/upload", () => ({
  upload: {
    single: () => (_req: any, _res: any, next: any) => next(),
  },
}));

jest.mock("../../src/middlewares/authRateLimiter", () => ({
  rateLimitLogin: (_req: any, _res: any, next: any) => next(),
  rateLimitSignup: (_req: any, _res: any, next: any) => next(),
}));

jest.mock("../../src/middlewares/sensitiveRateLimiter", () => ({
  rateLimitPaymentInitialize: (_req: any, _res: any, next: any) => next(),
  rateLimitPaymentVerify: (_req: any, _res: any, next: any) => next(),
  rateLimitPaymentWebhook: (_req: any, _res: any, next: any) => next(),
  rateLimitTicketValidate: (_req: any, _res: any, next: any) => next(),
  rateLimitReminderCreate: (_req: any, _res: any, next: any) => next(),
}));

jest.mock("../../src/controllers/auth.controller", () => ({
  signup: mockHandler("auth.signup"),
  login: mockHandler("auth.login"),
  checkAuth: mockHandler("auth.check-auth"),
  logout: mockHandler("auth.logout"),
  refreshToken: mockHandler("auth.refresh"),
  updateProfile: mockHandler("auth.profile"),
  uploadAvatar: mockHandler("auth.avatar"),
}));

jest.mock("../../src/controllers/event.controller", () => ({
  createEvent: mockHandler("events.create"),
  getEvents: mockHandler("events.list"),
  getEventById: mockHandler("events.by-id"),
  getEventBySlug: mockHandler("events.by-slug"),
  getMyEvents: mockHandler("events.my-events"),
  getEventAttendees: mockHandler("events.attendees"),
  updateEventStatus: mockHandler("events.update-status"),
  updateEvent: mockHandler("events.update"),
  deleteEvent: mockHandler("events.delete"),
}));

jest.mock("../../src/controllers/ticket.controller", () => ({
  purchaseTicket: mockHandler("tickets.purchase"),
  validateTicket: mockHandler("tickets.validate"),
  getMyTickets: mockHandler("tickets.my-tickets"),
  getTicketById: mockHandler("tickets.by-id"),
}));

jest.mock("../../src/controllers/payment.controller", () => ({
  initializePayment: mockHandler("payments.initialize"),
  verifyPaymentWebhook: mockHandler("payments.webhook"),
  verifyPayment: mockHandler("payments.verify"),
  getMyPayments: mockHandler("payments.my-payments"),
  isValidPaystackSignature: jest.fn(),
}));

jest.mock("../../src/controllers/reminder.controller", () => ({
  createReminder: mockHandler("reminders.create"),
  getReminders: mockHandler("reminders.list"),
}));

jest.mock("../../src/controllers/share.controller", () => ({
  getEventShareMetadata: mockHandler("share.metadata"),
  getShareableLink: mockHandler("share.link"),
}));

jest.mock("../../src/controllers/analytics.controller", () => ({
  getCreatorDashboard: mockHandler("analytics.dashboard"),
  getEventAnalytics: mockHandler("analytics.event"),
}));

import app from "../../src/app";

describe("App routes integration", () => {
  const originalEnv = process.env;

  beforeAll(() => {
    process.env = {
      ...originalEnv,
      NODE_ENV: "test",
      JWT_SECRET: "test-secret",
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const createAuthHeader = () => {
    const token = jwt.sign(
      { userId: "user-1", role: "CREATOR" },
      "test-secret",
    );
    return { Authorization: `Bearer ${token}` };
  };

  describe("public endpoints", () => {
    it("allows access to all configured public routes", async () => {
      const responses = await Promise.all([
        request(app)
          .post("/api/v1/auth/login")
          .send({ email: "a@b.com", password: "password" }),
        request(app)
          .post("/api/v1/auth/signup")
          .send({ email: "a@b.com", password: "password" }),
        request(app).post("/api/v1/auth/refresh"),
        request(app).get("/api/v1/events"),
        request(app).get("/api/v1/events/event-1"),
        request(app).get("/api/v1/events/slug/sample-event"),
        request(app).get("/api/v1/share/events/sample-event/metadata"),
        request(app).get("/api/v1/share/events/event-1/link"),
        request(app)
          .post("/api/v1/payments/webhook")
          .send({ event: "charge.success" }),
      ]);

      for (const response of responses) {
        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
      }
    });
  });

  describe("protected endpoints", () => {
    const protectedRequestsWithoutToken = [
      () => request(app).get("/api/v1/auth/check-auth"),
      () =>
        request(app).put("/api/v1/auth/profile").send({ firstName: "Test" }),
      () => request(app).post("/api/v1/auth/avatar"),
      () => request(app).post("/api/v1/events").send({ title: "X" }),
      () => request(app).get("/api/v1/events/my/events"),
      () => request(app).get("/api/v1/events/event-1/attendees"),
      () =>
        request(app)
          .patch("/api/v1/events/event-1/status")
          .send({ status: "PUBLISHED" }),
      () => request(app).put("/api/v1/events/event-1").send({ title: "Y" }),
      () => request(app).delete("/api/v1/events/event-1"),
      () =>
        request(app)
          .post("/api/v1/tickets/purchase")
          .send({ eventId: "event-1" }),
      () => request(app).get("/api/v1/tickets/my-tickets"),
      () => request(app).get("/api/v1/tickets/ticket-1"),
      () =>
        request(app).post("/api/v1/tickets/validate").send({ qrCode: "abc" }),
      () =>
        request(app)
          .post("/api/v1/payments/initialize")
          .send({ eventId: "event-1" }),
      () => request(app).get("/api/v1/payments/verify?reference=ref-1"),
      () => request(app).get("/api/v1/payments/my/payments"),
      () => request(app).post("/api/v1/reminders").send({ eventId: "event-1" }),
      () => request(app).get("/api/v1/reminders"),
      () => request(app).get("/api/v1/analytics/dashboard"),
      () => request(app).get("/api/v1/analytics/event/event-1"),
    ];

    it("returns 401 when token is missing", async () => {
      for (const makeRequest of protectedRequestsWithoutToken) {
        const response = await makeRequest();
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message");
      }
    });

    it("allows protected routes with a valid bearer token", async () => {
      const authHeader = createAuthHeader();

      const responses = await Promise.all([
        request(app).get("/api/v1/auth/check-auth").set(authHeader),
        request(app)
          .put("/api/v1/auth/profile")
          .set(authHeader)
          .send({ firstName: "New" }),
        request(app).post("/api/v1/auth/avatar").set(authHeader),
        request(app)
          .post("/api/v1/events")
          .set(authHeader)
          .send({ title: "Demo" }),
        request(app).get("/api/v1/events/my/events").set(authHeader),
        request(app).get("/api/v1/events/event-1/attendees").set(authHeader),
        request(app)
          .patch("/api/v1/events/event-1/status")
          .set(authHeader)
          .send({ status: "PUBLISHED" }),
        request(app)
          .put("/api/v1/events/event-1")
          .set(authHeader)
          .send({ title: "Updated" }),
        request(app).delete("/api/v1/events/event-1").set(authHeader),
        request(app)
          .post("/api/v1/tickets/purchase")
          .set(authHeader)
          .send({ eventId: "event-1" }),
        request(app).get("/api/v1/tickets/my-tickets").set(authHeader),
        request(app).get("/api/v1/tickets/ticket-1").set(authHeader),
        request(app)
          .post("/api/v1/tickets/validate")
          .set(authHeader)
          .send({ qrCode: "abc" }),
        request(app)
          .post("/api/v1/payments/initialize")
          .set(authHeader)
          .send({ eventId: "event-1" }),
        request(app)
          .get("/api/v1/payments/verify?reference=ref-1")
          .set(authHeader),
        request(app).get("/api/v1/payments/my/payments").set(authHeader),
        request(app)
          .post("/api/v1/reminders")
          .set(authHeader)
          .send({ eventId: "event-1" }),
        request(app).get("/api/v1/reminders").set(authHeader),
        request(app).get("/api/v1/analytics/dashboard").set(authHeader),
        request(app).get("/api/v1/analytics/event/event-1").set(authHeader),
      ]);

      for (const response of responses) {
        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
      }
    });
  });
});
