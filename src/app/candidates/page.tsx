"use client";

import { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, PlusCircle, FileDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { candidates, applications } from "@/lib/data";
import CandidatesHeader from "./header"; // Import the new server component for the header

const ITEMS_PER_PAGE = 10; // Define how many items per page

export default function CandidatesPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const handleExport = (candidateId: string) => {
    console.log(`Exporting profile for candidate ${candidateId}`);
    // In a real app, this would trigger a PDF generation service
  };

  // Pre-calculate application counts for optimization
  const applicationCounts = applications.reduce((acc, app) => {
    acc[app.candidateId] = (acc[app.candidateId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate pagination
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
        <CandidatesHeader /> {/* Use the new server component for the header */}
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
                <TableHead>Current Role</TableHead>
                <TableHead className="text-center">Applications</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCandidates.map((candidate) => {
                const applicationCount = applicationCounts[candidate.id] || 0;
                return (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={candidate.avatarUrl} alt={candidate.name} data-ai-hint="person face" />
                          <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{candidate.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{candidate.email}</div>
                      <div className="text-sm text-muted-foreground">{candidate.phone}</div>
                    </TableCell>
                    <TableCell>{candidate.currentRole}</TableCell>
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
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
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
