import apiClient from "./apiClient";

export const categoryApi = {
  getAll: async () => {
    const res = await apiClient.get(`/products/categories`);
    return res.data;
  }
};
