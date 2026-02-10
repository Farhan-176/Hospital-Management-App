import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { prescriptionService } from '../../services/prescriptionService';
import { medicineService } from '../../services/medicineService';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiFileText, FiPill } from 'react-icons/fi';

const AddPrescriptionModal = ({ isOpen, onClose, onSuccess, patientId, doctorId, appointmentId = null }) => {
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState({
    diagnosis: '',
    medications: [{ medicineId: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    labTests: '',
    additionalNotes: '',
    followUpDate: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchMedicines();
    }
  }, [isOpen]);

  const fetchMedicines = async () => {
    try {
      const response = await medicineService.getAllMedicines();
      setMedicines(response.data || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index][field] = value;
    setFormData({ ...formData, medications: updatedMedications });
  };

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { medicineId: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });
  };

  const removeMedication = (index) => {
    const updatedMedications = formData.medications.filter((_, i) => i !== index);
    setFormData({ ...formData, medications: updatedMedications });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const prescriptionData = {
        patientId,
        doctorId,
        appointmentId,
        diagnosis: formData.diagnosis,
        medications: formData.medications.filter(med => med.medicineId),
        labTests: formData.labTests ? formData.labTests.split(',').map(t => t.trim()) : [],
        additionalNotes: formData.additionalNotes,
        followUpDate: formData.followUpDate || null
      };

      await prescriptionService.createPrescription(prescriptionData);
      toast.success('Prescription created successfully');
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        diagnosis: '',
        medications: [{ medicineId: '', dosage: '', frequency: '', duration: '', instructions: '' }],
        labTests: '',
        additionalNotes: '',
        followUpDate: ''
      });
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error(error.response?.data?.message || 'Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Prescription"
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-prescription-form"
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Prescription'}
          </button>
        </>
      }
    >
      <form id="add-prescription-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Diagnosis */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FiFileText className="inline mr-1" />
            Diagnosis <span className="text-red-500">*</span>
          </label>
          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            required
            rows={2}
            placeholder="Enter diagnosis..."
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Medications */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              <FiPill className="inline mr-1" />
              Medications <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={addMedication}
              className="flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <FiPlus className="mr-1" /> Add Medication
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.medications.map((medication, index) => (
              <div key={index} className="p-4 border-2 border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">Medication {index + 1}</span>
                  {formData.medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedication(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Medicine</label>
                    <select
                      value={medication.medicineId}
                      onChange={(e) => handleMedicationChange(index, 'medicineId', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                    >
                      <option value="">Select Medicine</option>
                      {medicines.map(med => (
                        <option key={med.id} value={med.id}>
                          {med.name} ({med.type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Dosage</label>
                    <input
                      type="text"
                      value={medication.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                      required
                      placeholder="e.g., 500mg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Frequency</label>
                    <input
                      type="text"
                      value={medication.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                      required
                      placeholder="e.g., Twice daily"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                    <input
                      type="text"
                      value={medication.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                      required
                      placeholder="e.g., 7 days"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Instructions</label>
                    <input
                      type="text"
                      value={medication.instructions}
                      onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                      placeholder="e.g., After meals"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lab Tests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lab Tests <span className="text-xs text-gray-500">(comma-separated)</span>
          </label>
          <input
            type="text"
            name="labTests"
            value={formData.labTests}
            onChange={handleChange}
            placeholder="e.g., Blood Test, X-Ray, ECG"
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Follow-up Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Follow-up Date
          </label>
          <input
            type="date"
            name="followUpDate"
            value={formData.followUpDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            rows={3}
            placeholder="Any additional instructions or notes..."
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddPrescriptionModal;
