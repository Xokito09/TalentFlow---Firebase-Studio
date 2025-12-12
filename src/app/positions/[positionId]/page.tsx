"use client";
import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from "next/link";
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Plus, ChevronDown, Settings, FileText, MapPin, Wallet } from 'lucide-react';
import { Application, Candidate } from '@/lib/types'; // Assuming types are here

const POSITION_STATUS_CONFIG: { [key: string]: { label: string; className: string; dotClassName: string } } = {
  open: { label: "OPEN", className: "bg-green-100 text-green-700", dotClassName: "bg-green-500" },
  frozen: { label: "FROZEN", className: "bg-blue-100 text-blue-700", dotClassName: "bg-blue-500" },
  won: { label: "WON", className: "bg-purple-100 text-purple-700", dotClassName: "bg-purple-500" },
  lost: { label: "LOST", className: "bg-red-100 text-red-700", dotClassName: "bg-red-500" },
  closed: { label: "CLOSED", className: "bg-gray-100 text-gray-700", dotClassName: "bg-gray-500" },
};

interface CandidateCardProps {
  application: Application & { candidate: Candidate };
}

const CandidateCard: React.FC<CandidateCardProps> = ({ application }) => {
  const router = useRouter();
  const { candidate } = application;

  return (
    <Card
      className="rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/candidates/${candidate.id}`)}
    >
      <CardContent className="p-4 flex items-center gap-3">
        {/* Placeholder for candidate avatar/image */}
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-medium">
          {candidate.fullName ? candidate.fullName.charAt(0).toUpperCase() : 'N/A'}
        </div>
        <div className="flex-grow">
          <p className="text-sm font-medium text-slate-900">{candidate.fullName}</p>
          {candidate.currentTitle && <p className="text-xs text-slate-500">{candidate.currentTitle}</p>}
          {application.appliedDate && (
            <p className="mt-1 text-xs text-slate-400">
              {new Date(application.appliedDate).toLocaleDateString()}
            </p>
          )}
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
    positionsByClient,
    loadPositionsForClient,
    positions: mockPositions,
    applications,
    candidates,
  } = useAppStore();

  useEffect(() => {
    if (!clientsInitialized) {
      loadClients();
    }
  }, [clientsInitialized, loadClients]);

  const allPositions = Object.values(positionsByClient).flat().concat(mockPositions);
  const position = allPositions.find(p => p.id === positionId);

  const client = position ? clients.find(c => c.id === position.clientId) : undefined;

  useEffect(() => {
    if (client && !positionsByClient[client.id] && clientsInitialized) {
      loadPositionsForClient(client.id);
    }
  }, [client, clientsInitialized, positionsByClient, loadPositionsForClient]);

  if (!position) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">Position not found</p>
        <Button onClick={() => router.push("/clients")}>Go back to clients</Button>
      </div>
    );
  }

  const statusConfig =
    POSITION_STATUS_CONFIG[position.status.toLowerCase()] ||
    POSITION_STATUS_CONFIG.open;

  const handleAddCandidate = () => {
    console.log("Add candidate clicked");
  };

  // Derive position-specific candidates and group them
  const positionApplications = applications.filter(
    (app) => app.positionId === position?.id
  );

  const groupedApplications: { [key: string]: (Application & { candidate: Candidate })[] } = {
    shortlisted: [],
    client_interview_1: [],
    client_interview_2: [],
    hired: [],
  };

  positionApplications.forEach((app) => {
    const candidate = candidates.find((c) => c.id === app.candidateId);
    if (candidate) {
      const enrichedApp = { ...app, candidate };
      switch (app.status) {
        case "Screening":
        case "Sourced":
          groupedApplications.shortlisted.push(enrichedApp);
          break;
        case "Interview":
          groupedApplications.client_interview_1.push(enrichedApp);
          break;
        case "Hired":
          groupedApplications.hired.push(enrichedApp);
          break;
        default:
          // Other statuses are not mapped to these columns for now
          break;
      }
    }
  });

  const kanbanColumns = [
    { title: "SHORTLISTED", stageKey: "shortlisted" },
    { title: "CLIENT INTERVIEW 1", stageKey: "client_interview_1" },
    { title: "CLIENT INTERVIEW 2", stageKey: "client_interview_2" },
    { title: "HIRED", stageKey: "hired" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Breadcrumb */}
      <Link href="/clients" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Clients / Positions</span>
      </Link>

      {/* Header section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{position.title || position.roleTitle}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            {position.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-slate-400" />
                {position.location}
              </span>
            )}
            {(position.location && (position.salaryRange || (position.minSalary && position.maxSalary))) && <span className="text-slate-400">&bull;</span>}
            {(position.salaryRange || (position.minSalary && position.maxSalary)) ? (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <Wallet className="h-4 w-4" />
                {position.salaryRange || `${position.minSalary} - ${position.maxSalary}`}
              </span>
            ) : null}
          </div>
        </div>

        {/* Right-side actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Dropdown */}
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
                  <DropdownMenuItem key={statusKey} onClick={() => console.log(`Changed status to ${statusKey}`)}>
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
          <Button variant="secondary" className="h-8 text-sm px-3">
            <FileText className="h-4 w-4 mr-2" />
            Export PDF report
          </Button>
          <Button onClick={handleAddCandidate} className="h-8 text-sm px-3 bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add candidate
          </Button>
        </div>
      </div>

      {/* Kanban-like area */}
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
                    <CandidateCard key={app.id} application={app} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PositionDetailPage;
