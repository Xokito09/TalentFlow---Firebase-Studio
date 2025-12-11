import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface ClientsHeaderProps {
  activeTab: 'partner' | 'prospect';
  openNewClientModal: () => void;
}

export default function ClientsHeader({
  activeTab,
  openNewClientModal,
}: ClientsHeaderProps) {
  const title = activeTab === "partner" ? "Clients" : "Prospects";
  const description = activeTab === "partner"
    ? "Manage your active client portfolio and key accounts"
    : "Track potential opportunities and sales pipeline";
  const buttonText = activeTab === "partner" ? "New Client" : "New Prospect";

  return (
    <PageHeader 
      title={title}
      description={description}
    >
        <Button onClick={openNewClientModal}>
          <PlusCircle className="mr-2" />
          {buttonText}
        </Button>
    </PageHeader>
  );
}
