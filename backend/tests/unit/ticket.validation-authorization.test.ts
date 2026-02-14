jest.mock("../../src/dal/ticket.dal", () => ({
  findTicketByQrCode: jest.fn(),
  updateTicketStatus: jest.fn(),
}));

jest.mock("../../src/lib/prisma", () => ({
  prisma: {},
}));

jest.mock("../../src/lib/redis", () => ({
  __esModule: true,
  default: {
    del: jest.fn(),
  },
}));

import * as ticketDal from "../../src/dal/ticket.dal";
import * as ticketService from "../../src/services/ticket.service";

describe("ticket validation authorization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects validation when creator does not own the event", async () => {
    (ticketDal.findTicketByQrCode as jest.Mock).mockResolvedValue({
      id: "ticket-1",
      eventId: "event-1",
      status: "VALID",
      event: { creatorId: "creator-owner" },
    });

    await expect(
      ticketService.validateTicket("qr-code", "event-1", "creator-other"),
    ).rejects.toThrow("Unauthorized - you are not the creator of this event");
  });

  it("allows validation for event owner and marks ticket as used", async () => {
    (ticketDal.findTicketByQrCode as jest.Mock).mockResolvedValue({
      id: "ticket-1",
      eventId: "event-1",
      status: "VALID",
      event: { creatorId: "creator-owner" },
    });

    (ticketDal.updateTicketStatus as jest.Mock).mockResolvedValue({
      id: "ticket-1",
      status: "USED",
    });

    const result = await ticketService.validateTicket(
      "qr-code",
      "event-1",
      "creator-owner",
    );

    expect(result.status).toBe("USED");
    expect(ticketDal.updateTicketStatus).toHaveBeenCalled();
  });
});
