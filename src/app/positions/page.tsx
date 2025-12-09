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
import { MoreHorizontal, PlusCircle, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { positions, clients, applications } from "@/lib/data";

export default function PositionsPage() {
  const handleExport = (positionId: string) => {
    console.log(`Exporting all candidates for position ${positionId}`);
    // In a real app, this would trigger a PDF generation service
  };

  return (
    <>
      <PageHeader 
        title="Positions"
        description="Create, edit, and manage all job postings."
      >
        <Button>
          <PlusCircle className="mr-2" />
          Create Position
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Job Postings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Candidates</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => {
                const client = clients.find((c) => c.id === position.clientId);
                const candidateCount = applications.filter(
                  (a) => a.positionId === position.id
                ).length;

                const getStatusBadge = (status: 'Open' | 'Closed' | 'On Hold') => {
                  switch (status) {
                    case 'Open':
                      return <Badge variant="outline" className="text-green-600 border-green-600/50 bg-green-500/10">Open</Badge>;
                    case 'Closed':
                      return <Badge variant="secondary">Closed</Badge>;
                    case 'On Hold':
                      return <Badge variant="outline" className="text-yellow-600 border-yellow-600/50 bg-yellow-500/10">On Hold</Badge>;
                  }
                };
                
                return (
                  <TableRow key={position.id}>
                    <TableCell className="font-medium">{position.title}</TableCell>
                    <TableCell>{client?.name}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(position.status)}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant="secondary" className="font-medium">
                            {candidateCount}
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
                          <DropdownMenuItem>View Position</DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleExport(position.id)}>
                            <FileDown className="mr-2 h-4 w-4" />
                            Export Candidates
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit Position</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete Position
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
