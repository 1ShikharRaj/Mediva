import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/db/mongodb';
import Case from '@/models/Case';
import Patient from '@/models/Patient';
import { assessRisk, PatientData } from '@/lib/clinical/safetyEngine';
import { generateCaseSummary } from '@/lib/openai/caseSummary';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();

    const caseRecord = await Case.findById(id).populate('patientId');
    if (!caseRecord) return NextResponse.json({ success: false, error: 'Case not found' }, { status: 404 });

    const patient = caseRecord.patientId;

    // 1. Prepare data for safety engine
    const patientData: PatientData = {
      age: patient.age,
      vitals: caseRecord.vitals,
      symptoms: caseRecord.symptoms,
      duration: caseRecord.symptomDuration,
      chiefComplaint: caseRecord.chiefComplaint,
    };

    // 2. Deterministic Safety Check
    const riskAssessment = assessRisk(patientData);

    // 3. Generate AI Summary (Doctor-Ready Brief)
    // For demo, if OpenAI key is not valid, we'll generate a fallback
    let aiSummary = "AI Summary unavailable due to configuration.";
    try {
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-test-123') {
        aiSummary = await generateCaseSummary({
          patient: {
            name: patient.name,
            age: patient.age,
            sex: patient.sex,
          },
          complaint: caseRecord.chiefComplaint,
          symptoms: caseRecord.symptoms,
          duration: caseRecord.symptomDuration,
          vitals: caseRecord.vitals,
          history: [caseRecord.medicalHistory].filter(Boolean),
          medications: patient.currentMedications,
          allergies: patient.allergies,
          riskAssessment: {
            level: riskAssessment.riskLevel,
            reasons: riskAssessment.reasons,
          }
        });
      } else {
        // Fallback for demo without keys
        aiSummary = `**AI CASE BRIEF READY**\n\n**${patient.name.toUpperCase()}**\n${patient.age} years\n\n**Chief concern:**\n${caseRecord.chiefComplaint}\n\n**Duration:**\n${caseRecord.symptomDuration || 'Unknown'}\n\n**Vitals:**\n${caseRecord.vitals?.temperature || '--'}°F | ${caseRecord.vitals?.bloodPressure || '--'} | ${caseRecord.vitals?.pulse || '--'} BPM | ${caseRecord.vitals?.oxygenSaturation || '--'}% SpO₂\n\n**Risk:**\n${riskAssessment.riskLevel} — ${riskAssessment.requiresDoctorReview ? 'DOCTOR REVIEW' : 'ROUTINE'}\n\n**Reasons:**\n${riskAssessment.reasons.map(r => `• ${r}`).join('\n')}\n\n*AI-generated information. Not a diagnosis. Doctor review is required where clinically appropriate.*`;
      }
    } catch (aiError) {
      console.error("AI Generation failed:", aiError);
      aiSummary = "AI analysis failed. Raw data available for doctor review.";
    }

    // 4. Update Case with results
    caseRecord.riskLevel = riskAssessment.riskLevel;
    caseRecord.riskReasons = riskAssessment.reasons;
    caseRecord.aiSummary = aiSummary;
    caseRecord.status = 'WAITING_DOCTOR';
    
    await caseRecord.save();

    return NextResponse.json({ success: true, data: caseRecord });
  } catch (error: any) {
    console.error('Case analyze error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
