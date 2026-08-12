import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, AlertTriangle, CheckCircle, Clock, UserCog } from 'lucide-react';
import connectToDatabase from '@/lib/db/mongodb';
import Case from '@/models/Case';
import Patient from '@/models/Patient';
import User from '@/models/User';

export default async function AdminDashboardPage() {
  await connectToDatabase();

  const totalPatients = await Patient.countDocuments();
  const totalCases = await Case.countDocuments();
  const totalUsers = await User.countDocuments();

  const redCases = await Case.countDocuments({ riskLevel: 'RED' });
  const yellowCases = await Case.countDocuments({ riskLevel: 'YELLOW' });
  const greenCases = await Case.countDocuments({ riskLevel: 'GREEN' });

  const pendingConsults = await Case.countDocuments({ status: 'WAITING_DOCTOR' });
  const completedConsults = await Case.countDocuments({ status: 'COMPLETED' });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">System Overview</h1>
        <p className="text-slate-500 mt-1">High-level metrics and performance across SehatBridge.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4" /> Total Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-900">{totalPatients}</div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4" /> Total Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-900">{totalCases}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <UserCog className="w-4 h-4" /> Registered Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-900">{totalUsers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">AI Triage Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center bg-red-50 p-4 rounded-lg border border-red-100">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-900">Red (Emergency)</span>
              </div>
              <span className="text-2xl font-bold text-red-700">{redCases}</span>
            </div>
            
            <div className="flex justify-between items-center bg-amber-50 p-4 rounded-lg border border-amber-100">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-900">Yellow (Urgent)</span>
              </div>
              <span className="text-2xl font-bold text-amber-700">{yellowCases}</span>
            </div>

            <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-emerald-900">Green (Routine)</span>
              </div>
              <span className="text-2xl font-bold text-emerald-700">{greenCases}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Consultation Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 rounded-lg border bg-slate-50">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-600" />
                <span className="font-medium text-slate-700">Waiting for Doctor</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">{pendingConsults}</span>
            </div>

            <div className="flex justify-between items-center p-4 rounded-lg border bg-slate-50">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-slate-600" />
                <span className="font-medium text-slate-700">Fully Completed Cases</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">{completedConsults}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
