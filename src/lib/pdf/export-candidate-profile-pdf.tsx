"use client";
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { getApplicationDataForPdf } from '@/lib/repositories/applications';
import { CandidateProfileDocument } from './candidate-profile-document';
import { fetchImageAsDataUrl, serializePlain } from '@/lib/utils';

export const exportCandidateProfilePdfByApplicationId = async (applicationId: string) => {
  try {
    const applicationData = await getApplicationDataForPdf(applicationId);
    if (!applicationData) {
      throw new Error('Application data not found');
    }

    const plainApplicationData = serializePlain(applicationData);
    const { candidate, position } = plainApplicationData;

    const photoDataUrl = candidate.photoURL ? await fetchImageAsDataUrl(candidate.photoURL) : null;

    const doc = (
      <CandidateProfileDocument
        name={candidate.name}
        role={candidate.role}
        email={candidate.email}
        phone={candidate.phone}
        linkedin={candidate.linkedin}
        projectRole={position.name} 
        compensation={candidate.compensation}
        academicBackground={candidate.academicBackground}
        languages={candidate.languages}
        professionalBackground={candidate.professionalBackground}
        mainProjects={candidate.mainProjects}
        hardSkills={candidate.hardSkills}
        photoDataUrl={photoDataUrl}
      />
    );

    const blob = await pdf(doc).toBlob();
    saveAs(blob, `candidate-profile-${candidate.name.replace(/\s/g, '_')}.pdf`);
  } catch (error) {
    console.error('Failed to export candidate PDF:', error);
    throw new Error('An unexpected error occurred while exporting the PDF.');
  }
};
