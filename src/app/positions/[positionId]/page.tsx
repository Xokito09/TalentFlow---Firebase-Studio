import PipelineBoard from '@/components/positions/pipeline-board';
import { notFound } from 'next/navigation';
import { getPositionById } from '@/lib/repositories/positions';
import { getClientById } from '@/lib/repositories/clients';
import { getApplicationsByPositionId } from '@/lib/repositories/applications';
import { getCandidatesByIds } from '@/lib/repositories/candidates';
import { serializePlain } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import PositionHeaderActions from '@/components/positions/PositionHeaderActions';

type PositionDetailPageProps = {
  params: {
    positionId: string;
  };
};

export default async function PositionDetailPage({
  params,
}: {
  params: Promise<PositionDetailPageProps['params']>;
}) {
  const { positionId } = await params;

  const position = await getPositionById(positionId);
  if (!position) {
    notFound();
  }

  // Fetch all data in the server component
  const client = position.clientId
    ? await getClientById(position.clientId)
    : null;
  const applications = await getApplicationsByPositionId(positionId);
  const candidateIds = [...new Set(applications.map((app) => app.candidateId))];
  const candidates =
    candidateIds.length > 0 ? await getCandidatesByIds(candidateIds) : [];

  const applicationsPlain = serializePlain(applications);
  const candidatesPlain = serializePlain(candidates);

  // Create a map for easy lookup
  const candidatesById = new Map(
    candidatesPlain.map((candidate) => [candidate.id, candidate])
  );

  const applicationsWithCandidates = applicationsPlain
    .map((app) => ({
      ...app,
      candidate: candidatesById.get(app.candidateId),
    }))
    .filter((app) => !!app.candidate); // Ensure we don't pass applications with missing candidates

  return (
    <>
      <PageHeader
        title={position.title}
        description={client?.name || 'Internal Position'}
      >
        <PositionHeaderActions position={serializePlain(position)} />
      </PageHeader>
      <div className="p-4 sm:p-6 lg:p-8">
        <PipelineBoard
          applications={applicationsWithCandidates}
          position={serializePlain(position)}
        />
      </div>
    </>
  );
}
