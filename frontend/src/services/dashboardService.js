import apiClient from "./apiClient";

export const dashboardService = {
  kpis: () => apiClient.get("/shop/dashboard/kpis").then(r => r.data.data),
  revenue: (params) => apiClient.get("/shop/dashboard/revenue", { params }).then(r => r.data.data),
  orderStatus: () => apiClient.get("/shop/dashboard/order-status").then(r => r.data.data),
  topProducts: (limit = 10) => apiClient.get("/shop/dashboard/top-products", { params: { limit } }).then(r => r.data.data),
  topCustomers: (limit = 10) => apiClient.get("/shop/dashboard/top-customers", { params: { limit } }).then(r => r.data.data),
  exportExcel: (params) => apiClient.get("/shop/dashboard/export/excel", { params, responseType: "blob" }),
  exportPdf:   (params) => apiClient.get("/shop/dashboard/export/pdf",   { params, responseType: "blob" }),
  forecast: (horizon = 14) => apiClient.get("/shop/dashboard/forecast/revenue", { params: { horizon } }).then(r => r.data.data),
};
