import mongoose, { Schema, Document } from 'mongoose';

export interface IClinic extends Document {
  clinicId: string;
  name: string;
  location: string;
  contactNumber: string;
  facilities: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ClinicSchema: Schema = new Schema(
  {
    clinicId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    contactNumber: { type: String, required: true },
    facilities: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Clinic || mongoose.model<IClinic>('Clinic', ClinicSchema);
