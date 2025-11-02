import apiClient from "./apiClient";

export const getAnalytics = async () => {
  const res = await apiClient.get(`/shop/analytics`);
  return res.data;
}

export const getRevenueByMonth = async () => {
  const res = await apiClient.get(`/transactions/revenue-by-month`);
  return res.data.data;
};

export const getRevenueByCategory = async () => {
  const res = await apiClient.get(`/orders/revenue-by-category`);
  return res.data.data;
};