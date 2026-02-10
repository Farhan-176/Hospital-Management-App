import api from './api';

export const appointmentService = {
  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  getAllAppointments: async (params) => {
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  getAppointmentById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  getDoctorSchedule: async (doctorId, date) => {
    const response = await api.get(`/appointments/doctor/${doctorId}/schedule`, {
      params: { date },
    });
    return response.data;
  },

  getDoctorQueue: async (doctorId) => {
    const response = await api.get(`/appointments/doctor/${doctorId}/queue`);
    return response.data;
  },

  getPatientAppointments: async (patientId) => {
    const response = await api.get(`/appointments/patient/${patientId}`);
    return response.data;
  },

  updateAppointment: async (id, updates) => {
    const response = await api.put(`/appointments/${id}`, updates);
    return response.data;
  },

  cancelAppointment: async (id, reason) => {
    const response = await api.post(`/appointments/${id}/cancel`, {
      cancelReason: reason,
    });
    return response.data;
  },
};
