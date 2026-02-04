import { create } from 'zustand';
import { authAPI } from './lib/apiClient';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem('token', token);
    }
  },
  setAuth: (user, token) => {
    set({ user, token });
    if (token) {
      localStorage.setItem('token', token);
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  isAdmin: () => {
    const { user } = get();
    return user?.role === 'ADMIN';
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      set({ user, token, isLoading: false });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.message || 'Error al iniciar sesión';
      set({ error, isLoading: false });
      return { success: false, error };
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register({ email, password, name, code: get().registerCode });
      const { token, user } = response.data;
      set({ user, token, isLoading: false });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.message || 'Error al registrarse';
      set({ error, isLoading: false });
      return { success: false, error };
    }
  },

  registerCode: '',
  setRegisterCode: (code) => set({ registerCode: code }),

  requestRegisterCode: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await authAPI.requestRegisterCode({ email });
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.message || 'Error al enviar el código';
      set({ error, isLoading: false });
      return { success: false, error };
    }
  },

  logout: () => {
    set({ user: null, token: null, error: null });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      set({ token, user: JSON.parse(user) });
    }
  },
}));

export const useCartStore = create((set, get) => ({
  items: [],
  total: 0,

  addItem: (item) => set((state) => {
    const existingItem = state.items.find((i) => i.product_id === item.product_id);
    if (existingItem) {
      return {
        items: state.items.map((i) =>
          i.product_id === item.product_id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    }
    return { items: [...state.items, { ...item, quantity: 1 }] };
  }),

  removeItem: (productId) => set((state) => ({
    items: state.items.filter((i) => i.product_id !== productId),
  })),

  updateQuantity: (productId, quantity) => set((state) => ({
    items: state.items.map((i) =>
      i.product_id === productId ? { ...i, quantity } : i
    ),
  })),

  clearCart: () => set({ items: [], total: 0 }),

  calculateTotal: () => {
    const { items } = get();
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    set({ total });
  },
}));
