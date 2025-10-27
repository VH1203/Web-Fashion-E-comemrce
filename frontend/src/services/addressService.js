import apiClient from "./apiClient";

export const addressService = {
  list: () => apiClient.get("/addresses").then(r => r.data.data),
  create: (payload) => apiClient.post("/addresses", payload).then(r => r.data.data),
  update: (id, payload) => apiClient.put(`/addresses/${id}`, payload).then(r => r.data.data),
  remove: (id) => apiClient.delete(`/addresses/${id}`).then(r => r.data.data),
  setDefault: (id) => apiClient.patch(`/addresses/${id}/default`).then(r => r.data.data),
};
