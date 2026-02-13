import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FiClock, FiSearch, FiActivity, FiBriefcase, FiHeart, FiDroplet,
    FiThermometer, FiDownload, FiEye, FiPlus, FiPrinter, FiCheckCircle, FiSave,
    FiUser, FiFileText, FiAlertCircle, FiShare2, FiMoreHorizontal,
    FiX, FiCheck, FiArrowLeft, FiLayers
} from 'react-icons/fi';
import { appointmentService } from '../../services/appointmentService';
import { prescriptionService } from '../../services/prescriptionService';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const ConsultationWorkspace = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [prescriptions, setPrescriptions] = useState([]);
    const [medicationSearch, setMedicationSearch] = useState('');
    const [labOrders, setLabOrders] = useState(['Complete Blood Count', 'Thyroid Profile']);

    useEffect(() => {
        fetchAppointmentDetails();
    }, [appointmentId]);

    const fetchAppointmentDetails = async () => {
        try {
            const res = await appointmentService.getAppointmentById(appointmentId);
            setAppointment(res.data);
            setNotes(res.data.clinicalNotes || '');
        } catch (error) {
            console.error('Error fetching appointment:', error);
            toast.error('Failed to load appointment details');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalize = async () => {
        try {
            await appointmentService.updateAppointment(appointmentId, {
                status: 'completed',
                clinicalNotes: notes,
                checkOutTime: new Date().toISOString(),
            });
            toast.success('Consultation finalized');
            navigate('/doctor/dashboard');
        } catch (error) {
            toast.error('Failed to finalize');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#137fec]"></div>
            </div>
        );
    }

    const patient = appointment?.patient;
    const patientUser = patient?.user;

    return (
        <div className="bg-[#f8fafc] min-h-screen font-sans flex flex-col overflow-hidden text-slate-900">
            <Navbar />

            {/* Sticky Patient Summary Strip */}
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/doctor/dashboard')}
                        className="w-10 h-10 rounded-2xl hover:bg-slate-50 flex items-center justify-center transition-colors text-slate-400 border border-slate-200"
                    >
                        <FiArrowLeft />
                    </button>
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl border-2 border-slate-100 p-0.5">
                            <img className="w-full h-full object-cover rounded-[0.9rem]" src={`https://ui-avatars.com/api/?name=${patientUser?.firstName}+${patientUser?.lastName}&background=137fec&color=fff`} alt="Patient" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">{patientUser?.firstName} {patientUser?.lastName}</h2>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><FiUser className="text-blue-500" /> {patientUser?.gender}, 42 Years</span>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><FiLayers className="text-blue-500" /> MRN: {patient?.medicalRecordNumber}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-2xl border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest">
                        <FiAlertCircle /> Allergy: Penicillin
                    </div>
                    <div className="h-10 w-[1px] bg-slate-200 mx-2"></div>
                    <button onClick={handleFinalize} className="px-6 py-3 bg-[#137fec] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#137fec]/20 hover:scale-105 transition-all active:scale-95">
                        Finish Session
                    </button>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto p-8 lg:p-12">
                <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8 items-start">

                    {/* Left Side: Vitals & Notes */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">

                        {/* High-Contrast Vitals Summary */}
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: 'Heart Rate', value: '72', unit: 'BPM', icon: FiHeart, color: 'text-rose-500', bg: 'bg-rose-50' },
                                { label: 'BP', value: '138/88', unit: 'mmHg', icon: FiActivity, color: 'text-blue-500', bg: 'bg-blue-50' },
                                { label: 'O2 SAT', value: '98', unit: '%', icon: FiDroplet, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                { label: 'Body Temp', value: '36.8', unit: '°C', icon: FiThermometer, color: 'text-amber-500', bg: 'bg-amber-50' },
                            ].map((v, i) => (
                                <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center">
                                    <v.icon className={`${v.color} mb-3`} size={20} />
                                    <p className="text-2xl font-black text-slate-800 leading-none">{v.value}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{v.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Main Interaction Card */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Clinical Assessment</h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-2">
                                        <FiFileText className="text-blue-500" /> Interaction v8.4.2
                                    </p>
                                </div>
                                <button className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-white hover:text-blue-600 transition-all">
                                    Load Template
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Reason for Encounter</label>
                                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 font-bold text-slate-700">
                                        {appointment?.reason || 'Hypertension Routine Follow-up'}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Observations & Findings</label>
                                    <textarea
                                        className="w-full bg-slate-50/30 border border-slate-100 rounded-[2rem] p-8 text-sm text-slate-700 placeholder-slate-300 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none leading-relaxed min-h-[350px] font-medium"
                                        placeholder="Type your clinical findings, physical exam results, and diagnosis here..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Orders & Prescriptions */}
                    <div className="col-span-12 lg:col-span-4 space-y-8 sticky top-32">

                        {/* Prescription Section */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                                <FiPlus className="p-1 bg-blue-500 text-white rounded-lg" size={24} /> Rx Prescriptions
                            </h3>

                            <div className="relative mb-6">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none placeholder-slate-400 font-bold"
                                    placeholder="Add medication..."
                                    type="text"
                                    value={medicationSearch}
                                    onChange={(e) => setMedicationSearch(e.target.value)}
                                />
                                {medicationSearch && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-50">
                                        <div
                                            className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                                            onClick={() => {
                                                setPrescriptions([...prescriptions, { name: medicationSearch, dose: '10mg', freq: 'QD' }]);
                                                setMedicationSearch('');
                                            }}
                                        >
                                            <p className="font-bold text-slate-800">{medicationSearch}</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Prescribe 10mg once daily</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                {prescriptions.map((p, i) => (
                                    <div key={i} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                                        <div>
                                            <p className="font-black text-slate-800 text-sm">{p.name}</p>
                                            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1">{p.dose} • {p.freq}</p>
                                        </div>
                                        <button onClick={() => setPrescriptions(prescriptions.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-rose-500">
                                            <FiX />
                                        </button>
                                    </div>
                                ))}
                                {prescriptions.length === 0 && (
                                    <div className="py-8 text-center bg-slate-50/30 rounded-3xl border border-dashed border-slate-200">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No meds added yet</p>
                                    </div>
                                )}
                            </div>

                            <button className="w-full mt-6 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                                <FiPrinter /> Review & Print RX
                            </button>
                        </div>

                        {/* Laboratory Section */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                            <h3 className="text-xl font-black mb-4 flex items-center gap-3">
                                <FiLayers className="text-blue-500" /> Lab Orders
                            </h3>
                            <div className="space-y-3 relative z-10">
                                {labOrders.map((lab, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                        <span className="text-sm font-bold">{lab}</span>
                                        <FiX className="text-white/20 hover:text-white cursor-pointer" onClick={() => setLabOrders(labOrders.filter((_, idx) => idx !== i))} />
                                    </div>
                                ))}
                                <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    Request New Test
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default ConsultationWorkspace;
