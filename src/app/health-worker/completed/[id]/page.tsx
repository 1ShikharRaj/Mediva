import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, ClipboardList, AlertTriangle, FileText } from 'lucide-react';
import connectToDatabase from '@/lib/db/mongodb';
import Case from '@/models/Case';
import DoctorDecision from '@/models/DoctorDecision';
import Link from 'next/link';

export default async function CompletedCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectToDatabase();
  
  const caseRecord = await Case.findById(id).populate('patientId').lean();
  if (!caseRecord) return notFound();

  const decision = await DoctorDecision.findOne({ caseId: id }).lean();
  if (!decision) return notFound();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Doctor's Decision</h1>
          <p className="text-slate-500 mt-1">Review the care plan and instruct the patient.</p>
        </div>
        <Badge variant={caseRecord.status === 'REFERRED' ? 'destructive' : 'default'} className="text-sm px-4 py-1">
          {caseRecord.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      {caseRecord.status === 'REFERRED' && (
        <div className="bg-red-50 border border-red-200 text-red-900 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-800">URGENT: Patient Referred to Hospital</h3>
            <p className="text-sm mt-1">The doctor has requested that this patient be immediately transferred to a higher care facility.</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardHeader className="border-b bg-slate-50 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" /> Clinical Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-slate-700 whitespace-pre-wrap">{decision.clinicalNotes || "No notes provided."}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="border-b bg-slate-50 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" /> Prescriptions & Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {decision.prescriptions && decision.prescriptions.length > 0 ? (
              <ul className="space-y-3">
                {decision.prescriptions.map((rx: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 bg-emerald-50 p-3 rounded-md text-emerald-900 text-sm font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    {rx}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">No prescriptions recorded.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Finalize Discharge</h3>
        <p className="text-slate-600 text-sm mb-6">
          Once you have dispensed the medications and fully explained the doctor's instructions to the patient, you can mark this case as completed.
        </p>
        <div className="flex gap-4">
          <form action={`/api/cases/${id}/complete`} method="POST" className="inline">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 gap-2">
              <CheckCircle className="w-4 h-4" /> Mark as Discharged
            </Button>
          </form>
          <Link href="/health-worker/completed">
            <Button variant="outline">Back to Queue</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
