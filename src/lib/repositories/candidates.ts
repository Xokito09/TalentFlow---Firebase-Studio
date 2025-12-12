import { doc, collection, getDoc, getDocs, query, where, addDoc, updateDoc, orderBy, limit, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Candidate } from "../types";

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

export async function getAllCandidates(limitNum: number = 200): Promise<Candidate[]> {
  const q = query(candidatesCollection, orderBy("fullName"), limit(limitNum));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Candidate, "id">) }));
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