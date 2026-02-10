import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import DataTable from '../../components/DataTable';
import AddPatientModal from '../../components/modals/AddPatientModal';
import AddAppointmentModal from '../../components/modals/AddAppointmentModal';
import AddMedicineModal from '../../components/modals/AddMedicineModal';
import { patientService } from '../../services/patientService';
import { appointmentService } from '../../services/appointmentService';
import { medicineService } from '../../services/medicineService';
import { FiUsers, FiCalendar, FiPackage, FiActivity, FiTrendingUp, FiDollarSign, FiUserCheck, FiClock, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    totalAppointments: 0,
    completedToday: 0,
    lowStockMedicines: 0,
    activeDoctors: 0,
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [patientsRes, appointmentsRes, medicinesRes, recentPatientsRes, allPatientsRes] = await Promise.all([
        patientService.getAllPatients({ limit: 1 }),
        appointmentService.getAllAppointments({ date: today }),
        medicineService.getLowStockMedicines(),
        patientService.getAllPatients({ limit: 5, page: 1 }),
        patientService.getAllPatients(),
      ]);

      const appointments = appointmentsRes.data || [];
      const completedToday = appointments.filter(a => a.status === 'completed').length;

      setStats({
        totalPatients: patientsRes.pagination?.total || 0,
        todayAppointments: appointments.length,
        totalAppointments: appointmentsRes.pagination?.total || 0,
        completedToday,
        lowStockMedicines: medicinesRes.data?.length || 0,
        activeDoctors: 2, // From seed data
      });

      setRecentPatients(recentPatientsRes.data || []);
      setAllPatients(allPatientsRes.data || []);
      setTodayAppointments(appointments.slice(0, 5));
      setLowStockItems(medicinesRes.data || []);
      
      // Mock doctors data - in real app, fetch from API
      setDoctors([
        { id: 1, user: { firstName: 'Sarah', lastName: 'Johnson' }, specialization: 'Cardiology' },
        { id: 2, user: { firstName: 'Michael', lastName: 'Chen' }, specialization: 'Pediatrics' }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: FiUsers,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+12%',
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: FiCalendar,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+8%',
    },
    {
      title: 'Completed Today',
      value: stats.completedToday,
      icon: FiUserCheck,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: `${Math.round((stats.completedToday / stats.todayAppointments) * 100) || 0}%`,
    },
    {
      title: 'Low Stock Alerts',
      value: stats.lowStockMedicines,
      icon: FiPackage,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      change: stats.lowStockMedicines > 0 ? 'Action needed' : 'All good',
    },
    {
      title: 'Active Doctors',
      value: stats.activeDoctors,
      icon: FiActivity,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      change: '100%',
    },
    {
      title: 'Total Revenue',
      value: '₹' + (stats.completedToday * 1500).toLocaleString(),
      icon: FiDollarSign,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      change: '+15%',
    },
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 flex items-center">
            <FiActivity className="mr-2" />
            Real-time hospital overview and management
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                        <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                      </div>
                      <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`h-2 bg-gradient-to-r ${stat.color}`}></div>
                </div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Today's Appointments */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <FiCalendar className="mr-2 text-green-600" />
                    Today's Appointments
                  </h2>
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {stats.todayAppointments} Total
                  </span>
                </div>
                <div className="space-y-4">
                  {todayAppointments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No appointments for today</p>
                  ) : (
                    todayAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {apt.patient?.user?.firstName} {apt.patient?.user?.lastName}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <FiClock className="mr-1" /> {apt.appointmentTime} • Dr. {apt.doctor?.user?.firstName}
                          </p>
                        </div>
                        <span className={getStatusBadge(apt.status)}>{apt.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Patients */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <FiUsers className="mr-2 text-blue-600" />
                    Recent Patients
                  </h2>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {stats.totalPatients} Total
                  </span>
                </div>
                <div className="space-y-4">
                  {recentPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {patient.user?.firstName?.[0]}{patient.user?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {patient.user?.firstName} {patient.user?.lastName}
                          </p>
                          <p className="text-sm text-gray-600">MRN: {patient.medicalRecordNumber}</p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low Stock Medicines */}
              <div className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <FiPackage className="mr-2 text-red-600" />
                    Low Stock Medicines
                  </h2>
                  <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {stats.lowStockMedicines} Items
                  </span>
                </div>
                {lowStockItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">All medicines are well stocked</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">Medicine</th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">Category</th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">Current Stock</th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">Min Stock</th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockItems.map((medicine) => (
                          <tr key={medicine.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{medicine.name}</td>
                            <td className="py-3 px-4 text-gray-600">{medicine.category}</td>
                            <td className="py-3 px-4">
                              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                                {medicine.stock}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{medicine.minStock}</td>
                            <td className="py-3 px-4">
                              <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium">
                                Reorder
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FiTrendingUp className="mr-2 text-indigo-600" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => setShowAddPatientModal(true)}
                  className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <FiUsers className="w-6 h-6 mb-2" />
                  <span className="text-sm font-semibold">Add Patient</span>
                </button>
                <button 
                  onClick={() => setShowAddAppointmentModal(true)}
                  className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <FiCalendar className="w-6 h-6 mb-2" />
                  <span className="text-sm font-semibold">Schedule Appointment</span>
                </button>
                <button 
                  onClick={() => setShowAddMedicineModal(true)}
                  className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <FiPackage className="w-6 h-6 mb-2" />
                  <span className="text-sm font-semibold">Add Medicine</span>
                </button>
                <button 
                  onClick={() => setActiveTab('patients')}
                  className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <FiActivity className="w-6 h-6 mb-2" />
                  <span className="text-sm font-semibold">View All Patients</span>
                </button>
              </div>
            </div>

            {/* Tabs for All Patients */}
            {activeTab === 'patients' && (
              <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <FiUsers className="mr-2 text-blue-600" />
                    All Patients
                  </h2>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Back to Overview
                  </button>
                </div>
                <DataTable
                  data={allPatients}
                  columns={[
                    {
                      key: 'medicalRecordNumber',
                      label: 'MRN',
                      accessor: (row) => row.medicalRecordNumber
                    },
                    {
                      key: 'name',
                      label: 'Patient Name',
                      accessor: (row) => `${row.user?.firstName} ${row.user?.lastName}`
                    },
                    {
                      key: 'email',
                      label: 'Email',
                      accessor: (row) => row.user?.email
                    },
                    {
                      key: 'phone',
                      label: 'Phone',
                      accessor: (row) => row.user?.phone || 'N/A'
                    },
                    {
                      key: 'bloodGroup',
                      label: 'Blood Group',
                      render: (row) => (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                          {row.bloodGroup || 'N/A'}
                        </span>
                      )
                    },
                    {
                      key: 'createdAt',
                      label: 'Registered',
                      accessor: (row) => new Date(row.createdAt).toLocaleDateString()
                    }
                  ]}
                  searchable={true}
                  sortable={true}
                  pagination={true}
                  itemsPerPage={10}
                  emptyMessage="No patients registered yet"
                />
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Modals */}
      <AddPatientModal
        isOpen={showAddPatientModal}
        onClose={() => setShowAddPatientModal(false)}
        onSuccess={fetchDashboard}
      />
      <AddAppointmentModal
        isOpen={showAddAppointmentModal}
        onClose={() => setShowAddAppointmentModal(false)}
        onSuccess={fetchDashboard}
        doctors={doctors}
      />
      <AddMedicineModal
        isOpen={showAddMedicineModal}
        onClose={() => setShowAddMedicineModal(false)}
        onSuccess={fetchDashboard}
      />
    </div>
  );
};

export default AdminDashboard;
