import { doc, collection, query, where, getDocs, addDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Application } from "../types";

const applicationsCollection = collection(db, "applications");

function removeUndefined(obj: any) {
  Object.keys(obj).forEach(key => {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  });
  return obj;
}

export async function getApplicationsByPositionId(positionId: string): Promise<Application[]> {
  const q = query(applicationsCollection, where("positionId", "==", positionId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Application, "id">) }));
}

export async function getApplicationsByCandidateId(candidateId: string): Promise<Application[]> {
  const q = query(applicationsCollection, where("candidateId", "==", candidateId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Application, "id">) }));
}

export async function createApplication(applicationData: Omit<Application, "id" | "appliedDate" | "updatedAt">): Promise<Application> {
  const now = Timestamp.now();
  const dataToCreate = removeUndefined({
    ...applicationData,
    appliedDate: now,
    updatedAt: now,
  });
  const docRef = await addDoc(applicationsCollection, dataToCreate);
  return { id: docRef.id, ...dataToCreate as Omit<Application, "id"> };
}

export async function updateApplication(applicationId: string, patch: Partial<Omit<Application, "id" | "appliedDate" | "updatedAt">>): Promise<void> {
  const applicationDocRef = doc(applicationsCollection, applicationId);
  const dataToUpdate = removeUndefined({
    ...patch,
    updatedAt: serverTimestamp(),
  });
  await updateDoc(applicationDocRef, dataToUpdate);
}