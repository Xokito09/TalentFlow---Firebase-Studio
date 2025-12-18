import { db } from '../firebase';
import { Client } from '../types';
import { collection, getDocs, setDoc, doc, updateDoc, getDoc } from 'firebase/firestore';

function removeUndefined(obj: any) {
  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] !== undefined) {
        newObj[key] = obj[key];
      }
    }
  }
  return newObj;
}

export async function getClientById(clientId: string): Promise<Client | null> {
  try {
    const clientDocRef = doc(db, 'clients', clientId);
    const clientDocSnap = await getDoc(clientDocRef);
    if (clientDocSnap.exists()) {
      const data = clientDocSnap.data();
      return {
        id: clientDocSnap.id,
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
    }
    return null;
  } catch (err) {
    console.error("getClientById failed", err);
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    throw new Error(`getClientById failed :: ${msg}`);
  }
}

export async function getAllClients(): Promise<Client[]> {
  try {
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
  } catch (err) {
    console.error("getAllClients failed", err);
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    throw new Error(`getAllClients failed :: ${msg}`);
  }
}

export async function saveClient(client: Omit<Client, 'id'> & { id?: string }): Promise<Client> {
  try {
    const currentUserId = "test-user-id"; // Placeholder for current user ID
    const cleanClient = removeUndefined(client);

    if (client.id) {
      await setDoc(doc(db, 'clients', client.id), cleanClient, { merge: true });
      return cleanClient as Client;
    } else {
      const newDocRef = doc(collection(db, 'clients'));
      const clientWithOwnership = {
        ...cleanClient,
        ownerId: currentUserId,
        id: newDocRef.id,
      };
      await setDoc(newDocRef, clientWithOwnership);
      return clientWithOwnership as Client;
    }
  } catch (err) {
    console.error("saveClient failed", err);
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    throw new Error(`saveClient failed :: ${msg}`);
  }
}

export async function updateClient(client: Client): Promise<void> {
  try {
    const { id, ...data } = client;
    const docRef = doc(db, "clients", id);
    const dataToUpdate = removeUndefined(data);
    await setDoc(docRef, dataToUpdate, { merge: true });
  } catch (err) {
    console.error("updateClient failed", err);
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    throw new Error(`updateClient failed :: ${msg}`);
  }
}
