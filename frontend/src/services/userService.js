import apiClient from "./apiClient";

function getAuthHeader() {
  const token = localStorage.getItem("dfs_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const userApi = {
  async getProfile() {
    return await apiClient.get("/users/profile", { headers: getAuthHeader() });
  },

  async updateProfile(data) {
    return await apiClient.put("/users/profile", data, { headers: getAuthHeader() });
  },

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append("file", file);
    return await apiClient.post("/users/profile/avatar", formData, {
      headers: { ...getAuthHeader(), "Content-Type": "multipart/form-data" },
    });
  },

  async changePassword(payload) {
    return await apiClient.post("/users/change-password", payload, {
      headers: getAuthHeader(),
    });
  },
};
