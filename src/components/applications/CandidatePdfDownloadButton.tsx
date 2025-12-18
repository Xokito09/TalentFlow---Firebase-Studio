"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportCandidateProfilePdfByApplicationId } from "@/lib/pdf/export-candidate-profile-pdf";

interface CandidatePdfDownloadButtonProps {
  applicationId: string;
}

export const CandidatePdfDownloadButton: React.FC<CandidatePdfDownloadButtonProps> = ({ applicationId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      await exportCandidateProfilePdfByApplicationId(applicationId);
      toast({
        title: "Success!",
        description: "Candidate profile PDF has been downloaded.",
      });
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while exporting the PDF.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleDownload} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="mr-2 h-4 w-4" />
      )}
      {isLoading ? 'Generating...' : 'Download PDF'}
    </Button>
  );
};
