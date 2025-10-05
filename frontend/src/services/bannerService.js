import apiClient from "./apiClient";

export const bannerApi = {
  getAll: () => apiClient.get("/banners").then(res => res.data),
};
