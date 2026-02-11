import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import DataTable from '../../components/DataTable';
import AddPatientModal from '../../components/modals/AddPatientModal';
import AddAppointmentModal from '../../components/modals/AddAppointmentModal';
import AddMedicineModal from '../../components/modals/AddMedicineModal';
import { patientService } from '../../services/patientService';
import { appointmentService } from '../../services/appointmentService';
import { medicineService } from '../../services/medicineService';
import { FiUsers, FiCalendar, FiPackage, FiActivity, FiTrendingUp, FiDollarSign, FiUserCheck, FiClock, FiPlus, FiAlertCircle, FiCheckCircle, FiFileText, FiBell, FiSearch, FiMenu, FiX } from 'react-icons/fi';
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
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showActivityLogModal, setShowActivityLogModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showDoctorProfileModal, setShowDoctorProfileModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSearchResults && !event.target.closest('.search-container')) {
        setShowSearchResults(false);
      }
      if (showNotifications && !event.target.closest('.notification-container')) {
        setShowNotifications(false);
      }
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (showSearchResults) {
          setShowSearchResults(false);
          setSearchQuery('');
        }
        if (showNotifications) setShowNotifications(false);
        if (showUserMenu) setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showSearchResults, showNotifications, showUserMenu]);

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
        activeDoctors: 2,
      });

      setRecentPatients(recentPatientsRes.data || []);
      setAllPatients(allPatientsRes.data || []);
      setTodayAppointments(appointments.slice(0, 5));
      setLowStockItems(medicinesRes.data || []);

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

  const departmentOccupancy = [
    { name: 'ICU', percentage: 92, color: 'bg-[#137fec]' },
    { name: 'Peds', percentage: 75, color: 'bg-[#137fec]' },
    { name: 'Ent', percentage: 45, color: 'bg-[#137fec]' },
    { name: 'Gen', percentage: 88, color: 'bg-[#137fec]' },
    { name: 'Cardio', percentage: 60, color: 'bg-[#137fec]' },
    { name: 'Emerg', percentage: 95, color: 'bg-[#137fec]' },
  ];

  const recentActivity = [
    { icon: FiFileText, title: 'New patient admitted', subtitle: 'Marcus Wright - Ward 4A', time: '12 mins ago', color: 'bg-blue-100 text-blue-600' },
    { icon: FiCheckCircle, title: 'Surgery completed', subtitle: 'Dr. Helena Vance - Theatre 2', time: '45 mins ago', color: 'bg-emerald-100 text-emerald-600' },
    { icon: FiFileText, title: 'Lab reports updated', subtitle: '14 results finalized for Haematology', time: '1 hour ago', color: 'bg-[#137fec]/10 text-[#137fec]' },
  ];

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: FiUsers,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      change: '+3.2%',
      trending: 'up',
    },
    {
      title: 'Active Appointments',
      value: stats.todayAppointments,
      icon: FiCalendar,
      iconBg: 'bg-[#137fec]/10',
      iconColor: 'text-[#137fec]',
      change: '+12',
      trending: 'up',
    },
    {
      title: 'Revenue (Monthly)',
      value: `$${(stats.completedToday * 1500).toLocaleString()}`,
      icon: FiDollarSign,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      change: '-1.1%',
      trending: 'down',
    },
    {
      title: 'Bed Occupancy',
      value: '88%',
      icon: FiActivity,
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
      change: 'High',
      trending: 'neutral',
    },
  ];

  const notifications = [
    {
      id: 1,
      type: 'appointment',
      title: 'New Appointment Scheduled',
      message: 'Dr. Smith has a new appointment at 3:00 PM',
      time: '5 min ago',
      unread: true,
      icon: FiCalendar,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      type: 'alert',
      title: 'Low Stock Alert',
      message: 'Paracetamol stock is running low (8 units remaining)',
      time: '15 min ago',
      unread: true,
      icon: FiAlertCircle,
      color: 'bg-rose-500'
    },
    {
      id: 3,
      type: 'patient',
      title: 'New Patient Registration',
      message: 'Jane Doe has been registered successfully',
      time: '1 hour ago',
      unread: false,
      icon: FiUsers,
      color: 'bg-emerald-500'
    },
    {
      id: 4,
      type: 'system',
      title: 'System Update',
      message: 'Dashboard analytics have been updated',
      time: '2 hours ago',
      unread: false,
      icon: FiActivity,
      color: 'bg-purple-500'
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = [];

    // Search patients
    allPatients.forEach(patient => {
      const fullName = `${patient.user?.firstName} ${patient.user?.lastName}`.toLowerCase();
      const mrn = patient.medicalRecordNumber?.toLowerCase() || '';
      if (fullName.includes(lowerQuery) || mrn.includes(lowerQuery)) {
        results.push({
          type: 'Patient',
          name: `${patient.user?.firstName} ${patient.user?.lastName}`,
          subtitle: `MRN: ${patient.medicalRecordNumber}`,
          icon: FiUsers,
          action: () => setActiveSection('patients')
        });
      }
    });

    // Search doctors
    doctors.forEach(doctor => {
      const fullName = `Dr. ${doctor.user?.firstName} ${doctor.user?.lastName}`.toLowerCase();
      const specialization = doctor.specialization?.toLowerCase() || '';
      if (fullName.includes(lowerQuery) || specialization.includes(lowerQuery)) {
        results.push({
          type: 'Doctor',
          name: `Dr. ${doctor.user?.firstName} ${doctor.user?.lastName}`,
          subtitle: doctor.specialization,
          icon: FiUserCheck,
          action: () => setActiveSection('staff')
        });
      }
    });

    // Search appointments
    todayAppointments.forEach(apt => {
      const patientName = `${apt.patient?.user?.firstName} ${apt.patient?.user?.lastName}`.toLowerCase();
      if (patientName.includes(lowerQuery)) {
        results.push({
          type: 'Appointment',
          name: `${apt.patient?.user?.firstName} ${apt.patient?.user?.lastName}`,
          subtitle: `${apt.appointmentTime} - ${apt.status}`,
          icon: FiCalendar,
          action: () => setActiveSection('appointments')
        });
      }
    });

    // Search medicines
    lowStockItems.forEach(medicine => {
      const medicineName = medicine.name?.toLowerCase() || '';
      if (medicineName.includes(lowerQuery)) {
        results.push({
          type: 'Medicine',
          name: medicine.name,
          subtitle: `Stock: ${medicine.stock} units`,
          icon: FiPackage,
          action: () => setActiveSection('pharmacy')
        });
      }
    });

    setSearchResults(results.slice(0, 8)); // Limit to 8 results
    setShowSearchResults(true);
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

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white border-r border-slate-200 flex flex-col shadow-xl overflow-hidden`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 bg-gradient-to-br from-[#137fec] to-[#0d5fb8] rounded-xl flex items-center justify-center shadow-lg shadow-[#137fec]/20">
            <FiActivity className="text-white text-xl" />
          </div>
          <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
            Hospital <span className="text-[#137fec]">Management</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === 'dashboard'
              ? 'bg-gradient-to-r from-[#137fec] to-[#0d5fb8] text-white shadow-lg shadow-[#137fec]/20'
              : 'text-slate-600 hover:bg-[#137fec]/10 hover:text-[#137fec]'
              }`}
          >
            <FiActivity className="text-lg" />
            <span className="font-semibold">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveSection('patients')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === 'patients'
              ? 'bg-gradient-to-r from-[#137fec] to-[#0d5fb8] text-white shadow-lg shadow-[#137fec]/20'
              : 'text-slate-600 hover:bg-[#137fec]/10 hover:text-[#137fec]'
              }`}
          >
            <FiUsers className="text-lg" />
            <span className="font-medium">Patients</span>
          </button>
          <button
            onClick={() => setActiveSection('appointments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === 'appointments'
              ? 'bg-gradient-to-r from-[#137fec] to-[#0d5fb8] text-white shadow-lg shadow-[#137fec]/20'
              : 'text-slate-600 hover:bg-[#137fec]/10 hover:text-[#137fec]'
              }`}
          >
            <FiCalendar className="text-lg" />
            <span className="font-medium">Appointments</span>
          </button>
          <button
            onClick={() => setActiveSection('staff')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === 'staff'
              ? 'bg-gradient-to-r from-[#137fec] to-[#0d5fb8] text-white shadow-lg shadow-[#137fec]/20'
              : 'text-slate-600 hover:bg-[#137fec]/10 hover:text-[#137fec]'
              }`}
          >
            <FiUserCheck className="text-lg" />
            <span className="font-medium">Staff & Doctors</span>
          </button>
          <button
            onClick={() => setActiveSection('pharmacy')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === 'pharmacy'
              ? 'bg-gradient-to-r from-[#137fec] to-[#0d5fb8] text-white shadow-lg shadow-[#137fec]/20'
              : 'text-slate-600 hover:bg-[#137fec]/10 hover:text-[#137fec]'
              }`}
          >
            <FiPackage className="text-lg" />
            <span className="font-medium">Pharmacy & Lab</span>
          </button>
          <button
            onClick={() => setActiveSection('billing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === 'billing'
              ? 'bg-gradient-to-r from-[#137fec] to-[#0d5fb8] text-white shadow-lg shadow-[#137fec]/20'
              : 'text-slate-600 hover:bg-[#137fec]/10 hover:text-[#137fec]'
              }`}
          >
            <FiDollarSign className="text-lg" />
            <span className="font-medium">Billing</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-gradient-to-br from-[#137fec]/5 to-[#137fec]/10 rounded-xl p-4 border border-[#137fec]/20">
            <p className="text-xs font-bold text-[#137fec] uppercase tracking-wider mb-2">Support Plan</p>
            <p className="text-sm font-semibold text-slate-700">Enterprise Edition v2.4</p>
            <button className="mt-3 w-full py-2 bg-[#137fec]/20 hover:bg-[#137fec]/30 text-[#137fec] text-xs font-bold rounded-lg transition-all">
              UPGRADE
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
            >
              {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
            <div className="relative w-full group search-container">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#137fec] transition-colors" />
              <input
                className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-[#137fec] text-sm transition-all"
                placeholder="Search patients, doctors, or reports..."
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
              />

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-96 overflow-y-auto z-50">
                  <div className="p-2">
                    <p className="text-xs font-bold text-slate-500 uppercase px-3 py-2">Search Results ({searchResults.length})</p>
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          result.action();
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#137fec]/10 flex items-center justify-center">
                          <result.icon className="text-[#137fec]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 text-sm">{result.name}</p>
                          <p className="text-xs text-slate-500">{result.type} • {result.subtitle}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showSearchResults && searchResults.length === 0 && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 p-6 z-50">
                  <div className="text-center">
                    <FiSearch className="mx-auto text-3xl text-slate-300 mb-2" />
                    <p className="text-slate-500 text-sm">No results found for "{searchQuery}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <div className="relative notification-container">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <FiBell className="text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-[500px] overflow-hidden">
                  <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="overflow-y-auto max-h-96">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${notification.unread ? 'bg-blue-50/50' : ''
                          }`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-lg ${notification.color} flex items-center justify-center flex-shrink-0`}>
                            <notification.icon className="text-white text-lg" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-bold text-slate-900 text-sm">{notification.title}</p>
                              {notification.unread && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-slate-400 mt-2">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-slate-200">
                    <button className="w-full text-center text-sm font-semibold text-[#137fec] hover:text-[#0d5fb8] transition-colors">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-[1px] bg-slate-200"></div>

            {/* User Profile Menu */}
            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 hover:bg-slate-50 rounded-xl p-2 transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 leading-none">Admin Sarah Jenkins</p>
                  <p className="text-xs text-slate-500 mt-1">Hospital Director</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#137fec] to-purple-500 flex items-center justify-center text-white font-bold ring-2 ring-[#137fec]/20">
                  SJ
                </div>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-200">
                    <p className="font-bold text-slate-900">Sarah Jenkins</p>
                    <p className="text-sm text-slate-500">admin@hospital.com</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowProfileModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-left"
                    >
                      <FiUserCheck className="text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowActivityLogModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-left"
                    >
                      <FiActivity className="text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Activity Log</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowSettingsModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-left"
                    >
                      <FiFileText className="text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Settings</span>
                    </button>
                  </div>
                  <div className="p-2 border-t border-slate-200">
                    <button
                      onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-rose-50 rounded-lg transition-colors text-left"
                    >
                      <FiX className="text-rose-600" />
                      <span className="text-sm font-medium text-rose-600">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#137fec] border-t-transparent"></div>
            </div>
          ) : activeSection === 'dashboard' ? (
            <>
              {/* Welcome Section */}
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 mb-1">Dashboard Overview</h2>
                  <p className="text-slate-500">Real-time status of St. Mary's General Hospital</p>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                    <FiCalendar className="text-sm" />
                    Last 24 Hours
                  </button>
                  <button
                    onClick={() => setShowAddPatientModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#137fec] to-[#0d5fb8] text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-[#137fec]/30 transition-all"
                  >
                    <FiPlus className="text-sm" />
                    NEW ADMISSION
                  </button>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#137fec]/30 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 ${stat.iconBg} rounded-xl group-hover:scale-110 transition-transform`}>
                        <stat.icon className={`${stat.iconColor} text-xl`} />
                      </div>
                      <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg ${stat.trending === 'up' ? 'text-emerald-600 bg-emerald-50' :
                        stat.trending === 'down' ? 'text-rose-600 bg-rose-50' :
                          'text-orange-600 bg-orange-50'
                        }`}>
                        {stat.trending === 'up' && <FiTrendingUp className="text-sm" />}
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-extrabold text-slate-900">{stat.value}</h3>
                  </div>
                ))}
              </div>

              {/* Analytics & Activity */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Department Occupancy Chart */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-lg font-bold text-slate-900">Department Occupancy</h4>
                    <select className="bg-slate-50 border border-slate-200 text-sm font-semibold text-[#137fec] px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#137fec] cursor-pointer">
                      <option>Filter by Floor</option>
                      <option>Ground Floor</option>
                      <option>1st Floor</option>
                    </select>
                  </div>
                  <div className="h-64 flex items-end justify-between gap-4 px-2">
                    {departmentOccupancy.map((dept, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                        <div className="w-full bg-[#137fec]/10 rounded-t-xl relative h-full">
                          <div
                            className={`absolute inset-x-0 bottom-0 ${dept.color} rounded-t-xl transition-all duration-700 hover:opacity-80`}
                            style={{ height: `${dept.percentage}%` }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg transition-opacity">
                              {dept.percentage}% Occupied
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-500">{dept.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-sm hover:shadow-lg transition-shadow">
                  <h4 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h4>
                  <div className="flex-1 space-y-6 overflow-y-auto">
                    {recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex gap-4 group">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-xl ${activity.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <activity.icon className="text-lg" />
                          </div>
                          {idx < recentActivity.length - 1 && (
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[2px] h-10 bg-slate-200"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">{activity.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{activity.subtitle}</p>
                          <p className="text-[10px] text-slate-400 mt-1.5 uppercase font-bold tracking-wide">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alerts and Staff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Urgent Alerts */}
                <div className="bg-white rounded-2xl border-l-4 border-l-rose-500 border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 mb-6">
                    <FiAlertCircle className="text-rose-500 text-xl" />
                    <h4 className="text-lg font-bold text-slate-900">Urgent System Alerts</h4>
                  </div>
                  <div className="space-y-4">
                    {lowStockItems.slice(0, 2).map((medicine, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-rose-50 rounded-xl border border-rose-200 hover:bg-rose-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <FiPackage className="text-rose-500 text-xl" />
                          <div>
                            <p className="text-sm font-bold text-rose-700">Low Stock: {medicine.name}</p>
                            <p className="text-xs text-rose-600">Remaining: {medicine.stock} units (Min: {medicine.minStock})</p>
                          </div>
                        </div>
                        <button className="text-[10px] font-extrabold uppercase bg-rose-500 text-white px-3 py-2 rounded-lg hover:bg-rose-600 transition-colors">
                          Order Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Staff Updates */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-shadow">
                  <h4 className="text-lg font-bold text-slate-900 mb-6">Staff & Leave Requests</h4>
                  <div className="space-y-4">
                    {doctors.map((doctor, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#137fec] to-purple-500 flex items-center justify-center text-white font-bold">
                            {doctor.user.firstName[0]}{doctor.user.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Dr. {doctor.user.firstName} {doctor.user.lastName}</p>
                            <p className="text-xs text-slate-500">{doctor.specialization}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors">
                            <FiCheckCircle className="text-lg" />
                          </button>
                          <button className="p-2 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors">
                            <FiX className="text-lg" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : activeSection === 'patients' ? (
            /* All Patients View */
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                  <FiUsers className="mr-2 text-[#137fec]" />
                  All Patients
                </h2>
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                >
                  Back to Dashboard
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
          ) : activeSection === 'appointments' ? (
            /* Appointments View */
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                      <FiCalendar className="mr-2 text-[#137fec]" />
                      Appointments Management
                    </h2>
                    <p className="text-slate-500 mt-1">Manage and schedule patient appointments</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveSection('dashboard')}
                      className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                    >
                      Back to Dashboard
                    </button>
                    <button
                      onClick={() => setShowAddAppointmentModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#137fec] to-[#0d5fb8] text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-[#137fec]/30 transition-all"
                    >
                      <FiPlus className="text-sm" />
                      Schedule Appointment
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-blue-600 text-sm font-semibold">Today's Appointments</p>
                    <p className="text-3xl font-bold text-blue-700 mt-1">{stats.todayAppointments}</p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl">
                    <p className="text-emerald-600 text-sm font-semibold">Completed</p>
                    <p className="text-3xl font-bold text-emerald-700 mt-1">{stats.completedToday}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl">
                    <p className="text-orange-600 text-sm font-semibold">Pending</p>
                    <p className="text-3xl font-bold text-orange-700 mt-1">{stats.todayAppointments - stats.completedToday}</p>
                  </div>
                </div>

                {/* Appointments List */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Today's Schedule</h3>
                  <div className="space-y-3">
                    {todayAppointments.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 rounded-xl">
                        <FiCalendar className="mx-auto text-4xl text-slate-300 mb-3" />
                        <p className="text-slate-500">No appointments scheduled for today</p>
                      </div>
                    ) : (
                      todayAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#137fec] to-purple-500 flex items-center justify-center text-white font-bold">
                              {apt.patient?.user?.firstName?.[0]}{apt.patient?.user?.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {apt.patient?.user?.firstName} {apt.patient?.user?.lastName}
                              </p>
                              <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                                <FiClock className="text-[#137fec]" />
                                {apt.appointmentTime} • Dr. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={getStatusBadge(apt.status)}>{apt.status}</span>
                            <button className="p-2 hover:bg-white rounded-lg transition-colors">
                              <FiActivity className="text-slate-600" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : activeSection === 'staff' ? (
            /* Staff & Doctors View */
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                      <FiUserCheck className="mr-2 text-[#137fec]" />
                      Staff & Doctors Management
                    </h2>
                    <p className="text-slate-500 mt-1">Manage hospital staff and doctors</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveSection('dashboard')}
                      className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                    >
                      Back to Dashboard
                    </button>
                    <button
                      onClick={() => setShowAddStaffModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#137fec] to-[#0d5fb8] text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-[#137fec]/30 transition-all"
                    >
                      <FiPlus className="text-sm" />
                      Add Staff Member
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-blue-600 text-sm font-semibold">Total Doctors</p>
                    <p className="text-3xl font-bold text-blue-700 mt-1">{doctors.length}</p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl">
                    <p className="text-emerald-600 text-sm font-semibold">Active Today</p>
                    <p className="text-3xl font-bold text-emerald-700 mt-1">{doctors.length}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl">
                    <p className="text-orange-600 text-sm font-semibold">On Leave</p>
                    <p className="text-3xl font-bold text-orange-700 mt-1">0</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <p className="text-purple-600 text-sm font-semibold">Departments</p>
                    <p className="text-3xl font-bold text-purple-700 mt-1">6</p>
                  </div>
                </div>

                {/* Doctors Grid */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Medical Staff</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {doctors.map((doctor) => (
                      <div key={doctor.id} className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-[#137fec]/30 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#137fec] to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                              {doctor.user.firstName[0]}{doctor.user.lastName[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">Dr. {doctor.user.firstName} {doctor.user.lastName}</p>
                              <p className="text-xs text-slate-500">{doctor.specialization}</p>
                            </div>
                          </div>
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">Active</span>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <FiCalendar className="text-[#137fec]" />
                            <span>Available Today</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <FiUsers className="text-[#137fec]" />
                            <span>{Math.floor(Math.random() * 10) + 5} Patients Today</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedDoctor(doctor);
                              setShowDoctorProfileModal(true);
                            }}
                            className="flex-1 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => setShowAddAppointmentModal(true)}
                            className="flex-1 py-2 bg-[#137fec] text-white rounded-lg hover:bg-[#0d5fb8] transition-colors text-sm font-medium"
                          >
                            Schedule
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : activeSection === 'pharmacy' ? (
            /* Pharmacy & Lab View */
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                      <FiPackage className="mr-2 text-[#137fec]" />
                      Pharmacy & Lab Management
                    </h2>
                    <p className="text-slate-500 mt-1">Manage medicine inventory and lab supplies</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveSection('dashboard')}
                      className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                    >
                      Back to Dashboard
                    </button>
                    <button
                      onClick={() => setShowAddMedicineModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#137fec] to-[#0d5fb8] text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-[#137fec]/30 transition-all"
                    >
                      <FiPlus className="text-sm" />
                      Add Medicine
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-blue-600 text-sm font-semibold">Total Medicines</p>
                    <p className="text-3xl font-bold text-blue-700 mt-1">245</p>
                  </div>
                  <div className="bg-rose-50 p-4 rounded-xl">
                    <p className="text-rose-600 text-sm font-semibold">Low Stock Items</p>
                    <p className="text-3xl font-bold text-rose-700 mt-1">{stats.lowStockMedicines}</p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl">
                    <p className="text-emerald-600 text-sm font-semibold">In Stock</p>
                    <p className="text-3xl font-bold text-emerald-700 mt-1">{245 - stats.lowStockMedicines}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <p className="text-purple-600 text-sm font-semibold">Categories</p>
                    <p className="text-3xl font-bold text-purple-700 mt-1">12</p>
                  </div>
                </div>

                {/* Low Stock Alert */}
                {lowStockItems.length > 0 && (
                  <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <FiAlertCircle className="text-rose-600 text-xl" />
                      <h3 className="font-bold text-rose-900">Low Stock Alert</h3>
                    </div>
                    <p className="text-sm text-rose-700">{lowStockItems.length} items are running low on stock and need immediate attention.</p>
                  </div>
                )}

                {/* Medicines Table */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Medicine Inventory</h3>
                  {lowStockItems.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl">
                      <FiPackage className="mx-auto text-4xl text-slate-300 mb-3" />
                      <p className="text-slate-500">All medicines are well stocked</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                      <table className="min-w-full">
                        <thead className="bg-slate-50">
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-4 px-6 text-slate-700 font-bold text-sm">Medicine Name</th>
                            <th className="text-left py-4 px-6 text-slate-700 font-bold text-sm">Category</th>
                            <th className="text-left py-4 px-6 text-slate-700 font-bold text-sm">Current Stock</th>
                            <th className="text-left py-4 px-6 text-slate-700 font-bold text-sm">Min Stock</th>
                            <th className="text-left py-4 px-6 text-slate-700 font-bold text-sm">Status</th>
                            <th className="text-left py-4 px-6 text-slate-700 font-bold text-sm">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lowStockItems.map((medicine) => (
                            <tr key={medicine.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className="py-4 px-6">
                                <p className="font-bold text-slate-900">{medicine.name}</p>
                              </td>
                              <td className="py-4 px-6 text-slate-600">{medicine.category}</td>
                              <td className="py-4 px-6">
                                <span className="bg-rose-100 text-rose-800 px-3 py-1.5 rounded-full text-sm font-bold">
                                  {medicine.stock} units
                                </span>
                              </td>
                              <td className="py-4 px-6 text-slate-600">{medicine.minStock} units</td>
                              <td className="py-4 px-6">
                                <span className="flex items-center gap-1 text-rose-600 text-sm font-semibold">
                                  <FiAlertCircle className="text-xs" />
                                  Critical
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <button className="bg-[#137fec] text-white px-4 py-2 rounded-lg hover:bg-[#0d5fb8] text-sm font-bold transition-colors">
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
            </div>
          ) : activeSection === 'billing' ? (
            /* Billing View */
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                      <FiDollarSign className="mr-2 text-[#137fec]" />
                      Billing Management
                    </h2>
                    <p className="text-slate-500 mt-1">Track payments and financial transactions</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveSection('dashboard')}
                      className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                    >
                      Back to Dashboard
                    </button>
                    <button
                      onClick={() => setShowInvoiceModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#137fec] to-[#0d5fb8] text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-[#137fec]/30 transition-all"
                    >
                      <FiPlus className="text-sm" />
                      Generate Invoice
                    </button>
                  </div>
                </div>

                {/* Revenue Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-emerald-50 p-4 rounded-xl">
                    <p className="text-emerald-600 text-sm font-semibold">Today's Revenue</p>
                    <p className="text-3xl font-bold text-emerald-700 mt-1">${(stats.completedToday * 150).toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-blue-600 text-sm font-semibold">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-blue-700 mt-1">${(stats.completedToday * 1500).toLocaleString()}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl">
                    <p className="text-orange-600 text-sm font-semibold">Pending Payments</p>
                    <p className="text-3xl font-bold text-orange-700 mt-1">$2,450</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <p className="text-purple-600 text-sm font-semibold">Total Invoices</p>
                    <p className="text-3xl font-bold text-purple-700 mt-1">{stats.completedToday + 15}</p>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Transactions</h3>
                  <div className="space-y-3">
                    {[
                      { id: 1, patient: 'John Doe', amount: 450, status: 'paid', date: 'Today, 10:30 AM', type: 'Consultation' },
                      { id: 2, patient: 'Jane Smith', amount: 1200, status: 'paid', date: 'Today, 09:15 AM', type: 'Surgery' },
                      { id: 3, patient: 'Mike Johnson', amount: 350, status: 'pending', date: 'Yesterday, 4:20 PM', type: 'Lab Tests' },
                      { id: 4, patient: 'Sarah Williams', amount: 800, status: 'paid', date: 'Yesterday, 2:10 PM', type: 'X-Ray' },
                    ].map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                            <FiDollarSign className="text-xl" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{transaction.patient}</p>
                            <p className="text-sm text-slate-600">{transaction.type} • {transaction.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-lg font-bold text-slate-900">${transaction.amount}</p>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${transaction.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-orange-100 text-orange-700'
                            }`}>
                            {transaction.status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                          <button className="p-2 hover:bg-white rounded-lg transition-colors">
                            <FiActivity className="text-slate-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </main>
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

      {/* User Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6 text-center border-b border-slate-100">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#137fec] to-purple-500 mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4 ring-4 ring-slate-50">
                SJ
              </div>
              <h2 className="text-xl font-bold text-slate-900">Sarah Jenkins</h2>
              <p className="text-slate-500">Hospital Director</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <FiClock />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Last Login</p>
                  <p className="text-slate-900 font-medium">Today, 09:15 AM</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Contact Information</p>
                <div className="grid grid-cols-1 gap-2 text-sm text-slate-600">
                  <p>📧 admin@hospital.com</p>
                  <p>📱 +1 (555) 123-4567</p>
                  <p>📍 Room 101, Admin Block</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Modal */}
      {showActivityLogModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FiActivity className="text-[#137fec]" />
                Recent Activity
              </h2>
              <button onClick={() => setShowActivityLogModal(false)} className="text-slate-400 hover:text-slate-600">
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="p-0 max-h-96 overflow-y-auto">
              {[
                { action: 'Updated patient record', detail: 'John Doe (MRN-123)', time: '10 mins ago', icon: FiUsers, color: 'text-blue-500', bg: 'bg-blue-50' },
                { action: 'Approved leave request', detail: 'Dr. Emily Chen', time: '2 hours ago', icon: FiCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { action: 'System Backup', detail: 'Daily automated backup', time: '5 hours ago', icon: FiPackage, color: 'text-purple-500', bg: 'bg-purple-50' },
                { action: 'Login Detected', detail: 'New device (Chrome/Win10)', time: 'Yesterday', icon: FiAlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
              ].map((log, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <div className={`w-10 h-10 rounded-full ${log.bg} ${log.color} flex items-center justify-center flex-shrink-0`}>
                    <log.icon />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{log.action}</p>
                    <p className="text-xs text-slate-500">{log.detail}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <button className="w-full text-center text-sm font-bold text-[#137fec] hover:underline">
                View Full History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FiFileText className="text-[#137fec]" />
                System Settings
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Email Notifications</p>
                  <p className="text-xs text-slate-500">Receive daily summary emails</p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle" id="toggle1" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-[#137fec]" defaultChecked />
                  <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-200 cursor-pointer checked:bg-[#137fec]"></label>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Dark Mode</p>
                  <p className="text-xs text-slate-500">Switch to dark theme</p>
                </div>
                <button className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">Beta</button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Two-Factor Auth</p>
                  <p className="text-xs text-slate-500">Secure your account</p>
                </div>
                <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded">Enabled</span>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  toast.success('Settings saved successfully');
                  setShowSettingsModal(false);
                }}
                className="flex-1 py-2.5 bg-[#137fec] text-white font-bold rounded-xl hover:bg-[#0d5fb8] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Add New Staff Member</h2>
              <button onClick={() => setShowAddStaffModal(false)} className="text-slate-400 hover:text-slate-600">
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                  <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                  <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input type="email" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none" placeholder="john.doe@hospital.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none">
                    <option>Doctor</option>
                    <option>Nurse</option>
                    <option>Receptionist</option>
                    <option>Pharmacist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none">
                    <option>Cardiology</option>
                    <option>Neurology</option>
                    <option>Pediatrics</option>
                    <option>Orthopedics</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowAddStaffModal(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
              <button onClick={() => { toast.success('Staff invitation sent successfully'); setShowAddStaffModal(false); }} className="px-5 py-2.5 bg-[#137fec] text-white font-bold rounded-xl hover:bg-[#0d5fb8] transition-colors">Send Invitation</button>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Profile Modal */}
      {showDoctorProfileModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="relative h-32 bg-gradient-to-r from-[#137fec] to-purple-500">
              <button
                onClick={() => setShowDoctorProfileModal(false)}
                className="absolute top-4 right-4 p-2 bg-black/20 text-white rounded-full hover:bg-black/40 transition-colors"
              >
                <FiX />
              </button>
            </div>
            <div className="px-6 -mt-12 text-center">
              <div className="w-24 h-24 rounded-2xl bg-white p-1 mx-auto shadow-lg">
                <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-4xl font-bold text-slate-400">
                  {selectedDoctor.user.firstName[0]}{selectedDoctor.user.lastName[0]}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mt-3">Dr. {selectedDoctor.user.firstName} {selectedDoctor.user.lastName}</h2>
              <p className="text-[#137fec] font-medium">{selectedDoctor.specialization}</p>

              <div className="flex justify-center gap-6 my-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">15</p>
                  <p className="text-xs text-slate-500 uppercase font-bold">Years Exp.</p>
                </div>
                <div className="w-[1px] bg-slate-200"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">4.9</p>
                  <p className="text-xs text-slate-500 uppercase font-bold">Rating</p>
                </div>
                <div className="w-[1px] bg-slate-200"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">1.2k</p>
                  <p className="text-xs text-slate-500 uppercase font-bold">Patients</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-left">
                  <FiClock className="text-[#137fec]" />
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Working Hours</p>
                    <p className="text-sm font-medium">Mon - Fri • 09:00 AM - 05:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-left">
                  <FiAlertCircle className="text-orange-500" />
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Department</p>
                    <p className="text-sm font-medium">Cardiology Unit (Floor 3)</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => {
                    setShowDoctorProfileModal(false);
                    setShowAddAppointmentModal(true);
                  }}
                  className="flex-1 py-3 bg-[#137fec] text-white font-bold rounded-xl hover:bg-[#0d5fb8] transition-colors"
                >
                  Book Appointment
                </button>
                <button className="px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FiDollarSign className="text-[#137fec]" />
                Generate New Invoice
              </h2>
              <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 hover:text-slate-600">
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name</label>
                <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none" placeholder="Search patient..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none">
                    <option>Consultation</option>
                    <option>Lab Test</option>
                    <option>Surgery</option>
                    <option>Pharmacy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                  <input type="number" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#137fec] outline-none h-24" placeholder="Enter invoice details..."></textarea>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="emailInvoice" className="w-4 h-4 text-[#137fec] rounded focus:ring-[#137fec] border-gray-300" />
                <label htmlFor="emailInvoice" className="text-sm text-slate-600">Send invoice via email automatically</label>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowInvoiceModal(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
              <button onClick={() => { toast.success('Invoice generated successfully'); setShowInvoiceModal(false); }} className="px-5 py-2.5 bg-[#137fec] text-white font-bold rounded-xl hover:bg-[#0d5fb8] transition-colors">Create Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
