import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import eventService from "./eventService";

export interface Event {
  id: string;
  slug?: string;
  title: string;
  description: string;
  date: string;
  price: number;
  location: string;
  imageUrl: string;
  currency: string;
  capacity: number;
  status: string;
  isPublic: boolean;
  creatorId: string;
  creator?: {
    first_name: string;
    last_name: string;
    avatarUrl?: string;
    jobTitle?: string;
    company?: string;
    phone?: string;
    website?: string;
    bio?: string;
  };
  ticketTypes?: {
    id: string;
    name: string;
    price: string | number;
    currency: string;
  }[];
}

interface EventState {
  events: Event[];
  event: Event | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  message: string;
}

const initialState: EventState = {
  events: [],
  event: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

// Get all events
export const getEvents = createAsyncThunk(
  "events/getAll",
  async (
    filters: { search?: string; location?: string } | undefined,
    thunkAPI,
  ) => {
    try {
      return await eventService.getEvents(filters);
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

// Get single event
export const getEvent = createAsyncThunk(
  "events/get",
  async (id: string, thunkAPI) => {
    try {
      return await eventService.getEvent(id);
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

// Get user events
export const getMyEvents = createAsyncThunk(
  "events/getMyEvents",
  async (_, thunkAPI) => {
    try {
      return await eventService.getMyEvents();
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

// Create new event
export const createEvent = createAsyncThunk(
  "events/create",
  async (eventData: any, thunkAPI) => {
    try {
      return await eventService.createEvent(eventData);
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

// Update event
export const updateEvent = createAsyncThunk(
  "events/update",
  async ({ id, eventData }: { id: string; eventData: any }, thunkAPI) => {
    try {
      return await eventService.updateEvent(id, eventData);
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

// Delete event
export const deleteEvent = createAsyncThunk(
  "events/delete",
  async (id: string, thunkAPI) => {
    try {
      return await eventService.deleteEvent(id);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          (error.response.data.message || error.response.data.error)) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const eventSlice = createSlice({
  name: "event",
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
      .addCase(getEvents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload.events;
      })
      .addCase(getEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(getEvent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.event = action.payload.event;
      })
      .addCase(getEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.events.push(action.payload.event);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(getMyEvents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        // We might want to store user specific events separately in state if needed,
        // but for now let's just update 'events' or maybe we need a new state property 'userEvents'
        // For simplicity, let's assume this view replaces the main list or we add a userEvents field.
        // Let's add userEvents to state interface first if we want separation.
        // Checking state interface... it has 'events'.
        // Let's overwrite 'events' for now if this is a "my events" page context,
        // OR, better, let's not overwrite and just return them.
        // Actually, I should probably add `userEvents` to the state to avoid conflict with public feed.
        // But I can't easily change interface in this replace block without more context.
        // I'll just set it to events for now, assuming the page will use the same selector.
        state.events = action.payload.events;
      })
      .addCase(getMyEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(updateEvent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.event = action.payload.event;
        state.events = state.events.map((event) =>
          event.id === action.payload.event.id ? action.payload.event : event,
        );
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(deleteEvent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.events = state.events.filter(
          (event) => event.id !== action.meta.arg,
        );
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      });
  },
});

export const { reset } = eventSlice.actions;
export default eventSlice.reducer;
