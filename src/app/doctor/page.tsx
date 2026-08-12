import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Activity, FileText } from 'lucide-react';
import connectToDatabase from '@/lib/db/mongodb';
import Case from '@/models/Case';
import Patient from '@/models/Patient';
import { auth } from '@clerk/nextjs/server';

export default async function DoctorQueueDashboard() {
  await connectToDatabase();

  // Fetch cases waiting for doctor review, sorted by Risk Level (RED first, then YELLOW, then GREEN) 
  // and then by oldest first
  const cases = await Case.find({ status: 'WAITING_DOCTOR' })
    .populate('patientId')
    .lean();

  // Sort: RED (3) -> YELLOW (2) -> GREEN (1)
  const sortedCases = cases.sort((a: any, b: any) => {
    const riskScore = { 'RED': 3, 'YELLOW': 2, 'GREEN': 1, 'PENDING': 0 };
    const scoreA = riskScore[a.riskLevel as keyof typeof riskScore] || 0;
    const scoreB = riskScore[b.riskLevel as keyof typeof riskScore] || 0;
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Descending
    }
    // If same risk, oldest first
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const urgentCount = sortedCases.filter((c: any) => c.riskLevel === 'RED').length;
  const totalCount = sortedCases.length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Priority Queue</h1>
          <p className="text-slate-500 mt-1">Cases requiring remote doctor review.</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-4 py-2 bg-white rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Waiting</div>
          </div>
          <div className="text-center px-4 py-2 bg-red-50 rounded-lg border border-red-100 shadow-sm">
            <div className="text-2xl font-bold text-red-600">{urgentCount}</div>
            <div className="text-xs font-medium text-red-600 uppercase tracking-wider">Urgent</div>
          </div>
        </div>
      </div>

      <Card className="shadow-sm overflow-hidden border-slate-200">
        <div className="bg-slate-50 px-6 py-3 border-b text-xs font-semibold text-slate-500 uppercase tracking-wider grid grid-cols-12 gap-4">
          <div className="col-span-1">Risk</div>
          <div className="col-span-3">Patient</div>
          <div className="col-span-3">Chief Complaint</div>
          <div className="col-span-3">AI Flags</div>
          <div className="col-span-2 text-right">Action</div>
        </div>
        <div className="divide-y divide-slate-100">
          {sortedCases.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <Activity className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-900">No cases waiting</p>
              <p>The queue is currently empty.</p>
            </div>
          ) : (
            sortedCases.map((c: any) => (
              <div key={c._id.toString()} className="px-6 py-4 hover:bg-slate-50 transition-colors grid grid-cols-12 gap-4 items-center">
                <div className="col-span-1">
                  {c.riskLevel === 'RED' ? (
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  ) : c.riskLevel === 'YELLOW' ? (
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    </div>
                  )}
                </div>
                
                <div className="col-span-3 flex flex-col">
                  <span className="font-semibold text-slate-900">{c.patientId?.name || 'Unknown Patient'}</span>
                  <span className="text-xs text-slate-500">{c.patientId?.age} yrs • {c.patientId?.sex}</span>
                </div>
                
                <div className="col-span-3">
                  <span className="text-sm font-medium text-slate-700 truncate block">{c.chiefComplaint}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> {new Date(c.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                
                <div className="col-span-3 flex flex-wrap gap-1">
                  {c.riskReasons?.slice(0, 2).map((reason: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs truncate max-w-full bg-white">{reason}</Badge>
                  ))}
                  {c.riskReasons?.length > 2 && <Badge variant="outline" className="text-xs">+{c.riskReasons.length - 2}</Badge>}
                </div>
                
                <div className="col-span-2 text-right">
                  <Link href={`/doctor/cases/${c._id}`}>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Review Case</Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
