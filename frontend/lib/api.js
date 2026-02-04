import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
  create: (data) => api.post('/categories', data),
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  uploadMedia: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/products/upload-media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const cartAPI = {
  getCart: (userId) => api.get(`/cart/${userId}`),
  addItem: (data) => api.post('/cart/add', data),
  removeItem: (cartItemId) => api.delete(`/cart/${cartItemId}`),
  updateItem: (cartItemId, data) => api.put(`/cart/${cartItemId}`, data),
  clearCart: (userId) => api.delete(`/cart/clear/${userId}`),
};

export const paymentAPI = {
  createWompiPayment: (data) => api.post('/payments/wompi', data),
  createOrder: (data) => api.post('/payments/order', data),
  updateOrderStatus: (data) => api.put('/payments/order-status', data),
  getUserOrders: (userId) => api.get(`/payments/orders/${userId}`),
};

export default api;
