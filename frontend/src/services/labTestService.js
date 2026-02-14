import api from './api';

export const labTestService = {
    getAllLabTests: async (params = {}) => {
        const response = await api.get('/lab-tests', { params });
        return response.data;
    },

    getLabTestById: async (id) => {
        const response = await api.get(`/lab-tests/${id}`);
        return response.data;
    },

    getPatientLabTests: async (patientId) => {
        const response = await api.get(`/lab-tests/patient/${patientId}`);
        return response.data;
    },

    createLabTest: async (labTestData) => {
        const response = await api.post('/lab-tests', labTestData);
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await api.put(`/lab-tests/${id}/status`, { status });
        return response.data;
    },

    updateResults: async (id, resultsData) => {
        const response = await api.post(`/lab-tests/${id}/results`, resultsData);
        return response.data;
    },

    cancelLabTest: async (id, reason) => {
        const response = await api.post(`/lab-tests/${id}/cancel`, { cancelReason: reason });
        return response.data;
    }
};
