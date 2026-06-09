import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Donation API
export const donationAPI = {
  create: (data) => api.post('/donations', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: (params) => api.get('/donations', { params }),
  getById: (id) => api.get(`/donations/${id}`),
  update: (id, data) => api.put(`/donations/${id}`, data),
  delete: (id) => api.delete(`/donations/${id}`),
  accept: (id) => api.put(`/donations/${id}/accept`),
  updateStatus: (id, status) => api.put(`/donations/${id}/status`, { status }),
  getNearby: (params) => api.get('/donations/nearby', { params }),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getDonations: (params) => api.get('/admin/donations', { params }),
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get('/users/notifications'),
  markAsRead: (id) => api.put(`/users/notifications/${id}/read`),
  markAllAsRead: () => api.put('/users/notifications/read-all'),
};

// Rating & Feedback API
export const ratingAPI = {
  submit: (data) => api.post('/ratings', data),
  getPending: () => api.get('/ratings/pending'),
  check: (donationId) => api.get(`/ratings/check/${donationId}`),
  getUserRatings: (userId) => api.get(`/ratings/user/${userId}`),
  getTrustScore: (userId) => api.get(`/ratings/trust/${userId}`),
};

export default api;
