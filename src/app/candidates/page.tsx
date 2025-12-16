import '@/lib/firebase/admin'; // Initialize Firebase Admin SDK
import { type WithId, type Candidate } from '@/lib/types';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import CandidatesListClient from "@/components/candidates/candidates-list-client";
import { getPaginatedCandidates } from '@/lib/repositories/candidates';

const CANDIDATES_LIMIT = 10;

async function getInitialCandidates() {
  try {
    const { candidates, nextCursor } = await getPaginatedCandidates({ limit: CANDIDATES_LIMIT });
    
    // Convert Timestamps to ISO strings for client component serialization if needed
    const serializableCandidates = candidates.map(c => ({
      ...c,
      createdAt: c.createdAt?.toDate().toISOString(),
      updatedAt: c.updatedAt?.toDate().toISOString(),
    })) as WithId<Candidate>[];

    return { candidates: serializableCandidates, nextCursor };
  } catch (error) {
    console.error('Error fetching initial candidates for server render:', error);
    return { candidates: [], nextCursor: undefined };
  }
}

export default async function CandidatesPage() {
  const { candidates, nextCursor } = await getInitialCandidates();

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
        initialNextCursor={nextCursor}
      />
    </>
  );
}
