"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Mail,
  Phone,
  Link as LinkIcon,
  DollarSign,
  Languages as LanguagesIcon,
  GraduationCap,
  AlertTriangle,
  Briefcase,
  Code,
} from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type HiddenField =
  | "contact"
  | "salary"
  | "languages"
  | "education"
  | "professional_background"
  | "main_projects"
  | "hard_skills";

interface CandidateReportPageProps {
  // Identity
  name: string;
  role: string;

  // Contact
  email: string;
  phone?: string;
  linkedin?: string;

  // Application context
  projectRole: string; // Position title (what they applied for)
  compensation?: string; // Per-application compensation

  // Profile sections (prefer per-application values if available)
  academicBackground?: string | string[];
  languages?: string[] | string;
  professionalBackground?: string;
  mainProjects?: string[] | string;
  hardSkills?: string[] | string;
  photoUrl?: string; // Added photoUrl prop

  // Optional flags/future-proofing
  isRejected?: boolean;
  hiddenFields?: HiddenField[];
  id?: string;

  // Branding (optional, defaults are safe)
  brandName?: string; // e.g., "Kaptas Global"
  brandLogoUrl?: string; // optional logo shown on the report

  // Navigation
  onBack: () => void;
  backButtonLabel: string;
}

function normalizeToArray(value?: string | string[]): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }

  const raw = String(value).trim();
  if (!raw) return [];

  const parts = raw.includes("\n") ? raw.split("\n") : raw.split(",");
  return parts.map((p) => p.trim()).filter(Boolean);
}

function formatLinkedinUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

function formatLinkedinDisplay(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return trimmed.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "");
}

