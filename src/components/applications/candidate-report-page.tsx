"use client";

import React, { useMemo } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  DollarSign,
  Languages as LanguagesIcon,
  GraduationCap,
} from "lucide-react";
import Image from "next/image";
import { Logo } from "@/components/logo";

interface CandidateReportPageProps {
  // Identity
  name: string;
  role: string;

  // Contact
  email: string;
  phone?: string;
  linkedin?: string;

  // Application context
  projectRole: string;
  compensation?: string;

  // Profile sections
  academicBackground?: string | string[];
  languages?: string[] | string;
  professionalBackground?: string;
  mainProjects?: string[] | string;
  hardSkills?: string[] | string;
  photoUrl?: string;

  // Navigation props
  applicationId: string;
  candidateId: string;
  from?: string;
  fromPositionId?: string;
  fromCandidateId?: string;
}

function normalizeToArray(value?: string | string[]): string[] {
  if (!value) return [];
  const items = Array.isArray(value) ? value : [value];
  return items
    .flatMap(item => String(item).split('\n'))
    .map(part => part.trim().replace(/^[•\-●]\s*/, '').trim())
    .filter(part => part.length > 0);
}

const InfoColumn: React.FC<{ icon: React.ElementType; label: string; value: React.ReactNode }> = ({ icon: Icon, label, value }) => (
  <div>
    <div className="flex items-center gap-2">
      <Icon className="w-[18px] h-[18px] text-[#4C1D95]" />
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#94A3B8]">{label}</span>
    </div>
    <div className="mt-[10px] text-lg leading-[22px] font-extrabold text-[#0F172A]">
      {value}
    </div>
  </div>
);

const SectionHeading: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div>
    <h2 className={`text-xs font-extrabold uppercase tracking-[0.18em] ${className}`}>
      {children}
    </h2>
    <div className="mt-3 mb-[18px] h-[1px] bg-[#EEF2F7]"></div>
  </div>
);

