import apiClient from "./apiClient";

export const productApi = {
  getByTag: async (tag) => {
    const res = await apiClient.get(`/products/tag/${tag}`);
    return res.data;
  },
  getNew: async () => {
    const res = await apiClient.get("/products/new");
    return res.data;
  },
  getByCategory: async (slug) => {
    const res = await apiClient.get(`/products/category/${slug}`);
    return res.data;
  },

  getAllProducts: async () => {
    const res = await apiClient.get("/products/all-products");
    return res.data.data;
  },
};
