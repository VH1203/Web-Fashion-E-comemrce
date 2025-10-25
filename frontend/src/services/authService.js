import apiClient from "./apiClient";

export const authService = {
  requestRegisterOTP: (data) =>
    apiClient.post("/auth/register/request-otp", data),
  verifyRegister: (data) =>
    apiClient.post("/auth/register/verify", data),

  login: (data) => apiClient.post("/auth/login", data),
  googleLogin: (data) => apiClient.post("/auth/google-login", data),

  requestResetOTP: (data) =>
    apiClient.post("/auth/forgot-password/request-otp", data),
  resetPassword: (data) =>
    apiClient.post("/auth/forgot-password/verify", data),

  changePassword: (data, token) =>
    apiClient.post("/auth/change-password", data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
