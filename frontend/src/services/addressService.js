import apiClient from "./apiClient";

export const addressApi = {
  getAll: () => apiClient.get("/address"),
  add: (data) => apiClient.post("/address", data),
  delete: (id) => apiClient.delete(`/address/${id}`),
};
