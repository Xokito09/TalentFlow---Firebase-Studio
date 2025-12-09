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
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, PlusCircle, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { candidates, applications } from "@/lib/data";

export default function CandidatesPage() {

  const handleExport = (candidateId: string) => {
    console.log(`Exporting profile for candidate ${candidateId}`);
    // In a real app, this would trigger a PDF generation service
  };

  return (
    <>
      <PageHeader 
        title="Candidates"
        description="Manage your talent pool and candidate information."
      >
        <Button>
          <PlusCircle className="mr-2" />
          Add Candidate
        </Button>
      </PageHeader>
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
              {candidates.map((candidate) => {
                const applicationCount = applications.filter(
                  (app) => app.candidateId === candidate.id
                ).length;
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
        </CardContent>
      </Card>
    </>
  );
}
