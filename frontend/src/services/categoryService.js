import apiClient from "./apiClient";

export const categoryApi = {
  getAll: async () => {
    const res = await apiClient.get("/categories");
    return res.data;
  },
};
