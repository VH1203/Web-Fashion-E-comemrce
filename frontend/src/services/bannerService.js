import apiClient from "./apiClient";

export const bannerApi = {
  getAll: async () => {
    const res = await apiClient.get("/banners");
    return res.data;
  },
};
