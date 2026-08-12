import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/db/mongodb';
import DoctorDecision from '@/models/DoctorDecision';
import Case from '@/models/Case';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    await connectToDatabase();

    const decision = await DoctorDecision.create({
      caseId: body.caseId,
      patientId: body.patientId,
      doctorId: userId,
      action: body.action,
      notes: body.notes,
      prescriptions: body.prescriptions || []
    });

    // Link decision to case
    await Case.findByIdAndUpdate(body.caseId, {
      doctorDecisionId: decision._id,
      status: body.action === 'REFER_TO_HOSPITAL' ? 'REFERRED' : 'CARE_PLAN_APPROVED'
    });

    return NextResponse.json({ success: true, data: decision }, { status: 201 });
  } catch (error: any) {
    console.error('Doctor decision error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
