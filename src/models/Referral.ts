import mongoose, { Schema, Document } from 'mongoose';

export interface IReferral extends Document {
  referralId: string;
  patientId: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  reason: string;
  riskLevel: 'GREEN' | 'YELLOW' | 'RED';
  destination: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  createdBy: string; // Clerk User ID
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema: Schema = new Schema(
  {
    referralId: { type: String, required: true, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    reason: { type: String, required: true },
    riskLevel: { type: String, enum: ['GREEN', 'YELLOW', 'RED'], required: true },
    destination: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING'
    },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema);
