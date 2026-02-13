import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import AddAppointmentModal from '../../components/modals/AddAppointmentModal';
import { patientService } from '../../services/patientService';
import { appointmentService } from '../../services/appointmentService';
import { staffService } from '../../services/staffService';
import { toast } from 'react-toastify';
import {
  FiUserPlus, FiCalendar, FiSearch, FiActivity, FiClock,
  FiCheckCircle, FiPlus, FiUsers, FiLayers, FiTrendingUp, FiCheck, FiArrowRight
} from 'react-icons/fi';

const ReceptionistDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Data State
  const [stats, setStats] = useState({
    todayRegistrations: 0,
    activeAppointments: 0,
    pendingArrivals: 0,
    doctorsOnDuty: 0,
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [activeQueue, setActiveQueue] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [patientsRes, appointmentsRes, doctorsRes] = await Promise.all([
        patientService.getAllPatients({ limit: 5, page: 1 }),
        appointmentService.getAllAppointments({ date: today }),
        staffService.getAllDoctors()
      ]);

      const appointments = appointmentsRes.data || [];
      setStats({
        todayRegistrations: patientsRes.pagination?.total || 0,
        activeAppointments: appointments.length,
        pendingArrivals: appointments.filter(a => a.status === 'scheduled').length,
        doctorsOnDuty: doctorsRes.data?.length || 0,
      });

      setRecentPatients(patientsRes.data || []);
      setActiveQueue(appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled'));

      const mappedDoctors = (doctorsRes.data || []).map(doctor => ({
        id: doctor.doctorProfile?.id,
        user: { firstName: doctor.firstName, lastName: doctor.lastName },
        specialization: doctor.doctorProfile?.specialization
      }));
      setDoctors(mappedDoctors);
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await appointmentService.updateAppointment(id, { status: 'confirmed', checkInTime: new Date().toISOString() });
      toast.success('Patient arrived');
      fetchData();
    } catch (error) {
      toast.error('Check-in failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fe] text-slate-800 font-sans">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-6 py-8">

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Reception Dashboard</h1>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
            <FiActivity className="text-blue-500" /> Facility: Main Hospital Registry
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Performance Bar (Screenshot Style) */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <FiTrendingUp className="text-purple-500 text-xl" />
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Performance Today</h3>
              </div>

              <div className="flex gap-16">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 leading-none mb-1">{stats.todayRegistrations}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Total Onboardings</p>
                </div>
                <div className="text-center border-l border-slate-100 pl-16">
                  <p className="text-2xl font-bold text-emerald-500 leading-none mb-1">100%</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Accuracy Rate</p>
                </div>
                <div className="text-center border-l border-slate-100 pl-16">
                  <p className="text-2xl font-bold text-purple-600 leading-none mb-1">4 min</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Avg Wait Time</p>
                </div>
                <button
                  onClick={() => { setSelectedPatient(null); setShowAppointmentModal(true); }}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <FiPlus /> New Appointment
                </button>
              </div>
            </div>

            {/* High-Contrast Stat Cards (Screenshot Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Pending Onboarding', value: stats.todayRegistrations, icon: FiClock, status: 'Waiting', color: 'border-blue-500', iconColor: 'text-blue-500', pillBg: 'bg-blue-50', pillText: 'text-blue-600' },
                { label: 'Active Queue', value: stats.activeAppointments, icon: FiActivity, status: 'Active', color: 'border-amber-400', iconColor: 'text-amber-500', pillBg: 'bg-amber-50', pillText: 'text-amber-600' },
                { label: 'Completed Today', value: stats.activeAppointments - stats.pendingArrivals, icon: FiCheckCircle, status: 'Done', color: 'border-emerald-500', iconColor: 'text-emerald-500', pillBg: 'bg-emerald-50', pillText: 'text-emerald-600' },
                { label: 'Doctors On-Duty', value: stats.doctorsOnDuty, icon: FiUsers, status: '100%', color: 'border-purple-500', iconColor: 'text-purple-500', pillBg: 'bg-purple-50', pillText: 'text-purple-600' },
              ].map((stat, i) => (
                <div key={i} className={`bg-white p-6 rounded-xl shadow-sm border-b-4 ${stat.color} flex flex-col justify-between h-40`}>
                  <div className="flex justify-between items-center">
                    <stat.icon size={20} className={stat.iconColor} />
                    <span className={`${stat.pillBg} ${stat.pillText} px-3 py-1 rounded-lg text-[10px] font-bold uppercase`}>{stat.status}</span>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-semibold mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-800 leading-none">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

              {/* Left Side: Recent Patients List */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <FiUsers className="text-blue-500" /> Recent Registrations
                  </h2>
                  <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">Today</span>
                </div>

                <div className="space-y-3">
                  {recentPatients.map(p => {
                    const inQueue = activeQueue.some(a => a.patientId === p.id);
                    return (
                      <div key={p.id} className="p-4 bg-slate-50/50 rounded-xl flex items-center justify-between border-l-4 border-blue-500">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                            {p.user?.firstName?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{p.user?.firstName} {p.user?.lastName}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">MRN: {p.medicalRecordNumber}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {!inQueue ? (
                            <button
                              onClick={() => { setSelectedPatient(p); setShowAppointmentModal(true); }}
                              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                            >
                              Assign <FiArrowRight />
                            </button>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-emerald-100">In Queue</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {recentPatients.length === 0 && (
                    <div className="py-20 text-center">
                      <FiCheck size={40} className="mx-auto text-slate-200 mb-2" />
                      <p className="text-slate-400 font-medium">All caught up!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Arrival Queue (Screenshot Style) */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <FiClock className="text-amber-500" /> Arrival Queue
                  </h2>
                  <span className="bg-amber-50 text-amber-500 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">{activeQueue.length} total</span>
                </div>

                <div className="space-y-4">
                  {activeQueue.filter(a => a.status === 'scheduled' || a.status === 'confirmed').slice(0, 4).map(apt => (
                    <div key={apt.id} className="p-4 bg-slate-50/50 rounded-xl relative border-l-4 border-amber-400">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-red-600 mb-1">{apt.appointmentTime}</p>
                          <p className="font-bold text-slate-800 text-sm">{apt.patient?.user?.firstName} {apt.patient?.user?.lastName}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Consultation</p>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase ${apt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {apt.status}
                        </span>
                      </div>
                      {apt.status === 'scheduled' && (
                        <button
                          onClick={() => handleCheckIn(apt.id)}
                          className="w-full mt-3 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition"
                        >
                          Check In Patient
                        </button>
                      )}
                    </div>
                  ))}
                  {activeQueue.length === 0 && (
                    <div className="py-10 text-center flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center mb-3">
                        <FiCheck className="text-slate-200" size={24} />
                      </div>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No patients in queue</p>
                      <p className="text-slate-300 text-[10px] mt-1 italic">All caught up!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </>
        )}
      </main>

      <AddAppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        onSuccess={fetchData}
        doctors={doctors}
        preselectedPatient={selectedPatient}
      />
    </div>
  );
};

export default ReceptionistDashboard;
