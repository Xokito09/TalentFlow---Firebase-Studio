'use client'
import { type WithId, type Application, type Candidate, type Position, type Client, PipelineStageKey } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type EnrichedApplication = WithId<Application> & {
  candidate: WithId<Candidate>;
  position: WithId<Position>;
  client: WithId<Client>;
};

type ProspectBoardProps = {
  initialApplications: EnrichedApplication[];
  initialNextCursor?: string;
  statuses: PipelineStageKey[];
};

export function ProspectBoard({ initialApplications, initialNextCursor, statuses }: ProspectBoardProps) {
  const [applications, setApplications] = useState<EnrichedApplication[]>(initialApplications);
  const [nextCursor, setNextCursor] = useState<string | undefined>(initialNextCursor);
  const [loading, setLoading] = useState(false);

  const loadMoreProspects = async () => {
    if (!nextCursor || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/prospects/board?cursor=${nextCursor}&limit=10`);
      const data = await res.json();

      const newApplications: EnrichedApplication[] = data.prospects.map((app: any) => {
        // Assuming the API returns enriched applications directly, or you'll need to re-enrich here.
        // For now, let's assume the API returns partially enriched data that needs full enrichment.
        // In a real scenario, the API would return fully enriched data or raw data + lookup tables.
        // For simplicity in this example, we will assume prospects returned by API are fully enriched.
        return {
          ...app,
          appliedDate: new Date(app.appliedDate._seconds * 1000 + app.appliedDate._nanoseconds / 1000000),
          createdAt: new Date(app.createdAt._seconds * 1000 + app.createdAt._nanoseconds / 1000000),
          updatedAt: new Date(app.updatedAt._seconds * 1000 + app.updatedAt._nanoseconds / 1000000),
        };
      });

      setApplications((prev) => [...prev, ...newApplications]);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error("Failed to load more prospects:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 items-start">
      {statuses.map((status) => {
        const applicationsInStatus = applications.filter(app => app.stageKey === status);
        return (
          <div key={status} className="flex flex-col gap-4">
            <div className="px-2">
              <h2 className="font-headline text-lg font-semibold text-foreground">
                {status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
              </h2>
              <p className="text-sm text-muted-foreground">
                {applicationsInStatus.length} prospect{applicationsInStatus.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {applicationsInStatus.map((app) => (
                <Card key={app.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border">
                        {app.candidate && app.candidate.photoThumbUrl && <AvatarImage src={app.candidate.photoThumbUrl} alt={app.candidate.fullName} />}
                        <AvatarFallback>{app.candidate?.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5">
                        <CardTitle className="text-base font-semibold">{app.candidate?.fullName}</CardTitle>
                        <CardDescription className="text-sm">{app.position?.title}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Applied to: <span className="font-medium text-foreground">{app.client?.name}</span>
                    </div>
                     <div className="text-xs text-muted-foreground mt-2">
                      Applied on {new Date(app.appliedDate).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
      {nextCursor && (
        <div className="flex justify-center col-span-full mt-4">
          <Button onClick={loadMoreProspects} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
