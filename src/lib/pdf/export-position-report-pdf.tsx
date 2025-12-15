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

export async function exportPositionReportPdfByPositionId(positionId: string) {
  try {
    const store = useAppStore.getState();
    
    let position = store.positions.find(p => p.id === positionId);
    if (!position) {
      position = (await getPositionById(positionId)) || undefined;
    }
    if (!position) throw new Error("Position not found");

    let client = store.clients.find(c => c.id === position.clientId);
    if (!client) {
        const allClients = await getAllClients();
        client = allClients.find(c => c.id === position.clientId);
    }
    if (!client) throw new Error("Client not found");

    let applications = store.applicationsByPosition[positionId];
    if (!applications) {
      applications = await getApplicationsByPositionId(positionId);
    }

    const relevantStages: PipelineStageKey[] = ['shortlisted', 'client_interview_1', 'client_interview_2', 'hired'];
    const filteredApps = applications.filter(app => {
        let stage = app.stageKey;
        if (!stage && app.status) {
             const mapping: { [key: string]: PipelineStageKey } = {
                "Screening": 'shortlisted',
                "Interview": 'client_interview_1',
                "Hired": 'hired',
              };
              // @ts-ignore
              if (mapping[app.status]) stage = mapping[app.status];
        }
        return stage && relevantStages.includes(stage);
    });

    const stageOrder: { [key in PipelineStageKey]: number } = {
        'shortlisted': 1,
        'client_interview_1': 2,
        'client_interview_2': 3,
        'hired': 4
    };

    filteredApps.sort((a, b) => {
        const stageA = a.stageKey || (a.status === 'Hired' ? 'hired' : 'shortlisted');
        const stageB = b.stageKey || (b.status === 'Hired' ? 'hired' : 'shortlisted');
        // @ts-ignore
        const orderA = stageOrder[stageA] || 99;
        // @ts-ignore
        const orderB = stageOrder[stageB] || 99;

        if (orderA !== orderB) return orderA - orderB;
        return 0;
    });
    
    const reportCandidates = await Promise.all(filteredApps.map(async (app) => {
        let candidateData = app.candidateSnapshot;
        
        if (!candidateData || !candidateData.fullName) {
             const fetched = await getCandidateById(app.candidateId);
             if (fetched) {
                 candidateData = {
                     id: fetched.id,
                     fullName: fetched.fullName,
                     email: fetched.email,
                     phone: fetched.phone,
                     currentTitle: fetched.currentTitle,
                     linkedinUrl: fetched.linkedinUrl,
                     photoUrl: fetched.photoUrl,
                     hardSkills: fetched.hardSkills,
                     languages: fetched.languages,
                     academicBackground: fetched.academicBackground,
                     professionalBackground: fetched.professionalBackground,
                     mainProjects: fetched.mainProjects,
                 };
             }
        }

        return {
            id: app.id,
            name: candidateData?.fullName || "Unknown Candidate",
            role: app.appliedRoleTitle || candidateData?.currentTitle || "",
            email: candidateData?.email || "",
            phone: candidateData?.phone,
            linkedin: candidateData?.linkedinUrl,
            projectRole: position?.title || "",
            compensation: app.appliedCompensation,
            academicBackground: candidateData?.academicBackground,
            languages: candidateData?.languages,
            professionalBackground: app.professionalBackgroundAtApply || candidateData?.professionalBackground,
            mainProjects: app.mainProjectsAtApply || candidateData?.mainProjects,
            hardSkills: candidateData?.hardSkills,
            photoUrl: candidateData?.photoUrl
        };
    }));

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    const reportData = {
        clientName: client.name,
        positionTitle: position.title,
        reportDate: formattedDate,
        funnelMetrics: position.funnelMetrics || DEFAULT_FUNNEL_METRICS,
        candidates: reportCandidates
    };

    const blob = await pdf(<PositionReportDocument {...reportData} />).toBlob();

    const safeClientName = client.name.replace(/[^a-z0-9]/gi, '_');
    const safePositionTitle = position.title.replace(/[^a-z0-9]/gi, '_');
    const filename = `${safeClientName}_${safePositionTitle}_Full_Report.pdf`;
    
    saveAs(blob, filename);

  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}
