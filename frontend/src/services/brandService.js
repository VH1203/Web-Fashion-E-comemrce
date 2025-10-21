import apiClient from "./apiClient";

export const brandApi = {
  getAll: async () => {
    const res = await apiClient.get("/brands");
    return res?.data || [];
  },
};
