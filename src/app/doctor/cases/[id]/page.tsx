import connectToDatabase from '@/lib/db/mongodb';
import Case from '@/models/Case';
import Patient from '@/models/Patient';
import DoctorCaseView from '@/components/doctor/DoctorCaseView';
import { redirect } from 'next/navigation';

export default async function DoctorCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  await connectToDatabase();
  
  const caseRecord = await Case.findById(id).populate('patientId').lean();
  
  if (!caseRecord) {
    redirect('/doctor');
  }

  // Ensure patient is populated
  if (!caseRecord.patientId) {
    return <div>Error loading patient data</div>;
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 h-[calc(100vh-120px)] flex flex-col">
      <DoctorCaseView caseData={JSON.parse(JSON.stringify(caseRecord))} />
    </div>
  );
}
