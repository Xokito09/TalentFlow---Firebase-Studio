import { doc, collection, query, where, getDocs, addDoc, updateDoc, serverTimestamp, Timestamp, getDoc, limit, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Application, Candidate, Position } from "../types";
import { getCandidateById } from './candidates';
import { getPositionById } from './positions';

type ApplicationDoc = Omit<Application, 'id'>;

/**
 * Removes joined properties from an application object to ensure only the
 * application data is returned.
 * @param app The application object.
 * @returns The application object without joined data.
 */
function stripApplicationJoins<T>(app: T): T {
    if (app && typeof app === 'object') {
        delete (app as any).candidate;
        delete (app as any).position;
        delete (app as any).client;
    }
    return app;
}

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
    };
};

export async function getApplicationById(applicationId: string): Promise<Application | null> {
  const docRef = doc(db, 'applications', applicationId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return stripApplicationJoins(applicationFromDoc(docSnap));
  } else {
    return null;
  }
}

export async function getApplicationDataForPdf(applicationId: string): Promise<{ application: Application, candidate: Candidate, position: Position } | null> {
    const application = await getApplicationById(applicationId);
    if (!application) return null;

    const [candidate, position] = await Promise.all([
        getCandidateById(application.candidateId),
        getPositionById(application.positionId)
    ]);

    if (!candidate || !position) {
        return null;
    }

    return { application, candidate, position };
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
        return stripApplicationJoins(applicationFromDoc(querySnapshot.docs[0]));
    }
    return null;
}

export async function getApplicationsByPositionId(positionId: string): Promise<Application[]> {
  const q = query(applicationsCollection, where("positionId", "==", positionId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => stripApplicationJoins(applicationFromDoc(doc)));
}

export async function getApplicationsByCandidateId(candidateId: string): Promise<Application[]> {
  const q = query(applicationsCollection, where("candidateId", "==", candidateId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => stripApplicationJoins(applicationFromDoc(doc)));
}

export async function getLatestApplicationByCandidateId(candidateId: string): Promise<Application | null> {
    const q = query(
        applicationsCollection,
        where("candidateId", "==", candidateId),
        orderBy("appliedDate", "desc"),
        limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return stripApplicationJoins(applicationFromDoc(querySnapshot.docs[0]));
    }
    return null;
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
            applications.push(stripApplicationJoins(applicationFromDoc(doc)));
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
  return stripApplicationJoins(applicationFromDoc(docSnap));
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

export async function updateApplicationStageKey(applicationId: string, stageKey: string): Promise<void> {
    const applicationDocRef = doc(applicationsCollection, applicationId);
    await updateDoc(applicationDocRef, {
        stageKey,
        updatedAt: serverTimestamp(),
    });
}
