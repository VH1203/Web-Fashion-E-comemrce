import apiClient from "./apiClient";

export const userService = {
  get:    () => apiClient.get("/users").then(r => r.data.data),
  update: (payload) => apiClient.put("/users", payload).then(r => r.data.data),
  changePassword: (payload) => apiClient.patch("/users/change-password", payload).then(r => r.data.data),
  uploadAvatar: (file) => {
    const f = new FormData(); f.append("avatar", file);
    return apiClient.post("/users/avatar", f, { headers: { "Content-Type": "multipart/form-data" } })
      .then(r => r.data.data);
  },
};
