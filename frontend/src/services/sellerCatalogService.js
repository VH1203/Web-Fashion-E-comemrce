import apiClient from "./apiClient";
export const sellerCatalogService = {
  listCategories: () => apiClient.get("/admin/catalog/categories").then(r => r.data.data),
  listAttributes: () => apiClient.get("/admin/catalog/attributes").then(r => r.data.data),
  listBrands:     () => apiClient.get("/admin/catalog/brands").then(r => r.data.data),
};
