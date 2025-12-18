import { notFound } from 'next/navigation';
import CandidateReportPage from '@/components/applications/candidate-report-page';
import * as applicationsRepository from '@/lib/repositories/applications';
import * as candidatesRepository from '@/lib/repositories/candidates';
import * as positionsRepository from '@/lib/repositories/positions';
import * as clientsRepository from '@/lib/repositories/clients';
import { serializePlain } from '@/lib/utils';
import { CandidatePdfDownloadButton } from '@/components/applications/CandidatePdfDownloadButton';

type ApplicationDetailPageProps = {
  params: { applicationId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

const ApplicationCvPage = async (props: {
  params: Promise<ApplicationDetailPageProps['params']>;
  searchParams: Promise<ApplicationDetailPageProps['searchParams']>;
}) => {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { applicationId } = params;
  const {
    from,
    positionId: fromPositionId,
    candidateId: fromCandidateId,
  } = searchParams;

  const applicationData =
    await applicationsRepository.getApplicationById(applicationId);
  if (!applicationData) {
    notFound();
  }

  const [candidate, position] = await Promise.all([
    candidatesRepository.getCandidateById(applicationData.candidateId),
    positionsRepository.getPositionById(applicationData.positionId),
  ]);

  if (!candidate || !position) {
    notFound();
  }

  const client = position.clientId
    ? await clientsRepository.getClientById(position.clientId)
    : null;

  const applicationPlain = serializePlain(applicationData);
  const candidatePlain = serializePlain(candidate);
  const positionPlain = serializePlain(position);
  const clientPlain = serializePlain(client);

  const candidateReportProps = {
    name: candidatePlain.fullName,
    role: applicationPlain.appliedRoleTitle || candidatePlain.currentTitle || '',
    email: candidatePlain.email,
    linkedin: candidatePlain.linkedinUrl,
    compensation: applicationPlain.appliedCompensation,
    projectRole: positionPlain.title,
    academicBackground: candidatePlain.academicBackground?.join(', '),
    languages: candidatePlain.languages,
    professionalBackground:
      applicationPlain.professionalBackgroundAtApply ||
      candidatePlain.professionalBackground,
    mainProjects:
      applicationPlain.mainProjectsAtApply || candidatePlain.mainProjects,
    hardSkills: candidatePlain.hardSkills,
    phone: candidatePlain.phone,
    candidateId: candidatePlain.id,
    applicationId: applicationId,
    from: from as string,
    fromPositionId: fromPositionId as string,
    fromCandidateId: fromCandidateId as string,
  };

  return (
    <div>
      <div className="mx-auto max-w-4xl p-4 sm:p-8 print:hidden">
        <CandidatePdfDownloadButton applicationId={applicationId} />
      </div>
      <CandidateReportPage {...candidateReportProps} />
    </div>
  );
};

export default ApplicationCvPage;
