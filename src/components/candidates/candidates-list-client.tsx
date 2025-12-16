"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { exportCandidatePdf } from '@/lib/utils';
import * as applicationsRepository from '@/lib/repositories/applications';
import EditCandidateModal from "@/components/candidates/edit-candidate-modal";
import { Candidate } from '@/lib/types';

const ITEMS_PER_PAGE = 10;

interface CandidatesListProps {
  initialCandidates: Candidate[];
  initialTotalPages: number;
  initialCurrentPage: number;
}

export default function CandidatesListClient({
  initialCandidates,
  initialTotalPages,
  initialCurrentPage,
}: CandidatesListProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [candidates, setCandidates] = useState(initialCandidates);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const [applicationCounts, setApplicationCounts] = useState<Record<string, number>>({});
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [candidateIdToEdit, setCandidateIdToEdit] = useState<string | null>(null);

  const countsCacheRef = useRef<Record<string, number>>({});

  const fetchCandidates = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/candidates/list?page=${page}&limit=${ITEMS_PER_PAGE}`);
      if (!response.ok) {
        throw new Error("Failed to fetch candidates");
      }
      const data = await response.json();
      setCandidates(data.candidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentPage !== initialCurrentPage) {
      fetchCandidates(currentPage);
    }
  }, [currentPage, initialCurrentPage]);

  const pageCandidateIds = useMemo(
    () => candidates.map(c => c.id).filter(Boolean),
    [candidates]
  );

  const pageCandidateIdsKey = useMemo(
    () => pageCandidateIds.join(","),
    [pageCandidateIds]
  );

  useEffect(() => {
    let cancelled = false;

    const fetchApplicationCounts = async () => {
      if (pageCandidateIds.length === 0) {
        const newCountsForPage = {};
        const mergedCounts = { ...countsCacheRef.current, ...newCountsForPage };
        if (JSON.stringify(mergedCounts) !== JSON.stringify(countsCacheRef.current)) {
          countsCacheRef.current = mergedCounts;
          setApplicationCounts(mergedCounts);
        }
        return;
      }

      const allCached = pageCandidateIds.every(id => countsCacheRef.current.hasOwnProperty(id));
      
      if (!allCached) {
        const applications = await applicationsRepository.getApplicationsByCandidateIds(pageCandidateIds);

        if (cancelled) return;

        const newCountsForPage = applications.reduce((acc, app) => {
          acc[app.candidateId] = (acc[app.candidateId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const mergedCounts = { ...countsCacheRef.current, ...newCountsForPage };
        
        if (JSON.stringify(mergedCounts) !== JSON.stringify(countsCacheRef.current)) {
          countsCacheRef.current = mergedCounts;
          setApplicationCounts(mergedCounts);
        }
      }
    };

    fetchApplicationCounts();

    return () => {
      cancelled = true;
    };
  }, [pageCandidateIdsKey]);

  const handleExport = (candidateId: string) => {
    exportCandidatePdf(candidateId, router);
  };

  const handleEditCandidate = (candidateId: string) => {
    setCandidateIdToEdit(candidateId);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCandidateIdToEdit(null);
  };

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
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Loading candidates...
                  </TableCell>
                </TableRow>
              )}
              {!loading && candidates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No candidates found.
                  </TableCell>
                </TableRow>
              )}
              {!loading && candidates.map((candidate) => {
                const applicationCount = applicationCounts[candidate.id];
                const showLoadingIndicator = pageCandidateIds.includes(candidate.id) && applicationCount === undefined;

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
                        {showLoadingIndicator ? '...' : applicationCount || 0}
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
                          <DropdownMenuItem onClick={() => handleEditCandidate(candidate.id)}>Edit Candidate</DropdownMenuItem>
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

      {isEditModalOpen && candidateIdToEdit && (
        <EditCandidateModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          candidateId={candidateIdToEdit}
        />
      )}
    </>
  );
}