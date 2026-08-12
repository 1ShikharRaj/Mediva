import connectToDatabase from '@/lib/db/mongodb';
import Case from '@/models/Case';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Send, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { redirect } from 'next/navigation';

export default async function CaseSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectToDatabase();
  
  const caseRecord = await Case.findById(id).populate('patientId').lean();
  
  if (!caseRecord || caseRecord.status === 'DRAFT') {
    redirect(`/health-worker/cases/${id}`);
  }

  const isRed = caseRecord.riskLevel === 'RED';
  const isYellow = caseRecord.riskLevel === 'YELLOW';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href={`/health-worker/cases/${id}`}>
          <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Case Brief</h1>
          <p className="text-slate-500">{caseRecord.patientId.name} | {caseRecord.caseId}</p>
        </div>
      </div>

      {isRed && (
        <div className="bg-red-600 text-white p-6 rounded-xl flex items-start gap-4 shadow-sm animate-pulse-slow">
          <AlertTriangle className="w-8 h-8 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold">URGENT MEDICAL ATTENTION REQUIRED</h2>
            <p className="mt-1 opacity-90">This case has triggered safety signals indicating a potential emergency.</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="prose prose-slate max-w-none prose-h2:text-xl prose-h2:mb-4 prose-p:mb-2 prose-strong:text-slate-900">
                <ReactMarkdown>{caseRecord.aiSummary || 'No summary available.'}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={isRed ? "border-red-200" : isYellow ? "border-amber-200" : "border-emerald-200"}>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                Safety Engine
                {isRed ? <AlertTriangle className="w-5 h-5 text-red-500" /> : isYellow ? <AlertTriangle className="w-5 h-5 text-amber-500" /> : <CheckCircle className="w-5 h-5 text-emerald-500" />}
              </h3>
              
              <div className={`text-center py-2 px-4 rounded-lg font-bold text-lg mb-4 ${
                isRed ? "bg-red-100 text-red-700" : 
                isYellow ? "bg-amber-100 text-amber-700" : 
                "bg-emerald-100 text-emerald-700"
              }`}>
                {caseRecord.riskLevel}
              </div>

              <div className="space-y-2 mb-6">
                <p className="text-sm font-medium text-slate-700">Why this was flagged:</p>
                <ul className="text-sm text-slate-600 space-y-1 list-disc pl-4">
                  {caseRecord.riskReasons?.map((reason: string, i: number) => (
                    <li key={i}>{reason}</li>
                  )) || <li>No reasons provided.</li>}
                </ul>
              </div>

              <Link href="/health-worker">
                <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4" /> Send to Doctor
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
