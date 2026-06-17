import axios from 'axios';

// In production, REACT_APP_API_URL is set at build time (e.g. on Vercel) to the deployed backend URL.
// In local development, it falls back to the same hostname on port 8000.
const API_URL =
  process.env.REACT_APP_API_URL ||
  `http://${window.location.hostname}:8000`;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
