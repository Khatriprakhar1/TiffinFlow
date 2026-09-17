import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add auth token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
API.interceptors.response.use(
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
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// Customer API
export const customerAPI = {
  getAll: (params) => API.get('/customers', { params }),
  getOne: (id) => API.get(`/customers/${id}`),
  create: (data) => API.post('/customers', data),
  update: (id, data) => API.put(`/customers/${id}`, data),
  delete: (id) => API.delete(`/customers/${id}`),
  getStats: () => API.get('/customers/stats'),
};

// Subscription API
export const subscriptionAPI = {
  get: (customerId) => API.get(`/subscriptions/${customerId}`),
  create: (customerId, data) => API.post(`/subscriptions/${customerId}`, data),
  pause: (customerId, data) => API.post(`/subscriptions/${customerId}/pause`, data),
  resume: (customerId, data) => API.post(`/subscriptions/${customerId}/resume`, data),
  getBill: (customerId, month) => API.get(`/subscriptions/${customerId}/bill`, { params: { month } }),
};

// Plan API
export const planAPI = {
  getAll: (params) => API.get('/plans', { params }),
  getOne: (id) => API.get(`/plans/${id}`),
  create: (data) => API.post('/plans', data),
  update: (id, data) => API.put(`/plans/${id}`, data),
  delete: (id) => API.delete(`/plans/${id}`),
};

// Clock / Notification API
export const clockAPI = {
  trigger: (data) => API.post('/clock', data),
  getOutbox: (params) => API.get('/outbox', { params }),
};

// Transfer API
export const transferAPI = {
  transfer: (data) => API.post('/subscriptions/transfer', data),
  getLogs: () => API.get('/transfers'),
  getSplitBill: (customerId, month) => API.get(`/subscriptions/${customerId}/split-bill`, { params: { month } }),
};

// Import API
export const importAPI = {
  importCustomers: (data) => API.post('/import/customers', data),
};

export default API;
