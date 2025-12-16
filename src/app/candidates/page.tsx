import { getFirestore } from 'firebase-admin/firestore';
import '@/lib/firebase/admin'; // Initialize Firebase Admin SDK
import { Candidate } from '@/lib/types';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import CandidatesListClient from "@/components/candidates/candidates-list-client";

const ITEMS_PER_PAGE = 10;

async function getCandidates(page: number = 1, limit: number = ITEMS_PER_PAGE): Promise<{ candidates: Candidate[], totalPages: number }> {
  try {
    const db = getFirestore();
    let candidatesRef = db.collection('candidates')
      .orderBy('updatedAt', 'desc')
      .orderBy('createdAt', 'desc');
    
    const totalCandidatesSnapshot = await candidatesRef.count().get();
    const totalItems = totalCandidatesSnapshot.data().count;
    const totalPages = Math.ceil(totalItems / limit);

    const snapshot = await candidatesRef.offset((page - 1) * limit).limit(limit).get();

    const candidates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    })) as Candidate[];

    return { candidates, totalPages };
  } catch (error) {
    console.error('Error fetching candidates for server render:', error);
    return { candidates: [], totalPages: 0 };
  }
}

export default async function CandidatesPage() {
  const { candidates, totalPages } = await getCandidates(1, ITEMS_PER_PAGE);

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader
          title="Candidates"
          description="Manage your talent pool and candidate information."
        />
        <Button>
          <PlusCircle className="mr-2" />
          Add Candidate
        </Button>
      </div>
      <CandidatesListClient
        initialCandidates={candidates}
        initialTotalPages={totalPages}
        initialCurrentPage={1}
      />
    </>
  );
}
