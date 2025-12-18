import type { LucideIcon } from "lucide-react";
import { Timestamp } from "firebase/firestore";

export type WithId<T> = T & { id: string };

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
};

export type PipelineStageKey = 'shortlisted' | 'client_interview_1' | 'client_interview_2' | 'hired';

export type Candidate = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  currentTitle?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Identity and core profile fields as per prompt
  linkedinUrl?: string;
  photoUrl?: string;
  photoThumbUrl?: string;
  hardSkills?: string[];
  languages?: string[];
  academicBackground?: string[];
  professionalBackground?: string; // Replaces bio
  mainProjects?: string[]; // Replaces notes
};

export type Client = {
  id: string;
  name: string;
  pointOfContact: string;
  contactEmail: string;
  relationshipStatus: 'prospect' | 'active' | 'churn' | 'lost';
  updatedAt?: Timestamp;
  notes?: string;

  // Optional fields
  industry?: string;
  location?: string;
  website?: string;
  logoUrl?: string;
  ownerId?: string;
  createdAt?: Timestamp;
  taxId?: string;
  billingAddress?: string;
  billingEmail?: string;
  paymentTerms?: string;
};

export type FunnelMetrics = {
  sourced: number;
  approached: number;
  notInterested: number;
  noResponse: number;
  activePipeline: number;
  shortlisted: number;
  finalInterviews: number;
};

export const DEFAULT_FUNNEL_METRICS: FunnelMetrics = {
  sourced: 0,
  approached: 0,
  notInterested: 0,
  noResponse: 0,
  activePipeline: 0,
  shortlisted: 0,
  finalInterviews: 0,
};

export type Position = {
  id: string;
  title: string;
  clientId: string;
  description: string;
  requirements: string[];
  status: 'Open' | 'Closed' | 'On Hold';
  createdAt?: Timestamp; // Added createdAt
  updatedAt?: Timestamp; // Added updatedAt
  location?: string;
  department?: string;
  funnelMetrics?: FunnelMetrics;
};

export type Application = {
  id: string;
  candidateId: string;
  positionId: string;
  clientId: string;
  stageKey: PipelineStageKey;
  appliedDate: Timestamp;
  updatedAt: Timestamp;
  createdAt: Timestamp;

  // Normalized Per-Application Fields
  appliedRoleTitle?: string;
  appliedCompensation?: string;
  professionalBackgroundAtApply?: string;
  mainProjectsAtApply?: string[];
};

export type CandidateProfilePdfData = {
    name: string;
    title?: string;
    location?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    skills?: string[];
    languages?: string[];
    summary?: string;
    professionalBackground?: string;
    compensation?: string;
    projectRole?: string;
    photoDataUrl?: string | null;
    mainProjects?: string[];
    academicBackground?: string[];
};

export type CandidateProfilePdfProps = {
  candidate: CandidateProfilePdfData;
};
