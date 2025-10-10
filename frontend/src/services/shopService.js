import apiClient from "./apiClient";

export const getAnalytics = async () => {
  const res = await apiClient.get(`/analytics`);
  return res.data;
}