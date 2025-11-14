import apiClient from "./apiClient";

export const categoryService = {
  async getAllCategories() {
    try {
      const response = await apiClient.get("/categories");
      return response.data.data; // Assuming the categories are in response.data.data
    } catch (error) {
      // ...existing code...
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  getCategoryBySlug: (slug) => {
    return apiClient.get(`/categories/${slug}`);
  },
};
