import NewPatientForm from '@/components/patient/NewPatientForm';

export default function NewPatientPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Register New Patient</h1>
        <p className="text-slate-500">Enter basic patient details to start a new clinical case.</p>
      </div>
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <NewPatientForm />
      </div>
    </div>
  );
}
