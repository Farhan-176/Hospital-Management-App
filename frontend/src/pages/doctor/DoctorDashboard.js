import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { prescriptionService } from '../../services/prescriptionService';
import { toast } from 'react-toastify';
import { FiClock, FiUsers, FiCheckCircle, FiCalendar, FiActivity, FiFileText, FiAlertCircle, FiTrendingUp, FiUserCheck } from 'react-icons/fi';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    total: 0,
    inProgress: 0,
  });

  useEffect(() => {
    if (user?.doctorProfile?.id) {
      fetchDoctorData();
    }
  }, [user]);

  const fetchDoctorData = async () => {
    try {
      const doctorId = user.doctorProfile.id;
      const today = new Date().toISOString().split('T')[0];

      const [queueRes, scheduleRes] = await Promise.all([
        appointmentService.getDoctorQueue(doctorId),
        appointmentService.getDoctorSchedule(doctorId, today),
      ]);

      const scheduleData = scheduleRes.data || [];
      setQueue(queueRes.data || []);
      setSchedule(scheduleData);

      const completed = scheduleData.filter((a) => a.status === 'completed').length;
      const inProgress = scheduleData.filter((a) => a.status === 'in-progress').length;
      const total = scheduleData.length;
      const pending = total - completed - inProgress;

      setStats({ pending, completed, total, inProgress });
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (appointmentId) => {
    try {
      await appointmentService.updateAppointment(appointmentId, {
        status: 'in-progress',
        checkInTime: new Date().toISOString(),
      });
      toast.success('Patient checked in successfully');
      fetchDoctorData();
    } catch (error) {
      toast.error('Failed to check in patient');
    }
  };

  const handleComplete = async (appointmentId) => {
    try {
      await appointmentService.updateAppointment(appointmentId, {
        status: 'completed',
        checkOutTime: new Date().toISOString(),
      });
      toast.success('Appointment marked as completed');
      fetchDoctorData();
    } catch (error) {
      toast.error('Failed to complete appointment');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold',
      confirmed: 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold',
      'in-progress': 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold',
      completed: 'bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold',
    };
    return badges[status] || badges.scheduled;
  };

  const getTimeColor = (time) => {
    const now = new Date();
    const appointmentTime = new Date(`${new Date().toISOString().split('T')[0]}T${time}`);
    const diff = appointmentTime - now;

    if (diff < -3600000) return 'text-red-600'; // Past by more than 1 hour
    if (diff < 0) return 'text-orange-600'; // Past but within 1 hour
    if (diff < 1800000) return 'text-green-600'; // Within 30 minutes
    return 'text-gray-600'; // Future
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dr. {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-gray-600 flex items-center">
            <FiActivity className="mr-2" />
            {user?.doctorProfile?.specialization} • License: {user?.doctorProfile?.licenseNumber}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-blue-50">
                      <FiClock className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Waiting
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">Pending Patients</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-yellow-50">
                      <FiUserCheck className="w-6 h-6 text-yellow-600" />
                    </div>
                    <span className="text-sm font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                      Active
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
                </div>
                <div className="h-2 bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-green-50">
                      <FiCheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                      Done
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">Completed Today</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
                </div>
                <div className="h-2 bg-gradient-to-r from-green-500 to-green-600"></div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-purple-50">
                      <FiCalendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      {Math.round((stats.completed / stats.total) * 100) || 0}%
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">Total Appointments</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Patient Queue - Takes 2 columns */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <FiUsers className="mr-2 text-blue-600" />
                    Patient Queue
                  </h2>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {queue.length} in queue
                  </span>
                </div>

                {queue.length === 0 ? (
                  <div className="text-center py-12">
                    <FiCheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No patients in queue</p>
                    <p className="text-gray-400 text-sm mt-2">All caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {queue.map((appointment, index) => (
                      <div
                        key={appointment.id}
                        className="border-2 border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            {/* Queue Number */}
                            <div className="flex-shrink-0">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <span className="text-white text-xl font-bold">{appointment.queueToken || index + 1}</span>
                              </div>
                            </div>

                            {/* Patient Info */}
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-bold text-gray-900">
                                  {appointment.patient?.user?.firstName} {appointment.patient?.user?.lastName}
                                </h3>
                                <span className={getStatusBadge(appointment.status)}>{appointment.status}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                <p className="flex items-center">
                                  <FiClock className={`mr-1.5 ${getTimeColor(appointment.appointmentTime)}`} />
                                  <span className={getTimeColor(appointment.appointmentTime)}>
                                    {appointment.appointmentTime}
                                  </span>
                                </p>
                                <p className="flex items-center">
                                  <FiFileText className="mr-1.5" />
                                  MRN: {appointment.patient?.medicalRecordNumber}
                                </p>
                                <p className="flex items-center col-span-2">
                                  <FiAlertCircle className="mr-1.5" />
                                  {appointment.reason || 'General consultation'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col space-y-2 ml-4">
                            {appointment.status === 'scheduled' || appointment.status === 'confirmed' ? (
                              <button
                                onClick={() => handleCheckIn(appointment.id)}
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
                              >
                                Check In
                              </button>
                            ) : appointment.status === 'in-progress' ? (
                              <>
                                <button
                                  onClick={() => navigate(`/doctor/consultation/${appointment.id}`)}
                                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
                                >
                                  Consult
                                </button>
                                <button
                                  onClick={() => handleComplete(appointment.id)}
                                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
                                >
                                  Complete
                                </button>
                              </>
                            ) : (
                              <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold">
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Today's Schedule - Sidebar */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <FiCalendar className="mr-2 text-purple-600" />
                    Today's Schedule
                  </h2>
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {schedule.length} total
                  </span>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {schedule.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No appointments scheduled</p>
                  ) : (
                    schedule.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-blue-500"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className={`font-bold ${getTimeColor(appointment.appointmentTime)}`}>
                            {appointment.appointmentTime}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                            {appointment.status}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900 text-sm">
                          {appointment.patient?.user?.firstName} {appointment.patient?.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {appointment.type || 'Consultation'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FiTrendingUp className="mr-2 text-indigo-600" />
                Performance Today
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Appointments</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {Math.round((stats.completed / stats.total) * 100) || 0}%
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Completion Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.total > 0 ? Math.round((stats.total / 8) * 60) : 0} min
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Avg Time/Patient</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-indigo-600">
                    ₹{(stats.completed * (user?.doctorProfile?.consultationFee || 1500)).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Revenue Today</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;

