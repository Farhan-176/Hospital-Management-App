import api from './api';

export const invoiceService = {
    getAllInvoices: async (params = {}) => {
        const response = await api.get('/invoices', { params });
        return response.data;
    },

    getInvoiceById: async (id) => {
        const response = await api.get(`/invoices/${id}`);
        return response.data;
    },

    getPatientInvoices: async (patientId) => {
        const response = await api.get(`/invoices/patient/${patientId}`);
        return response.data;
    },

    createInvoice: async (invoiceData) => {
        const response = await api.post('/invoices', invoiceData);
        return response.data;
    },

    updateInvoice: async (id, invoiceData) => {
        const response = await api.put(`/invoices/${id}`, invoiceData);
        return response.data;
    },

    processPayment: async (id, paymentData) => {
        const response = await api.post(`/invoices/${id}/payment`, paymentData);
        return response.data;
    },

    cancelInvoice: async (id, reason) => {
        const response = await api.post(`/invoices/${id}/cancel`, { cancelReason: reason });
        return response.data;
    }
};
