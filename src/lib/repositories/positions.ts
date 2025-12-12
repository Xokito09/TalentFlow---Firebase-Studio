import { db } from '../firebase';
import { Position } from '../types';
import { collection, doc, getDocs, setDoc, query, where, addDoc } from 'firebase/firestore';

export async function getPositionsByClientId(clientId: string): Promise<Position[]> {
  const positionsCol = collection(db, 'positions');
  const q = query(positionsCol, where("clientId", "==", clientId));
  const positionSnapshot = await getDocs(q);
  const positionList = positionSnapshot.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      roleTitle: data.roleTitle,
      clientId: data.clientId,
      status: data.status,
      dateCreated: data.dateCreated,
      // Add other Position fields as needed
    } as Position;
  });
  return positionList;
}

export async function createPosition(data: Omit<Position, "id">): Promise<Position> {
  const positionsCol = collection(db, 'positions');
  const docRef = await addDoc(positionsCol, data);
  return { ...data, id: docRef.id } as Position;
}

export async function updatePosition(position: Position): Promise<Position> {
  await setDoc(doc(db, 'positions', position.id), position);
  return position;
}
