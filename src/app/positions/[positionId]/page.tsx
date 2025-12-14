"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Plus, ChevronDown, Settings, FileText, MapPin, Wallet } from 'lucide-react';
import { Application, PipelineStageKey, Position as PositionType, Candidate } from '@/lib/types';
import * as positionsRepository from '@/lib/repositories/positions';
import * as candidateRepository from '@/lib/repositories/candidates';
import { formatFirestoreDate } from '@/lib/utils';

const AddCandidateModal = dynamic(() => import('@/components/positions/add-candidate-modal'), {
  loading: () => <p>Loading...</p>,
  ssr: false
});

const POSITION_STATUS_CONFIG: { [key: string]: { label: string; className: string; dotClassName: string } } = {
  open: { label: "OPEN", className: "bg-green-100 text-green-700", dotClassName: "bg-green-500" },
  onhold: { label: "ON HOLD", className: "bg-blue-100 text-blue-700", dotClassName: "bg-blue-500" },
  closed: { label: "CLOSED", className: "bg-gray-100 text-gray-700", dotClassName: "bg-gray-500" },
};

interface CandidateCardProps {
  application: Application;
  candidate: Candidate | null;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ application, candidate }) => {
  const router = useRouter();
  const params = useParams();
  const positionId = params.positionId as string;

  const candidateName = candidate?.fullName || application.candidateSnapshot?.fullName || "Unknown candidate";
  const candidateTitle = candidate?.currentTitle || application.candidateSnapshot?.currentTitle || "";

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
          <p className="mt-1 text-xs text-slate-400">
            {formatFirestoreDate(application.appliedDate)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const PositionDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const positionId = params.positionId as string;

  const {
    clients,
    clientsInitialized,
    loadClients,
    positions,
    positionsInitialized,
    loadPositions,
    loadPositionsForClient,
    applicationsByPosition,
    loadApplicationsForPosition,
    updatePositionInStore,
  } = useAppStore();

  const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<PositionType | null>(null);
  const [loadingPosition, setLoadingPosition] = useState(true);
  const [candidates, setCandidates] = useState<Map<string, Candidate>>(new Map());

  useEffect(() => {
    const fetchPositionData = async () => {
      setLoadingPosition(true);
      let foundPosition: PositionType | undefined = positions.find(p => p.id === positionId);

      if (!foundPosition) {
        foundPosition = await positionsRepository.getPositionById(positionId);
        if (foundPosition) {
          updatePositionInStore(foundPosition);
        }
      }
      setCurrentPosition(foundPosition || null);
      setLoadingPosition(false);
    };

    fetchPositionData();
  }, [positionId, positions, updatePositionInStore]);

  useEffect(() => {
    if (!clientsInitialized) loadClients();
    if (!positionsInitialized) loadPositions();
  }, [clientsInitialized, loadClients, positionsInitialized, loadPositions]);

  useEffect(() => {
    if (currentPosition && clientsInitialized) {
      const client = clients.find(c => c.id === currentPosition.clientId);
      if (client) {
        loadPositionsForClient(client.id);
      }
    }
  }, [currentPosition, clientsInitialized, clients, loadPositionsForClient]);

  useEffect(() => {
    if (currentPosition) {
      loadApplicationsForPosition(positionId);
    }
  }, [currentPosition, positionId, loadApplicationsForPosition]);

  useEffect(() => {
    const fetchCandidates = async () => {
      const apps = applicationsByPosition[positionId];
      if (!apps) return;

      const candidateIds = apps.map(app => app.candidateId).filter(id => id && !candidates.has(id));
      if (candidateIds.length === 0) return;

      const uniqueCandidateIds = [...new Set(candidateIds)];
      const fetchedCandidates = await Promise.all(uniqueCandidateIds.map(id => candidateRepository.getCandidateById(id)));

      setCandidates(prev => {
        const newCandidates = new Map(prev);
        fetchedCandidates.forEach(c => {
          if (c) newCandidates.set(c.id, c);
        });
        return newCandidates;
      });
    };

    fetchCandidates();
  }, [applicationsByPosition, positionId, candidates]);


  if (loadingPosition) {
    return <div className="p-8 text-center">Loading position...</div>;
  }

  if (!currentPosition) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8 bg-slate-50 min-h-screen">
        <Link href="/positions" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Positions</span>
        </Link>
        <div className="p-8 text-center">
          <p className="mb-4">Position not found</p>
          <Button onClick={() => router.push("/positions")}>Go back to Positions</Button>
        </div>
      </div>
    );
  }

  const client = clients.find(c => c.id === currentPosition.clientId);
  const statusConfig = POSITION_STATUS_CONFIG[currentPosition.status.toLowerCase()] || POSITION_STATUS_CONFIG.open;

  const handleUpdatePositionStatus = (newStatus: string) => {
    updatePositionInStore({ ...currentPosition, status: newStatus as PositionType['status'] });
  };

  const mapLegacyStatusToStageKey = (status: string): PipelineStageKey | undefined => {
    const mapping: { [key: string]: PipelineStageKey } = {
      "Sourced": 'shortlisted',
      "Screening": 'shortlisted',
      "Interview": 'client_interview_1',
      "Hired": 'hired',
    };
    return mapping[status];
  };

  const groupedApplications: { [key in PipelineStageKey]: Application[] } = {
    shortlisted: [],
    client_interview_1: [],
    client_interview_2: [],
    hired: [],
  };

  const cleanApplications = (applicationsByPosition[positionId] || []).filter(Boolean);

  cleanApplications.forEach((app) => {
    if (!app) return;
    let stageKey: PipelineStageKey | undefined = app.stageKey;
    if (!stageKey && app.status) {
      stageKey = mapLegacyStatusToStageKey(app.status);
    }
    if (stageKey && groupedApplications[stageKey]) {
      groupedApplications[stageKey].push(app);
    }
  });

  const kanbanColumns: { title: string; stageKey: PipelineStageKey }[] = [
    { title: "SHORTLISTED", stageKey: "shortlisted" },
    { title: "CLIENT INTERVIEW 1", stageKey: "client_interview_1" },
    { title: "CLIENT INTERVIEW 2", stageKey: "client_interview_2" },
    { title: "HIRED", stageKey: "hired" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-8 bg-slate-50 min-h-screen">
      <Link href={client ? `/clients/${client.id}` : "/clients"} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to {client ? client.name : "Clients"}</span>
      </Link>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{currentPosition.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            {client && (
                <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {currentPosition.location || client.location}
                </span>
            )}
            <span className="text-slate-400">&bull;</span>
            <span className="flex items-center gap-1 text-green-600 font-medium">
              <Wallet className="h-4 w-4" />
              {/* Add salary info if available */}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className={`h-8 rounded-full text-xs font-medium flex items-center gap-2 ${statusConfig.className}`}>
                <span className={`w-2 h-2 rounded-full ${statusConfig.dotClassName}`}></span>
                {statusConfig.label}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.keys(POSITION_STATUS_CONFIG).map((statusKey) => {
                const config = POSITION_STATUS_CONFIG[statusKey];
                return (
                  <DropdownMenuItem key={statusKey} onClick={() => handleUpdatePositionStatus(statusKey)}>
                    <span className={`w-2 h-2 rounded-full ${config.dotClassName} mr-2`}></span>
                    {config.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" className="h-8 text-sm px-3">
            <Settings className="h-4 w-4 mr-2" />
            Funnel settings
          </Button>
          <Button variant="secondary" className="h-8 text-sm px-3" disabled>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF report
          </Button>
          <Button onClick={() => setIsAddCandidateModalOpen(true)} className="h-8 text-sm px-3 bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add candidate
          </Button>
        </div>
      </div>

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
                    <CandidateCard key={app.id} application={app} candidate={candidates.get(app.candidateId) || null} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {isAddCandidateModalOpen && (
        <AddCandidateModal
          isOpen={isAddCandidateModalOpen}
          onClose={() => setIsAddCandidateModalOpen(false)}
          clientId={client?.id || ''}
          positionId={positionId}
        />
      )}
    </div>
  );
};

export default PositionDetailPage;
