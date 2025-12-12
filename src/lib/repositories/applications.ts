import { doc, collection, query, where, getDocs, addDoc, updateDoc, serverTimestamp, Timestamp, getDoc, limit } from "firebase/firestore";
import { db } from "../firebase";
import { Application } from "../types";

type ApplicationDoc = Omit<Application, 'id'>;

const applicationsCollection = collection(db, "applications");

const applicationFromDoc = (doc: any): Application => {
    const data = doc.data() as ApplicationDoc;
    return {
        id: doc.id,
        candidateId: data.candidateId || '',
        positionId: data.positionId || '',
        clientId: data.clientId || '',
        stageKey: data.stageKey || 'shortlisted',
        appliedDate: data.appliedDate, // Keep as Timestamp
        updatedAt: data.updatedAt,
        appliedRoleTitle: data.appliedRoleTitle || '',
        appliedCompensation: data.appliedCompensation || '',
        professionalBackgroundAtApply: data.professionalBackgroundAtApply || '',
        mainProjectsAtApply: data.mainProjectsAtApply || [],
        candidateSnapshot: data.candidateSnapshot || {},
        applicationSnapshot: data.applicationSnapshot || {},
        status: data.status,
    };
};

export async function getApplicationById(applicationId: string): Promise<Application | null> {
  const docRef = doc(db, 'applications', applicationId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return applicationFromDoc(docSnap);
  } else {
    return null;
  }
}

export async function findApplicationByCandidateAndPosition(candidateId: string, positionId: string): Promise<Application | null> {
    const q = query(
        applicationsCollection,
        where("candidateId", "==", candidateId),
        where("positionId", "==", positionId),
        limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return applicationFromDoc(querySnapshot.docs[0]);
    }
    return null;
}

export async function getApplicationsByPositionId(positionId: string): Promise<Application[]> {
  const q = query(applicationsCollection, where("positionId", "==", positionId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(applicationFromDoc);
}

export async function getApplicationsByCandidateId(candidateId: string): Promise<Application[]> {
  const q = query(applicationsCollection, where("candidateId", "==", candidateId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(applicationFromDoc);
}

export async function getApplicationsByCandidateIds(candidateIds: string[]): Promise<Application[]> {
    if (candidateIds.length === 0) {
        return [];
    }

    const applications: Application[] = [];
    const chunks: string[][] = [];

    for (let i = 0; i < candidateIds.length; i += 10) {
        chunks.push(candidateIds.slice(i, i + 10));
    }

    for (const chunk of chunks) {
        const q = query(applicationsCollection, where("candidateId", "in", chunk));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => {
            applications.push(applicationFromDoc(doc));
        });
    }

    return applications;
}

async function createApplication(applicationData: Omit<Application, "id" | "appliedDate" | "updatedAt">): Promise<Application> {
  const now = Timestamp.now();
  const dataToCreate = {
    ...applicationData,
    appliedDate: now,
    updatedAt: now,
  };
  const docRef = await addDoc(applicationsCollection, dataToCreate);
  const docSnap = await getDoc(docRef);
  return applicationFromDoc(docSnap);
}

export async function createOrGetApplication(applicationData: Omit<Application, "id" | "appliedDate" | "updatedAt">): Promise<{ application: Application; created: boolean }> {
  const { candidateId, positionId } = applicationData;
  const existingApplication = await findApplicationByCandidateAndPosition(candidateId, positionId);
  if (existingApplication) {
    return { application: existingApplication, created: false };
  } else {
    const newApplication = await createApplication(applicationData);
    return { application: newApplication, created: true };
  }
}

export async function updateApplication(applicationId: string, patch: Partial<Omit<Application, "id" | "appliedDate" | "updatedAt">>): Promise<void> {
  const applicationDocRef = doc(applicationsCollection, applicationId);
  const dataToUpdate = {
    ...patch,
    updatedAt: serverTimestamp(),
  };
  await updateDoc(applicationDocRef, dataToUpdate);
}
