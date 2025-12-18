import { getAllCandidates } from '@/lib/repositories/candidates';
import { getLatestApplicationByCandidateId } from '@/lib/repositories/applications';
import CandidatesListClient from '@/components/candidates/candidates-list-client';
import { PageHeader } from '@/components/page-header';
import { serializePlain } from '@/lib/utils';
import { notFound } from 'next/navigation';

export default async function CandidatesPage() {
  try {
    const candidates = await getAllCandidates();

    if (!candidates || candidates.length === 0) {
      // If you want to show a 404 when no candidates are found,
      // you could uncomment the following line:
      // notFound();
    }

    const applicationsPromises = candidates.map((candidate) =>
      getLatestApplicationByCandidateId(candidate.id)
    );
    const applications = await Promise.all(applicationsPromises);

    const candidatesWithApplications = candidates.map((candidate, index) => ({
      ...candidate,
      latestApplication: applications[index] || null,
    }));

    return (
      <>
        <PageHeader title="Candidates" />
        <div className="p-4 sm:p-6 lg:p-8">
          <CandidatesListClient
            candidates={serializePlain(candidatesWithApplications)}
          />
        </div>
      </>
    );
  } catch (err) {
    if ((err as any)?.digest?.includes('NEXT_NOT_FOUND')) {
      throw err;
    }
    console.error(
      'SERVER_ERROR src/app/candidates/page.tsx',
      err instanceof Error ? { message: err.message, stack: err.stack } : err
    );
    return (
      <div className="p-6 text-sm text-red-600">Server error. Check logs.</div>
    );
  }
}
