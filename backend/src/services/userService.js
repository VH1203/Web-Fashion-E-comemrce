import apiClient from "./apiClient";

// Hàm tiện ích lấy token từ localStorage
function getAuthHeader() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const userApi = {
  // 🔹 Lấy thông tin hồ sơ người dùng
  async getProfile() {
    const res = await apiClient.get("/users/profile", {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // 🔹 Cập nhật thông tin hồ sơ
  async updateProfile(data) {
    const res = await apiClient.put("/users/profile", data, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // 🔹 Upload ảnh đại diện
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post("/users/profile/avatar", formData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
};
