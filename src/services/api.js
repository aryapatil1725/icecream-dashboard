// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Generic fetch wrapper with error handling
const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    return data;
  },
  
  customerLogin: async (email) => {
    const response = await fetch(`${API_BASE_URL}/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Customer login failed');
    }
    
    return data;
  },
  
  customerRegister: async (name, email, phone) => {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone })
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    return data;
  }
};

// Products API
export const productsAPI = {
  getAll: async (page = 1, perPage = 10) => {
    return fetchAPI(`/products?page=${page}&per_page=${perPage}`);
  },
  
  add: async (formData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to add product');
    }
    
    return data;
  },
  
  update: async (id, formData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update product');
    }
    
    return data;
  },
  
  delete: async (id) => {
    return fetchAPI(`/products/${id}`, { method: 'DELETE' });
  }
};

// Orders API
export const ordersAPI = {
  getAll: async (page = 1, perPage = 10) => {
    return fetchAPI(`/orders?page=${page}&per_page=${perPage}`);
  },
  
  getCustomerOrders: async (email) => {
    const response = await fetch(`${API_BASE_URL}/orders/customer/${email}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch orders');
    }
    
    return data;
  },
  
  add: async (orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Failed to add order');
    }
    
    return data;
  },
  
  update: async (id, orderData) => {
    return fetchAPI(`/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
  },
  
  delete: async (id) => {
    return fetchAPI(`/orders/${id}`, { method: 'DELETE' });
  }
};

// Customers API
export const customersAPI = {
  getAll: async (page = 1, perPage = 10) => {
    return fetchAPI(`/customers?page=${page}&per_page=${perPage}`);
  },
  
  update: async (id, customerData) => {
    return fetchAPI(`/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData)
    });
  },
  
  delete: async (id) => {
    return fetchAPI(`/customers/${id}`, { method: 'DELETE' });
  }
};

// Analytics API
export const analyticsAPI = {
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/analytics/stats`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    const data = await response.json();
    return data;
  },

  getRecentActivity: async () => {
    const response = await fetch(`${API_BASE_URL}/analytics/recent-activity`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    const data = await response.json();
    return data || [];
  },

  getSales: async (params = {}) => {
    const response = await fetch(`${API_BASE_URL}/analytics/sales?${new URLSearchParams(params)}`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    const data = await response.json();
    return data;
  },

  getRevenue: async (params = {}) => {
    const response = await fetch(`${API_BASE_URL}/analytics/revenue?${new URLSearchParams(params)}`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    const data = await response.json();
    return data;
  },

  getTopProducts: async (params = {}) => {
    const response = await fetch(`${API_BASE_URL}/analytics/top-products?${new URLSearchParams(params)}`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    const data = await response.json();
    return data;
  },

  getTrends: async (params = {}) => {
    const response = await fetch(`${API_BASE_URL}/analytics/trends?${new URLSearchParams(params)}`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    const data = await response.json();
    return data;
  },
};
 
