import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { patientService } from '../../services/patientService';
import { appointmentService } from '../../services/appointmentService';
import { medicineService } from '../../services/medicineService';
import { toast } from 'react-toastify';
import { FiUserPlus, FiCalendar, FiSearch, FiPackage, FiUsers, FiClock, FiCheckCircle, FiActivity } from 'react-icons/fi';

const ReceptionistDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    todayRegistrations: 0,
    todayAppointments: 0,
    pendingCheckIns: 0,
    dispensedMedicines: 0,
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [patientData, setPatientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    bloodGroup: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [patientsRes, appointmentsRes] = await Promise.all([
        patientService.getAllPatients({ limit: 5, page: 1 }),
        appointmentService.getAllAppointments({ date: today }),
      ]);

      setRecentPatients(patientsRes.data || []);
      const appointments = appointmentsRes.data || [];
      setTodayAppointments(appointments);

      const pendingCheckIns = appointments.filter(a =>
        a.status === 'scheduled' || a.status === 'confirmed'
      ).length;

      setStats({
        todayRegistrations: patientsRes.pagination?.total || 0,
        todayAppointments: appointments.length,
        pendingCheckIns,
        dispensedMedicines: 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    try {
      const response = await patientService.registerPatient(patientData);
      toast.success(`Patient registered! MRN: ${response.data.patient.medicalRecordNumber}`);
      if (response.data.temporaryPassword) {
        alert(`Temporary Password: ${response.data.temporaryPassword}\nPlease share with patient.`);
      }
      setPatientData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        bloodGroup: '',
      });
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register patient');
    }
  };

  const handleChange = (e) => {
    setPatientData({
      ...patientData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await patientService.getAllPatients({ search: searchTerm });
      setSearchResults(response.data || []);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleCheckIn = async (appointmentId) => {
    try {
      await appointmentService.updateAppointment(appointmentId, {
        status: 'confirmed',
        checkInTime: new Date().toISOString(),
      });
      toast.success('Patient checked in successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to check in patient');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: 'bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-semibold',
      confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold',
      'in-progress': 'bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold',
      completed: 'bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-xs font-semibold',
      cancelled: 'bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-semibold',
    };
    return badges[status] || badges.scheduled;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Reception Desk
          </h1>
          <p className="text-gray-600 flex items-center text-lg">
            <FiActivity className="mr-2 text-green-600" />
            Patient registration, appointments & check-ins
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-green-50 text-green-600">
                      <FiUserPlus className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                      +New
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-2 font-medium">Total Patients</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.todayRegistrations}</p>
                </div>
                <div className="h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                      <FiCalendar className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                      Today
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-2 font-medium">Appointments</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.todayAppointments}</p>
                </div>
                <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                      <FiClock className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                      Waiting
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-2 font-medium">Pending Check-ins</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.pendingCheckIns}</p>
                </div>
                <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                      <FiPackage className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                      Stock
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-2 font-medium">Medicines Dispensed</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.dispensedMedicines}</p>
                </div>
                <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg mb-8 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview', icon: FiActivity },
                    { id: 'register', label: 'Register Patient', icon: FiUserPlus },
                    { id: 'appointments', label: 'Appointments', icon: FiCalendar },
                    { id: 'search', label: 'Search Patients', icon: FiSearch },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all ${activeTab === tab.id
                          ? 'border-green-600 text-green-700'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Recent Patients */}
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                          <FiUsers className="mr-2 text-green-600" />
                          Recent Patients
                        </h2>
                        <div className="space-y-3">
                          {recentPatients.map((patient) => (
                            <div
                              key={patient.id}
                              className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all flex items-center justify-between group"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold shadow-md">
                                  {patient.user?.firstName?.[0]}{patient.user?.lastName?.[0]}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {patient.user?.firstName} {patient.user?.lastName}
                                  </p>
                                  <p className="text-sm text-gray-500">MRN: {patient.medicalRecordNumber}</p>
                                </div>
                              </div>
                              <button className="text-green-600 hover:text-green-800 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                View
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Today's Appointments */}
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                          <FiCalendar className="mr-2 text-green-600" />
                          Today's Appointments
                        </h2>
                        <div className="space-y-3">
                          {todayAppointments.slice(0, 5).map((apt) => (
                            <div
                              key={apt.id}
                              className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-gray-900">
                                  {apt.patient?.user?.firstName} {apt.patient?.user?.lastName}
                                </p>
                                <span className={getStatusBadge(apt.status)}>{apt.status}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <span className="flex items-center">
                                  <FiClock className="mr-1" /> {apt.appointmentTime}
                                </span>
                                {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                                  <button
                                    onClick={() => handleCheckIn(apt.id)}
                                    className="text-green-600 hover:text-green-800 font-medium transition-colors"
                                  >
                                    Check In
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Register Patient Form */}
                {activeTab === 'register' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6 text-gray-900">Register New Patient</h2>
                    <form onSubmit={handleRegisterPatient} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="label">First Name *</label>
                          <input
                            type="text"
                            name="firstName"
                            required
                            className="input"
                            value={patientData.firstName}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <label className="label">Last Name *</label>
                          <input
                            type="text"
                            name="lastName"
                            required
                            className="input"
                            value={patientData.lastName}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <label className="label">Email *</label>
                          <input
                            type="email"
                            name="email"
                            required
                            className="input"
                            value={patientData.email}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <label className="label">Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            className="input"
                            value={patientData.phone}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <label className="label">Date of Birth</label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            className="input"
                            value={patientData.dateOfBirth}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <label className="label">Gender</label>
                          <select
                            name="gender"
                            className="input"
                            value={patientData.gender}
                            onChange={handleChange}
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="label">Blood Group</label>
                          <select
                            name="bloodGroup"
                            className="input"
                            value={patientData.bloodGroup}
                            onChange={handleChange}
                          >
                            <option value="">Select Blood Group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="label">Address</label>
                          <textarea
                            name="address"
                            rows="3"
                            className="input"
                            value={patientData.address}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary w-full md:w-auto px-8">
                        Register Patient
                      </button>
                    </form>
                  </div>
                )}

                {/* Appointments Tab */}
                {activeTab === 'appointments' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6 text-gray-900">Today's Appointments</h2>
                    <div className="space-y-4">
                      {todayAppointments.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No appointments scheduled</p>
                      ) : (
                        todayAppointments.map((apt) => (
                          <div
                            key={apt.id}
                            className="border border-gray-200 bg-white rounded-xl p-5 hover:shadow-lg transition-all"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-lg font-bold text-gray-900">
                                    {apt.patient?.user?.firstName} {apt.patient?.user?.lastName}
                                  </h3>
                                  <span className={getStatusBadge(apt.status)}>{apt.status}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                  <p className="flex items-center">
                                    <FiClock className="mr-1.5" /> {apt.appointmentTime}
                                  </p>
                                  <p>MRN: {apt.patient?.medicalRecordNumber}</p>
                                  <p>Dr. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName}</p>
                                  <p>{apt.type || 'Consultation'}</p>
                                </div>
                              </div>
                              {(apt.status === 'scheduled') && (
                                <button
                                  onClick={() => handleCheckIn(apt.id)}
                                  className="ml-4 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
                                >
                                  Check In
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Search Tab */}
                {activeTab === 'search' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6 text-gray-900">Search Patients</h2>
                    <div className="flex gap-4 mb-6">
                      <input
                        type="text"
                        placeholder="Search by name, email, or MRN..."
                        className="input flex-1"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <button onClick={handleSearch} className="btn btn-primary px-8">
                        <FiSearch className="mr-2" /> Search
                      </button>
                    </div>
                    <div className="space-y-3">
                      {searchResults.map((patient) => (
                        <div
                          key={patient.id}
                          className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                              {patient.user?.firstName?.[0]}{patient.user?.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {patient.user?.firstName} {patient.user?.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                MRN: {patient.medicalRecordNumber} • {patient.user?.email}
                              </p>
                            </div>
                          </div>
                          <button className="text-green-600 hover:text-green-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            View Details
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
