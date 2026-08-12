import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/db/mongodb';
import Case from '@/models/Case';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();

    // Generate custom Case ID
    const count = await Case.countDocuments();
    const caseId = `CASE-2026-${(count + 1).toString().padStart(6, '0')}`;

    const newCase = await Case.create({
      patientId: body.patientId,
      createdBy: userId,
      caseId,
      status: 'DRAFT',
      chiefComplaint: body.chiefComplaint || 'Pending',
    });

    return NextResponse.json({ success: true, data: newCase }, { status: 201 });
  } catch (error: any) {
    console.error('Case creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
