import mongoose, { Schema, Document } from 'mongoose';

export interface IFollowUp extends Document {
  followUpId: string;
  patientId: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  assignedTo: string; // Clerk User ID (Health Worker)
  scheduledDate: Date;
  reason: string;
  instructions: string;
  status: 'PENDING' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema: Schema = new Schema(
  {
    followUpId: { type: String, required: true, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    assignedTo: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    reason: { type: String, required: true },
    instructions: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'MISSED', 'CANCELLED'],
      default: 'PENDING'
    },
  },
  { timestamps: true }
);

export default mongoose.models.FollowUp || mongoose.model<IFollowUp>('FollowUp', FollowUpSchema);
