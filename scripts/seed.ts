import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import Patient from '../src/models/Patient';
import Case from '../src/models/Case';
import User from '../src/models/User';

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'sehatbridge' });
  console.log('Connected!');

  // Clear existing demo data
  console.log('Clearing existing patients and cases...');
  await Patient.deleteMany({});
  await Case.deleteMany({});
  await User.deleteMany({});

  console.log('Seeding primary demo patient (Ravi Kumar)...');
  
  // Create Demo Health Worker
  const hw = await User.create({
    clerkId: 'demo_hw_123',
    email: 'hw@demo.com',
    firstName: 'Demo',
    lastName: 'Worker',
    role: 'HEALTH_WORKER'
  });

  // Create Demo Doctor
  const doc = await User.create({
    clerkId: 'demo_doc_123',
    email: 'doctor@demo.com',
    firstName: 'Demo',
    lastName: 'Doctor',
    role: 'DOCTOR'
  });

  // Create Patient 1: Ravi Kumar (YELLOW Case)
  const p1 = await Patient.create({
    patientId: 'SB-2026-000001',
    name: 'Ravi Kumar',
    age: 42,
    sex: 'MALE',
    phone: '9876543210',
    preferredLanguage: 'Hindi',
    village: 'Ramgarh',
  });

  await Case.create({
    caseId: 'CASE-2026-000001',
    patientId: p1._id,
    createdBy: hw.clerkId,
    chiefComplaint: 'Fever + weakness',
    symptoms: ['headache', 'chills'],
    symptomDuration: '3 days',
    vitals: {
      temperature: 102,
      bloodPressure: '145/90',
      pulse: 98,
      oxygenSaturation: 97
    },
    riskLevel: 'YELLOW',
    riskReasons: ['Elevated temperature', 'Reported symptom requires review: fever', 'Reported symptom requires review: weakness'],
    aiSummary: `**AI CASE BRIEF READY**\n\n**RAVI KUMAR**\n42 years\n\n**Chief concern:**\nFever + weakness\n\n**Duration:**\n3 days\n\n**Vitals:**\n102°F | 145/90 | 98 BPM | 97% SpO₂\n\n**Risk:**\nYELLOW — DOCTOR REVIEW RECOMMENDED\n\n**Reasons:**\n• Elevated temperature\n• Weakness reported\n\n*AI-generated information. Not a diagnosis. Doctor review is required where clinically appropriate.*`,
    status: 'WAITING_DOCTOR'
  });

  // Create Patient 2: Sunita Devi (RED Case / Emergency)
  const p2 = await Patient.create({
    patientId: 'SB-2026-000002',
    name: 'Sunita Devi',
    age: 58,
    sex: 'FEMALE',
    preferredLanguage: 'Hindi',
    village: 'Ramgarh',
    chronicConditions: ['Hypertension']
  });

  await Case.create({
    caseId: 'CASE-2026-000002',
    patientId: p2._id,
    createdBy: hw.clerkId,
    chiefComplaint: 'Severe chest pain and shortness of breath',
    symptoms: ['chest pain', 'breathing difficulty', 'sweating'],
    symptomDuration: '2 hours',
    vitals: {
      temperature: 98.6,
      bloodPressure: '180/110',
      pulse: 115,
      oxygenSaturation: 89
    },
    riskLevel: 'RED',
    riskReasons: ['Oxygen saturation below 92%', 'Reported potentially urgent symptom: chest pain'],
    status: 'WAITING_DOCTOR',
    aiSummary: `**AI CASE BRIEF READY**\n\n**SUNITA DEVI**\n58 years\n\n**Chief concern:**\nSevere chest pain\n\n**Vitals:**\n98.6°F | 180/110 | 115 BPM | 89% SpO₂\n\n**Risk:**\nRED — URGENT MEDICAL ATTENTION REQUIRED\n\n*AI-generated information. Not a diagnosis.*`
  });

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
