import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebase/admin'; // Ensure adminApp is initialized

adminApp(); // Initialize the admin app if not already initialized

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const db = getFirestore();
    let candidatesRef = db.collection('candidates')
      .orderBy('updatedAt', 'desc')
      .orderBy('createdAt', 'desc'); // Fallback order

    const snapshot = await candidatesRef.offset((page - 1) * limit).limit(limit).get();

    const candidates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }));

    // For simplicity, we are not calculating total pages orhasNext/hasPrev here
    // as the client will manage pagination state based on received items.

    return NextResponse.json({ candidates });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}
