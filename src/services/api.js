// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://academic-center-pro-pi94.vercel.app/api/v1',
});

// Attach JWT from localStorage on every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// On 401/403, clear token and redirect to login
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && [401, 403].includes(err.response.status)) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default API;
