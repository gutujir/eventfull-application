import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ticketService from "./ticketService";

interface Ticket {
  id: string;
  eventId: string;
  ticketTypeId?: string;
  userId: string;
  status: string;
  qrCode?: string;
  event?: any; // Populated event data
  ticketType?: {
    name: string;
    price: number;
    description?: string;
  };
  purchasePrice?: number;
}

interface TicketState {
  tickets: Ticket[];
  ticket: Ticket | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  message: string;
}

const initialState: TicketState = {
  tickets: [],
  ticket: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

// Purchase Ticket
export const purchaseTicket = createAsyncThunk(
  "tickets/purchase",
  async (
    ticketData: { eventId: string; ticketTypeId?: string; quantity: number },
    thunkAPI,
  ) => {
    try {
      return await ticketService.purchaseTicket(ticketData);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Validate Ticket
export const validateEventTicket = createAsyncThunk(
  "tickets/validate",
  async (data: { qrCode: string; eventId: string }, thunkAPI) => {
    try {
      return await ticketService.validateTicket(data);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Get My Tickets
export const getMyTickets = createAsyncThunk(
  "tickets/getMyTickets",
  async (_, thunkAPI) => {
    try {
      return await ticketService.getMyTickets();
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const ticketSlice = createSlice({
  name: "ticket",
  initialState,
  reducers: {
    reset: (state) => {
      state.isSuccess = false;
      state.isError = false;
      state.isLoading = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Purchase Ticket
      .addCase(purchaseTicket.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(purchaseTicket.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Depending on response, might need to push to tickets or set current ticket
      })
      .addCase(purchaseTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // Get My Tickets
      .addCase(getMyTickets.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyTickets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.tickets = action.payload.tickets || action.payload; // Adjust based on API response
      })
      .addCase(getMyTickets.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // Validate Ticket
      .addCase(validateEventTicket.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(validateEventTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.ticket = action.payload.ticket || null;
        state.message =
          action.payload.message || "Ticket verified successfully.";
      })
      .addCase(validateEventTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      });
  },
});

export const { reset } = ticketSlice.actions;
export default ticketSlice.reducer;
