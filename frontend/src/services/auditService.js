import api from './api';

export const auditService = {
    getAllLogs: async (params = {}) => {
        const response = await api.get('/audit-logs', { params });
        return response.data;
    },

    getLogById: async (id) => {
        const response = await api.get(`/audit-logs/${id}`);
        return response.data;
    }
};
