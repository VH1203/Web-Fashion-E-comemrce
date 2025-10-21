import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",    
    Pragma: "no-cache",            
  },
});
let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("dfs_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res?.data?.data ?? res?.data ?? res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject }))
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return apiClient(original);
          })
          .catch(Promise.reject);
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refresh = localStorage.getItem("dfs_refresh_token");
        if (!refresh) throw new Error("No refresh token");

        const resp = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { token: refresh }
        );

        const newToken = resp.data.access_token;
        localStorage.setItem("dfs_access_token", newToken);
        apiClient.defaults.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return apiClient(original);
      } catch (e) {
        processQueue(e, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err.response?.data || err.message);
  }
);

export default apiClient;
