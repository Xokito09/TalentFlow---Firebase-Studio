"use client";
import { ProspectBoard } from "@/components/prospects/prospect-board";
import { useAppStore } from '@/lib/store';
import { useMemo } from 'react';
import ProspectsHeader from "./prospects/header";
import { pipelineStatuses } from "@/lib/data";

export default function ProspectsPage() {
  const { candidates, positions, clients, applicationsByPosition } = useAppStore();

  const enrichedApplications = useMemo(() => {
    // Flatten applications from store
    const allApplications = Object.values(applicationsByPosition).flat();
    
    // De-duplicate applications if any
    const uniqueApplications = Array.from(new Map(allApplications.map(app => [app.id, app])).values());

    return uniqueApplications.map(app => {
      const candidate = candidates.find(c => c.id === app.candidateId);
      const position = positions.find(p => p.id === app.positionId);
      const client = position ? clients.find(cl => cl.id === position.clientId) : undefined;
      return {
        ...app,
        candidate,
        position,
        client,
      };
    }).filter(app => app.candidate && app.position && app.client);
  }, [applicationsByPosition, candidates, positions, clients]);

  return (
    <>
      <ProspectsHeader />
      <ProspectBoard applications={enrichedApplications} statuses={pipelineStatuses} />
    </>
  );
}
