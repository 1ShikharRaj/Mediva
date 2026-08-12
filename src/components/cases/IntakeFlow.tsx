"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mic, FileText, Image as ImageIcon, CheckCircle, AlertTriangle } from "lucide-react";

export default function IntakeFlow({ caseId, initialData }: { caseId: string, initialData: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("complaint");
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    chiefComplaint: initialData.chiefComplaint === "Pending" ? "" : initialData.chiefComplaint,
    symptoms: initialData.symptoms?.join(", ") || "",
    duration: initialData.symptomDuration || "",
    vitals: {
      temperature: initialData.vitals?.temperature || "",
      bloodPressure: initialData.vitals?.bloodPressure || "",
      pulse: initialData.vitals?.pulse || "",
      oxygenSaturation: initialData.vitals?.oxygenSaturation || "",
    },
    history: initialData.medicalHistory || "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name.includes("vitals.")) {
      const vitalName = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        vitals: { ...prev.vitals, [vitalName]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/cases/${caseId}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunAI = async () => {
    if (!formData.chiefComplaint.trim()) {
      setError("Chief complaint is required before running AI analysis.");
      return;
    }
    
    setIsAnalyzing(true);
    setError("");
    try {
      await handleSaveDraft();
      
      const res = await fetch(`/api/cases/${caseId}/analyze`, {
        method: "POST",
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/health-worker/cases/${caseId}/summary`);
    } catch (err: any) {
      setError(err.message || "Failed to analyze case");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsUploading(true);
    setError("");
    
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("caseId", caseId);
      data.append("patientId", initialData.patientId._id || initialData.patientId);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setDocuments(prev => [...prev, result.data]);
    } catch (err: any) {
      setError(err.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
      // reset file input
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="complaint">Complaint</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <Card className="mt-4 border-slate-200">
          <CardContent className="p-6">
            <TabsContent value="complaint" className="mt-0 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Chief Complaint & Symptoms</h3>
                <Button variant="outline" size="sm" className="gap-2 text-blue-600 border-blue-200">
                  <Mic className="w-4 h-4" /> Voice Intake
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Chief Complaint <span className="text-red-500">*</span></Label>
                  <Input 
                    name="chiefComplaint" 
                    value={formData.chiefComplaint} 
                    onChange={handleChange} 
                    placeholder="Main reason for visit (e.g. Fever and weakness)" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Symptoms (comma separated)</Label>
                    <Input 
                      name="symptoms" 
                      value={formData.symptoms} 
                      onChange={handleChange} 
                      placeholder="e.g. headache, chills, cough" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input 
                      name="duration" 
                      value={formData.duration} 
                      onChange={handleChange} 
                      placeholder="e.g. 3 days" 
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={() => setActiveTab("vitals")}>Next: Vitals</Button>
              </div>
            </TabsContent>

            <TabsContent value="vitals" className="mt-0 space-y-4">
              <h3 className="text-lg font-medium mb-4">Record Vitals</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Temperature (°F)</Label>
                  <Input name="vitals.temperature" type="number" step="0.1" value={formData.vitals.temperature} onChange={handleChange} placeholder="98.6" />
                </div>
                <div className="space-y-2">
                  <Label>Blood Pressure (mmHg)</Label>
                  <Input name="vitals.bloodPressure" value={formData.vitals.bloodPressure} onChange={handleChange} placeholder="120/80" />
                </div>
                <div className="space-y-2">
                  <Label>Pulse (BPM)</Label>
                  <Input name="vitals.pulse" type="number" value={formData.vitals.pulse} onChange={handleChange} placeholder="72" />
                </div>
                <div className="space-y-2">
                  <Label>SpO2 (%)</Label>
                  <Input name="vitals.oxygenSaturation" type="number" value={formData.vitals.oxygenSaturation} onChange={handleChange} placeholder="98" />
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setActiveTab("complaint")}>Back</Button>
                <Button onClick={() => setActiveTab("history")}>Next: History</Button>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0 space-y-4">
              <h3 className="text-lg font-medium mb-4">Medical History</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Known Conditions & History</Label>
                  <Textarea 
                    name="history" 
                    value={formData.history} 
                    onChange={handleChange} 
                    placeholder="Any relevant past medical history, chronic conditions, etc." 
                    className="h-32"
                  />
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setActiveTab("vitals")}>Back</Button>
                <Button onClick={() => setActiveTab("documents")}>Next: Documents</Button>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="mt-0 space-y-4">
              <h3 className="text-lg font-medium mb-4">Upload Documents</h3>
              
              {documents.length > 0 && (
                <div className="mb-4 space-y-2">
                  <h4 className="text-sm font-medium text-slate-700">Uploaded Files:</h4>
                  <ul className="space-y-2">
                    {documents.map((doc) => (
                      <li key={doc._id} className="text-sm bg-slate-50 p-2 rounded-md border flex items-center justify-between">
                        <span className="truncate flex-1 font-medium">{doc.fileName}</span>
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 ml-2">Uploaded</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 cursor-pointer transition-colors overflow-hidden">
                  <input 
                    type="file" 
                    accept="application/pdf,image/jpeg,image/png" 
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                  />
                  {isUploading ? <Loader2 className="w-10 h-10 text-blue-500 mb-2 animate-spin" /> : <FileText className="w-10 h-10 text-slate-400 mb-2" />}
                  <span className="font-medium text-slate-700">{isUploading ? "Uploading..." : "Upload Report"}</span>
                  <span className="text-sm text-slate-500">PDF, JPG, PNG</span>
                </div>
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 cursor-pointer transition-colors overflow-hidden">
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png" 
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                  />
                  {isUploading ? <Loader2 className="w-10 h-10 text-blue-500 mb-2 animate-spin" /> : <ImageIcon className="w-10 h-10 text-slate-400 mb-2" />}
                  <span className="font-medium text-slate-700">{isUploading ? "Uploading..." : "Injury Image"}</span>
                  <span className="text-sm text-slate-500">Visible symptoms</span>
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setActiveTab("history")} disabled={isAnalyzing || isUploading}>Back</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleRunAI} disabled={isAnalyzing || isUploading}>
                  {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Run AI Analysis
                </Button>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
