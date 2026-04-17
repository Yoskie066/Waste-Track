import axios from 'axios';

const ADMIN_API_BASE_URL = 'http://localhost:3000/api/admin';

const adminApi = axios.create({
  baseURL: ADMIN_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminAccessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default adminApi;