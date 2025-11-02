import apiClient from "./apiClient";

// Lấy token từ localStorage
function getAuthHeader() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const voucherApi = {
  // Lấy danh sách voucher với filter, pagination
  async getAll(page = 1, limit = 5, keyword = "") {
    const res = await apiClient.get("/vouchers", {
      headers: getAuthHeader(),
      params: {
        page,
        limit,
        keyword, // tìm kiếm theo code hoặc các field khác
      },
    });
    return res.data;
  },

  // Lấy chi tiết voucher theo ID
  async getDetail(id) {
    const res = await apiClient.get(`/vouchers/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Tạo voucher mới
  async create(data) {
    const res = await apiClient.post("/vouchers", data, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Cập nhật voucher theo ID
  async update(id, data) {
    const res = await apiClient.put(`/vouchers/${id}`, data, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Xóa voucher theo ID
  async delete(id) {
    const res = await apiClient.delete(`/vouchers/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },
};
