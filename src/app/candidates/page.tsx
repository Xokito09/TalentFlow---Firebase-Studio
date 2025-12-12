"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, PlusCircle, FileDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { useAppStore } from "@/lib/store";
import { exportCandidatePdf } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;

export default function CandidatesPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const candidates = useAppStore((s) => s.candidates);
  const candidatesLoading = useAppStore((s) => s.candidatesLoading);
  const candidatesInitialized = useAppStore((s) => s.candidatesInitialized);
  const loadCandidates = useAppStore((s) => s.loadCandidates);
  const applicationsByPosition = useAppStore((s) => s.applicationsByPosition);

  useEffect(() => {
    if (!candidatesInitialized) {
      loadCandidates();
    }
  }, [candidatesInitialized, loadCandidates]);

  const handleExport = (candidateId: string) => {
    exportCandidatePdf(candidateId);
  };

  const applicationCounts = Object.values(applicationsByPosition).flat().reduce((acc, app) => {
    acc[app.candidateId] = (acc[app.candidateId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const indexOfLastCandidate = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstCandidate = indexOfLastCandidate - ITEMS_PER_PAGE;
  const currentCandidates = candidates.slice(indexOfFirstCandidate, indexOfLastCandidate);
  const totalPages = Math.ceil(candidates.length / ITEMS_PER_PAGE);

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader
          title="Candidates"
          description="Manage your talent pool and candidate information."
        />
        <Button>
          <PlusCircle className="mr-2" />
          Add Candidate
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Talent Pool</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Current Title</TableHead>
                <TableHead className="text-center">Applications</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidatesLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Loading candidates...
                  </TableCell>
                </TableRow>
              )}
              {!candidatesLoading && currentCandidates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No candidates found.
                  </TableCell>
                </TableRow>
              )}
              {!candidatesLoading && currentCandidates.map((candidate) => {
                const applicationCount = applicationCounts[candidate.id] || 0;
                return (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                          <AvatarFallback>{candidate.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{candidate.fullName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{candidate.email}</div>
                      {candidate.phone && <div className="text-sm text-muted-foreground">{candidate.phone}</div>}
                    </TableCell>
                    <TableCell>{candidate.currentTitle}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-medium">
                        {applicationCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/candidates/${candidate.id}`)}>View Profile</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport(candidate.id)}>
                             <FileDown className="mr-2 h-4 w-4" />
                            Export as PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit Candidate</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete Candidate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
