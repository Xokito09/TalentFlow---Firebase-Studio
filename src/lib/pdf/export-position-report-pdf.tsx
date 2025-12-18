"use client";
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { PositionReportDocument } from './position-report-document';
import { getPositionById } from '../repositories/positions';
import { getAllClients } from '../repositories/clients';
import { getApplicationsByPositionId } from '../repositories/applications';
import { getCandidateById } from '../repositories/candidates';
import { useAppStore } from '../store';
import { DEFAULT_FUNNEL_METRICS, PipelineStageKey, Application } from '../types';
import { fetchImageAsDataUrl } from '../utils';

export async function exportPositionReportPdfByPositionId(positionId: string) {
  try {
    const store = useAppStore.getState();
    
    let position = store.positions.find(p => p.id === positionId);
    if (!position) {
      position = await getPositionById(positionId);
      if (position) {
        store.addPosition(position);
      } else {
        throw new Error(`Position with id ${positionId} not found.`);
      }
    }
    
    let client = store.clients.find(c => c.id === position?.clientId);
    if (!client && position?.clientId) {
      const allClients = await getAllClients();
      store.setClients(allClients);
      client = allClients.find(c => c.id === position?.clientId);
    }
    
    const applications = await getApplicationsByPositionId(positionId);

    const funnelMetrics = applications.reduce((metrics, app) => {
      const stageKey = app.stageId as PipelineStageKey;
      if (metrics.hasOwnProperty(stageKey)) {
        metrics[stageKey]++;
      }
      return metrics;
    }, { ...DEFAULT_FUNNEL_METRICS });

    const relevantStages: PipelineStageKey[] = ['shortlist', 'firstInterview', 'secondInterview', 'offer', 'hired'];
    
    const filteredApps = applications
      .filter(app => {
        const stage = app.stageId as PipelineStageKey;
        return stage && relevantStages.includes(stage);
    });

    const stageOrder: { [key in PipelineStageKey]: number } = {
        'shortlist': 1,
        'firstInterview': 2,
        'secondInterview': 3,
        'offer': 4,
        'hired': 5,
        'new': 0,
        'archived': 6
    };

    filteredApps.sort((a, b) => {
        const orderA = stageOrder[a.stageId as PipelineStageKey] ?? 99;
        const orderB = stageOrder[b.stageId as PipelineStageKey] ?? 99;
        if (orderA !== orderB) return orderA - orderB;
        return 0;
    });
    
    const reportCandidates = await Promise.all(filteredApps.map(async (app) => {
        let candidateData = app.candidateSnapshot;
        
        if (!candidateData || Object.keys(candidateData).length === 0) {
             const fetched = await getCandidateById(app.candidateId);
             if (fetched) {
                 store.addCandidate(fetched);
                 candidateData = {
                     id: fetched.id,
                     fullName: fetched.name,
                     currentTitle: fetched.role,
                     email: fetched.email,
                     phone: fetched.phone,
                     linkedinUrl: fetched.linkedin,
                     photoUrl: fetched.photoURL,
                     compensation: fetched.compensation,
                     academicBackground: fetched.academicBackground,
                     languages: fetched.languages,
                     professionalBackground: fetched.professionalBackground,
                     mainProjects: fetched.mainProjects,
                     hardSkills: fetched.hardSkills,
                 };
             }
        }

        const photoDataUrl = await fetchImageAsDataUrl(candidateData?.photoUrl);

        return {
            id: app.id,
            name: candidateData?.fullName || "Unknown Candidate",
            role: app.appliedRoleTitle || candidateData?.currentTitle || "N/A",
            email: candidateData?.email || "N/A",
            phone: candidateData?.phone,
            linkedin: candidateData?.linkedinUrl,
            projectRole: position?.title || "N/A",
            compensation: app.appliedCompensation || candidateData?.compensation,
            academicBackground: candidateData?.academicBackground,
            languages: candidateData?.languages,
            professionalBackground: app.professionalBackgroundAtApply || candidateData?.professionalBackground,
            mainProjects: app.mainProjectsAtApply || candidateData?.mainProjects,
            hardSkills: candidateData?.hardSkills,
            photoDataUrl: photoDataUrl
        };
    }));

    const today = new Date();
    const reportDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

    const doc = (
        <PositionReportDocument
            clientName={client?.name || "N/A"}
            positionTitle={position?.title || "N/A"}
            reportDate={reportDate}
            funnelMetrics={funnelMetrics}
            candidates={reportCandidates}
        />
    );

    const blob = await pdf(doc).toBlob();
    saveAs(blob, `position_report_${position?.title.replace(/\s/g, '_')}.pdf`);
  } catch (error) {
    console.error("Failed to generate position report PDF:", error);
    throw new Error('An unexpected error occurred while generating the PDF report.');
  }
}
