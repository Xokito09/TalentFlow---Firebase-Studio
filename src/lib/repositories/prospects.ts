import { query, collection, orderBy, startAfter, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Application, WithId } from "@/lib/types";

export async function getPaginatedApplications({ cursor, limit: numLimit }: { cursor?: string; limit?: number }): Promise<{ applications: WithId<Application>[]; nextCursor?: string }> {
  const applicationsRef = collection(db, "applications");
  let q = query(applicationsRef, orderBy("createdAt", "desc"));

  if (cursor) {
    q = query(q, startAfter(cursor));
  }

  if (numLimit) {
    q = query(q, limit(numLimit));
  }

  const documentSnapshots = await getDocs(q);
  const applications: WithId<Application>[] = documentSnapshots.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as WithId<Application>[];

  const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
  const nextCursor = lastVisible ? lastVisible.id : undefined;

  return { applications, nextCursor };
}

export async function getPaginatedProspects({ cursor, limit: numLimit }: { cursor?: string; limit?: number }): Promise<{ prospects: WithId<Application>[]; nextCursor?: string }> {
  const { applications, nextCursor } = await getPaginatedApplications({ cursor, limit: numLimit });
  // For prospects, we are essentially just paginating applications and then enriching them later.
  // The term 'prospects' here is synonymous with 'applications' in this context of the board view.
  return { prospects: applications, nextCursor };
}
