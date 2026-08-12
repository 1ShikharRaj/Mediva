import { Card, CardContent } from '@/components/ui/card';
import { Clock, Activity } from 'lucide-react';
import connectToDatabase from '@/lib/db/mongodb';
import Case from '@/models/Case';

export default async function DoctorFollowUpsPage() {
  await connectToDatabase();
  
  // Fetch cases that require doctor's attention for follow-up
  const followUps = await Case.find({ status: 'FOLLOW_UP' }).populate('patientId').lean();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Follow-up Queue</h1>
          <p className="text-slate-500 mt-1">Review patients who require follow-up attention.</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {followUps.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <Activity className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-lg font-medium text-slate-900">No pending follow-ups</p>
                <p>There are no follow-ups requiring doctor review right now.</p>
              </div>
            ) : (
              followUps.map((c: any) => (
                <div key={c._id.toString()} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{c.patientId?.name || 'Unknown'}</h3>
                      <p className="text-sm text-slate-500">Case: {c.caseId} • {c.chiefComplaint}</p>
                    </div>
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
