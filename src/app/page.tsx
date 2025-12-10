import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ProspectBoard } from "@/components/prospects/prospect-board";
import { applications, candidates, positions, clients, pipelineStatuses } from "@/lib/data";
import ProspectsHeader from "./prospects/header"; // Import the new server component for the header

export default function ProspectsPage() {
  // Enhance applications with full candidate, position, and client details
  const enrichedApplications = applications.map(app => {
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

  return (
    <>
      <ProspectsHeader /> {/* Use the new server component for the header */}
      <ProspectBoard applications={enrichedApplications} statuses={pipelineStatuses} />
    </>
  );
}
