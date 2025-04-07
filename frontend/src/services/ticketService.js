import api from "./api";

export const getTickets = async (params) => {
  const response = await api.get("/tickets", { params });
  return response.data;
};

export const getTicketById = async (id) => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};

export const createTicket = async (ticketData) => {
  const response = await api.post("/tickets", ticketData);
  return response.data;
};

export const updateTicket = async (id, ticketData) => {
  const response = await api.put(`/tickets/${id}`, ticketData);
  return response.data;
};

export const deleteTicket = async (id) => {
  const response = await api.delete(`/tickets/${id}`);
  return response.data;
};

export const addResponse = async (ticketId, responseData) => {
  const response = await api.post(
    `/tickets/${ticketId}/responses`,
    responseData
  );
  return response.data;
};

export const getTicketStats = async () => {
  const response = await api.get("/tickets/stats");
  return response.data;
};
