import apiClient from "./apiClient";

export const brandService = {
  getAll: async () => {
    const res = await apiClient.get("/brands");
    return res?.data || [];
  },
  getBrandBySlug: (slug) => {
    return apiClient.get(`/brands/${slug}`);
  },
};
