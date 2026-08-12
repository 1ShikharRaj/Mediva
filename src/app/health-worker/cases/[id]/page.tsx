import connectToDatabase from '@/lib/db/mongodb';
import Case from '@/models/Case';
import Patient from '@/models/Patient';
import IntakeFlow from '@/components/cases/IntakeFlow';
import { redirect } from 'next/navigation';

export default async function CaseIntakePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  await connectToDatabase();
  
  const caseRecord = await Case.findById(id).populate('patientId').lean();
  
  if (!caseRecord) {
    redirect('/health-worker');
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Patient Intake: {caseRecord.patientId.name}</h1>
        <p className="text-slate-500">Case ID: {caseRecord.caseId} | Age: {caseRecord.patientId.age} | Sex: {caseRecord.patientId.sex}</p>
      </div>
      
      <IntakeFlow caseId={id} initialData={JSON.parse(JSON.stringify(caseRecord))} />
    </div>
  );
}
