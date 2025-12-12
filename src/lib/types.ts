import type { LucideIcon } from "lucide-react";
import { Timestamp } from "firebase/firestore";

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
  skills?: string[];
  bio?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Identity fields
  name?: string; // Legacy
  currentRole?: string; // Legacy
  avatarUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  photoUrl?: string;
  hardSkills?: string[];
  languages?: string[];
  academicBackground?: string[];
  professionalBackground?: string;
  mainProjects?: string[];
};

export type Client = {
  id: string;
  name: string;
  industry: string;
  location: string;
  website?: string;
  pointOfContact: string;
  contactEmail: string;
  logoUrl: string;
  relationshipStatus: 'client' | 'prospect' | 'churn' | 'lost';
  // CRM Fields
  taxId?: string;
  billingAddress?: string;
  billingEmail?: string;
  paymentTerms?: string;
  notes?: string;
};

export type Position = {
  id: string;
  title: string;
  clientId: string;
  description: string;
  requirements: string[];
  status: 'Open' | 'Closed' | 'On Hold';
  location?: string;
  department?: string;
};

// For backward compatibility (will be removed later)
export type ApplicationStatus = 'Sourced' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';

export type Application = {
  id: string;
  candidateId: string;
  positionId: string;
  clientId: string;
  stageKey: PipelineStageKey;
  appliedDate: Timestamp;
  updatedAt: Timestamp;
  
  // Normalized Per-Application Fields
  appliedRoleTitle?: string;
  appliedCompensation?: string;
  professionalBackgroundAtApply?: string;
  mainProjectsAtApply?: string[];
  
  // Legacy / Transitional Snapshots (can be deprecated eventually)
  candidateSnapshot?: {
    fullName?: string;
    currentTitle?: string;
    email?: string;
    linkedinUrl?: string;
    academicBackground?: string[];
    languages?: string[];
    professionalBackground?: string;
    mainProjects?: string[];
    hardSkills?: string[];
  };
  applicationSnapshot?: {
    positionTitle?: string;
    appliedRole?: string;
    compensation?: string;
  };
  
  // For backward compatibility (will be removed later)
  status?: ApplicationStatus;
};
