import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface ProspectsHeaderProps {
  openNewProspectModal: () => void;
}

export default function ProspectsHeader({ openNewProspectModal }: ProspectsHeaderProps) {
  return (
    <PageHeader 
      title="Prospects Pipeline"
      description="Track candidates through your recruitment process."
    >
      <Button onClick={openNewProspectModal}>
        <PlusCircle className="mr-2" />
        Add Prospect
      </Button>
    </PageHeader>
  );
}
