import axiosInstance from '../interfaces/axiosInstance.js';

// Payment routes - CORRECT PATHS
export const getPendingPayments = () => axiosInstance.get('/employee/payments/pending');
export const approvePayment = (id) => axiosInstance.put(`/employee/payments/${id}/approve`);
export const denyPayment = (id) => axiosInstance.put(`/employee/payments/${id}/deny`);
export const getPaymentHistory = () => axiosInstance.get('/employee/payments/history');

// Employee management routes - CORRECT PATHS
export const getEmployees = () => axiosInstance.get('/employee/employees');
export const createEmployee = (data) => axiosInstance.post('/employee/employees', data);
export const deleteEmployee = (id) => axiosInstance.delete(`/employee/employees/${id}`);

// Login route - ADD THIS
export const employeeLogin = (credentials) => axiosInstance.post('/employee/login', credentials);