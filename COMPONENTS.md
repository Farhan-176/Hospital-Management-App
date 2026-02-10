# Components Documentation

## DataTable Component

A reusable, feature-rich data table component with search, sort, and pagination capabilities.

### Features
- **Search**: Real-time filtering across all columns
- **Sort**: Click column headers to sort ascending/descending
- **Pagination**: Navigate through large datasets
- **Responsive**: Mobile-friendly design
- **Customizable**: Flexible column rendering

### Usage

```javascript
import DataTable from '../components/DataTable';

const columns = [
  {
    key: 'id',
    label: 'ID',
    accessor: (row) => row.id
  },
  {
    key: 'name',
    label: 'Name',
    accessor: (row) => `${row.firstName} ${row.lastName}`
  },
  {
    key: 'status',
    label: 'Status',
    render: (row) => (
      <span className={`px-3 py-1 rounded-full text-xs ${getStatusClass(row.status)}`}>
        {row.status}
      </span>
    )
  }
];

<DataTable
  data={patients}
  columns={columns}
  searchable={true}
  sortable={true}
  pagination={true}
  itemsPerPage={10}
  onRowClick={(row) => console.log('Clicked:', row)}
  emptyMessage="No data available"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | Array | [] | Array of data objects to display |
| columns | Array | [] | Column definitions (see below) |
| searchable | Boolean | true | Enable search functionality |
| sortable | Boolean | true | Enable column sorting |
| pagination | Boolean | true | Enable pagination |
| itemsPerPage | Number | 10 | Rows per page |
| onRowClick | Function | null | Callback when row is clicked |
| emptyMessage | String | "No data available" | Message when no data |

### Column Definition

```javascript
{
  key: 'fieldName',        // Unique identifier for sorting
  label: 'Display Name',   // Column header text
  sortable: true,          // Optional: disable sort for this column
  accessor: (row) => {},   // Optional: custom data accessor
  render: (row) => {}      // Optional: custom cell renderer
}
```

---

## Modal Component

A flexible modal dialog component with customizable size and footer.

### Features
- **ESC key to close**
- **Click outside to close** (configurable)
- **Body scroll lock** when open
- **Multiple sizes** (sm, md, lg, xl, full)
- **Custom footer** with action buttons

### Usage

```javascript
import Modal from '../components/Modal';

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Modal Title"
  size="md"
  footer={
    <>
      <button onClick={handleCancel}>Cancel</button>
      <button onClick={handleSave}>Save</button>
    </>
  }
>
  <p>Modal content goes here...</p>
</Modal>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| isOpen | Boolean | required | Controls modal visibility |
| onClose | Function | required | Called when modal should close |
| title | String | required | Modal header title |
| children | ReactNode | required | Modal content |
| size | String | 'md' | Modal size: sm, md, lg, xl, full |
| footer | ReactNode | null | Custom footer content |
| closeOnOverlayClick | Boolean | true | Close when clicking outside |

---

## CRUD Modals

### AddPatientModal

Register new patients with comprehensive medical information.

**Features:**
- Personal information (name, email, phone, DOB, gender, address)
- Medical information (blood group, allergies, chronic conditions)
- Emergency contact details
- Insurance information

```javascript
import AddPatientModal from '../components/modals/AddPatientModal';

<AddPatientModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    fetchPatients();
    toast.success('Patient registered!');
  }}
/>
```

---

### AddAppointmentModal

Schedule appointments with doctors.

**Features:**
- Patient selection dropdown
- Doctor selection with specialization
- Date picker (today onwards)
- Time slot selection (9 AM - 5:30 PM)
- Reason for visit
- Symptoms list
- Additional notes

```javascript
import AddAppointmentModal from '../components/modals/AddAppointmentModal';

<AddAppointmentModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={fetchAppointments}
  doctors={doctorsList}
  preselectedPatient={patient} // Optional
/>
```

---

### AddPrescriptionModal

Create prescriptions for patients.

**Features:**
- Diagnosis input
- Multiple medications with dosage, frequency, duration
- Lab tests recommendations
- Follow-up date
- Additional notes

```javascript
import AddPrescriptionModal from '../components/modals/AddPrescriptionModal';

<AddPrescriptionModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={fetchPrescriptions}
  patientId={patient.id}
  doctorId={doctor.id}
  appointmentId={appointment.id} // Optional
/>
```

---

### AddMedicineModal

Add medicines to inventory.

**Features:**
- Medicine name, type, manufacturer
- Batch number, expiry date
- Stock quantity, unit price
- Description, side effects
- Storage conditions
- Prescription requirement flag

```javascript
import AddMedicineModal from '../components/modals/AddMedicineModal';

<AddMedicineModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={fetchMedicines}
/>
```

---

## Integration Example

Complete example integrating DataTable and Modals:

```javascript
import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import AddPatientModal from '../components/modals/AddPatientModal';
import { patientService } from '../services/patientService';
import { FiPlus } from 'react-icons/fi';

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const response = await patientService.getAllPatients();
    setPatients(response.data);
  };

  const columns = [
    {
      key: 'mrn',
      label: 'MRN',
      accessor: (row) => row.medicalRecordNumber
    },
    {
      key: 'name',
      label: 'Patient Name',
      accessor: (row) => `${row.user?.firstName} ${row.user?.lastName}`
    },
    {
      key: 'bloodGroup',
      label: 'Blood Group',
      render: (row) => (
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
          {row.bloodGroup || 'N/A'}
        </span>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patients</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center"
        >
          <FiPlus className="mr-2" />
          Add Patient
        </button>
      </div>

      <DataTable
        data={patients}
        columns={columns}
        onRowClick={(patient) => console.log('View:', patient)}
      />

      <AddPatientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchPatients}
      />
    </div>
  );
};

export default PatientsPage;
```

---

## Styling

All components use Tailwind CSS with a consistent design system:

**Colors:**
- Primary: Purple (purple-600)
- Success: Green (green-600)
- Warning: Yellow (yellow-600)
- Danger: Red (red-600)
- Info: Blue (blue-600)

**Spacing:**
- Cards: rounded-2xl with shadow-lg
- Inputs: rounded-lg with border-2
- Buttons: rounded-lg with hover effects
- Modal: rounded-2xl with shadow-2xl

**Transitions:**
- All interactive elements have smooth transitions
- Hover states for better UX
- Focus states for accessibility
