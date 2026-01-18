import { projectId, publicAnonKey } from './supabase/info';
import { supabase } from './supabaseClient';

const BASE_URL = import.meta.env.VITE_API_URL || ''; // Use relative path or env var

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function to set auth token
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

// Helper function to clear auth token
export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

// Helper function to make authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : `Bearer ${publicAnonKey}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // If we get a 401, the token is invalid - clear it
    if (response.status === 401) {
      clearAuthToken();
    }

    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// ============ AUTHENTICATION API ============

export const authAPI = {
  signup: async (email: string, password: string, name?: string) => {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    return response.json();
  },

  signin: async (email: string, password: string) => {
    try {
      console.log(`🔐 Attempting sign in for: ${email} (using Supabase client)`);

      // Use Supabase client directly for authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error(`❌ Sign in failed:`, error);
        throw new Error(error.message || 'Sign in failed');
      }

      if (!data.session || !data.user) {
        console.error(`❌ Sign in failed: No session or user data`);
        throw new Error('Authentication failed - no session created');
      }

      console.log(`✅ Sign in successful:`, { email, userId: data.user.id });

      // Store token and user data
      const accessToken = data.session.access_token;
      const user = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || '',
        role: data.user.user_metadata?.role || 'buyer',
      };

      setAuthToken(accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      return { success: true, accessToken, user };
    } catch (error: any) {
      console.error(`💥 Sign in exception:`, error);
      throw error;
    }
  },

  getSession: async () => {
    return fetchWithAuth(`${BASE_URL}/auth/session`);
  },

  signout: async () => {
    try {
      await fetchWithAuth(`${BASE_URL}/auth/signout`, { method: 'POST' });
    } finally {
      clearAuthToken();
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!getAuthToken();
  },
};

// ============ PRODUCT API ============

export const productAPI = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/products`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${BASE_URL}/products/${id}`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    return response.json();
  },

  create: async (productData: any) => {
    return fetchWithAuth(`${BASE_URL}/products`, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  update: async (id: string, updates: any) => {
    return fetchWithAuth(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string) => {
    return fetchWithAuth(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============ CART API ============

export const cartAPI = {
  get: async () => {
    return fetchWithAuth(`${BASE_URL}/cart`);
  },

  addItem: async (productId: string, quantity: number = 1) => {
    return fetchWithAuth(`${BASE_URL}/cart/add`, {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  removeItem: async (productId: string) => {
    return fetchWithAuth(`${BASE_URL}/cart/remove`, {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  clear: async () => {
    return fetchWithAuth(`${BASE_URL}/cart/clear`, {
      method: 'POST',
    });
  },
};

// ============ WISHLIST API ============

export const wishlistAPI = {
  get: async () => {
    return fetchWithAuth(`${BASE_URL}/wishlist`);
  },

  addItem: async (productId: string) => {
    return fetchWithAuth(`${BASE_URL}/wishlist/add`, {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  removeItem: async (productId: string) => {
    return fetchWithAuth(`${BASE_URL}/wishlist/remove`, {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },
};

// ============ ORDER API ============

export const orderAPI = {
  create: async (orderData: any) => {
    return fetchWithAuth(`${BASE_URL}/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getAll: async () => {
    return fetchWithAuth(`${BASE_URL}/orders`);
  },

  getById: async (id: string) => {
    return fetchWithAuth(`${BASE_URL}/orders/${id}`);
  },
};