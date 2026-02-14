import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import AddAppointmentModal from '../../components/modals/AddAppointmentModal';
import { patientService } from '../../services/patientService';
import { appointmentService } from '../../services/appointmentService';
import { staffService } from '../../services/staffService';
import { invoiceService } from '../../services/invoiceService';
import { labTestService } from '../../services/labTestService';
import { prescriptionService } from '../../services/prescriptionService';
import { toast } from 'react-toastify';
import {
  FiUserPlus, FiCalendar, FiSearch, FiActivity, FiClock,
  FiCheckCircle, FiPlus, FiUsers, FiLayers, FiTrendingUp, FiCheck, FiArrowRight
} from 'react-icons/fi';

const ReceptionistDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('registry'); // 'registry', 'billing', 'lab', 'pharmacy'

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
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [pendingLabs, setPendingLabs] = useState([]);
  const [activePrescriptions, setActivePrescriptions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [patientsRes, appointmentsRes, doctorsRes, invoicesRes, labsRes, rxRes] = await Promise.all([
        patientService.getAllPatients({ limit: 5, page: 1 }),
        appointmentService.getAllAppointments({ date: today }),
        staffService.getAllDoctors(),
        invoiceService.getAllInvoices({ limit: 5 }),
        labTestService.getAllLabTests({ status: 'ordered' }),
        prescriptionService.getPatientPrescriptions('all').catch(() => ({ data: [] }))
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
      setRecentInvoices(invoicesRes.data || []);
      setPendingLabs(labsRes.data || []);
      setActivePrescriptions(rxRes.data?.filter(r => r.status === 'active') || []);

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

  const handleCollectSample = async (id) => {
    try {
      await labTestService.updateStatus(id, 'sample-collected');
      toast.success('Sample marked as collected');
      fetchData();
    } catch (error) {
      toast.error('Failed to update lab status');
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await invoiceService.processPayment(id, { amount: 0, paymentMethod: 'cash' });
      toast.success('Payment recorded');
      fetchData();
    } catch (error) {
      toast.error('Payment update failed');
    }
  };

  const handleDispense = async (id) => {
    try {
      await prescriptionService.dispensePrescription(id);
      toast.success('Prescription dispensed');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Dispensing failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fe] text-slate-800 font-sans">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-6 py-8">

        {/* Welcome Section */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Reception Dashboard</h1>
            <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
              <FiActivity className="text-blue-500" /> Facility: Main Hospital Registry
            </p>
          </div>

          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
            {['registry', 'billing', 'lab', 'pharmacy'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Performance Bar */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <FiTrendingUp className="text-purple-500 text-xl" />
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Registry Performance</h3>
              </div>

              <div className="flex gap-16">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 leading-none mb-1">{stats.todayRegistrations}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Onboardings</p>
                </div>
                <div className="text-center border-l border-slate-100 pl-16">
                  <p className="text-2xl font-bold text-emerald-500 leading-none mb-1">100%</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Accuracy</p>
                </div>
                <div className="text-center border-l border-slate-100 pl-16">
                  <p className="text-2xl font-bold text-purple-600 leading-none mb-1">4 min</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Wait Time</p>
                </div>
                <button
                  onClick={() => { setSelectedPatient(null); setShowAppointmentModal(true); }}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <FiPlus /> New Appointment
                </button>
              </div>
            </div>

            {activeTab === 'registry' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Left Side: Recent Patients List */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <FiUsers className="text-blue-500" /> Recent Registrations
                    </h2>
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
                  </div>
                </div>

                {/* Right Side: Arrival Queue */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <FiClock className="text-amber-500" /> Arrival Queue
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {activeQueue.filter(a => a.status === 'scheduled' || a.status === 'confirmed').slice(0, 4).map(apt => (
                      <div key={apt.id} className="p-4 bg-slate-50/50 rounded-xl relative border-l-4 border-amber-400">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-bold text-red-600 mb-1">{apt.appointmentTime}</p>
                            <p className="font-bold text-slate-800 text-sm">{apt.patient?.user?.firstName} {apt.patient?.user?.lastName}</p>
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
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                  <h2 className="text-lg font-bold mb-6">Recent Invoices</h2>
                  <div className="space-y-3">
                    {recentInvoices.map(inv => (
                      <div key={inv.id} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-800">{inv.patient?.user?.firstName} {inv.patient?.user?.lastName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{inv.invoiceNumber} • {new Date(inv.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <p className="text-lg font-bold text-slate-900">${inv.totalAmount}</p>
                          {inv.paymentStatus !== 'paid' ? (
                            <button onClick={() => handleMarkPaid(inv.id)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20">Mark Paid</button>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">Paid</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-blue-900 rounded-xl p-6 text-white shadow-xl">
                  <h3 className="text-lg font-bold mb-4">Quick Invoice</h3>
                  <p className="text-blue-200 text-xs mb-6 font-medium leading-relaxed">Create a custom invoice for miscellaneous hospital services or lab tests.</p>
                  <button className="w-full py-4 bg-white text-blue-900 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-white/10 hover:bg-blue-50 transition-all">New Service Invoice</button>
                </div>
              </div>
            )}

            {activeTab === 'lab' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                  <h2 className="text-lg font-bold mb-6">Sample Collection Queue</h2>
                  <div className="space-y-3">
                    {pendingLabs.map(lab => (
                      <div key={lab.id} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-800">{lab.testName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{lab.patient?.user?.firstName} {lab.patient?.user?.lastName} • {lab.priority}</p>
                        </div>
                        <button onClick={() => handleCollectSample(lab.id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Collect Sample</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                  <h2 className="text-lg font-bold mb-6">Recent Lab Results</h2>
                  <div className="py-20 text-center flex flex-col items-center">
                    <FiLayers size={40} className="text-slate-100 mb-4" />
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">All samples at pathology lab</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pharmacy' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                  <h2 className="text-lg font-bold mb-6">Pending Prescriptions</h2>
                  <div className="space-y-4">
                    {activePrescriptions.map(rx => (
                      <div key={rx.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-black text-slate-800">{rx.patient?.user?.firstName} {rx.patient?.user?.lastName}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Diagnosis: {rx.diagnosis || 'General'}</p>
                          </div>
                          <button onClick={() => handleDispense(rx.id)} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-600/20">Dispense Meds</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {rx.medications?.map((m, idx) => (
                            <div key={idx} className="bg-white p-2 rounded-lg text-[10px] border border-slate-200">
                              <span className="font-bold text-slate-800">{m.medicineName}</span> • <span className="text-slate-500">{m.dosage} ({m.frequency})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {activePrescriptions.length === 0 && (
                      <div className="py-20 text-center">
                        <FiCheckCircle size={40} className="mx-auto text-slate-200 mb-2" />
                        <p className="text-slate-400 font-medium">No pending prescriptions</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-purple-900 rounded-xl p-6 text-white shadow-xl">
                  <h3 className="text-lg font-bold mb-4">Inventory Alert</h3>
                  <p className="text-purple-200 text-xs mb-6 font-medium leading-relaxed">Inventory levels are monitored automatically upon dispensing.</p>
                  <button className="w-full py-4 bg-white text-purple-900 rounded-xl font-bold text-xs uppercase tracking-widest">View Stock Status</button>
                </div>
              </div>
            )}
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
