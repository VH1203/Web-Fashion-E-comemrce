import apiClient from "./apiClient";

// Lấy token để gửi header
function getAuthHeader() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const flashsaleApi = {
  // Lấy danh sách flashsale (phân trang + filter)
  getAll: async (page = 1, limit = 10, search = "") => {
    const res = await apiClient.get(`/flashsales`, {
      headers: getAuthHeader(),
      params: { page, limit, title: search },
    });
    return res.data;
  },

  // Lấy chi tiết flashsale theo ID
  getDetail: async (id) => {
    const res = await apiClient.get(`/flashsales/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Tạo flashsale mới (có thể kèm banner ảnh)
  create: async (data, bannerFile) => {
    if (bannerFile) {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null)
          formData.append(key, data[key]);
      });
      formData.append("banner_image", bannerFile);

      const res = await apiClient.post(`/flashsales`, formData, {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } else {
      const res = await apiClient.post(`/flashsales`, data, {
        headers: getAuthHeader(),
      });
      return res.data;
    }
  },

  // Cập nhật flashsale
  update: async (id, data, bannerFile) => {
    if (bannerFile) {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null)
          formData.append(key, data[key]);
      });
      formData.append("banner_image", bannerFile);

      const res = await apiClient.put(`/flashsales/${id}`, formData, {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } else {
      const res = await apiClient.put(`/flashsales/${id}`, data, {
        headers: getAuthHeader(),
      });
      return res.data;
    }
  },

  // Xóa flashsale
  delete: async (id) => {
    const res = await apiClient.delete(`/flashsales/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Upload banner riêng (nếu tách upload)
  uploadBanner: async (file) => {
    const formData = new FormData();
    formData.append("banner_image", file);

    const res = await apiClient.post(`/flashsales/upload-banner`, formData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data; // { upload: { url, public_id } }
  },
};
