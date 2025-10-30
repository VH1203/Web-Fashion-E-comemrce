import apiClient from "./apiClient";

export const productApi = {
  getByTag: (tag) => apiClient.get(`/products/tag/${tag}`),
  getNew: () => apiClient.get("/products/new"),
  getByCategory: (slug) => apiClient.get(`/products/category/${slug}`),
};

export const productService = {
  async getDetail(idOrSlug) {
    const res = await apiClient.get(`/products/${idOrSlug}`);
    return res.data.data;
  },
  async getReviews(idOrSlug, page = 1, limit = 10) {
    const res = await apiClient.get(`/products/${idOrSlug}/reviews`, { params: { page, limit } });
    return res.data.data; // { total, items }
  },
  async getRatingsSummary(idOrSlug) {
    const res = await apiClient.get(`/products/${idOrSlug}/ratings-summary`);
    return res.data.data; // { average, count, histogram }
  },
  async getRelated(idOrSlug, limit = 12) {
    const res = await apiClient.get(`/products/${idOrSlug}/related`, { params: { limit } });
    return res.data.data;
  },

 async getAllProducts () {
    const res = await apiClient.get("/products/all-products");
    return res.data.data;
  },
  async searchProducts(query) {
    const res = await apiClient.get(`/products/search`, { params: { q: query } });
    return res.data.data;
  },
  async updateProduct(id, updateData) {
    const res = await apiClient.patch(`/products/${id}`, updateData);
    return res.data.data;
  },
  async deleteProduct(id) {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data.data;
  }
};
