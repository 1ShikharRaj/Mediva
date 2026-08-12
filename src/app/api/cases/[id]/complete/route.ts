import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/db/mongodb';
import Case from '@/models/Case';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.redirect(new URL('/', req.url));

    const { id } = await params;
    await connectToDatabase();

    await Case.findByIdAndUpdate(id, {
      status: 'COMPLETED'
    });

    // Redirect back to the completed queue
    return NextResponse.redirect(new URL('/health-worker/completed', req.url), 303);
  } catch (error: any) {
    console.error('Case complete error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
