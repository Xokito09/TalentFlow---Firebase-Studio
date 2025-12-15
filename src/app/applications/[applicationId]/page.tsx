"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Application, Candidate, Position } from '@/lib/types';
import * as applicationsRepository from '@/lib/repositories/applications';
import * as candidatesRepository from '@/lib/repositories/candidates';
import * as positionsRepository from '@/lib/repositories/positions';
import CandidateReportPage from '@/components/applications/candidate-report-page';
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

const ApplicationCvPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = params.applicationId as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const from = searchParams.get("from");
  const fromPositionId = searchParams.get("positionId");
  const fromCandidateId = searchParams.get("candidateId");
  const shouldPrint = searchParams.get("print") === "true";

  useEffect(() => {
    const fetchData = async () => {
      if (!applicationId) return;
      setLoading(true);
      try {
        const app = await applicationsRepository.getApplicationById(applicationId);
        if (app) {
          setApplication(app);
          const [cand, pos] = await Promise.all([
            candidatesRepository.getCandidateById(app.candidateId),
            positionsRepository.getPositionById(app.positionId),
          ]);
          setCandidate(cand);
          setPosition(pos);
        } else {
          setError("Application not found.");
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load application data.");
      }
      setLoading(false);
    };
    fetchData();
  }, [applicationId]);

  useEffect(() => {
    if (shouldPrint && !loading && !error) {
      setTimeout(() => window.print(), 500); // Delay to allow rendering
    }
  }, [shouldPrint, loading, error]);

  const handleBack = () => {
    if (from === "position" && fromPositionId) {
      router.push(`/positions/${fromPositionId}`);
    } else if (from === "candidate" && fromCandidateId) {
      router.push(`/candidates/${fromCandidateId}`);
    } else {
      router.back();
    }
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const backButtonLabel = useMemo(() => {
    if (from === "position") {
      return "Back to Position";
    } else if (from === "candidate") {
      return "Back to Candidate Profile";
    } else {
      return "Back";
    }
  }, [from]);

  if (loading) {
    return <div className="p-8 text-center">Loading application...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  if (!application || !candidate || !position) {
    return <div className="p-8 text-center">Incomplete data.</div>;
  }

  const candidateReportProps = {
    name: candidate.fullName,
    role: application.appliedRoleTitle || candidate.currentTitle || '',
    email: candidate.email,
    linkedin: candidate.linkedinUrl,
    compensation: application.appliedCompensation,
    projectRole: position.title,
    academicBackground: candidate.academicBackground?.join(', '),
    languages: candidate.languages,
    professionalBackground: application.professionalBackgroundAtApply || candidate.professionalBackground,
    mainProjects: application.mainProjectsAtApply || candidate.mainProjects,
    hardSkills: candidate.hardSkills,
    phone: candidate.phone,
    onBack: handleBack,
    backButtonLabel: backButtonLabel,
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto p-4 sm:p-8 print:hidden">
        <Button onClick={handleDownloadPdf}>
          <FileDown className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
      <CandidateReportPage {...candidateReportProps} />
    </div>
  );
};

export default ApplicationCvPage;
