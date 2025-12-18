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
  try {
    if (!applicationId) {
      return null;
    }
    const docRef = doc(db, 'applications', applicationId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return stripApplicationJoins(applicationFromDoc(docSnap));
    } else {
      return null;
    }
  } catch (err) {
    console.error("getApplicationById failed", err);
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    throw new Error(`getApplicationById failed :: ${msg}`);
  }
}

export async function getApplicationDataForPdf(applicationId: string): Promise<{ application: Application, candidate: Candidate, position: Position } | null> {
  try {
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
  } catch (err) {
    console.error("getApplicationDataForPdf failed", err);
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    throw new Error(`getApplicationDataForPdf failed :: ${msg}`);
  }
}


export async function findApplicationByCandidateAndPosition(candidateId: string, positionId: string): Promise<Application | null> {
  try {
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
  } catch (err) {
    console.error("findApplicationByCandidateAndPosition failed", err);
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    throw new Error(`findApplicationByCandidateAndPosition failed :: ${msg}`);
  }
}

export async function getApplicationsByPositionId(positionId: string): Promise<Application[]> {
  try {
    const q = query(applicationsCollection, where("positionId", "==", positionId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => stripApplicationJoins(applicationFromDoc(doc)));
  } catch (err) {
    console.error("getApplicationsByPositionId failed", err);
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    throw new Error(`getApplicationsByPositionId failed :: ${msg}`);
  }
}

export async function getApplicationsByCandidateId(candidateId: string): Promise<Application[]> {
  try {
    const q = query(applicationsCollection, where("candidateId", "==", candidateId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => stripApplicationJoins(applicationFromDoc(doc)));
  } catch (err) {
    console.error("getApplicationsByCandidateId failed", err);
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    throw new Error(`getApplicationsByCandidateId failed :: ${msg}`);
  }
}

export async function getLatestApplicationByCandidateId(candidateId: string): Promise<Application | null> {
  try {
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
  } catch (err) {
    console.error("getLatestApplicationByCandidateId failed", err);
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    throw new Error(`getLatestApplicationByCandidateId failed :: ${msg}`);
  }
}

export async function getApplicationsByCandidateIds(candidateIds: string[]): Promise<Application[]> {
  try {
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
  } catch (err) {
    console.error("getApplicationsByCandidateIds failed", err);
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    throw new Error(`getApplicationsByCandidateIds failed :: ${msg}`);
  }
}

async function createApplication(applicationData: Omit<Application, "id" | "appliedDate" | "updatedAt">): Promise<Application> {
  try {
    const now = Timestamp.now();
    const dataToCreate = {
      ...applicationData,
      appliedDate: now,
      updatedAt: now,
    };
    const docRef = await addDoc(applicationsCollection, dataToCreate);
    const docSnap = await getDoc(docRef);
    return stripApplicationJoins(applicationFromDoc(docSnap));
  } catch (err) {
    console.error("createApplication failed", err);
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    throw new Error(`createApplication failed :: ${msg}`);
  }
}

export async function createOrGetApplication(applicationData: Omit<Application, "id" | "appliedDate" | "updatedAt">): Promise<{ application: Application; created: boolean }> {
  try {
    const { candidateId, positionId } = applicationData;
    const existingApplication = await findApplicationByCandidateAndPosition(candidateId, positionId);
    if (existingApplication) {
      return { application: existingApplication, created: false };
    } else {
      const newApplication = await createApplication(applicationData);
      return { application: newApplication, created: true };
    }
  } catch (err) {
    console.error("createOrGetApplication failed", err);
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    throw new Error(`createOrGetApplication failed :: ${msg}`);
  }
}

export async function updateApplication(applicationId: string, patch: Partial<Omit<Application, "id" | "appliedDate" | "updatedAt">>): Promise<void> {
  try {
    const applicationDocRef = doc(applicationsCollection, applicationId);
    const dataToUpdate = {
      ...patch,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(applicationDocRef, dataToUpdate);
  } catch (err) {
    console.error("updateApplication failed", err);
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    throw new Error(`updateApplication failed :: ${msg}`);
  }
}

export async function updateApplicationStageKey(applicationId: string, stageKey: string): Promise<void> {
  try {
    const applicationDocRef = doc(applicationsCollection, applicationId);
    await updateDoc(applicationDocRef, {
        stageKey,
        updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("updateApplicationStageKey failed", err);
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    throw new Error(`updateApplicationStageKey failed :: ${msg}`);
  }
}
