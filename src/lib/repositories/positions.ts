import { db } from '../firebase';
import { Position } from '../types';
import { collection, doc, getDocs, setDoc, query, where, addDoc, getDoc } from 'firebase/firestore';

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

const normalizePositionStatus = (status: string | undefined): 'Open' | 'Closed' | 'On Hold' => {
  const lowerStatus = (status || "").toLowerCase();
  if (lowerStatus === "open") return 'Open';
  if (lowerStatus === "closed") return 'Closed';
  if (lowerStatus === "on hold" || lowerStatus === "on_hold") return 'On Hold';
  return 'Open'; // Default to Open if unrecognized
};

const mapFirestoreDocToPosition = (d: any): Position => {
  const data = d.data();
  return {
    id: d.id,
    title: data.title ?? data.roleTitle ?? "Untitled Position", // Map title, fallback to roleTitle
    clientId: data.clientId,
    description: data.description ?? "",
    requirements: data.requirements ?? [],
    status: normalizePositionStatus(data.status), // Normalize status
    location: data.location ?? undefined,
    department: data.department ?? undefined,
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
  };

  await setDoc(doc(db, 'positions', id), stripUndefined(cleanPosition), { merge: true });
  return { ...position, status: normalizedStatus };
}
