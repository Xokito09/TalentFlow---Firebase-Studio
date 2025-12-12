
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

export async function saveClient(client: Client): Promise<void> {
  const cleanClient = Object.fromEntries(
    Object.entries(client).filter(([_, value]) => value !== undefined)
  );
  await setDoc(doc(db, 'clients', client.id), cleanClient, { merge: true });
}

export async function updateClient(client: Client): Promise<void> {
  const { id, ...data } = client;
  const docRef = doc(db, "clients", id);
  await setDoc(docRef, data, { merge: true });
}
