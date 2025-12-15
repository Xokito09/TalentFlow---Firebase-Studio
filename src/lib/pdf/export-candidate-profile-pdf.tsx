import React from 'react';
import { pdf, Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { CandidateProfileDocument } from './candidate-profile-document';
import * as applicationsRepository from '@/lib/repositories/applications';
import * as candidatesRepository from '@/lib/repositories/candidates';
import * as positionsRepository from '@/lib/repositories/positions';

const PDF_DEBUG_MINIMAL = false; // Set to false to test CandidateProfileDocument

export async function exportCandidateProfilePdfByApplicationId(applicationId: string): Promise<void> {
  try {
    if (PDF_DEBUG_MINIMAL) {
      const blob = await pdf(
        <Document>
          <Page size="A4">
            <Text>PDF OK</Text>
          </Page>
        </Document>
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `minimal_pdf_debug.pdf`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      return;
    }

    const application = await applicationsRepository.getApplicationById(applicationId);
    if (!application) {
      throw new Error("Application not found.");
    }
    
    const [candidate, position] = await Promise.all([
      candidatesRepository.getCandidateById(application.candidateId),
      positionsRepository.getPositionById(application.positionId),
    ]);
  
    if (!candidate || !position) {
      throw new Error("Candidate or Position not found for the application.");
    }
  
    const props = {
      name: candidate.fullName,
      role: application.appliedRoleTitle || candidate.currentTitle || '',
      email: candidate.email,
      linkedin: candidate.linkedinUrl,
      compensation: application.appliedCompensation,
      projectRole: position.title,
      academicBackground: Array.isArray(candidate.academicBackground) 
        ? candidate.academicBackground.join(', ') 
        : candidate.academicBackground,
      languages: candidate.languages,
      professionalBackground: application.professionalBackgroundAtApply || candidate.professionalBackground,
      mainProjects: application.mainProjectsAtApply || candidate.mainProjects,
      hardSkills: candidate.hardSkills,
      phone: candidate.phone,
      photoUrl: candidate.photoUrl,
    };
  
    const blob = await pdf(<CandidateProfileDocument {...props} />).toBlob();
  
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Candidate Profile ${candidate.fullName}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

  } catch (error) {
    console.error("Failed to export PDF:", error);
    alert("Could not export the PDF. Please check the console for details.");
  }
}
