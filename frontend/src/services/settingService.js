import api from './api';

export const settingService = {
    getAllSettings: async () => {
        const response = await api.get('/settings');
        return response.data;
    },

    updateSettings: async (settingsData) => {
        const response = await api.post('/settings', settingsData);
        return response.data;
    }
};
