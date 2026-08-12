import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/db/mongodb';
import Patient from '@/models/Patient';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();

    // Generate custom Patient ID
    const count = await Patient.countDocuments();
    const patientId = `SB-2026-${(count + 1).toString().padStart(6, '0')}`;

    const newPatient = await Patient.create({
      ...body,
      patientId
    });

    return NextResponse.json({ success: true, data: newPatient }, { status: 201 });
  } catch (error: any) {
    console.error('Patient creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // In a real app, we'd filter by clinicId
    const patients = await Patient.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: patients });
  } catch (error: any) {
    console.error('Patient fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
