import { db } from '../firebase';
import { Client } from '../types';
import { collection, getDocs, setDoc, doc, updateDoc } from 'firebase/firestore';

function removeUndefined(obj: any) {
  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}

export async function getAllClients(): Promise<Client[]> {
  const clientsCol = collection(db, 'clients');
  const clientSnapshot = await getDocs(clientsCol);
  const clientList = clientSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name ?? "",
      industry: data.industry ?? "",
      location: data.location ?? "",
      website: data.website ?? "",
      pointOfContact: data.pointOfContact ?? "",
      contactEmail: data.contactEmail ?? "",
      taxId: data.taxId ?? "",
      billingAddress: data.billingAddress ?? "",
      billingEmail: data.billingEmail ?? "",
      paymentTerms: data.paymentTerms ?? "",
      notes: data.notes ?? "",
      logoUrl: data.logoUrl ?? "",
      relationshipStatus: data.relationshipStatus ?? "prospect",
      ownerId: data.ownerId ?? "",
    } as Client;
  });
  return clientList;
}

export async function saveClient(client: Omit<Client, 'id'> & { id?: string }): Promise<Client> {
  const cleanClient = removeUndefined(client);
  if (client.id) {
    await setDoc(doc(db, 'clients', client.id), cleanClient, { merge: true });
    return cleanClient as Client;
  } else {
    const newDocRef = doc(collection(db, 'clients'));
    await setDoc(newDocRef, cleanClient);
    return { ...cleanClient, id: newDocRef.id } as Client;
  }
}

export async function updateClient(client: Client): Promise<void> {
  const { id, ...data } = client;
  const docRef = doc(db, "clients", id);
  const dataToUpdate = removeUndefined(data);
  await setDoc(docRef, dataToUpdate, { merge: true });
}
