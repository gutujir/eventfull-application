import api from "../../services/api";

const getEvents = async (params?: { search?: string; location?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append("search", params.search);
  if (params?.location) queryParams.append("location", params.location);

  const response = await api.get(`/events?${queryParams.toString()}`);
  return response.data;
};

const getEvent = async (id: string) => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};

const getMyEvents = async () => {
  const response = await api.get("/events/my/events");
  return response.data;
};

const createEvent = async (eventData: any) => {
  const config = {
    headers: {
      "Content-Type":
        eventData instanceof FormData
          ? "multipart/form-data"
          : "application/json",
    },
  };
  const response = await api.post("/events", eventData, config);
  return response.data;
};

const updateEvent = async (id: string, eventData: any) => {
  const config = {
    headers: {
      "Content-Type":
        eventData instanceof FormData
          ? "multipart/form-data"
          : "application/json",
    },
  };
  const response = await api.put(`/events/${id}`, eventData, config);
  return response.data;
};

const deleteEvent = async (id: string) => {
  const response = await api.delete(`/events/${id}`);
  return response.data;
};

const eventService = {
  getEvents,
  getEvent,
  getMyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};

export default eventService;
