"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from 'next/navigation';
import Link from "next/link";
import { useAppStore } from '@/lib/store';
import * as candidatesRepository from '@/lib/repositories/candidates';
import * as applicationsRepository from '@/lib/repositories/applications';
import { Candidate, Application, PipelineStageKey } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatFirestoreDate } from '@/lib/utils';

import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  BookOpen,
  Clipboard
} from 'lucide-react';

const CandidateProfilePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.candidateId as string;

  const {
    candidates,
    loadCandidates,
    clients,
    clientsInitialized,
    loadClients,
    positions,
    positionsInitialized,
    loadPositions
  } = useAppStore();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidateAndApplications = async () => {
      setLoading(true);
      let fetchedCandidate: Candidate | null | undefined = candidates.find(c => c.id === candidateId);

      if (!fetchedCandidate) {
        fetchedCandidate = await candidatesRepository.getCandidateById(candidateId);
        if (fetchedCandidate && !candidates.some(c => c.id === fetchedCandidate?.id)) {
          loadCandidates();
        }
      }

      if (fetchedCandidate) {
        setCandidate(fetchedCandidate);
        const fetchedApplications = await applicationsRepository.getApplicationsByCandidateId(candidateId);
        setApplications(fetchedApplications);

        if (!positionsInitialized) {
            loadPositions();
        }

      } else {
        console.error("Candidate not found");
      }
      setLoading(false);
    };

    fetchCandidateAndApplications();
  }, [candidateId, candidates, loadCandidates, positionsInitialized, loadPositions]);

  useEffect(() => {
    if (!clientsInitialized) {
      loadClients();
    }
  }, [clientsInitialized, loadClients]);

  const getPositionTitle = (positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    return position?.title || "Unknown Position";
  };

  if (loading) {
    return <div className="p-8 text-center">Loading candidate profile...</div>;
  }

  if (!candidate) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">Candidate not found</p>
        <Button onClick={() => router.push("/candidates")}>Go back to candidates</Button>
      </div>
    );
  }

  const getStageKeyLabel = (stageKey: PipelineStageKey | undefined) => {
    switch (stageKey) {
      case 'shortlisted': return 'Shortlisted';
      case 'client_interview_1': return 'Client Interview 1';
      case 'client_interview_2': return 'Client Interview 2';
      case 'hired': return 'Hired';
      default: return 'Unknown Stage';
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 space-y-8 bg-slate-50 min-h-screen">
      <Link href="/candidates" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Candidates</span>
      </Link>

      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24 border">
          <AvatarFallback className="text-4xl">{candidate.fullName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{candidate.fullName}</h1>
          {candidate.currentTitle && <p className="text-lg text-slate-700 flex items-center gap-2"><Briefcase className="h-5 w-5 text-slate-500" />{candidate.currentTitle}</p>}
          {candidate.location && <p className="text-md text-slate-600 flex items-center gap-2"><MapPin className="h-5 w-5 text-slate-500" />{candidate.location}</p>}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="flex items-center gap-2 text-slate-700"><Mail className="h-5 w-5 text-slate-500" />{candidate.email}</p>
          {candidate.phone && <p className="flex items-center gap-2 text-slate-700"><Phone className="h-5 w-5 text-slate-500" />{candidate.phone}</p>}
        </CardContent>
      </Card>

      {candidate.hardSkills && candidate.hardSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {candidate.hardSkills.map((skill, index) => (
              <Badge key={index} variant="secondary">{skill}</Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {(candidate.professionalBackground || candidate.mainProjects) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {candidate.professionalBackground && <div className="text-slate-700"><h3 className="font-semibold mb-1 flex items-center gap-2"><BookOpen className="h-5 w-5 text-slate-500" />Professional Background</h3><p>{candidate.professionalBackground}</p></div>}
            {candidate.mainProjects && (
              <div className="text-slate-700">
                <h3 className="font-semibold mb-1 flex items-center gap-2"><Clipboard className="h-5 w-5 text-slate-500" />Main Projects</h3>
                <p>{candidate.mainProjects.join(', ')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Application History</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <p className="text-slate-500">No application history for this candidate.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Role at apply time</TableHead>
                  <TableHead>Salary at apply time</TableHead>
                  <TableHead>Applied Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <Link href={`/applications/${app.id}?from=candidate&candidateId=${candidateId}`} className="text-blue-600 hover:underline">
                        {getPositionTitle(app.positionId)}
                      </Link>
                    </TableCell>
                    <TableCell>{clients.find(c => c.id === app.clientId)?.name || "Unknown Client"}</TableCell>
                    <TableCell>{getStageKeyLabel(app.stageKey)}</TableCell>
                    <TableCell>{app.appliedRoleTitle || ''}</TableCell>
                    <TableCell>{app.appliedCompensation || ''}</TableCell>
                    <TableCell>{formatFirestoreDate(app.appliedDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateProfilePage;
