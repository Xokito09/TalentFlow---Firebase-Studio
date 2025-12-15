"use client";
import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Candidate } from '@/lib/types';
import { toast } from "@/hooks/use-toast";

interface EditCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
}

const parseList = (value: string): string[] | undefined => {
  const items = value
    .split(/\r?\n|,/g)
    .map((s) => s.trim())
    .filter(Boolean);

  return items.length ? items : undefined;
};

const formatList = (list?: string[]): string => {
  return list ? list.join('\n') : '';
};

const EditCandidateModal: React.FC<EditCandidateModalProps> = ({
  isOpen,
  onClose,
  candidateId,
}) => {
  const { candidates, updateCandidateInStore } = useAppStore();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [academicBackground, setAcademicBackground] = useState('');
  const [languages, setLanguages] = useState('');
  const [professionalBackground, setProfessionalBackground] = useState('');
  const [mainProjects, setMainProjects] = useState('');
  const [hardSkills, setHardSkills] = useState('');

  useEffect(() => {
    if (isOpen && candidateId) {
      const candidate = candidates.find(c => c.id === candidateId);
      if (candidate) {
        setFullName(candidate.fullName || '');
        setEmail(candidate.email || '');
        setCurrentTitle(candidate.currentTitle || '');
        setPhone(candidate.phone || '');
        setLocation(candidate.location || '');
        
        setLinkedinUrl(candidate.linkedinUrl || '');
        setAcademicBackground(formatList(candidate.academicBackground));
        setLanguages(formatList(candidate.languages));
        setProfessionalBackground(candidate.professionalBackground || '');
        setMainProjects(formatList(candidate.mainProjects));
        setHardSkills(formatList(candidate.hardSkills));
      }
    }
  }, [isOpen, candidateId, candidates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      alert('Full Name and Email are required.');
      return;
    }

    try {
      const updatedData: Partial<Candidate> = {
        fullName,
        email,
        currentTitle: currentTitle || undefined,
        phone: phone || undefined,
        location: location || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        academicBackground: parseList(academicBackground),
        languages: parseList(languages),
        professionalBackground: professionalBackground.trim() || undefined,
        mainProjects: parseList(mainProjects),
        hardSkills: parseList(hardSkills),
      };

      await updateCandidateInStore(candidateId, updatedData);
      
      toast({
        title: "Candidate Updated",
        description: "The candidate information has been successfully updated.",
      });
      onClose();
    } catch (error) {
      console.error("Failed to update candidate:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update candidate information.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Candidate</DialogTitle>
          <DialogDescription>
            Update candidate information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="currentTitle">Current Title</Label>
            <Input
              id="currentTitle"
              placeholder="Software Engineer"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="(123) 456-7890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="San Francisco, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <details className="rounded-md border p-3" open>
            <summary className="cursor-pointer text-sm font-medium">
              Profile details
            </summary>

            <div className="pt-4 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="academicBackground">Academic Background (one per line)</Label>
                <Textarea
                  id="academicBackground"
                  placeholder={"BSc Computer Science - University X\nMBA - University Y"}
                  value={academicBackground}
                  onChange={(e) => setAcademicBackground(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="languages">Languages (one per line)</Label>
                <Textarea
                  id="languages"
                  placeholder={"English (Fluent)\nPortuguese (Native)"}
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="professionalBackground">Professional Background</Label>
                <Textarea
                  id="professionalBackground"
                  placeholder="Short narrative summary of the candidate's background..."
                  value={professionalBackground}
                  onChange={(e) => setProfessionalBackground(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mainProjects">Main Projects (one per line)</Label>
                <Textarea
                  id="mainProjects"
                  placeholder={"Project A — impact/results\nProject B — impact/results"}
                  value={mainProjects}
                  onChange={(e) => setMainProjects(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="hardSkills">Hard Skills (one per line or comma-separated)</Label>
                <Textarea
                  id="hardSkills"
                  placeholder={"React\nNode.js\nFirebase\nAWS"}
                  value={hardSkills}
                  onChange={(e) => setHardSkills(e.target.value)}
                />
              </div>
            </div>
          </details>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCandidateModal;
