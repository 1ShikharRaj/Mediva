import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileCheck, CheckCircle2 } from 'lucide-react';
import connectToDatabase from '@/lib/db/mongodb';
import Case from '@/models/Case';

export default async function CompletedCasesPage() {
  await connectToDatabase();
  
  // Fetch cases that have been approved or referred by the doctor
  const completedCases = await Case.find({ status: { $in: ['CARE_PLAN_APPROVED', 'REFERRED'] } })
    .populate('patientId')
    .sort({ updatedAt: -1 })
    .lean();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Prescriptions & Cures</h1>
          <p className="text-slate-500 mt-1">Cases reviewed by the doctor waiting for patient discharge.</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {completedCases.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-lg font-medium text-slate-900">All caught up!</p>
                <p>No new prescriptions waiting to be dispensed.</p>
              </div>
            ) : (
              completedCases.map((c: any) => (
                <div key={c._id.toString()} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <FileCheck className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{c.patientId?.name || 'Unknown'}</h3>
                      <p className="text-sm text-slate-500">Case: {c.caseId} • Reviewed {new Date(c.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="bg-slate-100 text-slate-700">
                      {c.status.replace(/_/g, ' ')}
                    </Badge>
                    <Link href={`/health-worker/completed/${c._id}`}>
                      <Button className="bg-emerald-600 hover:bg-emerald-700">View Decision</Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
