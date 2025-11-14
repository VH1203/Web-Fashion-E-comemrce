import apiClient from "./apiClient";

const withNoCache = (params = {}) => ({ ...params, _t: Date.now() });

export const productApi = {
  getByTag: (tag) =>
    apiClient.get(`/products/tag/${tag}`, { params: withNoCache() }),
  getNew: () => apiClient.get("/products/new", { params: withNoCache() }),
  getByCategory: (slug) =>
    apiClient.get(`/products/category/${slug}`, { params: withNoCache() }),
};

export const productService = {
  async getProducts(params) {
    try {
      const response = await apiClient.get("/products", {
        params: withNoCache(params),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },
  async getDetail(idOrSlug) {
    const res = await apiClient.get(`/products/${idOrSlug}`, {
      params: withNoCache(),
    });
    return res.data.data;
  },
  async getReviews(idOrSlug, page = 1, limit = 10) {
    const res = await apiClient.get(`/products/${idOrSlug}/reviews`, {
      params: withNoCache({ page, limit }),
    });
    return res.data.data;
  },
  async getRatingsSummary(idOrSlug) {
    const res = await apiClient.get(`/products/${idOrSlug}/ratings-summary`, {
      params: withNoCache(),
    });
    return res.data.data;
  },
  async getRelated(idOrSlug, limit = 12) {
    const res = await apiClient.get(`/products/${idOrSlug}/related`, {
      params: withNoCache({ limit }),
    });
    return res.data.data;
  },

  async getAllProducts() {
    const res = await apiClient.get("/products/all-products", {
      params: withNoCache(),
    });
    return res.data.data;
  },
  async searchProducts(query) {
    if (!query) return [];
    const res = await apiClient.get(`/products/search`, {
      params: withNoCache({ q: query }),
    });
    return res.data.data;
  },
  async updateProduct(id, updateData) {
    const res = await apiClient.patch(`/products/${id}`, updateData);
    return res.data.data;
  },
  async deleteProduct(id) {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data.data;
  },
  async createProduct(productData) {
    const res = await apiClient.post("/products", productData);
    return res.data.data;
  },
};
