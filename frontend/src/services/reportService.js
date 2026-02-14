import api from './api';

export const reportService = {
    getFinancialReport: async (params = {}) => {
        const response = await api.get('/reports/financial', { params });
        return response.data;
    },

    getOperationalReport: async (params = {}) => {
        const response = await api.get('/reports/operational', { params });
        return response.data;
    },

    getInventoryReport: async (params = {}) => {
        const response = await api.get('/reports/inventory', { params });
        return response.data;
    },

    getDashboardSummary: async () => {
        const response = await api.get('/reports/dashboard');
        return response.data;
    }
};
