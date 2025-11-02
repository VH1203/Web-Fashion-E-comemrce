// orderService.js 
import apiClient from "./apiClient";

export const orderService = {
  list: (params = {}) => apiClient.get("/orders", { params }).then(r => r.data.data),
  detail: (id) => apiClient.get(`/orders/${id}`).then(r => r.data.data),
  cancel: (id) => apiClient.post(`/orders/${id}/cancel`).then(r => r.data.data),
  reorder: (id) => apiClient.post(`/orders/${id}/reorder`).then(r => r.data.data),
  refund: (id, payload) => apiClient.post(`/orders/${id}/refund`, payload).then(r => r.data.data),
  tracking: (id) => apiClient.get(`/orders/${id}/tracking`).then(r => r.data.data),
  invoice: (id) => apiClient.get(`/orders/${id}/invoice`).then(r => r.data.data),
  reviewReminder: (id) => apiClient.post(`/orders/${id}/review-reminder`).then(r => r.data.data),
};