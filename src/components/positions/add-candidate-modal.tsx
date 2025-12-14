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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Candidate } from '@/lib/types';
import { toast } from "@/hooks/use-toast";

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  positionId: string;
}

const parseList = (value: string): string[] | undefined => {
  const items = value
    .split(/\r?\n|,/g)
    .map((s) => s.trim())
    .filter(Boolean);

  return items.length ? items : undefined;
};

const AddCandidateModal: React.FC<AddCandidateModalProps> = ({
  isOpen,
  onClose,
  clientId,
  positionId,
}) => {
  const {
    candidates,
    candidatesInitialized,
    loadCandidates,
    createCandidateAndApplyToPosition,
    addExistingCandidateToPosition,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('new');

  // New candidate base fields
  const [newCandidateFullName, setNewCandidateFullName] = useState('');
  const [newCandidateEmail, setNewCandidateEmail] = useState('');
  const [newCandidateCurrentTitle, setNewCandidateCurrentTitle] = useState('');
  const [newCandidatePhone, setNewCandidatePhone] = useState('');
  const [newCandidateLocation, setNewCandidateLocation] = useState('');
  const [newCandidateSalaryExpectation, setNewCandidateSalaryExpectation] = useState('');

  // New candidate profile fields (optional)
  const [newCandidateLinkedinUrl, setNewCandidateLinkedinUrl] = useState('');
  const [newCandidateAcademicBackground, setNewCandidateAcademicBackground] = useState('');
  const [newCandidateLanguages, setNewCandidateLanguages] = useState('');
  const [newCandidateProfessionalBackground, setNewCandidateProfessionalBackground] = useState('');
  const [newCandidateMainProjects, setNewCandidateMainProjects] = useState('');
  const [newCandidateHardSkills, setNewCandidateHardSkills] = useState('');

  // Existing candidate fields
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | undefined>(undefined);
  const [existingCandidateSalaryExpectation, setExistingCandidateSalaryExpectation] = useState('');

  useEffect(() => {
    if (isOpen && !candidatesInitialized) {
      loadCandidates();
    }
  }, [isOpen, candidatesInitialized, loadCandidates]);

  const resetForm = () => {
    setNewCandidateFullName('');
    setNewCandidateEmail('');
    setNewCandidateCurrentTitle('');
    setNewCandidatePhone('');
    setNewCandidateLocation('');
    setNewCandidateSalaryExpectation('');

    setNewCandidateLinkedinUrl('');
    setNewCandidateAcademicBackground('');
    setNewCandidateLanguages('');
    setNewCandidateProfessionalBackground('');
    setNewCandidateMainProjects('');
    setNewCandidateHardSkills('');

    setSelectedCandidateId(undefined);
    setExistingCandidateSalaryExpectation('');

    setActiveTab('new');
  };

  const handleNewCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidateFullName || !newCandidateEmail) {
      alert('Full Name and Email are required for a new candidate.');
      return;
    }

    const candidateData: Omit<Candidate, "id" | "createdAt" | "updatedAt"> = {
      fullName: newCandidateFullName,
      email: newCandidateEmail,
      currentTitle: newCandidateCurrentTitle || undefined,
      phone: newCandidatePhone || undefined,
      location: newCandidateLocation || undefined,

      // Profile fields
      linkedinUrl: newCandidateLinkedinUrl.trim() || undefined,
      academicBackground: parseList(newCandidateAcademicBackground),
      languages: parseList(newCandidateLanguages),
      professionalBackground: newCandidateProfessionalBackground.trim() || undefined,
      mainProjects: parseList(newCandidateMainProjects),
      hardSkills: parseList(newCandidateHardSkills),
    };

    const { created } = await createCandidateAndApplyToPosition({
      clientId,
      positionId,
      candidate: candidateData,
      appliedCompensation: newCandidateSalaryExpectation,
    });

    if (created) {
      resetForm();
      onClose();
    } else {
      toast({
        title: "Application Exists",
        description: "This candidate has already applied to this position.",
      });
    }
  };

  const handleExistingCandidateSubmit = async () => {
    if (!selectedCandidateId) {
      alert('Please select an existing candidate.');
      return;
    }

    const { created } = await addExistingCandidateToPosition({
      clientId,
      positionId,
      candidateId: selectedCandidateId,
      appliedCompensation: existingCandidateSalaryExpectation || undefined,
    });

    if (created) {
      resetForm();
      onClose();
    } else {
      toast({
        title: "Application Exists",
        description: "This candidate has already applied to this position.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Candidate to Pipeline</DialogTitle>
          <DialogDescription>
            Add a new candidate or select an existing one to apply to this position.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">New Candidate</TabsTrigger>
            <TabsTrigger value="existing">Existing Candidate</TabsTrigger>
          </TabsList>

          {/* NEW */}
          <TabsContent value="new" className="pt-4">
            <form onSubmit={handleNewCandidateSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={newCandidateFullName}
                  onChange={(e) => setNewCandidateFullName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={newCandidateEmail}
                  onChange={(e) => setNewCandidateEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="currentTitle">Current Title</Label>
                <Input
                  id="currentTitle"
                  placeholder="Software Engineer"
                  value={newCandidateCurrentTitle}
                  onChange={(e) => setNewCandidateCurrentTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="salaryExpectation">Salary expectation for this application</Label>
                <Input
                  id="salaryExpectation"
                  placeholder="e.g., $120,000 - $140,000"
                  value={newCandidateSalaryExpectation}
                  onChange={(e) => setNewCandidateSalaryExpectation(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="(123) 456-7890"
                  value={newCandidatePhone}
                  onChange={(e) => setNewCandidatePhone(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="San Francisco, CA"
                  value={newCandidateLocation}
                  onChange={(e) => setNewCandidateLocation(e.target.value)}
                />
              </div>

              {/* Optional Profile Fields */}
              <details className="rounded-md border p-3">
                <summary className="cursor-pointer text-sm font-medium">
                  Profile details (optional) — this is what fills the PDF
                </summary>

                <div className="pt-4 space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input
                      id="linkedinUrl"
                      placeholder="https://linkedin.com/in/username"
                      value={newCandidateLinkedinUrl}
                      onChange={(e) => setNewCandidateLinkedinUrl(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="academicBackground">Academic Background (one per line)</Label>
                    <Textarea
                      id="academicBackground"
                      placeholder={"BSc Computer Science - University X\nMBA - University Y"}
                      value={newCandidateAcademicBackground}
                      onChange={(e) => setNewCandidateAcademicBackground(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="languages">Languages (one per line)</Label>
                    <Textarea
                      id="languages"
                      placeholder={"English (Fluent)\nPortuguese (Native)"}
                      value={newCandidateLanguages}
                      onChange={(e) => setNewCandidateLanguages(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="professionalBackground">Professional Background</Label>
                    <Textarea
                      id="professionalBackground"
                      placeholder="Short narrative summary of the candidate's background..."
                      value={newCandidateProfessionalBackground}
                      onChange={(e) => setNewCandidateProfessionalBackground(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="mainProjects">Main Projects (one per line)</Label>
                    <Textarea
                      id="mainProjects"
                      placeholder={"Project A — impact/results\nProject B — impact/results"}
                      value={newCandidateMainProjects}
                      onChange={(e) => setNewCandidateMainProjects(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="hardSkills">Hard Skills (one per line or comma-separated)</Label>
                    <Textarea
                      id="hardSkills"
                      placeholder={"React\nNode.js\nFirebase\nAWS"}
                      value={newCandidateHardSkills}
                      onChange={(e) => setNewCandidateHardSkills(e.target.value)}
                    />
                  </div>
                </div>
              </details>

              <DialogFooter>
                <Button type="submit">Add New Candidate</Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* EXISTING */}
          <TabsContent value="existing" className="pt-4 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="existing-candidate">Select Candidate</Label>
              <Select value={selectedCandidateId} onValueChange={setSelectedCandidateId}>
                <SelectTrigger id="existing-candidate">
                  <SelectValue placeholder="Select a candidate" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.length === 0 && (
                    <p className="p-2 text-sm text-gray-500">No candidates available. Create a new one.</p>
                  )}
                  {candidates.map((candidate) => (
                    <SelectItem key={candidate.id} value={candidate.id}>
                      {candidate.fullName} ({candidate.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="existingSalaryExpectation">Salary expectation for this application</Label>
              <Input
                id="existingSalaryExpectation"
                placeholder="e.g., $120,000 - $140,000"
                value={existingCandidateSalaryExpectation}
                onChange={(e) => setExistingCandidateSalaryExpectation(e.target.value)}
              />
            </div>

            <DialogFooter className="mt-4">
              <Button onClick={handleExistingCandidateSubmit} disabled={!selectedCandidateId}>
                Add Existing Candidate
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddCandidateModal;
