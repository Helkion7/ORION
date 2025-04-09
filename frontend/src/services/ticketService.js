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
  try {
    // Ensure assignedTo is a string or null/undefined
    if (ticketData.assignedTo === "") {
      ticketData.assignedTo = null;
    }

    // Clean up undefined values to avoid validation issues
    Object.keys(ticketData).forEach((key) => {
      if (ticketData[key] === undefined) {
        delete ticketData[key];
      }
    });

    const response = await api.put(`/tickets/${id}`, ticketData);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating ticket:",
      error.response?.data || error.message
    );
    throw error;
  }
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

export const getAdminLeaderboard = async () => {
  const response = await api.get("/tickets/leaderboard");
  return response.data;
};

export const escalateTicket = async (ticketId, escalationData) => {
  const response = await api.put(
    `/tickets/${ticketId}/escalate`,
    escalationData
  );
  return response.data;
};

export const returnToFirstLine = async (ticketId, returnData) => {
  const response = await api.put(
    `/tickets/${ticketId}/returnToFirstLine`,
    returnData
  );
  return response.data;
};

export const getTicketTimelineStats = async () => {
  const response = await api.get("/tickets/stats/timeline");
  return response.data;
};

export const getSupportStaffStats = async () => {
  const response = await api.get("/tickets/stats/support-staff");
  return response.data;
};
