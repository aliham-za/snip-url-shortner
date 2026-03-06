import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

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

let onForceLogout = null;

export function setForceLogoutHandler(handler) {
  onForceLogout = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/signup')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (onForceLogout) {
          onForceLogout();
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.delete('/auth/logout'),
};

export const linksAPI = {
  list: (params) => api.get('/links', { params }),
  get: (id) => api.get(`/links/${id}`),
  create: (data) => api.post('/links', data),
  update: (id, data) => api.patch(`/links/${id}`, data),
  delete: (id) => api.delete(`/links/${id}`),
  toggle: (id) => api.patch(`/links/${id}/toggle`),
};

export const analyticsAPI = {
  get: (linkId, params) => api.get(`/links/${linkId}/analytics`, { params }),
  clicks: (linkId, params) => api.get(`/links/${linkId}/analytics/clicks`, { params }),
};

export const dashboardAPI = {
  stats: () => api.get('/dashboard/stats'),
};

export const apiKeysAPI = {
  list: () => api.get('/api_keys'),
  create: (data) => api.post('/api_keys', data),
  revoke: (id) => api.delete(`/api_keys/${id}`),
};

export const subdomainsAPI = {
  list: () => api.get('/subdomains'),
  create: (data) => api.post('/subdomains', data),
  update: (id, data) => api.patch(`/subdomains/${id}`, data),
  delete: (id) => api.delete(`/subdomains/${id}`),
};

export default api;
