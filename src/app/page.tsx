import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ProspectBoard } from "@/components/prospects/prospect-board";
import { applications, candidates, positions, clients, pipelineStatuses } from "@/lib/data";

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
      <PageHeader 
        title="Prospects Pipeline"
        description="Track candidates through your recruitment process."
      >
        <Button>
          <PlusCircle className="mr-2" />
          Add Prospect
        </Button>
      </PageHeader>
      <ProspectBoard applications={enrichedApplications} statuses={pipelineStatuses} />
    </>
  );
}
