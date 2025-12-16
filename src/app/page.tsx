import { ProspectBoard } from "@/components/prospects/prospect-board";
import ProspectsHeader from "./prospects/header";
import { pipelineStatuses } from "@/lib/data";
import { getPaginatedProspects } from '@/lib/repositories/prospects';
import { getAllCandidates } from '@/lib/repositories/candidates';
import { getAllPositions } from '@/lib/repositories/positions';
import { getAllClients } from '@/lib/repositories/clients';
import { WithId, Application, Candidate, Position, Client } from '@/lib/types';

const PROSPECTS_LIMIT = 10;

async function getInitialProspects(cursor?: string) {
  const { prospects, nextCursor } = await getPaginatedProspects({ cursor, limit: PROSPECTS_LIMIT });
  const candidates = await getAllCandidates();
  const positions = await getAllPositions();
  const clients = await getAllClients();

  const enrichedApplications = prospects.map(app => {
    const candidate = candidates.find(c => c.id === app.candidateId);
    const position = positions.find(p => p.id === app.positionId);
    const client = position ? clients.find(cl => cl.id === position.clientId) : undefined;
    return {
      ...app,
      candidate,
      position,
      client,
    };
  }).filter(app => app.candidate && app.position && app.client) as (WithId<Application> & { candidate: WithId<Candidate>; position: WithId<Position>; client: WithId<Client> })[];

  return { enrichedApplications, nextCursor };
}

export default async function ProspectsPage() {
  const { enrichedApplications, nextCursor } = await getInitialProspects();

  return (
    <>
      <ProspectsHeader />
      <ProspectBoard initialApplications={enrichedApplications} initialNextCursor={nextCursor} statuses={pipelineStatuses} />
    </>
  );
}
