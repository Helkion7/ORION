import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Important for handling cookies (auth)
});

// Add a response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't log 401 errors for /auth/me endpoint as they're expected
    if (error.config.url !== "/auth/me" || error.response?.status !== 401) {
      console.error("API Error:", error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
