// frontend/src/services/cartService.js
import apiClient from "./apiClient";
export const cartService = {
  get: async () => {
    const res = await apiClient.get("/cart");
    return res.data.data;
  },
  add: async ({ product_id, variant_id, qty = 1 }) => {
    const res = await apiClient.post("/cart/add", { product_id, variant_id, qty });
    return res.data.data;
  },
  updateItem: async (itemId, payload) => {
    const res = await apiClient.patch(`/cart/item/${itemId}`, payload);
    return res.data.data;
  },
  removeItem: async (itemId) => {
    const res = await apiClient.delete(`/cart/item/${itemId}`);
    return res.data.data;
  },
  clear: async () => {
    const res = await apiClient.post("/cart/clear");
    return res.data.data;
  },
};
