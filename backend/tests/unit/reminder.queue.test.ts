jest.mock("../../src/dal/reminder.dal", () => ({
  createReminder: jest.fn(),
}));

jest.mock("../../src/queues/reminder.queue", () => ({
  addReminderJob: jest.fn().mockResolvedValue({ id: "job-1" }),
}));

import * as reminderDal from "../../src/dal/reminder.dal";
import { addReminderJob } from "../../src/queues/reminder.queue";
import * as reminderService from "../../src/services/reminder.service";

describe("reminder scheduling", () => {
  it("enqueues reminder with scheduledAt payload", async () => {
    const scheduledAt = new Date(Date.now() + 60_000);

    (reminderDal.createReminder as jest.Mock).mockResolvedValue({
      id: "rem-123",
      scheduledAt,
      user: { email: "test@example.com" },
      event: { title: "Sample Event" },
    });

    await reminderService.createReminder("user-1", "event-1", scheduledAt);

    expect(addReminderJob).toHaveBeenCalledWith(
      expect.objectContaining({
        reminderId: "rem-123",
        scheduledAt: scheduledAt.toISOString(),
        userEmail: "test@example.com",
        eventTitle: "Sample Event",
      }),
    );
  });
});
