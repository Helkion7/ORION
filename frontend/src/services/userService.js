import api from "./api";

export const getUsers = async (params = {}) => {
  // Handle array parameters for role filter
  if (params.role && Array.isArray(params.role)) {
    // Convert array to comma-separated string for query params
    params.role = params.role.join(",");
  }
  const response = await api.get("/users", { params });
  return response.data;
};

export const getUser = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await api.put("/auth/profile", userData);
  return response.data;
};

export const promoteUser = async (email) => {
  const response = await api.put("/users/promote", { email });
  return response.data;
};
