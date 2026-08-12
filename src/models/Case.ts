import mongoose, { Schema, Document } from 'mongoose';

export interface ICase extends Document {
  caseId: string;
  patientId: mongoose.Types.ObjectId;
  clinicId?: mongoose.Types.ObjectId;
  createdBy: string; // User ID (Clerk ID)
  chiefComplaint: string;
  symptoms: string[];
  symptomDuration?: string;
  symptomSeverity?: string;
  medicalHistory: string;
  vitals: {
    temperature?: number;
    bloodPressure?: string;
    pulse?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
  };
  medications: string[];
  allergies: string[];
  documentIds: mongoose.Types.ObjectId[];
  imageIds: mongoose.Types.ObjectId[];
  voiceTranscript?: string;
  aiSummary?: string;
  safetyAssessment?: any;
  riskLevel: 'GREEN' | 'YELLOW' | 'RED' | 'PENDING';
  riskReasons: string[];
  protocolId?: mongoose.Types.ObjectId;
  consultationId?: mongoose.Types.ObjectId;
  doctorDecisionId?: mongoose.Types.ObjectId;
  referralId?: mongoose.Types.ObjectId;
  followUpIds: mongoose.Types.ObjectId[];
  status: 'DRAFT' | 'ASSESSMENT' | 'AI_REVIEW' | 'WAITING_DOCTOR' | 'IN_CONSULTATION' | 'DOCTOR_REVIEW' | 'REFERRED' | 'CARE_PLAN_APPROVED' | 'FOLLOW_UP' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema: Schema = new Schema(
  {
    caseId: { type: String, required: true, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic' },
    createdBy: { type: String, required: true },
    chiefComplaint: { type: String, required: true },
    symptoms: { type: [String], default: [] },
    symptomDuration: { type: String },
    symptomSeverity: { type: String },
    medicalHistory: { type: String, default: '' },
    vitals: {
      temperature: Number,
      bloodPressure: String,
      pulse: Number,
      oxygenSaturation: Number,
      respiratoryRate: Number,
    },
    medications: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    documentIds: [{ type: Schema.Types.ObjectId, ref: 'Document' }],
    imageIds: [{ type: Schema.Types.ObjectId, ref: 'Document' }],
    voiceTranscript: { type: String },
    aiSummary: { type: String },
    safetyAssessment: { type: Schema.Types.Mixed },
    riskLevel: { type: String, enum: ['GREEN', 'YELLOW', 'RED', 'PENDING'], default: 'PENDING' },
    riskReasons: { type: [String], default: [] },
    protocolId: { type: Schema.Types.ObjectId, ref: 'Protocol' },
    consultationId: { type: Schema.Types.ObjectId, ref: 'Consultation' },
    doctorDecisionId: { type: Schema.Types.ObjectId, ref: 'DoctorDecision' },
    referralId: { type: Schema.Types.ObjectId, ref: 'Referral' },
    followUpIds: [{ type: Schema.Types.ObjectId, ref: 'FollowUp' }],
    status: {
      type: String,
      enum: [
        'DRAFT', 'ASSESSMENT', 'AI_REVIEW', 'WAITING_DOCTOR', 'IN_CONSULTATION',
        'DOCTOR_REVIEW', 'REFERRED', 'CARE_PLAN_APPROVED', 'FOLLOW_UP', 'COMPLETED'
      ],
      default: 'DRAFT'
    }
  },
  { timestamps: true }
);

export default mongoose.models.Case || mongoose.model<ICase>('Case', CaseSchema);
