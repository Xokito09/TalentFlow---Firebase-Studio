import '@/lib/firebase/admin'; // Initialize Firebase Admin SDK
import { getPaginatedCandidates } from '@/lib/repositories/candidates';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import CandidatesListClient from "@/components/candidates/candidates-list-client";
import { serializePlain } from '@/lib/utils';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CANDIDATES_LIMIT = 10;

async function getInitialData() {
  try {
    const { candidates } = await getPaginatedCandidates({ limit: CANDIDATES_LIMIT });
    
    // For pagination, we need a total count.
    const totalCandidatesSnapshot = await getDocs(collection(db, 'candidates'));
    const totalCandidates = totalCandidatesSnapshot.size;
    const totalPages = Math.ceil(totalCandidates / CANDIDATES_LIMIT);
    
    return { candidates, totalPages, currentPage: 1 };
  } catch (error) {
    console.error('Error fetching initial candidates for server render:', error);
    return { candidates: [], totalPages: 1, currentPage: 1 };
  }
}

export default async function CandidatesPage() {
  const { candidates, totalPages, currentPage } = await getInitialData();
  const candidatesPlain = serializePlain(candidates);

  return (
    <>
      <PageHeader
        title="Candidates"
        description="Manage your talent pool and candidate information."
      >
        <Button>
          <PlusCircle className="mr-2" />
          Add Candidate
        </Button>
      </PageHeader>
      <CandidatesListClient
        initialCandidates={candidatesPlain}
        initialTotalPages={totalPages}
        initialCurrentPage={currentPage}
      />
    </>
  );
}
