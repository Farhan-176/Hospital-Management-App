import api from './api';

export const patientService = {
  registerPatient: async (patientData) => {
    const response = await api.post('/patients', patientData);
    return response.data;
  },

  createPatient: async (patientData) => {
    const response = await api.post('/patients', patientData);
    return response.data;
  },

  getAllPatients: async (params) => {
    const response = await api.get('/patients', { params });
    return response.data;
  },

  getPatientById: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  getPatientHistory: async (id) => {
    const response = await api.get(`/patients/${id}/history`);
    return response.data;
  },

  updatePatient: async (id, updates) => {
    const response = await api.put(`/patients/${id}`, updates);
    return response.data;
  },
};
