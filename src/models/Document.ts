import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
  documentId: string;
  caseId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  cloudinaryPublicId: string;
  secureUrl: string;
  resourceType: 'IMAGE' | 'PDF' | 'VIDEO' | 'AUDIO' | 'OTHER';
  mimeType: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string; // Clerk User ID
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    documentId: { type: String, required: true, unique: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    cloudinaryPublicId: { type: String, required: true },
    secureUrl: { type: String, required: true },
    resourceType: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploadedBy: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
