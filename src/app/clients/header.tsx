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
    <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          {title}
        </h1>
        <p className="text-slate-500 mt-1">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        <Button
          onClick={openNewClientModal}
          className="px-5 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" /> {buttonText}
        </Button>
      </div>
    </div>
  );
}
