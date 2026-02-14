jest.mock("../../src/lib/prisma", () => ({
  prisma: {
    ticket: {
      aggregate: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    event: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock("../../src/lib/redis", () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue("OK"),
  },
}));

import { prisma } from "../../src/lib/prisma";
import { getEventStats } from "../../src/services/analytics.service";

describe("analytics calculations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns unique buyers and attendance rate with numeric values", async () => {
    (prisma.ticket.aggregate as jest.Mock).mockResolvedValue({
      _count: { id: 10 },
      _sum: { purchasePrice: 5000 },
    });

    (prisma.ticket.count as jest.Mock).mockResolvedValue(7);
    (prisma.ticket.findMany as jest.Mock).mockResolvedValue([
      { userId: "u1" },
      { userId: "u2" },
      { userId: "u3" },
    ]);

    const stats = await getEventStats("event-1");

    expect(stats.ticketsSold).toBe(10);
    expect(stats.attendeesCheckedIn).toBe(7);
    expect(stats.uniqueEventeesBought).toBe(3);
    expect(stats.attendanceRate).toBe(70);
    expect(typeof stats.revenue).toBe("number");
  });
});
