import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import EventList from "../../../../src/components/events/EventList";
import type { Event } from "../../../../src/features/events/eventSlice";

describe("EventList integration", () => {
  it("shows ended status and closed booking text for past events", () => {
    const events: Event[] = [
      {
        id: "event-1",
        slug: "ended-event",
        title: "Ended Event",
        description: "Event already ended",
        date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        price: 0,
        location: "Online",
        imageUrl: "",
        currency: "NGN",
        capacity: 100,
        status: "PUBLISHED",
        isPublic: true,
        creatorId: "creator-1",
      },
    ];

    render(
      <MemoryRouter>
        <EventList
          events={events}
          isLoading={false}
          isError={false}
          message=""
          onRetry={() => {}}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Ended")).toBeInTheDocument();
    expect(screen.getByText("Booking closed")).toBeInTheDocument();
  });
});
