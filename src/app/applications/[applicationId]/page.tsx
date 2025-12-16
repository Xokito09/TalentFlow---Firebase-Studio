
import CandidateReportPage from '@/components/applications/candidate-report-page';
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { Application, Candidate, Position, Client } from '@/lib/types';

type ApplicationDetailPageProps = {
  params: { applicationId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

const ApplicationCvPage = async ({ params, searchParams }: ApplicationDetailPageProps) => {
  const applicationId = params.applicationId;
  const from = searchParams.from as string;
  const fromPositionId = searchParams.positionId as string;
  const fromCandidateId = searchParams.candidateId as string;

  let application: Application | null = null;
  let candidate: Candidate | null = null;
  let position: Position | null = null;
  let client: Client | null = null;
  let error: string | null = null;

  try {
    // Assuming fetch works with an absolute URL in a server component environment
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/applications/${applicationId}/detail`);

    if (!response.ok) {
      error = response.status === 404 ? "Application not found." : "Failed to load application data.";
    } else {
      const data = await response.json();
      application = data.application;
      candidate = data.candidate;
      position = data.position;
      client = data.client;

      if (!application || !candidate || !position) {
        error = "Incomplete data received from API.";
      }
    }
  } catch (e) {
    console.error(e);
    error = "Failed to load application data due to a network error.";
  }


  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  if (!application || !candidate || !position) {
    return <div className="p-8 text-center">Loading or incomplete data...</div>;
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
    candidateId: candidate.id,
    applicationId: applicationId,
    from,
    fromPositionId,
    fromCandidateId,
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto p-4 sm:p-8 print:hidden">
      <Button
          onClick={async () => {
            "use server";
            const { exportCandidateProfilePdfByApplicationId } = await import('@/lib/pdf/export-candidate-profile-pdf');
            await exportCandidateProfilePdfByApplicationId(applicationId);
          }}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
      <CandidateReportPage {...candidateReportProps} />
    </div>
  );
};

export default ApplicationCvPage;
