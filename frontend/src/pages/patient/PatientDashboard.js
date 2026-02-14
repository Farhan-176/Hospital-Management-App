import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { prescriptionService } from '../../services/prescriptionService';
import { staffService } from '../../services/staffService';
import { toast } from 'react-toastify';
import { FiCalendar, FiFileText, FiClock, FiActivity, FiHeart, FiTrendingUp, FiCheckCircle, FiAlertCircle, FiUser, FiInfo } from 'react-icons/fi';
import AddAppointmentModal from '../../components/modals/AddAppointmentModal';
import Modal from '../../components/Modal';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

  useEffect(() => {
    if (user?.patientProfile?.id) {
      fetchPatientData();
      fetchDoctors();
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

  const fetchDoctors = async () => {
    try {
      const response = await staffService.getAllDoctors();
      setDoctors(response.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentService.cancelAppointment(id, 'Patient cancelled from dashboard');
        toast.success('Appointment cancelled successfully');
        fetchPatientData();
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        toast.error('Failed to cancel appointment');
      }
    }
  };

  const handleViewPrescription = (rx) => {
    setSelectedPrescription(rx);
    setIsPrescriptionModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'in-progress': 'bg-amber-100 text-amber-700 border-amber-200',
      completed: 'bg-slate-100 text-slate-700 border-slate-200',
      cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
    };
    return `px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badges[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`;
  };

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'scheduled' || a.status === 'confirmed'
  );
  const nextAppointment = upcomingAppointments[0];
  const pastAppointments = appointments.filter((a) => a.status === 'completed');
  const totalVisits = pastAppointments.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading your health portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Section */}
        <div className="relative mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 lg:text-5xl">
                Welcome back, <span className="text-primary-600">{user?.firstName}</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl">
                {nextAppointment ? (
                  <>Your next check-up with <span className="text-slate-900 font-semibold">Dr. {nextAppointment.doctor?.user?.firstName} {nextAppointment.doctor?.user?.lastName}</span> is on {new Date(nextAppointment.appointmentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.</>
                ) : (
                  "You have no upcoming appointments scheduled. Stay on top of your health!"
                )}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsAppModalOpen(true)}
                className="inline-flex items-center px-6 py-3.5 bg-primary-600 text-white font-bold rounded-2xl shadow-xl shadow-primary-600/20 hover:bg-primary-700 hover:-translate-y-0.5 transition-all duration-200"
              >
                <FiCalendar className="mr-2.5 text-xl" />
                Book Appointment
              </button>
              <button
                onClick={() => toast.info('Medical records feature coming soon!')}
                className="inline-flex items-center px-6 py-3.5 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all"
              >
                <FiFileText className="mr-2.5 text-xl text-primary-600" />
                Medical Records
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-8 space-y-10">

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Upcoming', value: upcomingAppointments.length, color: 'blue', icon: FiCalendar },
                { label: 'Total Visits', value: totalVisits, color: 'emerald', icon: FiActivity },
                { label: 'Prescriptions', value: prescriptions.length, color: 'purple', icon: FiFileText },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                  <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`text-2xl text-${stat.color}-600`} />
                  </div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Upcoming Visits Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Upcoming Visits</h2>
                <button
                  onClick={() => toast.info('Full schedule view coming soon!')}
                  className="text-sm font-bold text-primary-600 hover:text-primary-700 px-4 py-2 bg-primary-50 rounded-xl transition-colors"
                >
                  View Schedule
                </button>
              </div>

              {upcomingAppointments.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCalendar className="text-3xl text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">No scheduled appointments</h3>
                  <p className="text-slate-500 mt-1">Book a session with our specialists to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((app) => (
                    <div key={app.id} className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col md:flex-row">
                      <div className="md:w-40 bg-slate-50 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-100">
                        <span className="text-primary-600 text-xs font-black uppercase tracking-widest">
                          {new Date(app.appointmentDate).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-4xl font-black text-slate-900 my-1">
                          {new Date(app.appointmentDate).getDate()}
                        </span>
                        <span className="text-slate-500 text-sm font-medium">{app.appointmentTime || '10:30 AM'}</span>
                      </div>
                      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={getStatusBadge(app.status)}>{app.status}</span>
                              <span className="text-xs font-medium text-slate-400">#{app.appointmentNumber}</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{app.reason || 'General Consultation'}</h3>
                            <div className="mt-2 space-y-1">
                              <p className="flex items-center text-slate-600 font-medium">
                                <FiUser className="mr-2 text-primary-600" />
                                Dr. {app.doctor?.user?.firstName} {app.doctor?.user?.lastName}
                              </p>
                              <p className="flex items-center text-slate-500 text-sm">
                                <span className="w-1 h-1 bg-slate-300 rounded-full mr-2"></span>
                                {app.doctor?.specialization} • Main Campus, Wing B
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCancelAppointment(app.id)}
                              className="p-3 text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors tooltip"
                              title="Cancel"
                            >
                              <FiAlertCircle />
                            </button>
                            <button
                              onClick={() => toast.info('Please contact support to reschedule.')}
                              className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-md active:scale-95"
                            >
                              Reschedule
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Prescriptions Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Recent Prescriptions</h2>
                <button
                  onClick={() => toast.info('Pharmacy history coming soon!')}
                  className="text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors"
                >
                  Pharmacy History
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prescriptions.length === 0 ? (
                  <div className="col-span-2 py-10 text-center text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-3xl">
                    No active prescriptions found.
                  </div>
                ) : (
                  prescriptions.slice(0, 4).map((rx) => (
                    <div key={rx.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-primary-200 transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <FiFileText className="text-xl" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {new Date(rx.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 truncate">
                        {rx.diagnosis || "Medical Assessment"}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">Dr. {rx.doctor?.user?.lastName}</p>

                      <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
                          {rx.medications?.length || 0} Medications
                        </span>
                        <button
                          onClick={() => handleViewPrescription(rx)}
                          className="text-primary-600 text-sm font-bold hover:underline flex items-center gap-1"
                        >
                          View Details <FiTrendingUp className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            {/* Quick Profile Card */}
            <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary-600/20 relative overflow-hidden">
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full border-4 border-white/20 p-1 mb-4">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-primary-600 text-3xl font-black">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                </div>
                <h3 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h3>
                <p className="text-primary-100 text-sm font-medium mt-1">Patient ID: #{user?.patientProfile?.medicalRecordNumber}</p>

                <div className="grid grid-cols-2 gap-4 w-full mt-8">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                    <p className="text-xs text-primary-200 uppercase font-black tracking-tighter">Blood Group</p>
                    <p className="text-xl font-bold mt-1">{user?.patientProfile?.bloodGroup || 'N/A'}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                    <p className="text-xs text-primary-200 uppercase font-black tracking-tighter">Status</p>
                    <p className="text-xl font-bold mt-1">Active</p>
                  </div>
                </div>
              </div>
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
            </div>

            {/* Health Tips / Notifications */}
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <FiActivity className="text-primary-600" />
                  Health Activities
                </h2>
                <span className="bg-primary-50 text-primary-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">3 New</span>
              </div>
              <div className="p-2">
                {[
                  { title: 'Pathology Update', desc: 'Your blood work results from Friday are available.', time: '2h ago', icon: FiFileText, color: 'blue' },
                  { title: 'Check-in Ready', desc: 'Pre-visit forms for Dr. Smith are now open.', time: '5h ago', icon: FiCheckCircle, color: 'emerald' },
                  { title: 'Appointment Remainder', desc: 'Cardiac check-up in 48 hours.', time: '8h ago', icon: FiClock, color: 'amber' },
                ].map((item, i) => (
                  <div key={i} className="p-4 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group" onClick={() => toast.success(item.title)}>
                    <div className="flex gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-${item.color}-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <item.icon className={`text-${item.color}-600`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.desc}</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-black uppercase">{item.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50/50 text-center">
                <button
                  onClick={() => toast.info('Activity history coming soon!')}
                  className="text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors uppercase tracking-widest"
                >
                  View All Activity
                </button>
              </div>
            </section>

            {/* Quick Support Card */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-bold text-lg">Need Assistance?</h4>
                <p className="text-slate-400 text-sm mt-2 mb-6">Our support team and help center are available 24/7 for your medical inquiries.</p>
                <button
                  onClick={() => toast.info('Contacting support line...')}
                  className="w-full py-3 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition-colors active:scale-95"
                >
                  Get Support
                </button>
              </div>
              <FiActivity className="absolute -bottom-6 -right-6 text-9xl text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            </div>

          </div>
        </div>
      </main>

      {/* Modals */}
      <AddAppointmentModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        onSuccess={fetchPatientData}
        doctors={doctors}
        preselectedPatient={user?.patientProfile}
      />

      <Modal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        title="Prescription Details"
        size="md"
      >
        {selectedPrescription && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl">
              <div>
                <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">Diagnosis</p>
                <h4 className="text-xl font-bold text-slate-900">{selectedPrescription.diagnosis}</h4>
              </div>
              <FiFileText className="text-3xl text-purple-600" />
            </div>

            <div className="space-y-4">
              <h5 className="font-bold text-slate-900 flex items-center gap-2">
                <FiInfo className="text-primary-600" />
                Medications
              </h5>
              <div className="space-y-3">
                {selectedPrescription.medications?.map((med, idx) => (
                  <div key={idx} className="p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                    <p className="font-bold text-slate-900">{med.medicineName}</p>
                    <p className="text-sm text-slate-500 mt-1">{med.dosage} • {med.frequency} • {med.duration}</p>
                    {med.instructions && <p className="text-xs text-slate-400 mt-2 italic">Note: {med.instructions}</p>}
                  </div>
                ))}
              </div>
            </div>

            {selectedPrescription.advice && (
              <div className="p-4 bg-slate-50 rounded-2xl">
                <h5 className="font-bold text-xs text-slate-400 uppercase mb-2">Doctor's Advice</h5>
                <p className="text-slate-700 text-sm leading-relaxed">{selectedPrescription.advice}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-100 mt-20 text-center">
        <p className="text-sm text-slate-400 font-medium tracking-tight">
          &copy; {new Date().getFullYear()} Care<span className="text-primary-600 font-bold">Sync</span> Hospital Management. Secure & Encrypted.
        </p>
      </footer>
    </div>
  );
};

export default PatientDashboard;
