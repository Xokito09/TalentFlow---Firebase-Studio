import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ProspectsHeader() {
  return (
    <PageHeader 
      title="Prospects Pipeline"
      description="Track candidates through your recruitment process."
    >
      <Button>
        <PlusCircle className="mr-2" />
        Add Prospect
      </Button>
    </PageHeader>
  );
}
