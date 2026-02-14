import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import authReducer from "../../../../src/features/auth/authSlice";
import ticketReducer from "../../../../src/features/tickets/ticketSlice";
import PurchaseTicketModal from "../../../../src/components/tickets/PurchaseTicketModal";

describe("PurchaseTicketModal integration", () => {
  it("disables booking for creator users", () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        tickets: ticketReducer,
        events: (state = {}) => state,
        analytics: (state = {}) => state,
      },
      preloadedState: {
        auth: {
          user: {
            role: "CREATOR",
            email: "creator@example.com",
          },
          token: "token",
          isAuthenticated: true,
          isAuthChecking: false,
          isLoading: false,
          isError: false,
          isSuccess: false,
          message: "",
        },
        tickets: {
          tickets: [],
          ticket: null,
          isLoading: false,
          isError: false,
          isSuccess: false,
          message: "",
        },
        events: {},
        analytics: {},
      },
    });

    const event = {
      id: "event-1",
      title: "Creator Test Event",
      date: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      price: 100,
      currency: "NGN",
      ticketTypes: [
        {
          id: "ticket-1",
          name: "General",
          price: 100,
          currency: "NGN",
        },
      ],
    };

    render(
      <Provider store={store}>
        <MemoryRouter>
          <PurchaseTicketModal isOpen onClose={() => {}} event={event} />
        </MemoryRouter>
      </Provider>,
    );

    expect(
      screen.getByText("Creators cannot purchase tickets."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Booking Unavailable" }),
    ).toBeDisabled();
  });
});
