import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  patientId: string;
  clinicId: mongoose.Types.ObjectId;
  name: string;
  age: number;
  sex?: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;
  preferredLanguage: string;
  village?: string;
  emergencyContact?: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema: Schema = new Schema(
  {
    patientId: { type: String, required: true, unique: true },
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: false },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    sex: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
    phone: { type: String },
    preferredLanguage: { type: String, default: 'English' },
    village: { type: String },
    emergencyContact: { type: String },
    allergies: { type: [String], default: [] },
    chronicConditions: { type: [String], default: [] },
    currentMedications: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
