// src/services/addressService.js
import apiClient from "./apiClient";

const normalizeToArray = (d) => {
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.addresses)) return d.addresses;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

export const addressService = {
  list: () => apiClient.get("/addresses").then(r => normalizeToArray(r?.data?.data)),
  create: (payload) => apiClient.post("/addresses", payload).then(r => r.data.data),
  update: (id, payload) => apiClient.put(`/addresses/${id}`, payload).then(r => r.data.data),
  remove: (id) => apiClient.delete(`/addresses/${id}`).then(r => r.data),
  setDefault: (id) => apiClient.post(`/addresses/${id}/default`).then(r => r.data.data),
};

export default addressService;
