import axiosInstance from '../interfaces/axiosInstance.js';

export const getAllPayments = () => axiosInstance.get('/payments');
export const getPaymentById = (id) => axiosInstance.get(`/payments/${id}`);
export const createPayment = (paymentData) => axiosInstance.post('/payments', paymentData);
export const updatePayment = (id, paymentData) => axiosInstance.put(`/payments/${id}`, paymentData);
export const deletePayment = (id) => axiosInstance.delete(`/payments/${id}`);
