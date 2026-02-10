import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { prescriptionService } from '../../services/prescriptionService';
import { toast } from 'react-toastify';
import { FiCalendar, FiFileText, FiClock, FiActivity, FiHeart, FiTrendingUp, FiCheckCircle, FiAlertCircle, FiUser } from 'react-icons/fi';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.patientProfile?.id) {
      fetchPatientData();
    }
  }, [user]);

  const fetchPatientData = async () => {
    try {
      const patientId = user.patientProfile.id;

      const [appointmentsRes, prescriptionsRes] = await Promise.all([
        appointmentService.getPatientAppointments(patientId),
        prescriptionService.getPatientPrescriptions(patientId),
      ]);

      setAppointments(appointmentsRes.data || []);
      setPrescriptions(prescriptionsRes.data || []);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold',
      confirmed: 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold',
      'in-progress': 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold',
      completed: 'bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold',
      cancelled: 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold',
    };
    return badges[status] || badges.scheduled;
  };

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'scheduled' || a.status === 'confirmed'
  );
  const pastAppointments = appointments.filter((a) => a.status === 'completed');
  const totalVisits = appointments.filter(a => a.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Patient Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {user?.firstName} {user?.lastName}
                </h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <p className="flex items-center">
                    <FiUser className="mr-2" />
                    MRN: <span className="font-semibold ml-1">{user?.patientProfile?.medicalRecordNumber}</span>
                  </p>
                  {user?.patientProfile?.bloodGroup && (
                    <p className="flex items-center">
                      <FiHeart className="mr-2 text-red-500" />
                      Blood Group: <span className="font-semibold ml-1">{user?.patientProfile?.bloodGroup}</span>
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {user?.email} {user?.phone && `• ${user.phone}`}
                </p>
              </div>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold">
              Book Appointment
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-blue-50">
                      <FiCalendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Active
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">Upcoming Appointments</p>
                  <p className="text-3xl font-bold text-gray-900">{upcomingAppointments.length}</p>
                </div>
                <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-green-50">
                      <FiCheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                      History
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">Total Visits</p>
                  <p className="text-3xl font-bold text-gray-900">{totalVisits}</p>
                </div>
                <div className="h-2 bg-gradient-to-r from-green-500 to-green-600"></div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-purple-50">
                      <FiFileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      Rx
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">Prescriptions</p>
                  <p className="text-3xl font-bold text-gray-900">{prescriptions.length}</p>
                </div>
                <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-indigo-50">
                      <FiActivity className="w-6 h-6 text-indigo-600" />
                    </div>
                    <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      Status
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">Health Status</p>
                  <p className="text-xl font-bold text-green-600">Good</p>
                </div>
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upcoming Appointments - Main Section */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <FiCalendar className="mr-2 text-blue-600" />
                    Upcoming Appointments
                  </h2>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {upcomingAppointments.length} scheduled
                  </span>
                </div>
                
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No upcoming appointments</p>
                    <button className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                      Book New Appointment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border-2 border-gray-100 rounded-xl p-5 hover:border-purple-200 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                              Dr
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                Dr. {appointment.doctor?.user?.firstName} {appointment.doctor?.user?.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {appointment.doctor?.specialization}
                              </p>
                              {appointment.doctor?.department && (
                                <p className="text-xs text-gray-500">
                                  {appointment.doctor?.department?.name}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className={getStatusBadge(appointment.status)}>
                            {appointment.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center text-gray-600">
                            <FiCalendar className="mr-2 text-purple-600" />
                            {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FiClock className="mr-2 text-purple-600" />
                            {appointment.appointmentTime}
                          </div>
                          {appointment.reason && (
                            <div className="col-span-2 flex items-start text-gray-600">
                              <FiAlertCircle className="mr-2 text-purple-600 mt-0.5" />
                              <span>{appointment.reason}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                          <p className="text-sm text-gray-500">
                            Appointment #{appointment.appointmentNumber}
                          </p>
                          <div className="flex space-x-2">
                            <button className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium">
                              Reschedule
                            </button>
                            <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar - Recent Prescriptions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <FiFileText className="mr-2 text-purple-600" />
                    Prescriptions
                  </h2>
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {prescriptions.length} total
                  </span>
                </div>
                
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {prescriptions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No prescriptions yet</p>
                  ) : (
                    prescriptions.slice(0, 10).map((prescription) => (
                      <div
                        key={prescription.id}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-purple-500"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-bold text-sm text-gray-900">
                            #{prescription.prescriptionNumber}
                          </p>
                          <span className="text-xs text-gray-500">
                            {new Date(prescription.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Dr. {prescription.doctor?.user?.firstName} {prescription.doctor?.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-700 font-medium">
                          {prescription.diagnosis}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {prescription.medications?.length || 0} medications
                          </span>
                          <button className="text-xs text-purple-600 hover:text-purple-800 font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Medical History Summary */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FiTrendingUp className="mr-2 text-indigo-600" />
                Medical History Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-600 font-semibold mb-1">Last Visit</p>
                  <p className="text-lg font-bold text-gray-900">
                    {pastAppointments.length > 0 
                      ? new Date(pastAppointments[0].appointmentDate).toLocaleDateString()
                      : 'No visits yet'}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-600 font-semibold mb-1">Total Consultations</p>
                  <p className="text-lg font-bold text-gray-900">{totalVisits}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <p className="text-sm text-purple-600 font-semibold mb-1">Active Medications</p>
                  <p className="text-lg font-bold text-gray-900">
                    {prescriptions.filter(p => p.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
