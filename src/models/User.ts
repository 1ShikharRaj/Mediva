import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'HEALTH_WORKER' | 'DOCTOR' | 'ADMIN' | 'PENDING';
  clinicId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    role: { 
      type: String, 
      enum: ['HEALTH_WORKER', 'DOCTOR', 'ADMIN', 'PENDING'],
      default: 'PENDING'
    },
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic' },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
