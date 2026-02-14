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
import { medicineService } from '../../services/medicineService';
import { labTestService } from '../../services/labTestService';
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
    const [availableMedicines, setAvailableMedicines] = useState([]);
    const [labOrders, setLabOrders] = useState([]);
    const [showLabModal, setShowLabModal] = useState(false);
    const [diagnosis, setDiagnosis] = useState('');

    const commonLabTests = [
        { name: 'Complete Blood Count', type: 'Pathology', cost: 450 },
        { name: 'Lipid Profile', type: 'Pathology', cost: 800 },
        { name: 'Thyroid Profile (T3, T4, TSH)', type: 'Pathology', cost: 1200 },
        { name: 'Blood Sugar (F/PP)', type: 'Pathology', cost: 200 },
        { name: 'Liver Function Test', type: 'Pathology', cost: 1500 },
        { name: 'Kidney Function Test', type: 'Pathology', cost: 1200 },
        { name: 'Urine Routine', type: 'Pathology', cost: 150 },
        { name: 'Chest X-Ray', type: 'Radiology', cost: 600 },
        { name: 'ECG', type: 'Cardiology', cost: 500 },
        { name: 'Ultrasound Abdomen', type: 'Radiology', cost: 1800 }
    ];

    useEffect(() => {
        fetchAppointmentDetails();
        fetchMedicines();
    }, [appointmentId]);

    const fetchAppointmentDetails = async () => {
        try {
            const res = await appointmentService.getAppointmentById(appointmentId);
            setAppointment(res.data);
            setNotes(res.data.clinicalNotes || '');
            setDiagnosis(res.data.diagnosis || '');
        } catch (error) {
            console.error('Error fetching appointment:', error);
            toast.error('Failed to load appointment details');
        } finally {
            setLoading(false);
        }
    };

    const fetchMedicines = async () => {
        try {
            const res = await medicineService.getAllMedicines({ limit: 100 });
            setAvailableMedicines(res.data || []);
        } catch (error) {
            console.error('Error fetching medicines:', error);
        }
    };

    const handleFinalize = async () => {
        if (!diagnosis) {
            toast.warning('Please enter a diagnosis before finalizing');
            return;
        }

        try {
            setLoading(true);
            const patientId = appointment.patientId;
            const doctorId = user.doctorProfile.id;

            // 1. Save Prescriptions if any
            if (prescriptions.length > 0) {
                await prescriptionService.createPrescription({
                    appointmentId,
                    patientId,
                    diagnosis,
                    advice: notes,
                    medications: prescriptions.map(p => ({
                        medicineId: p.id,
                        medicineName: p.name,
                        dosage: p.dose,
                        frequency: p.freq,
                        duration: p.duration,
                        quantity: p.qty,
                        instructions: p.instr
                    }))
                });
            }

            // 2. Save Lab Orders if any
            if (labOrders.length > 0) {
                await Promise.all(labOrders.map(lab =>
                    labTestService.createLabTest({
                        appointmentId,
                        patientId,
                        doctorId,
                        testName: lab.name,
                        testType: lab.type,
                        cost: lab.cost,
                        priority: 'routine'
                    })
                ));
            }

            // 3. Finalize Appointment
            await appointmentService.updateAppointment(appointmentId, {
                status: 'completed',
                clinicalNotes: notes,
                diagnosis,
                checkOutTime: new Date().toISOString(),
            });

            toast.success('Consultation finalized successfully');
            navigate('/doctor/dashboard');
        } catch (error) {
            console.error('Finalization error:', error);
            toast.error(error.response?.data?.message || 'Failed to finalize consultation');
        } finally {
            setLoading(false);
        }
    };

    const addMedication = (med) => {
        const newMed = {
            id: med.id,
            name: med.name,
            dose: '1 tab',
            freq: 'Twice daily (1-0-1)',
            duration: '5 days',
            qty: 10,
            instr: 'After meals'
        };
        setPrescriptions([...prescriptions, newMed]);
        setMedicationSearch('');
    };

    const updateMedication = (index, field, value) => {
        const updated = [...prescriptions];
        updated[index][field] = value;
        setPrescriptions(updated);
    };

    if (loading && !appointment) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#137fec]"></div>
            </div>
        );
    }

    const patient = appointment?.patient;
    const patientUser = patient?.user;

    const filteredMeds = medicationSearch
        ? availableMedicines.filter(m => m.name.toLowerCase().includes(medicationSearch.toLowerCase()))
        : [];

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
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><FiUser className="text-blue-500" /> {patientUser?.gender}, {patient?.age || '42'} Years</span>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><FiLayers className="text-blue-500" /> MRN: {patient?.medicalRecordNumber}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-2xl border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest">
                        <FiAlertCircle /> Allergy: {patient?.allergies || 'None Reported'}
                    </div>
                    <div className="h-10 w-[1px] bg-slate-200 mx-2"></div>
                    <button
                        onClick={handleFinalize}
                        disabled={loading}
                        className="px-6 py-3 bg-[#137fec] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#137fec]/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Finalizing...' : 'Finish Session'}
                    </button>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto p-8 lg:p-12">
                <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8 items-start">

                    {/* Left Side: Vitals & Notes */}
                    <div className="col-span-12 lg:col-span-12 xl:col-span-8 space-y-8">

                        {/* High-Contrast Vitals Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Heart Rate', value: appointment?.vitals?.heartRate || '72', unit: 'BPM', icon: FiHeart, color: 'text-rose-500', bg: 'bg-rose-50' },
                                { label: 'BP', value: appointment?.vitals?.bloodPressure || '120/80', unit: 'mmHg', icon: FiActivity, color: 'text-blue-500', bg: 'bg-blue-50' },
                                { label: 'O2 SAT', value: appointment?.vitals?.oxygenSaturation || '98', unit: '%', icon: FiDroplet, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                { label: 'Body Temp', value: appointment?.vitals?.temperature || '36.8', unit: '°C', icon: FiThermometer, color: 'text-amber-500', bg: 'bg-amber-50' },
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
                                        <FiFileText className="text-blue-500" /> Patient Assessment File
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Final Diagnosis</label>
                                    <input
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Enter primary diagnosis..."
                                        value={diagnosis}
                                        onChange={(e) => setDiagnosis(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Clinical Notes & Advice</label>
                                    <textarea
                                        className="w-full bg-slate-50/30 border border-slate-100 rounded-[2rem] p-8 text-sm text-slate-700 placeholder-slate-300 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none leading-relaxed min-h-[300px] font-medium"
                                        placeholder="Type clinical findings, patient history, and general advice..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Prescription Management */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Medications</h3>
                                <div className="relative w-64">
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-xs font-bold outline-none"
                                        placeholder="Search inventory..."
                                        value={medicationSearch}
                                        onChange={(e) => setMedicationSearch(e.target.value)}
                                    />
                                    {filteredMeds.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto">
                                            {filteredMeds.map(m => (
                                                <div
                                                    key={m.id}
                                                    className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50"
                                                    onClick={() => addMedication(m)}
                                                >
                                                    <p className="font-bold text-sm text-slate-800">{m.name}</p>
                                                    <p className="text-[10px] text-slate-400">{m.type} • Stock: {m.stock}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {prescriptions.map((p, i) => (
                                    <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <div className="flex justify-between items-start mb-4">
                                            <p className="font-black text-slate-900">{p.name}</p>
                                            <button onClick={() => setPrescriptions(prescriptions.filter((_, idx) => idx !== i))} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg">
                                                <FiX />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">Dosage</label>
                                                <input className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold" value={p.dose} onChange={(e) => updateMedication(i, 'dose', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">Frequency</label>
                                                <input className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold" value={p.freq} onChange={(e) => updateMedication(i, 'freq', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">Duration</label>
                                                <input className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold" value={p.duration} onChange={(e) => updateMedication(i, 'duration', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {prescriptions.length === 0 && (
                                    <div className="py-12 text-center text-slate-300 font-bold border-2 border-dashed border-slate-100 rounded-[2rem]">
                                        No medications prescribed yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Lab Orders & History */}
                    <div className="col-span-12 lg:col-span-12 xl:col-span-4 space-y-8 sticky top-32">

                        {/* Laboratory Orders */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black flex items-center gap-3">
                                    <FiLayers className="text-blue-500" /> Lab Orders
                                </h3>
                                <button
                                    onClick={() => setShowLabModal(true)}
                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                                >
                                    <FiPlus />
                                </button>
                            </div>

                            <div className="space-y-3 relative z-10">
                                {labOrders.map((lab, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                        <div>
                                            <p className="text-sm font-bold">{lab.name}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{lab.type}</p>
                                        </div>
                                        <FiX className="text-white/20 hover:text-white cursor-pointer" onClick={() => setLabOrders(labOrders.filter((_, idx) => idx !== i))} />
                                    </div>
                                ))}
                                {labOrders.length === 0 && (
                                    <div className="py-6 text-center border border-dashed border-white/10 rounded-xl">
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">No labs ordered</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent History / Patient Stats */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Patient Overview</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-500 uppercase">Last Visit</p>
                                    <p className="font-bold text-slate-900 text-xs">2 Weeks Ago</p>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-500 uppercase">Total Visits</p>
                                    <p className="font-bold text-slate-900 text-xs">12 sessions</p>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-500 uppercase">Main Condition</p>
                                    <p className="font-bold text-slate-900 text-xs text-right">Type 2 Diabetes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Common Lab Tests Selection Modal */}
            {showLabModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLabModal(false)}></div>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg relative z-10 overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-2xl font-black text-slate-800">Select Lab Tests</h3>
                            <button onClick={() => setShowLabModal(false)} className="p-2 hover:bg-slate-50 rounded-xl"><FiX /></button>
                        </div>
                        <div className="p-8 grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                            {commonLabTests.map((test, idx) => {
                                const isSelected = labOrders.some(l => l.name === test.name);
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            if (isSelected) setLabOrders(labOrders.filter(l => l.name !== test.name));
                                            else setLabOrders([...labOrders, test]);
                                        }}
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div>
                                            <p className="font-black text-slate-800">{test.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{test.type} • ${test.cost}</p>
                                        </div>
                                        {isSelected && <FiCheckCircle className="text-blue-500" />}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-8 bg-slate-50 border-t border-slate-100">
                            <button
                                onClick={() => setShowLabModal(false)}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest"
                            >
                                Done ({labOrders.length} Selected)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConsultationWorkspace;
