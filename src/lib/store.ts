import { create } from 'zustand';
import { Client, Candidate, Position, Application } from './types';
import { candidates, positions, applications } from './data';
import * as clientsRepository from './repositories/clients'; // Import clientsRepository
import { getPositionsByClientId, createPosition, updatePosition } from './repositories/positions';

type ViewState = 
  | { type: 'CLIENT_LIST', activeTab?: 'partner' | 'prospect' }
  | { type: 'CLIENT_DETAIL', clientId: string, previousView?: ViewState }
  | { type: 'CANDIDATE_LIST' }
  | { type: 'POSITION_LIST' };

type AppState = {
  clients: Client[];
  clientsLoading: boolean;
  clientsInitialized: boolean;
  candidates: Candidate[];
  positions: Position[];
  applications: Application[];
  viewState: ViewState;
  setViewState: (viewState: ViewState) => void;
  addClient: (client: Client) => Promise<void>;
  updateClient: (client: Client) => Promise<void>;
  loadClients: () => Promise<void>;
  
  positionsByClient: Record<string, Position[]>;
  positionsLoadingByClient: Record<string, boolean>;
  loadPositionsForClient: (clientId: string) => Promise<void>;
  addPosition: (position: Omit<Position, "id">) => Promise<void>;
  updatePositionInStore: (position: Position) => Promise<void>;
};

export const useAppStore = create<AppState>((set, get) => ({
  clients: [],
  clientsLoading: false,
  clientsInitialized: false,
  candidates,
  positions,
  applications,
  viewState: { type: 'CLIENT_LIST' },
  setViewState: (viewState) => set({ viewState }),
  addClient: async (client) => {
    const newClient = {
        ...client,
        relationshipStatus: client.relationshipStatus || 'client',
    };
    await clientsRepository.saveClient(newClient); // Use repository
    set((state) => ({ clients: [...state.clients, newClient] }));
  },
  updateClient: async (updatedClient) => {
    // update local state
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === updatedClient.id ? updatedClient : c
      ),
    }));

    // persist to Firestore
    try {
      await clientsRepository.updateClient(updatedClient); // Use repository
    } catch (error) {
      console.error("Failed to update client in Firestore", error);
    }
  },
  loadClients: async () => {
    if (get().clientsInitialized) {
      return;
    }
    set({ clientsLoading: true });
    const clients = await clientsRepository.getAllClients(); // Use repository
    const normalizedClients = clients.map(client => ({
        ...client,
        relationshipStatus: client.relationshipStatus || 'client'
    }));
    set({ clients: normalizedClients, clientsInitialized: true, clientsLoading: false });
  },

  positionsByClient: {},
  positionsLoadingByClient: {},
  loadPositionsForClient: async (clientId: string) => {
    if (get().positionsLoadingByClient[clientId]) {
      return;
    }
    set((state) => ({
      positionsLoadingByClient: {
        ...state.positionsLoadingByClient,
        [clientId]: true,
      },
    }));
    const clientPositions = await getPositionsByClientId(clientId);
    set((state) => ({
      positionsByClient: {
        ...state.positionsByClient,
        [clientId]: clientPositions,
      },
      positionsLoadingByClient: {
        ...state.positionsLoadingByClient,
        [clientId]: false,
      },
    }));
  },
  addPosition: async (positionData: Omit<Position, "id">) => {
    const newPosition = await createPosition(positionData);
    set((state) => ({
      positionsByClient: {
        ...state.positionsByClient,
        [newPosition.clientId]: [
          ...(state.positionsByClient[newPosition.clientId] || []),
          newPosition,
        ],
      },
    }));
  },
  updatePositionInStore: async (position: Position) => {
    await updatePosition(position);
    set((state) => ({
      positionsByClient: {
        ...state.positionsByClient,
        [position.clientId]: state.positionsByClient[position.clientId]?.map(p => 
          p.id === position.id ? position : p
        ) || [],
      },
    }));
  },
}));
