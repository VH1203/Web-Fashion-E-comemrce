import apiClient from "./apiClient";

export const checkoutService = {
  preview: (payload) => apiClient.post("/checkout/preview", payload).then(r => r.data.data),
  confirm: (payload) => apiClient.post("/checkout/confirm", payload).then(r => r.data.data),
};
