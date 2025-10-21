import apiClient from "./apiClient";

export const productApi = {
  getByTag: (tag) => apiClient.get(`/products/tag/${tag}`),
  getNew: () => apiClient.get("/products/new"),
  getByCategory: (slug) => apiClient.get(`/products/category/${slug}`),
};
