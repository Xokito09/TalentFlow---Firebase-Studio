import { create } from 'zustand';
import { Client, Candidate, Position, Application } from './types';
import { candidates, positions, applications } from './data';
import { getAllClients, saveClient } from './repositories/clients';

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
    await saveClient(client);
    set((state) => ({ clients: [...state.clients, client] }));
  },
  updateClient: async (client) => {
    await saveClient(client);
    set((state) => ({
      clients: state.clients.map((c) => (c.id === client.id ? client : c)),
    }));
  },
  loadClients: async () => {
    if (get().clientsInitialized) {
      return;
    }
    set({ clientsLoading: true });
    const clients = await getAllClients();
    set({ clients, clientsInitialized: true, clientsLoading: false });
  },
}));
