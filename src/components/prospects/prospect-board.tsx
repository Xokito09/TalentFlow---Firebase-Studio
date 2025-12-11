import type { Application, ApplicationStatus, Candidate, Position, Client } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type EnrichedApplication = Application & {
  candidate?: Candidate;
  position?: Position;
  client?: Client;
};

type ProspectBoardProps = {
  applications: EnrichedApplication[];
  statuses: ApplicationStatus[];
};

export function ProspectBoard({ applications, statuses }: ProspectBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 items-start">
      {statuses.map((status) => {
        const applicationsInStatus = applications.filter(app => app.status === status);
        return (
          <div key={status} className="flex flex-col gap-4">
            <div className="px-2">
              <h2 className="font-headline text-lg font-semibold text-foreground">
                {status}
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
                        {app.candidate && app.candidate.avatarUrl && <AvatarImage src={app.candidate.avatarUrl} alt={app.candidate.name} />}
                        <AvatarFallback>{app.candidate?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5">
                        <CardTitle className="text-base font-semibold">{app.candidate?.name}</CardTitle>
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
    </div>
  );
}
