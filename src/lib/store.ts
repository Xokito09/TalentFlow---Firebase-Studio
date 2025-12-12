import { create } from 'zustand';
import { Client, Candidate, Position, Application, PipelineStageKey } from './types';
// Removed: import { positions as mockPositionsData } from './data';
import * as clientsRepository from './repositories/clients';
import * as candidatesRepository from './repositories/candidates';
import * as applicationsRepository from './repositories/applications';
import { getPositionsByClientId, getAllPositions, createPosition, updatePosition } from './repositories/positions';

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
  candidatesLoading: boolean;
  candidatesInitialized: boolean;
  positions: Position[];
  positionsLoading: boolean;
  positionsInitialized: boolean;
  applicationsByPosition: Record<string, Application[]>;
  applicationsLoadingByPosition: Record<string, boolean>;
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

  loadCandidates: () => Promise<void>;
  loadPositions: () => Promise<void>;
  loadApplicationsForPosition: (positionId: string) => Promise<void>;
  createCandidateAndApplyToPosition: (params: {
    clientId: string;
    positionId: string;
    candidate: Omit<Candidate, "id" | "createdAt" | "updatedAt">;
  }) => Promise<void>;
  addExistingCandidateToPosition: (params: {
    clientId: string;
    positionId: string;
    candidateId: string;
  }) => Promise<void>;
};

