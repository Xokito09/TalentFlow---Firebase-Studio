import { db } from '../firebase';
import { Position, FunnelMetrics, DEFAULT_FUNNEL_METRICS } from '../types';
import { collection, doc, getDocs, setDoc, query, where, addDoc, getDoc, updateDoc } from 'firebase/firestore';

// Helper function to remove undefined fields from an object (top-level only)
const stripUndefined = (obj: any): any => {
  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] !== undefined) {
        newObj[key] = obj[key];
      }
    }
  }
  return newObj;
};

const normalizePositionStatus = (status: string | undefined): 'open' | 'closed' | 'onhold' => {
  const lowerStatus = (status || "").toLowerCase();
  if (lowerStatus === "open") return 'open';
  if (lowerStatus === "closed") return 'closed';
  if (lowerStatus === "on hold" || lowerStatus === "on_hold") return 'onhold';
  return 'open'; // Default to open if unrecognized
};

const mapFirestoreDocToPosition = (d: any): Position => {
  const data = d.data();
  
  // Ensure funnelMetrics has defaults for missing fields
  const rawMetrics = data.funnelMetrics || {};
  const funnelMetrics: FunnelMetrics = {
    sourced: rawMetrics.sourced ?? 0,
    approached: rawMetrics.approached ?? 0,
    notInterested: rawMetrics.notInterested ?? 0,
    noResponse: rawMetrics.noResponse ?? 0,
    activePipeline: rawMetrics.activePipeline ?? 0,
    shortlisted: rawMetrics.shortlisted ?? 0,
    finalInterviews: rawMetrics.finalInterviews ?? 0,
  };

  return {
    id: d.id,
    title: data.title ?? data.roleTitle ?? "Untitled Position", // Map title, fallback to roleTitle
    clientId: data.clientId,
    description: data.description ?? "",
    requirements: data.requirements ?? [],
    status: normalizePositionStatus(data.status), // Normalize status
    location: data.location ?? undefined,
    department: data.department ?? undefined,
    funnelMetrics,
  } as Position;
};

export async function getPositionById(positionId: string): Promise<Position | null> {
  const positionDocRef = doc(db, 'positions', positionId);
  const positionDocSnap = await getDoc(positionDocRef);
  if (positionDocSnap.exists()) {
    return mapFirestoreDocToPosition(positionDocSnap);
  }
  return null;
}

export async function getPositionsByClientId(clientId: string): Promise<Position[]> {
  const positionsCol = collection(db, 'positions');
  const q = query(positionsCol, where("clientId", "==", clientId));
  const positionSnapshot = await getDocs(q);
  return positionSnapshot.docs.map(mapFirestoreDocToPosition);
}

export async function getAllPositions(): Promise<Position[]> {
  const positionsCol = collection(db, 'positions');
  const positionSnapshot = await getDocs(positionsCol);
  return positionSnapshot.docs.map(mapFirestoreDocToPosition);
}

export async function createPosition(data: Omit<Position, "id">): Promise<Position> {
  const positionsCol = collection(db, 'positions');
  const normalizedStatus = normalizePositionStatus(data.status);

  const cleanPosition = {
    ...data,
    status: normalizedStatus,
    location: data.location || "", // Default to empty string if missing
    department: data.department || "", // Default to empty string if missing
    funnelMetrics: data.funnelMetrics || DEFAULT_FUNNEL_METRICS,
  };

  const docRef = await addDoc(positionsCol, stripUndefined(cleanPosition));
  return { ...cleanPosition, id: docRef.id } as Position;
}

export async function updatePosition(position: Position): Promise<Position> {
  const { id } = position;
  const normalizedStatus = normalizePositionStatus(position.status);

  const cleanPosition = {
    ...position,
    status: normalizedStatus,
    location: position.location || "", // Default to empty string if missing
    department: position.department || "", // Default to empty string if missing
    // if funnelMetrics is present, it will be included, otherwise merged
  };

  await setDoc(doc(db, 'positions', id), stripUndefined(cleanPosition), { merge: true });
  return { ...position, status: normalizedStatus };
}

export async function updatePositionFunnelMetrics(positionId: string, funnelMetrics: FunnelMetrics): Promise<void> {
  const positionDocRef = doc(db, 'positions', positionId);
  // Only update the funnelMetrics field
  await updateDoc(positionDocRef, {
    funnelMetrics: funnelMetrics
  });
}
