import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/db/mongodb';
import Document from '@/models/Document';
import Case from '@/models/Case';
import { uploadBufferToCloudinary } from '@/lib/cloudinary/upload';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const caseId = formData.get('caseId') as string | null;
    const patientId = formData.get('patientId') as string | null;

    if (!file || !caseId || !patientId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload to Cloudinary
    const cloudinaryResponse = await uploadBufferToCloudinary(buffer, `sehatbridge/cases/${caseId}`);

    await connectToDatabase();

    const count = await Document.countDocuments();
    const documentId = `DOC-2026-${(count + 1).toString().padStart(6, '0')}`;

    let resourceType = 'OTHER';
    if (file.type.startsWith('image/')) resourceType = 'IMAGE';
    else if (file.type === 'application/pdf') resourceType = 'PDF';
    else if (file.type.startsWith('video/')) resourceType = 'VIDEO';

    // Save to Database
    const newDoc = await Document.create({
      documentId,
      caseId,
      patientId,
      cloudinaryPublicId: cloudinaryResponse.public_id,
      secureUrl: cloudinaryResponse.secure_url,
      resourceType,
      mimeType: file.type,
      fileName: file.name,
      fileSize: file.size,
      uploadedBy: userId,
    });

    // Attach to Case
    if (resourceType === 'IMAGE') {
      await Case.findByIdAndUpdate(caseId, { $push: { imageIds: newDoc._id } });
    } else {
      await Case.findByIdAndUpdate(caseId, { $push: { documentIds: newDoc._id } });
    }

    return NextResponse.json({ success: true, data: newDoc });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
