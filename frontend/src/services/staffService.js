import api from './api';

export const staffService = {
    getAllStaff: async (params = {}) => {
        const response = await api.get('/staff', { params });
        return response.data;
    },

    getAllDoctors: async () => {
        const response = await api.get('/staff/doctors');
        return response.data;
    },

    createStaff: async (staffData) => {
        const response = await api.post('/staff', staffData);
        return response.data;
    },

    getStaffById: async (id) => {
        const response = await api.get(`/staff/${id}`);
        return response.data;
    },

    updateStaff: async (id, staffData) => {
        const response = await api.put(`/staff/${id}`, staffData);
        return response.data;
    },

    deleteStaff: async (id) => {
        const response = await api.delete(`/staff/${id}`);
        return response.data;
    },
};
