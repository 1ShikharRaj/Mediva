import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/db/mongodb';
import Case from '@/models/Case';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    await connectToDatabase();

    const updatedCase = await Case.findByIdAndUpdate(
      id,
      {
        $set: {
          chiefComplaint: body.chiefComplaint,
          symptoms: body.symptoms ? body.symptoms.split(',').map((s: string) => s.trim()) : [],
          symptomDuration: body.duration,
          vitals: {
            temperature: body.vitals?.temperature ? Number(body.vitals.temperature) : undefined,
            bloodPressure: body.vitals?.bloodPressure,
            pulse: body.vitals?.pulse ? Number(body.vitals.pulse) : undefined,
            oxygenSaturation: body.vitals?.oxygenSaturation ? Number(body.vitals.oxygenSaturation) : undefined,
          },
          medicalHistory: body.history,
          status: 'ASSESSMENT'
        }
      },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updatedCase });
  } catch (error: any) {
    console.error('Case update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
