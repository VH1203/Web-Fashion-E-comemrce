import apiClient from "./apiClient";

export const bankService = {
  list: () => apiClient.get("/banks").then(r => r.data.data),
  create: (payload) => apiClient.post("/banks", payload).then(r => r.data.data),
  update: (id, payload) => apiClient.put(`/banks/${id}`, payload).then(r => r.data.data),
  remove: (id) => apiClient.delete(`/banks/${id}`).then(r => r.data.data),
};
