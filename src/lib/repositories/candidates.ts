import { doc, collection, getDoc, getDocs, query, where, addDoc, updateDoc, orderBy, limit, serverTimestamp, Timestamp, startAfter } from "firebase/firestore";
import { db } from "../firebase";
import { Candidate, WithId } from "../types";

const candidatesCollection = collection(db, "candidates");

function removeUndefined(obj: any) {
  Object.keys(obj).forEach(key => {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  });
  return obj;
}

export async function getCandidateById(candidateId: string): Promise<Candidate | null> {
  const candidateDocRef = doc(candidatesCollection, candidateId);
  const candidateDocSnap = await getDoc(candidateDocRef);
  if (candidateDocSnap.exists()) {
    return { id: candidateDocSnap.id, ...(candidateDocSnap.data() as Omit<Candidate, "id">) };
  }
  return null;
}

export async function getCandidatesByIds(ids: string[]): Promise<WithId<Candidate>[]> {
  if (ids.length === 0) {
    return [];
  }
  const q = query(candidatesCollection, where('__name__', 'in', ids));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Candidate, "id">) }));
}

export async function getAllCandidates(limitNum: number = 200): Promise<WithId<Candidate>[]> {
  const q = query(candidatesCollection, orderBy("fullName"), limit(limitNum));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Candidate, "id">) }));
}

export async function getPaginatedCandidates({ cursor, limit: numLimit = 10 }: { cursor?: string; limit?: number }): Promise<{ candidates: WithId<Candidate>[]; nextCursor?: string }> {
  let q = query(candidatesCollection, orderBy("createdAt", "desc"));

  if (cursor) {
    const cursorDoc = await getDoc(doc(db, "candidates", cursor));
    if (cursorDoc.exists()) {
      q = query(q, startAfter(cursorDoc));
    }
  }

  q = query(q, limit(numLimit));

  const documentSnapshots = await getDocs(q);
  const candidates: WithId<Candidate>[] = documentSnapshots.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as WithId<Candidate>[];

  const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
  const nextCursor = lastVisible ? lastVisible.id : undefined;

  return { candidates, nextCursor };
}

export async function findCandidateByEmail(email: string): Promise<Candidate | null> {
  const q = query(candidatesCollection, where("email", "==", email), limit(1));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...(doc.data() as Omit<Candidate, "id">) };
  }
  return null;
}

export async function createCandidate(candidateData: Omit<Candidate, "id" | "createdAt" | "updatedAt">): Promise<Candidate> {
  const now = Timestamp.now();
  const dataToCreate = removeUndefined({
    ...candidateData,
    createdAt: now,
    updatedAt: now,
  });
  const docRef = await addDoc(candidatesCollection, dataToCreate);
  return { id: docRef.id, ...dataToCreate as Omit<Candidate, "id"> };
}

export async function updateCandidate(candidateId: string, patch: Partial<Omit<Candidate, "id" | "createdAt" | "updatedAt">>): Promise<void> {
  const candidateDocRef = doc(candidatesCollection, candidateId);
  const dataToUpdate = removeUndefined({
    ...patch,
    updatedAt: serverTimestamp(),
  });
  await updateDoc(candidateDocRef, dataToUpdate);
}
