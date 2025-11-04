import apiClient from "./apiClient";

// Lấy token để gửi header
function getAuthHeader() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const productVariantByListIdProduct = {
  // Lấy danh sách variant theo list product_id
  getByProductIds: async (productIds = []) => {
    if (!Array.isArray(productIds) || !productIds.length) return [];

    const res = await apiClient.post(
      `/product-variant/`,
      { product_ids: productIds },
      { headers: getAuthHeader() }
    );

    return res.data.data || [];
  },
};
