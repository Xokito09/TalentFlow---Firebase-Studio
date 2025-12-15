import { create } from 'zustand';
import { Client, Candidate, Position, Application, PipelineStageKey } from './types';
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
  updateCandidateInStore: (candidateId: string, data: Partial<Candidate>) => Promise<void>;
  loadPositions: () => Promise<void>;
  loadApplicationsForPosition: (positionId: string) => Promise<void>;
  createCandidateAndApplyToPosition: (params: {
    clientId: string;
    positionId: string;
    candidate: Omit<Candidate, "id" | "createdAt" | "updatedAt">;
    appliedCompensation?: string;
  }) => Promise<{ created: boolean }>;
  addExistingCandidateToPosition: (params: {
    clientId: string;
    positionId: string;
    candidateId: string;
    appliedCompensation?: string;
  }) => Promise<{ created: boolean }>;
};

const getSalaryFromNotes = (notes: string | undefined): string => {
  if (notes && notes.startsWith('SalaryExpectationAtApply: ')) {
    return notes.substring('SalaryExpectationAtApply: '.length);
  }
  return '';
};

export const useAppStore = create<AppState>((set, get) => ({
  clients: [],
  clientsLoading: false,
  clientsInitialized: false,
  candidates: [],
  candidatesLoading: false,
  candidatesInitialized: false,
  positions: [],
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
    // Use the return value which includes the Firestore-generated ID
    const savedClient = await clientsRepository.saveClient(newClient);
    set((state) => ({ clients: [...state.clients, savedClient] }));
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
        ...state.positionsLoadingByPosition,
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
          acc[existingIndex] = currentPosition;
        } else {
          acc.push(currentPosition);
        }
        return acc;
      }, [...existingGlobalPositions]);

      return {
        positionsByClient: updatedPositionsByClient,
        positions: newOrUpdatedGlobalPositions,
        positionsLoadingByPosition: {
          ...state.positionsLoadingByPosition,
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
        updatedPositions = [position, ...(state.positions ?? [])];
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

  updateCandidateInStore: async (candidateId, data) => {
    await candidatesRepository.updateCandidate(candidateId, data);
    set((state) => ({
      candidates: state.candidates.map((c) =>
        c.id === candidateId ? { ...c, ...data } : c
      ),
    }));
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

  createCandidateAndApplyToPosition: async ({ clientId, positionId, candidate: candidateData, appliedCompensation }) => {
    let candidate: Candidate | null = await candidatesRepository.findCandidateByEmail(candidateData.email);

    if (!candidate) {
      candidate = await candidatesRepository.createCandidate(candidateData);
      set((state) => ({ candidates: [...state.candidates, candidate!] }));
    }

    const state = get(); // Re-get state after potential candidate creation
    const position = state.positions.find(p => p.id === positionId) ||
                     state.positionsByClient[clientId]?.find(p => p.id === positionId);

    const { application, created } = await applicationsRepository.createOrGetApplication({
      candidateId: candidate.id,
      clientId,
      positionId,
      stageKey: 'shortlisted',
      appliedRoleTitle: candidateData.currentTitle || '',
      appliedCompensation: appliedCompensation || '',
      professionalBackgroundAtApply: candidate.professionalBackground || '',
      mainProjectsAtApply: candidate.mainProjects || [],
    });

    if (created) {
      set((state) => {
        const currentApplications = state.applicationsByPosition[positionId] || [];
        const updatedApplications = [...currentApplications, application].filter((app, index, self) =>
          index === self.findIndex((a) => a.id === app.id)
        );
        return {
          applicationsByPosition: {
            ...state.applicationsByPosition,
            [positionId]: updatedApplications,
          },
        };
      });
    }

    return { created };
  },

  addExistingCandidateToPosition: async ({ clientId, positionId, candidateId, appliedCompensation }) => {
    const state = get();
    let candidate = state.candidates.find(c => c.id === candidateId);

    if (!candidate) {
      candidate = await candidatesRepository.getCandidateById(candidateId);
      if (candidate) {
        set((state) => ({ candidates: [...state.candidates, candidate!] }));
      } else {
        console.error("Candidate not found:", candidateId);
        return { created: false };
      }
    }

    const position = state.positions.find(p => p.id === positionId) ||
                     state.positionsByClient[clientId]?.find(p => p.id === positionId);

    const { application, created } = await applicationsRepository.createOrGetApplication({
      candidateId: candidate.id,
      clientId,
      positionId,
      stageKey: 'shortlisted',
      appliedRoleTitle: candidate.currentTitle || '',
      appliedCompensation: appliedCompensation || '',
      professionalBackgroundAtApply: candidate.professionalBackground || '',
      mainProjectsAtApply: candidate.mainProjects || [],
    });

    if (created) {
      set((state) => {
        const currentApplications = state.applicationsByPosition[positionId] || [];
        const updatedApplications = [...currentApplications, application].filter((app, index, self) =>
          index === self.findIndex((a) => a.id === app.id)
        );
        return {
          applicationsByPosition: {
            ...state.applicationsByPosition,
            [positionId]: updatedApplications,
          },
        };
      });
    }

    return { created };
  },
}));
