'use server';

import { db, getBucket } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

async function uploadAndGetDownloadUrl(file: File, filePath: string): Promise<string> {
  const bucket = getBucket();
  const fileRef = bucket.file(filePath);
  const buffer = Buffer.from(await file.arrayBuffer());

  const downloadToken = randomUUID();

  await fileRef.save(buffer, {
    metadata: {
      contentType: file.type,
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
  });

  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${downloadToken}`;
  return publicUrl;
}

export async function uploadCandidatePhoto(candidateId: string, formData: FormData) {
  if (!candidateId) {
    throw new Error('uploadCandidatePhoto failed: candidateId is empty.');
  }

  const pdfFile = formData.get('pdfImage') as File | null;
  const thumbnailFile = formData.get('thumbnailImage') as File | null;

  if (!pdfFile || !thumbnailFile) {
    const missingKeys = [];
    if (!pdfFile) missingKeys.push('pdfImage');
    if (!thumbnailFile) missingKeys.push('thumbnailImage');
    throw new Error(`Missing required files: ${missingKeys.join(', ')}`);
  }

  // Enforce server-side size check just in case
  if (pdfFile.size > 5 * 1024 * 1024 || thumbnailFile.size > 5 * 1024 * 1024) {
    throw new Error('File size exceeds the 5MB limit.');
  }

  const photoFilePath = `candidate_photos/${candidateId}/photo.jpg`;
  const thumbFilePath = `candidate_photos/${candidateId}/thumb.jpg`;

  try {
    const [photoUrl, photoThumbUrl] = await Promise.all([
      uploadAndGetDownloadUrl(pdfFile, photoFilePath),
      uploadAndGetDownloadUrl(thumbnailFile, thumbFilePath),
    ]);

    await db.collection('candidates').doc(candidateId).update({
      photoUrl,
      photoThumbUrl,
      updatedAt: Timestamp.now(),
    });

    return { photoUrl, photoThumbUrl };
  } catch (error: any) {
    console.error(
      `Failed to process photo upload for candidate ${candidateId}:`,
      error
    );
    throw new Error(
      `Failed to process photo upload for candidate ${candidateId}: ${error.message}`
    );
  }
}
