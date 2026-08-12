import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctorDecision extends Document {
  caseId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId: string; // Clerk User ID
  action: 'APPROVE_CARE' | 'MODIFY_CARE' | 'REQUEST_MORE_INFORMATION' | 'REFER_TO_HOSPITAL' | 'SCHEDULE_FOLLOW_UP' | 'CLOSE_CASE';
  notes: string;
  prescriptions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DoctorDecisionSchema: Schema = new Schema(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: String, required: true },
    action: {
      type: String,
      enum: [
        'APPROVE_CARE', 'MODIFY_CARE', 'REQUEST_MORE_INFORMATION', 
        'REFER_TO_HOSPITAL', 'SCHEDULE_FOLLOW_UP', 'CLOSE_CASE'
      ],
      required: true
    },
    notes: { type: String, required: true },
    prescriptions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.DoctorDecision || mongoose.model<IDoctorDecision>('DoctorDecision', DoctorDecisionSchema);
