import apiClient from "./apiClient";

export const bankApi = {
  getAll: () => apiClient.get("/bank"),
  add: (data) => apiClient.post("/bank", data),
  delete: (id) => apiClient.delete(`/bank/${id}`),
};
