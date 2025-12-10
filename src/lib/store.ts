import { create } from 'zustand';
import { Client, Candidate, Position, Application } from './types';
import { clients, candidates, positions, applications } from './data';

type ViewState = 
  | { type: 'CLIENT_LIST', activeTab?: 'partner' | 'prospect' }
  | { type: 'CLIENT_DETAIL', clientId: string, previousView?: ViewState }
  | { type: 'CANDIDATE_LIST' }
  | { type: 'POSITION_LIST' };

type AppState = {
  clients: Client[];
  candidates: Candidate[];
  positions: Position[];
  applications: Application[];
  viewState: ViewState;
  setViewState: (viewState: ViewState) => void;
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
};

export const useAppStore = create<AppState>((set) => ({
  clients,
  candidates,
  positions,
  applications,
  viewState: { type: 'CLIENT_LIST' },
  setViewState: (viewState) => set({ viewState }),
  addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
  updateClient: (client) =>
    set((state) => ({
      clients: state.clients.map((c) => (c.id === client.id ? client : c)),
    })),
}));