export const useAppStore = create<AppState>((set, get) => ({
  clients: [],
  clientsLoading: false,
  clientsInitialized: false,
  candidates: [],
  candidatesLoading: false,
  candidatesInitialized: false,
  positions: [], // Initialized as empty array
  positionsLoading: false,
  positionsInitialized: false,
  applicationsByPosition: {},
  applicationsLoadingByPosition: {},
  viewState: { type: 'CLIENT_LIST' },
  setViewState: (viewState) => set({ viewState }),
  addClient: async (client) => {
    const newClient = {
        ...client,
        relationshipStatus: client.relationshipStatus || 'client',
    };
    await clientsRepository.saveClient(newClient); 
    set((state) => ({ clients: [...state.clients, newClient] }));
  },
  updateClient: async (updatedClient) => {
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === updatedClient.id ? updatedClient : c
      ),
    }));

    try {
      await clientsRepository.updateClient(updatedClient);
    } catch (error) {
      console.error("Failed to update client in Firestore", error);
    }
  },
  loadClients: async () => {
    if (get().clientsInitialized) {
      return;
    }
    set({ clientsLoading: true });
    const clients = await clientsRepository.getAllClients();
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
    set((state) => {
      const updatedPositionsByClient = {
        ...state.positionsByClient,
        [clientId]: clientPositions,
      };

      const existingGlobalPositions = state.positions ?? [];
      const newOrUpdatedGlobalPositions = clientPositions.reduce((acc, currentPosition) => {
        const existingIndex = acc.findIndex(p => p.id === currentPosition.id);
        if (existingIndex > -1) {
          acc[existingIndex] = currentPosition; // Update existing
        } else {
          acc.push(currentPosition); // Add new
        }
        return acc;
      }, [...existingGlobalPositions]);

      return {
        positionsByClient: updatedPositionsByClient,
        positions: newOrUpdatedGlobalPositions,
        positionsLoadingByClient: {
          ...state.positionsLoadingByClient,
          [clientId]: false,
        },
      };
    });
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
      positions: [newPosition, ...(state.positions ?? [])].filter(
        (p, i, arr) => arr.findIndex((t) => t.id === p.id) === i
      ),
    }));
  },
  updatePositionInStore: async (position: Position) => {
    await updatePosition(position);
    set((state) => {
      const existingPositionIndex = (state.positions ?? []).findIndex(p => p.id === position.id);
      let updatedPositions;

      if (existingPositionIndex > -1) {
        updatedPositions = (state.positions ?? []).map(p => (p.id === position.id ? position : p));
      } else {
        updatedPositions = [position, ...(state.positions ?? [])]; // Add if not found
      }
      
      return {
        positions: updatedPositions,
        positionsByClient: Object.fromEntries(
          Object.entries(state.positionsByClient).map(([cid, list]) => [
            cid,
            (list ?? []).map(p => (p.id === position.id ? position : p)),
          ])
        ),
      };
    });
  },

  loadCandidates: async () => {
    if (get().candidatesInitialized) {
      return;
    }
    set({ candidatesLoading: true });
    const candidates = await candidatesRepository.getAllCandidates();
    set({ candidates, candidatesInitialized: true, candidatesLoading: false });
  },

  loadPositions: async () => {
    if (get().positionsInitialized) {
      return;
    }
    set({ positionsLoading: true });
    try {
      const positions = await getAllPositions();
      set({ positions, positionsInitialized: true });
    } catch (error) {
      console.error("Failed to load positions", error);
    } finally {
      set({ positionsLoading: false });
    }
  },

  loadApplicationsForPosition: async (positionId: string) => {
    if (get().applicationsLoadingByPosition[positionId]) {
      return;
    }
    set((state) => ({
      applicationsLoadingByPosition: {
        ...state.applicationsLoadingByPosition,
        [positionId]: true,
      },
    }));
    const applications = await applicationsRepository.getApplicationsByPositionId(positionId);
    set((state) => ({
      applicationsByPosition: {
        ...state.applicationsByPosition,
        [positionId]: applications,
      },
      applicationsLoadingByPosition: {
        ...state.applicationsLoadingByPosition,
        [positionId]: false,
      },
    }));
  },

  createCandidateAndApplyToPosition: async ({ clientId, positionId, candidate: candidateData }) => {
    let candidate: Candidate | null = await candidatesRepository.findCandidateByEmail(candidateData.email);
    const state = get();

    if (!candidate) {
      candidate = await candidatesRepository.createCandidate(candidateData);
      set((state) => ({ candidates: [...state.candidates, candidate!] }));
    }

    const position = state.positions.find(p => p.id === positionId) || 
                     state.positionsByClient[clientId]?.find(p => p.id === positionId);

    const newApplication = await applicationsRepository.createApplication({
      candidateId: candidate.id,
      clientId,
      positionId,
      stageKey: 'shortlisted',
      candidateSnapshot: {
        fullName: candidate.fullName,
        currentTitle: candidate.currentTitle,
      },
      applicationSnapshot: {
        appliedRole: candidateData.currentTitle || '',
        appliedSalaryExpectation: candidateData.notes || '',
        appliedPositionTitle: position?.title || '',
      },
    });

    set((state) => ({
      applicationsByPosition: {
        ...state.applicationsByPosition,
        [positionId]: [
          ...(state.applicationsByPosition[positionId] || []),
          newApplication,
        ],
      },
    }));
  },

  addExistingCandidateToPosition: async ({ clientId, positionId, candidateId }) => {
    const state = get();
    let candidate = state.candidates.find(c => c.id === candidateId);

    if (!candidate) {
      candidate = await candidatesRepository.getCandidateById(candidateId);
      if (candidate) {
        set((state) => ({ candidates: [...state.candidates, candidate!] }));
      } else {
        console.error("Candidate not found:", candidateId);
        return;
      }
    }

    const position = state.positions.find(p => p.id === positionId) || 
                     state.positionsByClient[clientId]?.find(p => p.id === positionId);

    const newApplication = await applicationsRepository.createApplication({
      candidateId: candidate.id,
      clientId,
      positionId,
      stageKey: 'shortlisted',
      candidateSnapshot: {
        fullName: candidate.fullName,
        currentTitle: candidate.currentTitle,
      },
      applicationSnapshot: {
        appliedRole: candidate.currentTitle || '',
        appliedSalaryExpectation: candidate.notes || '',
        appliedPositionTitle: position?.title || '',
      },
    });

    set((state) => ({
      applicationsByPosition: {
        ...state.applicationsByPosition,
        [positionId]: [
          ...(state.applicationsByPosition[positionId] || []),
          newApplication,
        ],
      },
    }));
  },
}));
