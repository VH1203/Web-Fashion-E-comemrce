import apiClient from "./apiClient";

export const voucherApi = {
  //Lấy danh sách vouchers
  getAll: async (page = 1, limit = 5, search = "") => {
    const res = await apiClient.get(
      `/vouchers?page=${page}&limit=${limit}&code=${search}`
    );
    return res.data;
  },

  //Lấy chi tiết voucher theo id
  getDetail: async (id) => {
    const res = await apiClient.get(`/vouchers/${id}`);
    return res.data;
  },

  //Tạo voucher mới
  create: async (data) => {
    const res = await apiClient.post(`/vouchers`, data);
    return res.data;
  },

  //Cập nhật voucher
  update: async (id, data) => {
    const res = await apiClient.put(`/vouchers/${id}`, data);
    return res.data;
  },

  //Xóa voucher
  delete: async (id) => {
    const res = await apiClient.delete(`/vouchers/${id}`);
    return res.data;
  },
};
