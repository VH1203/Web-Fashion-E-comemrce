import apiClient from "./apiClient";

function getAuthHeader() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const voucherApi = {
  // Lấy danh sách voucher
  async getVouchers(params = {}) {
    const res = await apiClient.get("/vouchers", {
      headers: getAuthHeader(),
      params, // ví dụ: { code: "SALE10", valid: true, page: 1, limit: 10 }
    });
    return res.data;
  },

  // 🔹 Lấy voucher theo ID
  async getVoucherById(id) {
    const res = await apiClient.get(`/vouchers/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // 🔹 Tạo voucher mới
  async createVoucher(data) {
    const res = await apiClient.post("/vouchers", data, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // 🔹 Cập nhật voucher
  async updateVoucher(id, data) {
    const res = await apiClient.put(`/vouchers/${id}`, data, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // 🔹 Xóa voucher
  async deleteVoucher(id) {
    const res = await apiClient.delete(`/vouchers/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },
};
