import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Search, User as UserIcon } from 'lucide-react';
import connectToDatabase from '@/lib/db/mongodb';
import Patient from '@/models/Patient';
import { Input } from '@/components/ui/input';

export default async function DoctorPatientsPage() {
  await connectToDatabase();
  // Fetch all patients for the doctor to review (could be filtered by clinic/region in a real app)
  const patients = await Patient.find({}).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Patient Directory</h1>
          <p className="text-slate-500 mt-1">Global registry of all patients.</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-4 border-b bg-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9 bg-white" placeholder="Search patients by name, ID or phone..." />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {patients.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <Users className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-lg font-medium text-slate-900">No patients found</p>
                <p>No patients have been registered by health workers yet.</p>
              </div>
            ) : (
              patients.map((p: any) => (
                <div key={p._id.toString()} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{p.name}</h3>
                      <p className="text-sm text-slate-500">{p.patientId} • {p.age} yrs • {p.sex}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-500 text-right hidden md:block">
                      <p>Location</p>
                      <p className="font-medium">{p.village || 'Unknown'}</p>
                    </div>
                    <Button variant="outline" size="sm" className="hidden" disabled>View Records</Button>
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
