import api from "../../services/api";

const getCreatorDashboard = async () => {
  const response = await api.get("/analytics/dashboard");
  return response.data;
};

const getEventAnalytics = async (eventId: string) => {
  const response = await api.get(`/analytics/event/${eventId}`);
  return response.data;
};

const analyticsService = {
  getCreatorDashboard,
  getEventAnalytics,
};

export default analyticsService;
