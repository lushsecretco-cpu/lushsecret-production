import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lushsecret.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Agregar token a cada solicitud
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  requestRegisterCode: (data) => apiClient.post('/auth/register/request-code', data),
};

// Categories
export const categoriesAPI = {
  getAll: () => apiClient.get('/categories'),
  getBySlug: (slug) => apiClient.get(`/categories/${slug}`),
  create: (data) => apiClient.post('/categories', data),
};

// Products
export const productsAPI = {
  getAll: (params) => apiClient.get('/products', { params }),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (data) => apiClient.post('/products', data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`),
  uploadMedia: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/products/upload-media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Cart
export const cartAPI = {
  getCart: (userId) => apiClient.get(`/cart/${userId}`),
  addToCart: (data) => apiClient.post('/cart/add', data),
  removeFromCart: (cartItemId) => apiClient.delete(`/cart/${cartItemId}`),
  updateCartItem: (cartItemId, data) => apiClient.put(`/cart/${cartItemId}`, data),
  clearCart: (userId) => apiClient.delete(`/cart/clear/${userId}`),
};

// Payments
export const paymentsAPI = {
  createWompiPayment: (data) => apiClient.post('/payments/wompi', data),
  createOrder: (data) => apiClient.post('/payments/order', data),
  updateOrderStatus: (data) => apiClient.put('/payments/order-status', data),
  getUserOrders: (userId) => apiClient.get(`/payments/orders/${userId}`),
};

// Orders
export const ordersAPI = {
  getAll: () => apiClient.get('/orders/admin/all'),
  getById: (id) => apiClient.get(`/orders/${id}`),
  updateStatus: (id, status) => apiClient.put(`/orders/${id}/status`, { status }),
};

// Shipping
export const shippingAPI = {
  getAdminOrders: () => apiClient.get('/shipping/admin/orders'),
  updateOrderStatus: (data) => apiClient.put('/shipping/admin/order-status', data),
  generateTrackingNumber: (orderId) => apiClient.post(`/shipping/admin/generate-tracking/${orderId}`),
  markAsDelivered: (data) => apiClient.put('/shipping/admin/mark-delivered', data),
  trackShipment: (trackingNumber) => apiClient.get(`/shipping/track/${trackingNumber}`),
};

export default apiClient;
