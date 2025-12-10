import type { LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
};

export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  currentRole: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  notes?: string;
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

export type ApplicationStatus = 'Sourced' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';

export type Application = {
  id: string;
  candidateId: string;
  positionId: string;
  status: ApplicationStatus;
  appliedDate: string;
};
