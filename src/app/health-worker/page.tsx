import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Activity, Clock, FileWarning, AlertTriangle, FileCheck } from 'lucide-react';
import connectToDatabase from '@/lib/db/mongodb';
import Case from '@/models/Case';
import Patient from '@/models/Patient';
import { auth } from '@clerk/nextjs/server';

export default async function HealthWorkerDashboard() {
  const { userId } = await auth();
  await connectToDatabase();

  // Fetch recent cases for this health worker
  const recentCases = await Case.find({ createdBy: userId })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate('patientId')
    .lean();

  const urgentCasesCount = await Case.countDocuments({ createdBy: userId, riskLevel: 'RED', status: { $in: ['WAITING_DOCTOR', 'ASSESSMENT', 'AI_REVIEW'] } });
  const waitingCasesCount = await Case.countDocuments({ createdBy: userId, status: 'WAITING_DOCTOR' });
  const completedCasesCount = await Case.countDocuments({ status: { $in: ['CARE_PLAN_APPROVED', 'REFERRED'] } });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Good Morning</h1>
        <p className="text-slate-500 mt-1">Here is the status of your clinic today.</p>
      </div>

      {completedCasesCount > 0 && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <FileCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-900">Doctor Cures Ready!</h2>
              <p className="text-emerald-700 font-medium">You have {completedCasesCount} patient(s) waiting to receive their prescriptions.</p>
            </div>
          </div>
          <Link href="/health-worker/completed">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-md">
              View Decisions
            </Button>
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/health-worker/patients/new">
          <Button className="w-full h-24 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm">
            <Plus className="w-6 h-6" />
            <span>New Patient</span>
          </Button>
        </Link>
        <Link href="/health-worker/completed">
          <Button variant="outline" className="w-full h-24 flex flex-col gap-2 shadow-sm bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800">
            <FileCheck className="w-6 h-6" />
            <span className="font-bold">Prescriptions</span>
          </Button>
        </Link>
        <Card className="col-span-2 md:col-span-1 bg-amber-50 border-amber-200">
          <CardContent className="p-4 flex flex-col justify-center items-center h-full text-amber-900 text-center">
            <Clock className="w-6 h-6 text-amber-600 mb-1" />
            <span className="text-2xl font-bold">{waitingCasesCount}</span>
            <span className="text-xs font-medium uppercase tracking-wider">Waiting for Doctor</span>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1 bg-red-50 border-red-200">
          <CardContent className="p-4 flex flex-col justify-center items-center h-full text-red-900 text-center">
            <AlertTriangle className="w-6 h-6 text-red-600 mb-1" />
            <span className="text-2xl font-bold">{urgentCasesCount}</span>
            <span className="text-xs font-medium uppercase tracking-wider">Urgent Cases</span>
          </CardContent>
        </Card>
      </div>

      {/* Recent Cases */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Recent Cases</h2>
          <Link href="/health-worker/patients">
            <Button variant="ghost" size="sm" className="text-blue-600">View All</Button>
          </Link>
        </div>
        <Card className="shadow-sm overflow-hidden border-slate-200">
          <div className="divide-y divide-slate-100">
            {recentCases.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No recent cases found. Create a new patient case to begin.</div>
            ) : (
              recentCases.map((c: any) => (
                <div key={c._id.toString()} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-slate-900">{c.patientId?.name || 'Unknown Patient'}</span>
                    <span className="text-sm text-slate-500 truncate max-w-md">{c.chiefComplaint}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={
                      c.riskLevel === 'RED' ? 'destructive' : 
                      c.riskLevel === 'YELLOW' ? 'default' : 
                      'secondary'
                    } className={c.riskLevel === 'YELLOW' ? 'bg-amber-500 hover:bg-amber-600' : ''}>
                      {c.riskLevel}
                    </Badge>
                    <Badge variant="outline" className="capitalize text-slate-600">
                      {c.status.replace('_', ' ').toLowerCase()}
                    </Badge>
                    <Link href={`/health-worker/cases/${c._id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
