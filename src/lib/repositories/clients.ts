
import { db } from '../firebase';
import { Client } from '../types';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';

export async function getAllClients(): Promise<Client[]> {
  const clientsCol = collection(db, 'clients');
  const clientSnapshot = await getDocs(clientsCol);
  const clientList = clientSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      industry: data.industry,
      location: data.location,
      logo: data.logo,
      ownerId: data.ownerId,
    } as Client;
  });
  return clientList;
}

export async function saveClient(client: Client): Promise<void> {
  await setDoc(doc(db, 'clients', client.id), client);
}
