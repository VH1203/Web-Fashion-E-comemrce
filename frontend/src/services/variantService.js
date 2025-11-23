import apiClient from "./apiClient";
export const variantService = {
  list:   (productId) => apiClient.get(`/admin/products/${productId}/variants`).then(r => r.data.data),
  create: (productId, body) => apiClient.post(`/admin/products/${productId}/variants`, body).then(r => r.data.data),
  update: (variantId, body) => apiClient.put(`/admin/variants/${variantId}`, body).then(r => r.data.data),
  remove: (variantId) => apiClient.delete(`/admin/variants/${variantId}`).then(r => r.data.data),
  bulk:   (productId, rows) => apiClient.post(`/admin/products/${productId}/variants/bulk`, { rows }).then(r => r.data.data),
};
