import apiClient from "./apiClient";

export const productApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await apiClient.get(`/products?${query}`);
    return res.data;
  },
  getByTag: async (tag) => {
    const res = await apiClient.get(`/products?tag=${tag}&limit=8`);
    return res.data.products || res.data;
  },
  getByCategory: async (category) => {
    const res = await apiClient.get(`/products?category=${category}&limit=8`);
    return res.data.products || res.data;
  },
  getNew: async () => {
    const res = await apiClient.get(`/products?sort=created_at&limit=8`);
    return res.data.products || res.data;
  },
  getDetail: async (id) => {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  },
};
