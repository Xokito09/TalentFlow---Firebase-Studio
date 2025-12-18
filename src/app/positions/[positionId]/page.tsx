import { getPositionById } from "@/lib/repositories/positions";
import { getApplicationsByPositionId } from "@/lib/repositories/applications";
import { getCandidatesByIds } from "@/lib/repositories/candidates";
import { getClientById } from "@/lib/repositories/clients";
import PositionDetailClient from "./client-page";
import { Timestamp } from "firebase/firestore";

// Helper function to serialize Firestore Timestamps
function serializeTimestamps(data: any): any {
  if (data === null || data === undefined || typeof data !== 'object') {
    return data;
  }
  if (data instanceof Timestamp) {
    return data.toDate().toISOString();
  }
  if (Array.isArray(data)) {
    return data.map(serializeTimestamps);
  }
  const serializedData: { [key: string]: any } = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      serializedData[key] = serializeTimestamps(data[key]);
    }
  }
  return serializedData;
}


export const dynamic = "force-dynamic";

type PositionDetailPageProps = {
  params: {
    positionId: string;
  };
};

export default async function PositionDetailPage({
  params,
}: {
  params: Promise<PositionDetailPageProps["params"]>;
}) {
  const { positionId } = await params;
  
  const position = await getPositionById(positionId);
  if (!position) {
    return <div>Position not found</div>;
  }

  // Fetch all data in the server component
  const client = position.clientId ? await getClientById(position.clientId) : null;
  const applications = await getApplicationsByPositionId(positionId);
  const candidateIds = [...new Set(applications.map(app => app.candidateId))];
  const candidates = candidateIds.length > 0 ? await getCandidatesByIds(candidateIds) : [];

  // Serialize the data before passing it to the client component
  const serializablePosition = serializeTimestamps(position);
  const serializableClient = serializeTimestamps(client);
  const serializableApplications = serializeTimestamps(applications);
  const serializableCandidates = serializeTimestamps(candidates);

  // Pass all data to the client component
  return (
    <PositionDetailClient 
      position={serializablePosition}
      client={serializableClient}
      applications={serializableApplications}
      candidates={serializableCandidates}
    />
  );
}
