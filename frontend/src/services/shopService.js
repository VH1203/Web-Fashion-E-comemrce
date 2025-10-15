import apiClient from "./apiClient";

export const getAnalytics = async () => {
  const res = await apiClient.get(`/shop/analytics`);
  return res.data;
}