const CandidateReportPage: React.FC<CandidateReportPageProps> = ({
  name,
  role,
  email,
  phone,
  linkedin,
  compensation,
  projectRole,
  academicBackground,
  languages,
  professionalBackground,
  mainProjects,
  hardSkills,
  photoUrl,
  applicationId,
  from,
  fromPositionId,
  fromCandidateId,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (from === "position" && fromPositionId) {
      router.push(`/positions/${fromPositionId}`);
    } else if (from === "candidate" && fromCandidateId) {
      router.push(`/candidates/${fromCandidateId}`);
    } else {
      router.back();
    }
  };

  const backButtonLabel = useMemo(() => {
    if (from === "position") {
      return "Back to Position";
    } else if (from === "candidate") {
      return "Back to Candidate Profile";
    } else {
      return "Back";
    }
  }, [from]);

  const skillsList = normalizeToArray(hardSkills);
  const projectsList = normalizeToArray(mainProjects);

  const formattedCompensation = useMemo(() => {
    if (!compensation) return '';
    if (compensation.toLowerCase().includes('monthly')) return compensation;
    return `USD ${compensation} monthly`;
  }, [compensation]);

  return (
    <div className="bg-[#F5F7FB] font-sans">
      <div className="max-w-[794px] mx-auto px-12 py-12">
        <div className="mb-4 print:hidden">
          <Button onClick={handleBack} variant="ghost" className="text-sm text-[#475569] hover:text-[#0F172A] flex items-center gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            <span>{backButtonLabel}</span>
          </Button>
        </div>

        {/* Header Card */}
        <div className="bg-[#FFFFFF] rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[#E6E8EF] p-7 report-container">
          <div className="flex justify-between items-center mb-5 border-b border-[#EEF2F7] pb-3.5">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 bg-[#0F172A] rounded-[10px] flex items-center justify-center text-white">
                <Logo />
              </div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#0F172A] uppercase">KAPTAS GLOBAL</span>
            </div>
            <div className="text-right flex items-baseline">
              <span className="text-[11px] font-semibold tracking-[0.1em] text-[#94A3B8] uppercase mr-2">PROJECT ROLE:</span>
              <span className="text-xs font-extrabold tracking-[0.05em] text-[#16A34A] uppercase">{projectRole}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-5">
            <div className="w-[80px] h-[80px] bg-[#F1F5F9] rounded-[12px] flex-shrink-0 border border-[#E6E8EF] overflow-hidden">
              {photoUrl && <Image src={photoUrl} alt={name} width={80} height={80} className="object-cover w-full h-full" />}
            </div>
            <div className="flex-grow">
              <h1 className="text-[28px] leading-[1.2] font-bold text-[#0F172A] uppercase tracking-[-0.02em]">{name}</h1>
              <p className="mt-1 text-[12px] font-bold text-[#16A34A] uppercase tracking-[0.08em]">{role}</p>

              <div className="mt-2.5 flex flex-wrap items-center text-[10px] text-[#64748B]">
                {linkedin && (
                  <>
                     <div className="flex items-center gap-1.5 mr-3">
                      <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-[#2563EB] hover:underline">
                        {linkedin.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\//, '')}
                      </a>
                    </div>
                    {(email || phone) && <span className="mr-3 text-[#CBD5E1]">|</span>}
                  </>
                )}
               
                <div className="flex items-center gap-1.5 mr-3">
                  <span>{email}</span>
                </div>
                {phone && (
                  <>
                    <span className="mr-3 text-[#CBD5E1]">|</span>
                    <div className="flex items-center gap-1.5">
                      <span>{phone}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-[18px] pt-[16px] border-t border-[#EEF2F7]">
             <div className="grid grid-cols-3 gap-8">
                <InfoColumn icon={DollarSign} label="COMPENSATION" value={formattedCompensation} />
                <InfoColumn icon={LanguagesIcon} label="LANGUAGES" value={Array.isArray(languages) ? languages.join(', ') : languages} />
                <InfoColumn icon={GraduationCap} label="EDUCATION" value={Array.isArray(academicBackground) ? academicBackground.join(', ') : academicBackground} />
             </div>
          </div>
        </div>

        {/* Body Grid */}
        <div className="mt-[34px] grid grid-cols-[2.6fr_1fr] gap-x-[44px] body-grid">
          {/* Left Column */}
          <div>
            <SectionHeading className="text-[#94A3B8]">PROFESSIONAL BACKGROUND</SectionHeading>
            <p className="text-base leading-[26px] font-medium text-[#334155] whitespace-pre-line text-justify mb-8">
              {professionalBackground}
            </p>

            <div>
              <SectionHeading className="text-[#94A3B8]">MAIN PROJECTS</SectionHeading>
              <ul className="space-y-[12px] mt-2">
                {projectsList.map((project, index) => (
                  <li key={index} className="flex items-start gap-[10px]">
                    <div className="mt-[8px] w-[3px] h-[3px] bg-[#16A34A] rounded-full flex-shrink-0"></div>
                    <span className="text-[15px] leading-6 font-medium text-[#334155]">{project}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="hard-skills-column">
            <SectionHeading className="text-[#94A3B8]">HARD SKILLS</SectionHeading>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, index) => (
                <span key={index} className="bg-[#FFFFFF] border border-[#E2E8F0] text-[#475569] text-[10px] font-bold uppercase tracking-wider px-[8px] py-[4px] rounded-[4px]">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden print:block fixed bottom-[24px] left-[36px] right-[36px] border-t border-[#E2E8F0] pt-2">
        <div className="flex justify-between items-center text-[10px] font-medium uppercase tracking-[0.1em] text-[#94A3B8]">
          <span>KAPTAS GLOBAL</span>
          <span>CONFIDENTIAL</span>
        </div>
      </div>
    </div>
  );
};

export default CandidateReportPage;
