import { describe, expect, it } from "vitest";
import { isEventEnded } from "../../../src/utils/eventStatus";

describe("eventStatus", () => {
  it("returns true when status is COMPLETED", () => {
    expect(
      isEventEnded({
        date: new Date(Date.now() + 60_000).toISOString(),
        status: "COMPLETED",
      }),
    ).toBe(true);
  });

  it("returns true when endDateTime is in the past", () => {
    expect(
      isEventEnded({
        date: new Date(Date.now() + 60_000).toISOString(),
        endDateTime: new Date(Date.now() - 1_000).toISOString(),
        status: "PUBLISHED",
      }),
    ).toBe(true);
  });

  it("returns false when event is still active", () => {
    expect(
      isEventEnded({
        date: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        endDateTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        status: "PUBLISHED",
      }),
    ).toBe(false);
  });
});
