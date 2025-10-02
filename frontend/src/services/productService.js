import apiClient from "./apiClient";

export const productApi = {
  getByTag: async (tag) => {
    const res = await apiClient.get(`/products?tag=${tag}`);
    return res.data;
  },
  getNew: async () => {
    const res = await apiClient.get(`/products?sort=created_at&limit=8`);
    return res.data;
  },
  getByCategory: async (category) => {
    const res = await apiClient.get(`/products?category=${category}&limit=8`);
    return res.data;
  },
  getAll: async () => {
    const res = await apiClient.get(`/products`);
    return res.data;
  }
};
