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
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Candidate } from '@/lib/types';

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  positionId: string;
}

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

  // New Candidate Form State
  const [newCandidateFullName, setNewCandidateFullName] = useState('');
  const [newCandidateEmail, setNewCandidateEmail] = useState('');
  const [newCandidateCurrentTitle, setNewCandidateCurrentTitle] = useState('');
  const [newCandidatePhone, setNewCandidatePhone] = useState('');
  const [newCandidateLocation, setNewCandidateLocation] = useState('');

  // Existing Candidate Select State
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | undefined>(undefined);

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
    setSelectedCandidateId(undefined);
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
    };

    await createCandidateAndApplyToPosition({ clientId, positionId, candidate: candidateData });
    resetForm();
    onClose();
  };

  const handleExistingCandidateSubmit = async () => {
    if (!selectedCandidateId) {
      alert('Please select an existing candidate.');
      return;
    }
    await addExistingCandidateToPosition({ clientId, positionId, candidateId: selectedCandidateId });
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
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
              <DialogFooter>
                <Button type="submit">Add New Candidate</Button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value="existing" className="pt-4">
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
