import api from './api';

export const medicineService = {
  getAllMedicines: async (params) => {
    const response = await api.get('/medicines', { params });
    return response.data;
  },

  getMedicineById: async (id) => {
    const response = await api.get(`/medicines/${id}`);
    return response.data;
  },

  getLowStockMedicines: async () => {
    const response = await api.get('/medicines/alerts/low-stock');
    return response.data;
  },

  createMedicine: async (medicineData) => {
    const response = await api.post('/medicines', medicineData);
    return response.data;
  },

  updateMedicine: async (id, updates) => {
    const response = await api.put(`/medicines/${id}`, updates);
    return response.data;
  },

  updateStock: async (id, quantity, type) => {
    const response = await api.post(`/medicines/${id}/stock`, { quantity, type });
    return response.data;
  },
};
