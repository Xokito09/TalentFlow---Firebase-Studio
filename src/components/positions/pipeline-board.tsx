"use client";
import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Application as ApplicationType, PipelineStageKey, Candidate } from '@/lib/types';
import { formatFirestoreDate } from '@/lib/utils';

// ... existing code ...
interface Application extends Omit<ApplicationType, 'appliedDate'> {
  appliedDate: string | null;
}
interface CandidateCardProps {
  application: Application;
  candidate: Candidate | null;
  positionId: string;
}
const CandidateCard: React.FC<CandidateCardProps> = ({ application, candidate, positionId }) => {
  const router = useRouter();

  const candidateName = candidate?.fullName || application.candidateSnapshot?.fullName || "Unknown candidate";
  const candidateTitle = candidate?.currentTitle || application.candidateSnapshot?.currentTitle || "";

  const appliedDateFormatted = formatFirestoreDate(application.appliedDate);

  return (
    <Card
      className="rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/applications/${application.id}?from=position&positionId=${positionId}`)}
    >
      <CardContent className="p-4 flex items-center gap-3">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-medium">
          {candidateName ? candidateName.charAt(0).toUpperCase() : 'N/A'}
        </div>
        <div className="flex-grow">
          <p className="text-sm font-medium text-slate-900">{candidateName}</p>
          {candidateTitle && <p className="text-xs text-slate-500">{candidateTitle}</p>}
          {appliedDateFormatted && (
             <p className="mt-1 text-xs text-slate-400">
                {appliedDateFormatted}
             </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
interface PipelineBoardProps {
    positionId: string;
    applications: Application[]; // Use the overridden Application type
    candidates: Candidate[];
}
const mapLegacyStatusToStageKey = (status: string): PipelineStageKey | undefined => {
    const mapping: { [key: string]: PipelineStageKey } = {
      "Sourced": 'shortlisted',
      "Screening": 'shortlisted',
      "Interview": 'client_interview_1',
      "Hired": 'hired',
    };
    return mapping[status];
};
const PipelineBoard: React.FC<PipelineBoardProps> = ({ positionId, applications, candidates }) => {
    const candidatesMap = useMemo(() => {
        const map = new Map<string, Candidate>();
        candidates.forEach(c => map.set(c.id, c));
        return map;
    }, [candidates]);
    const groupedApplications = useMemo(() => {
        const groups: { [key in PipelineStageKey]: Application[] } = {
            shortlisted: [],
            client_interview_1: [],
            client_interview_2: [],
            hired: [],
        };
        applications.forEach((app) => {
            if (!app) return;
            let stageKey: PipelineStageKey | undefined = app.stageKey;
            if (!stageKey && app.status) {
              stageKey = mapLegacyStatusToStageKey(app.status);
            }
            if (stageKey && groups[stageKey]) {
                groups[stageKey].push(app);
            }
          });
        return groups;
      }, [applications]);
    
      const kanbanColumns: { title: string; stageKey: PipelineStageKey }[] = [
        { title: "SHORTLISTED", stageKey: "shortlisted" },
        { title: "CLIENT INTERVIEW 1", stageKey: "client_interview_1" },
        { title: "CLIENT INTERVIEW 2", stageKey: "client_interview_2" },
        { title: "HIRED", stageKey: "hired" },
      ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {kanbanColumns.map((column) => (
          <Card key={column.title} className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col min-h-[300px]">
            <CardHeader className="px-4 py-3 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-semibold text-slate-700 tracking-wide uppercase">
                  {column.title}
                </CardTitle>
                <Badge variant="secondary" className="h-5 px-2 text-xs">
                  {groupedApplications[column.stageKey]?.length || 0}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {groupedApplications[column.stageKey]?.length || 0} Active
              </p>
            </CardHeader>
            <CardContent className="flex-grow p-4">
              {groupedApplications[column.stageKey]?.length === 0 ? (
                <div className="border-dashed border-2 border-slate-300 rounded-lg text-slate-400 text-sm text-center py-8 flex items-center justify-center h-full">
                  No candidates
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {groupedApplications[column.stageKey].map((app) => (
                    <CandidateCard 
                        key={app.id} 
                        application={app} 
                        candidate={candidatesMap.get(app.candidateId) || null}
                        positionId={positionId}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
};

export { PipelineBoard };
export default PipelineBoard;
