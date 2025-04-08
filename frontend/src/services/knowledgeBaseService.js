import api from "./api";

export const getKnowledgeBaseEntries = async (params) => {
  const response = await api.get("/knowledgebase", { params });
  return response.data;
};

export const getKnowledgeBaseEntry = async (id) => {
  const response = await api.get(`/knowledgebase/${id}`);
  return response.data;
};

export const createKnowledgeBaseEntry = async (entryData) => {
  const response = await api.post("/knowledgebase", entryData);
  return response.data;
};

export const updateKnowledgeBaseEntry = async (id, entryData) => {
  const response = await api.put(`/knowledgebase/${id}`, entryData);
  return response.data;
};

export const deleteKnowledgeBaseEntry = async (id) => {
  const response = await api.delete(`/knowledgebase/${id}`);
  return response.data;
};

export const searchRelatedEntries = async (params) => {
  const response = await api.get("/knowledgebase/search-related", { params });
  return response.data;
};
