// src/services/paymentService.js
import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with auth interceptor
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bankingToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bankingToken');
      localStorage.removeItem('bankingUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const paymentService = {
  // Get all payments for the logged-in customer
  getPayments: async () => {
    try {
      const response = await apiClient.get('/payments');
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  // Get a specific payment by ID
  getPaymentById: async (paymentId) => {
    try {
      const response = await apiClient.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  },

  // Create a new international payment
  createPayment: async (paymentData) => {
    try {
      const response = await apiClient.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  // Update payment status (if needed in future)
  updatePayment: async (paymentId, updateData) => {
    try {
      const response = await apiClient.put(`/payments/${paymentId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  },

  // Delete a payment (if needed in future)
  deletePayment: async (paymentId) => {
    try {
      const response = await apiClient.delete(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }
};

export default paymentService;