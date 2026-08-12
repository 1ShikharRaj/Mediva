"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Video, PhoneOff, Mic, MicOff, Camera, CameraOff, Send, Activity, User as UserIcon } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function DoctorCaseView({ caseData }: { caseData: any }) {
  const router = useRouter();
  const [inCall, setInCall] = useState(false);
  const [decision, setDecision] = useState({
    action: "",
    notes: "",
    prescriptions: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRed = caseData.riskLevel === 'RED';
  const isYellow = caseData.riskLevel === 'YELLOW';

  const handleSubmitDecision = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/doctor-decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: caseData._id,
          patientId: caseData.patientId._id,
          ...decision,
          prescriptions: decision.prescriptions.split(',').map((p: string) => p.trim()).filter(Boolean)
        }),
      });
      
      if (!res.ok) throw new Error("Failed to save decision");
      
      // Status is already updated by the /api/doctor-decisions route

      router.push("/doctor");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      {/* Left Column: Patient Data & AI Brief */}
      <div className={`w-full md:w-2/3 flex flex-col gap-6 overflow-auto pr-2 ${inCall ? 'hidden md:flex md:w-1/3' : ''}`}>
        
        {/* Header Profile */}
        <div className="flex justify-between items-start bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{caseData.patientId.name}</h2>
              <p className="text-slate-500">{caseData.patientId.age} yrs • {caseData.patientId.sex} • {caseData.patientId.patientId}</p>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  isRed ? 'bg-red-100 text-red-700' : isYellow ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {caseData.riskLevel} RISK
                </span>
              </div>
            </div>
          </div>
          {!inCall && (
            <Button onClick={() => setInCall(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              <Video className="w-4 h-4" /> Start Consultation
            </Button>
          )}
        </div>

        <Tabs defaultValue="brief" className="w-full flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="brief">AI Case Brief</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
            <TabsTrigger value="history">History & Docs</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-auto mt-4">
            <TabsContent value="brief" className="m-0 h-full">
              <Card className="h-full border-slate-200">
                <CardContent className="p-6">
                  {isRed && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-red-900">URGENT REVIEW REQUIRED</h4>
                        <p className="text-sm text-red-700 mt-1">{caseData.riskReasons?.join("; ")}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="prose prose-slate max-w-none">
                    <ReactMarkdown>{caseData.aiSummary || 'No AI summary available for this case.'}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="raw" className="m-0 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500" /> Vitals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg border">
                      <div className="text-xs text-slate-500 uppercase font-semibold">Temp</div>
                      <div className="text-xl font-bold">{caseData.vitals?.temperature || '--'} <span className="text-sm font-normal text-slate-500">°F</span></div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border">
                      <div className="text-xs text-slate-500 uppercase font-semibold">BP</div>
                      <div className="text-xl font-bold">{caseData.vitals?.bloodPressure || '--'}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border">
                      <div className="text-xs text-slate-500 uppercase font-semibold">Pulse</div>
                      <div className="text-xl font-bold">{caseData.vitals?.pulse || '--'} <span className="text-sm font-normal text-slate-500">BPM</span></div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border">
                      <div className="text-xs text-slate-500 uppercase font-semibold">SpO2</div>
                      <div className="text-xl font-bold">{caseData.vitals?.oxygenSaturation || '--'} <span className="text-sm font-normal text-slate-500">%</span></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Reported Symptoms</h4>
                    <div className="flex flex-wrap gap-2">
                      {caseData.symptoms?.map((sym: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">{sym}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Duration</h4>
                    <p className="font-medium">{caseData.symptomDuration || 'Not specified'}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="m-0 space-y-4">
               <Card>
                <CardContent className="p-6">
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Past Medical History</h4>
                  <p className="whitespace-pre-wrap">{caseData.medicalHistory || 'No medical history reported.'}</p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Right Column: Video & Doctor Decision */}
      <div className={`w-full flex flex-col gap-6 ${inCall ? 'md:w-2/3 h-[calc(100vh-140px)]' : 'md:w-1/3'}`}>
        {/* Video Area */}
        {inCall && (
          <Card className="flex-1 bg-slate-900 border-0 shadow-xl overflow-hidden relative min-h-[300px]">
            {/* Mock WebRTC Video Container */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-slate-500 flex flex-col items-center">
                <Video className="w-16 h-16 mb-4 opacity-50" />
                <p>Connected to Clinic</p>
                <p className="text-sm opacity-70">WebRTC Video Stream Active</p>
              </div>
            </div>
            {/* Self View Picture-in-Picture */}
            <div className="absolute top-4 right-4 w-32 h-24 bg-slate-800 rounded-lg border border-slate-700 shadow-lg"></div>
            
            {/* Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 p-3 rounded-full backdrop-blur-sm border border-slate-700">
              <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700 rounded-full h-10 w-10"><Mic className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700 rounded-full h-10 w-10"><Camera className="w-5 h-5" /></Button>
              <Button onClick={() => setInCall(false)} variant="destructive" size="icon" className="rounded-full h-12 w-12"><PhoneOff className="w-5 h-5" /></Button>
            </div>
          </Card>
        )}

        {/* Doctor Decision Form */}
        <Card className={`border-slate-200 flex flex-col ${inCall ? 'flex-shrink-0' : 'h-full'}`}>
          <CardHeader className="py-4 border-b bg-slate-50">
            <CardTitle className="text-lg">Clinical Decision</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col overflow-auto">
            <div className="space-y-4 flex-1">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Action Plan</label>
                <Select onValueChange={(val) => setDecision(prev => ({ ...prev, action: val as string }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select final decision..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPROVE_CARE">Approve Basic Care Plan</SelectItem>
                    <SelectItem value="MODIFY_CARE">Modify Care Plan</SelectItem>
                    <SelectItem value="REFER_TO_HOSPITAL">Emergency Referral</SelectItem>
                    <SelectItem value="REQUEST_MORE_INFORMATION">Request More Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex-1 flex flex-col">
                <label className="text-sm font-medium text-slate-700">Clinical Notes & Instructions</label>
                <Textarea 
                  className="flex-1 min-h-[120px] resize-none" 
                  placeholder="Instructions for the health worker..."
                  value={decision.notes}
                  onChange={(e: any) => setDecision(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Prescriptions (Optional)</label>
                <Input 
                  placeholder="e.g. Paracetamol 500mg, Amoxicillin" 
                  value={decision.prescriptions}
                  onChange={(e: any) => setDecision(prev => ({ ...prev, prescriptions: e.target.value }))}
                />
              </div>
            </div>

            <Button 
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700" 
              onClick={handleSubmitDecision}
              disabled={isSubmitting || !decision.action || !decision.notes}
            >
              <Send className="w-4 h-4 mr-2" /> Finalize Decision
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
