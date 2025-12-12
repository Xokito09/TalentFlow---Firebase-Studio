"use client";
import React from 'react';
import { Application, Candidate, Position } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  BookOpen,
  Link as LinkIcon
} from 'lucide-react';

interface CandidateReportPageProps {
  name: string;
  role: string;
  email: string;
  linkedin?: string;
  compensation?: string;
  projectRole: string;
  academicBackground?: string;
  languages?: string[];
  professionalBackground?: string;
  mainProjects?: string[];
  hardSkills?: string[];
  phone?: string;
  onBack: () => void;
  backButtonLabel: string;
}

const CandidateReportPage: React.FC<CandidateReportPageProps> = ({ 
  name, 
  role, 
  email, 
  linkedin, 
  compensation, 
  projectRole, 
  academicBackground, 
  languages, 
  professionalBackground, 
  mainProjects, 
  hardSkills, 
  phone, 
  onBack, 
  backButtonLabel 
}) => {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8 space-y-8 bg-slate-50 min-h-screen">
      <Button onClick={onBack} variant="ghost" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-2 pl-0">
        <ArrowLeft className="h-4 w-4" />
        <span>{backButtonLabel}</span>
      </Button>

      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24 border">
          <AvatarFallback className="text-4xl">{name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{name}</h1>
          {role && <p className="text-lg text-slate-700 flex items-center gap-2"><Briefcase className="h-5 w-5 text-slate-500" />{role}</p>}
          {projectRole && <p className="text-md text-slate-600">Applied for: {projectRole}</p>}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="flex items-center gap-2 text-slate-700"><Mail className="h-5 w-5 text-slate-500" />{email}</p>
          {phone && <p className="flex items-center gap-2 text-slate-700"><Phone className="h-5 w-5 text-slate-500" />{phone}</p>}
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
              <LinkIcon className="h-5 w-5 text-slate-500" />LinkedIn Profile
            </a>
          )}
        </CardContent>
      </Card>

      {compensation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Compensation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">{compensation}</p>
          </CardContent>
        </Card>
      )}

      {hardSkills && hardSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Hard Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {hardSkills.map((skill, index) => (
              <Badge key={index} variant="secondary">{skill}</Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {professionalBackground && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Professional Background</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700">{professionalBackground}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CandidateReportPage;
