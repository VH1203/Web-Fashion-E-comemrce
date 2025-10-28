import apiClient from "./apiClient";

function getAuthHeader() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const userApi = {
  getProfile: async () => {
    const res = await apiClient.get("/users/profile", {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await apiClient.put("/users/profile", data, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  uploadAvatar: async (file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await apiClient.post("/users/profile/avatar", form, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  changePassword: async (payload) => {
    const res = await apiClient.post("/users/change-password", payload, {
      headers: getAuthHeader(),
    });
    return res.data;
  },
};
