import apiClient from "./apiClient";

// Lấy token từ localStorage để gửi header
function getAuthHeader() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const bannerApi = {
  // Lấy danh sách banners (có phân trang + filter theo title)
  getAll: async (page = 1, limit = 10, search = "") => {
    const res = await apiClient.get(`/banners`, {
      headers: getAuthHeader(),
      params: { page, limit, title: search },
    });
    return res.data;
  },

  // Lấy chi tiết banner theo ID
  getDetail: async (id) => {
    const res = await apiClient.get(`/banners/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // Tạo banner mới (có thể kèm ảnh)
  create: async (data, file) => {
    if (file) {
      // Nếu có file, dùng FormData
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) formData.append(key, data[key]);
      });
      formData.append("image_url", file); // field name phải trùng backend
      const res = await apiClient.post(`/banners`, formData, {
        headers: { 
          ...getAuthHeader(), 
          "Content-Type": "multipart/form-data" 
        },
      });
      return res.data;
    } else {
      const res = await apiClient.post(`/banners`, data, { headers: getAuthHeader() });
      return res.data;
    }
  },

  // Cập nhật banner (có thể kèm ảnh mới)
  update: async (id, data, file) => {
    if (file) {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) formData.append(key, data[key]);
      });
      formData.append("image", file);
      const res = await apiClient.put(`/banners/${id}`, formData, {
        headers: { 
          ...getAuthHeader(), 
          "Content-Type": "multipart/form-data" 
        },
      });
      return res.data;
    } else {
      const res = await apiClient.put(`/banners/${id}`, data, { headers: getAuthHeader() });
      return res.data;
    }
  },

  // Xóa banner
  delete: async (id) => {
    const res = await apiClient.delete(`/banners/${id}`, { headers: getAuthHeader() });
    return res.data;
  },

  // Upload ảnh riêng (nếu muốn tách upload ra riêng)
  uploadImage: async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await apiClient.post(`/banners/upload-image`, formData, {
    headers: { 
      ...getAuthHeader(), 
      "Content-Type": "multipart/form-data" 
    },
  });

  return res.data; // { upload: { url, public_id } }
},
};
