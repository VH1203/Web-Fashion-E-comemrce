export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function post(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const authApi = {
  // Đăng ký
  registerRequestOTP: (payload) => post('/auth/register/request-otp', payload),
  registerVerify: (payload) => post('/auth/register/verify', payload),

  // Đăng nhập
  login: (payload) => post('/auth/login', payload),

  // Quên mật khẩu
  forgotRequest: (payload) => post('/auth/forgot-password/request', payload),
  forgotVerify: (payload) => post('/auth/forgot-password/verify', payload),

  // Đăng xuất
  logout: async () => {
    const token = localStorage.getItem('refresh_token');
    if (token) {
      try {
        await post('/auth/logout', { token });
      } catch (e) {
        console.warn("Logout API error:", e.message);
      }
    }
    // Xóa token trong mọi trường hợp
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
};
