import api from "../../services/api";

const purchaseTicket = async (ticketData: {
  eventId: string;
  ticketTypeId?: string;
  quantity: number;
}) => {
  const response = await api.post("/tickets/purchase", ticketData);
  return response.data;
};

const getMyTickets = async () => {
  const response = await api.get("/tickets/my-tickets");
  return response.data;
};

const validateTicket = async (data: { qrCode: string; eventId: string }) => {
  const response = await api.post("/tickets/validate", data);
  return response.data;
};

const ticketService = {
  purchaseTicket,
  getMyTickets,
  validateTicket,
};

export default ticketService;
