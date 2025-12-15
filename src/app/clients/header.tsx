import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface ClientsHeaderProps {
  openNewClientModal: () => void;
}

export default function ClientsHeader({
  openNewClientModal,
}: ClientsHeaderProps) {
  return (
    <PageHeader 
      title="Clients"
      description="Manage your active client portfolio and key accounts"
    >
        <Button onClick={openNewClientModal}>
          <PlusCircle className="mr-2" />
          New Client
        </Button>
    </PageHeader>
  );
}
