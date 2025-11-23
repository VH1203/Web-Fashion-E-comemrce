import apiClient from "./apiClient";

export const analyticsService = {
  overview:        () => apiClient.get("/analytics/overview").then(r => r.data.data),
  revenueSeries:   (granularity="day", range=30) => apiClient.get(`/analytics/revenue-series`, { params:{ granularity, range } }).then(r => r.data.data),
  statusSummary:   () => apiClient.get("/analytics/status-summary").then(r => r.data.data),
  topProducts:     (limit=10) => apiClient.get("/analytics/top-products", { params:{ limit } }).then(r => r.data.data),
  topCustomers:    (limit=10) => apiClient.get("/analytics/top-customers", { params:{ limit } }).then(r => r.data.data),
  forecast:        (granularity="day", range=90, future=14) => apiClient.get("/analytics/forecast", { params:{ granularity, range, future } }).then(r => r.data.data),
  exportExcel:     () => apiClient.get("/analytics/export/excel", { responseType: "blob" }),
  exportPdf:       () => apiClient.get("/analytics/export/pdf", { responseType: "blob" }),
};