const HeaderStat: React.FC<{ icon: React.ReactNode; label: string; value: string | undefined | null | string[] }> = ({ icon, label, value }) => {
  const displayValue = Array.isArray(value) ? value.join(', ') : value;
  if (!displayValue) return null;
  return (
    <div className="flex flex-col items-start h-full w-full">
      <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <span className="text-indigo-600 flex-shrink-0">
          {icon}
        </span>
        {label}
      </div>
      <div className="text-sm font-bold text-slate-900 leading-snug w-full">{displayValue}</div>
    </div>
  );
};

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
  isRejected = false,
  hiddenFields = [],
  id,
  brandName = "Kaptas Global",
  brandLogoUrl,
  onBack,
  backButtonLabel,
}) => {
  const isHidden = (field: HiddenField) => hiddenFields.includes(field);

  const educationList = normalizeToArray(academicBackground);
  const languageList = normalizeToArray(languages);
  const projectsList = normalizeToArray(mainProjects);
  const skillsList = normalizeToArray(hardSkills);

  const showContact = !isHidden("contact");
  const showSalary = !isHidden("salary") && !!compensation;
  const showLanguages = !isHidden("languages") && languageList.length > 0;
  const showEducation = !isHidden("education") && educationList.length > 0;

  const showProfBackground = !isHidden("professional_background") && !!professionalBackground?.trim();
  const showProjects = !isHidden("main_projects") && projectsList.length > 0;
  const showSkills = !isHidden("hard_skills") && skillsList.length > 0;

  const hasLeftContent = showProfBackground || showProjects;
  const hasRightContent = showSkills;

  const visibleStatsCount = [showSalary, showLanguages, showEducation].filter(Boolean).length;
  const gridColsClass =
    visibleStatsCount === 1
      ? "md:grid-cols-1"
      : visibleStatsCount === 2
      ? "md:grid-cols-2"
      : "md:grid-cols-3";

  const safeLinkedinUrl = linkedin ? formatLinkedinUrl(linkedin) : "";
  const linkedinDisplay = linkedin ? formatLinkedinDisplay(linkedin) : "";

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 print:bg-white print:py-0 print:px-0">
      {/* Back button should never appear in the PDF print */}
      <div className="mx-auto" style={{ maxWidth: "210mm" }}>
        <div className="print:hidden mb-4">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-2 pl-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{backButtonLabel}</span>
          </Button>
        </div>

        {/* Report (this is what you export to PDF) */}
        <div
          id={id}
          className="report-page w-full bg-white p-6 md:p-12 font-sans text-slate-700 relative mx-auto shadow-2xl mb-8 print:shadow-none print:m-0 print:border-none"
          style={{ maxWidth: "210mm", minHeight: "290mm" }}
        >
          <div className="w-full h-full flex flex-col">
            {/* REJECTED banner (optional) */}
            {isRejected && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="text-sm font-bold text-red-800 uppercase tracking-wide">
                    Candidate Reproved
                  </h3>
                  <p className="text-xs text-red-600 mt-0.5">
                    This candidate is no longer active in the pipeline.
                  </p>
                </div>
              </div>
            )}

            {/* HEADER CARD */}
            <header className="w-full mb-10 bg-white rounded-2xl border border-slate-200 p-6 relative overflow-hidden">
              {/* Subtle corner decoration */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none" />

              {/* Top row: Brand + Project Role */}
              <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-3 relative z-10">
                <div className="flex items-center gap-3">
                  {brandLogoUrl ? (
                    <Image
                      src={brandLogoUrl}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded object-cover"
                      alt={`${brandName} logo`}
                    />
                  ) : (
                    <div className="w-9 h-9 bg-slate-900 text-white flex items-center justify-center rounded font-bold text-lg">
                      {brandName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-bold tracking-[0.2em] text-slate-900 uppercase">
                    {brandName}
                  </span>
                </div>

                {projectRole && (
                  <div className="text-right opacity-70">
                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest mr-2">
                      Project Role:
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">
                      {projectRole}
                    </span>
                  </div>
                )}
              </div>

              {/* Main Identity Row */}
              <div className="relative z-10 flex items-center gap-6 text-left">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    width={72}
                    height={72}
                    alt={name}
                    className="w-18 h-18 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                  />
                ) : (
                  <Avatar className="w-18 h-18 rounded-lg flex-shrink-0 border border-slate-200 bg-transparent">
                    <AvatarFallback className="text-3xl bg-slate-100 text-slate-700 font-semibold">
                      {name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <h1 className="text-5xl font-extrabold text-slate-900 uppercase leading-none tracking-tighter mb-0">
                    {name}
                  </h1>
                  {role && (
                    <p className="mt-1 text-base font-medium text-slate-600 uppercase tracking-wide">
                      {role}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact row */}
              {showContact && (
                <div className="relative z-10 mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-normal text-slate-600 border-t border-slate-200 pt-4">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span className="break-all">{email}</span>
                  </div>

                  {phone && (
                    <>
                      <div className="hidden md:block w-px h-3 bg-slate-300" />
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="break-all">{phone}</span>
                      </div>
                    </>
                  )}

                  {linkedin && safeLinkedinUrl && (
                    <>
                      <div className="hidden md:block w-px h-3 bg-slate-300" />
                      <div className="flex items-center gap-1.5">
                        <LinkIcon className="w-3 h-3 text-slate-400" />
                        <a
                          href={safeLinkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0077b5] hover:underline cursor-pointer break-all"
                        >
                          {linkedinDisplay || "LinkedIn"}
                        </a>
                      </div>
                    </>
                  )}
                </div>
              )}
            </header>

            {/* Stats row - moved below header content but still within the main report div */}
            {visibleStatsCount > 0 && (
              <div
                className={`grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8 pt-6 border-t border-slate-200 relative z-10 mx-auto max-w-full`}
              >
                {showSalary && (
                  <HeaderStat
                    icon={<DollarSign size={16} />}
                    label="Compensation"
                    value={<span className="whitespace-pre-line">{compensation}</span>}
                  />
                )}

                {showLanguages && (
                  <HeaderStat
                    icon={<LanguagesIcon size={16} />}
                    label="Languages"
                    value={
                      <div className="flex flex-col">
                        {languageList.map((lang, i) => (
                          <span key={`${lang}-${i}`} className="whitespace-normal">
                            {lang}
                          </span>
                        ))}
                      </div>
                    }
                  />
                )}

                {showEducation && (
                  <HeaderStat
                    icon={<GraduationCap size={16} />}
                    label="Education"
                    value={
                      <div className="flex flex-col gap-1">
                        {educationList.map((edu, i) => (
                          <div key={`${edu}-${i}`} className="break-words">
                            {edu}
                          </div>
                        ))}
                      </div>
                    }
                  />
                )}
              </div>
            )}

            {/* BODY */}
            <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-12 leading-relaxed mt-10">
              {/* Left column */}
              {hasLeftContent && (
                <div
                  className={`flex flex-col gap-10 ${
                    hasRightContent ? "md:col-span-8" : "md:col-span-12"
                  }`}
                >
                  {showProfBackground && (
                    <div>
                      <h2 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-widest border-b border-slate-100 pb-2">
                        Professional Background
                      </h2>
                      <div className="space-y-4 text-justify text-sm font-medium text-slate-700 leading-7 whitespace-pre-line">
                        <p>{professionalBackground}</p>
                      </div>
                    </div>
                  )}

                  {showProjects && (
                    <div>
                      <h2 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-widest border-b border-slate-100 pb-2">
                        Main Projects
                      </h2>
                      <ul className="space-y-4 text-sm text-slate-700">
                        {projectsList.map((project, i) => (
                          <li key={`${project}-${i}`} className="flex items-start gap-3">
                            <span className="mt-2 w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
                            <span className="leading-snug font-medium whitespace-pre-line">
                              {project}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Right column */}
              {hasRightContent && (
                <div
                  className={`flex flex-col gap-8 ${
                    hasLeftContent
                      ? "md:col-span-4 md:border-l md:border-slate-100 md:pl-10"
                      : "md:col-span-12"
                  }`}
                >
                  {showSkills && (
                    <div>
                      <h2 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-widest border-b border-slate-100 pb-2">
                        Hard Skills
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {skillsList.map((skill, i) => (
                          <span
                            key={`${skill}-${i}`}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-700 rounded-md text-[10px] font-bold uppercase tracking-wide"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </main>

            {/* FOOTER */}
            <footer className="mt-auto pt-8 border-t border-slate-100 flex justify-between items-center opacity-60">
              <span className="text-[9px] font-mono uppercase text-slate-500">
                {brandName}
              </span>
              <span className="text-[9px] font-mono uppercase text-slate-500">
                Confidential
              </span>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateReportPage;
