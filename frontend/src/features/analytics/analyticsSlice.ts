import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import analyticsService from "./analyticsService";

interface DashboardStats {
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  eventsBreakdown: Array<{
    id: string;
    title: string;
    date: string;
    ticketsSold: number;
    revenue: number;
  }>;
}

interface EventStats {
  ticketsSold: number;
  revenue: number;
  attendeesCheckedIn: number;
}

interface AnalyticsState {
  dashboardStats: DashboardStats | null;
  eventStats: EventStats | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  message: string;
}

const initialState: AnalyticsState = {
  dashboardStats: null,
  eventStats: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

export const getCreatorDashboardStats = createAsyncThunk(
  "analytics/getCreatorDashboard",
  async (_, thunkAPI) => {
    try {
      const response = await analyticsService.getCreatorDashboard();
      return response.stats;
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

export const getEventAnalyticsStats = createAsyncThunk(
  "analytics/getEventStats",
  async (eventId: string, thunkAPI) => {
    try {
      const response = await analyticsService.getEventAnalytics(eventId);
      return response.stats;
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

export const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
      state.dashboardStats = null;
      state.eventStats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCreatorDashboardStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCreatorDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.dashboardStats = action.payload;
      })
      .addCase(getCreatorDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(getEventAnalyticsStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getEventAnalyticsStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.eventStats = action.payload;
      })
      .addCase(getEventAnalyticsStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      });
  },
});

export const { reset } = analyticsSlice.actions;
export default analyticsSlice.reducer;
