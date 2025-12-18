"use client";
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { getApplicationDataForPdf } from '@/lib/repositories/applications';
import { CandidateProfileDocument } from './candidate-profile-document';
import { fetchImageAsDataUrl, serializePlain } from '@/lib/utils';
import { CandidateProfilePdfData } from '@/lib/types';

export const exportCandidateProfilePdfByApplicationId = async (applicationId: string) => {
  try {
    const applicationData = await getApplicationDataForPdf(applicationId);
    if (!applicationData) {
      throw new Error('Application data not found');
    }

    const plainApplicationData = serializePlain(applicationData);
    const { application, candidate, position } = plainApplicationData;

    let photoDataUrl = null;
    if (candidate.photoUrl) {
      try {
        photoDataUrl = await fetchImageAsDataUrl(candidate.photoUrl);
      } catch (error) {
        console.warn(
          `Failed to fetch candidate photo from ${candidate.photoUrl}. Proceeding without it.`,
          error
        );
      }
    }

    const pdfData: CandidateProfilePdfData = {
      name: candidate.fullName,
      title: application.appliedRoleTitle || candidate.currentTitle,
      email: candidate.email,
      phone: candidate.phone,
      linkedin: candidate.linkedinUrl,
      projectRole: position.title,
      compensation: application.appliedCompensation,
      academicBackground: candidate.academicBackground,
      languages: candidate.languages,
      professionalBackground:
        application.professionalBackgroundAtApply || candidate.professionalBackground,
      mainProjects: application.mainProjectsAtApply || candidate.mainProjects,
      skills: candidate.hardSkills,
      photoDataUrl: photoDataUrl,
    };

    const doc = <CandidateProfileDocument candidate={pdfData} />;
    const blob = await pdf(doc).toBlob();
    const safeName = candidate.fullName ? candidate.fullName.replace(/\s/g, '_') : 'candidate';
    saveAs(blob, `candidate-profile-${safeName}.pdf`);
  } catch (error) {
    console.error('Failed to export candidate PDF:', error);
    throw new Error('An unexpected error occurred while exporting the PDF.');
  }
};
