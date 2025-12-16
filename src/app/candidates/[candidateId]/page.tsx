"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useParams, useRouter } from 'next/navigation';
import Link from "next/link";
import { useAppStore } from '@/lib/store';
import * as candidatesRepository from '@/lib/repositories/candidates';
import * as applicationsRepository from '@/lib/repositories/applications';
import * as positionsRepository from '@/lib/repositories/positions';
import { Candidate, Application, PipelineStageKey } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatFirestoreDate } from '@/lib/utils';
import { uploadCandidatePhoto } from '@/app/candidates/actions';
import { useToast } from "@/hooks/use-toast";

import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  BookOpen,
  Clipboard,
  Camera,
  Loader2
} from 'lucide-react';

// Helper to resize image client-side for thumbnail
const resizeImage = (file: File, maxDimension: number, quality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round(height * (maxDimension / width));
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round(width * (maxDimension / height));
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Image loading failed'));
    };
    reader.onerror = () => reject(new Error('File reading failed'));
  });
};


const CandidateProfilePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const candidateId = params.candidateId as string;

  const {
    candidates,
    loadCandidates,
    clients,
    clientsInitialized,
    loadClients,
    positions,
  } = useAppStore();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [positionsMap, setPositionsMap] = useState<Record<string, string>>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const fetchCandidateAndApplications = async () => {
      if (!candidateId) return;
      setLoading(true);
      try {
        let fetchedCandidate: Candidate | null | undefined = candidates.find(c => c.id === candidateId);

        if (!fetchedCandidate) {
          fetchedCandidate = await candidatesRepository.getCandidateById(candidateId);
          if (fetchedCandidate && !candidates.some(c => c.id === fetchedCandidate?.id)) {
            loadCandidates(); // Refresh the store
          }
        }

        if (fetchedCandidate) {
          setCandidate(fetchedCandidate);
          const fetchedApplications = await applicationsRepository.getApplicationsByCandidateId(candidateId);
          setApplications(fetchedApplications);

          const newPositionsMap: Record<string, string> = {};
          const positionIds = [...new Set(fetchedApplications.map(app => app.positionId))];

          const positionPromises = positionIds.map(async (id) => {
            const existingPosition = positions.find(p => p.id === id);
            if (existingPosition) {
              newPositionsMap[id] = existingPosition.title;
            } else {
              const position = await positionsRepository.getPositionById(id);
              if (position) {
                newPositionsMap[id] = position.title;
              }
            }
          });

          await Promise.all(positionPromises);
          setPositionsMap(newPositionsMap);
        } else {
          toast({
            title: "Error",
            description: "Candidate not found.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to fetch candidate details:", error);
        toast({
          title: "Error",
          description: "Failed to load candidate details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateAndApplications();
  }, [candidateId, candidates, loadCandidates, positions, toast]);


  useEffect(() => {
    if (!clientsInitialized) {
      loadClients();
    }
  }, [clientsInitialized, loadClients]);

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    if (!candidateId) {
      toast({
        title: "Error",
        description: "Candidate ID is not available.",
        variant: "destructive",
      });
      return;
    }

    const originalFile = event.target.files[0];

    // Enforce file size limit (5MB)
    if (originalFile.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingPhoto(true);

    try {
      // Create PDF and thumbnail variants
      const [pdfBlob, thumbnailBlob] = await Promise.all([
        resizeImage(originalFile, 1200, 0.88),
        resizeImage(originalFile, 512, 0.82),
      ]);

      const formData = new FormData();
      formData.append('pdfImage', pdfBlob, 'photo.jpg');
      formData.append('thumbnailImage', thumbnailBlob, 'thumb.jpg');

      const result = await uploadCandidatePhoto(candidateId, formData);

      if (result.photoUrl && result.photoThumbUrl) {
        setCandidate(prev => prev ? { ...prev, photoUrl: result.photoUrl, photoThumbUrl: result.photoThumbUrl } : null);
        toast({
          title: "Success",
          description: "Photo uploaded successfully.",
        });
      } else {
        throw new Error("Upload did not return valid URLs.");
      }

    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };


  const getPositionTitle = (positionId: string) => {
    return positionsMap[positionId] || "Unknown Position";
  };

  if (loading) {
    return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin text-slate-600" /></div>;
  }

  if (!candidate) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">Candidate not found</p>
        <Button onClick={() => router.push("/candidates")}>Go back to candidates</Button>
      </div>
    );
  }

  const getStageKeyLabel = (stageKey: PipelineStageKey | undefined) => {
    switch (stageKey) {
      case 'shortlisted': return 'Shortlisted';
      case 'client_interview_1': return 'Client Interview 1';
      case 'client_interview_2': return 'Client Interview 2';
      case 'hired': return 'Hired';
      default: return 'Unknown Stage';
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 space-y-8 bg-slate-50 min-h-screen">
      <Link href="/candidates" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Candidates</span>
      </Link>

      <div className="flex items-center gap-6">
        <div className="relative">
          <Avatar className="h-24 w-24 border">
            {candidate.photoThumbUrl ? (
              <AvatarImage
                src={candidate.photoThumbUrl}
                alt={candidate.fullName}
                priority={true}
              />
            ) : (
              <AvatarFallback className="text-4xl">{candidate.fullName.charAt(0).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow cursor-pointer">
            {uploadingPhoto ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
            ) : (
              <Camera className="h-4 w-4 text-slate-600" />
            )}
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handlePhotoUpload}
              disabled={uploadingPhoto}
            />
          </label>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{candidate.fullName}</h1>
          {candidate.currentTitle && <p className="text-lg text-slate-700 flex items-center gap-2"><Briefcase className="h-5 w-5 text-slate-500" />{candidate.currentTitle}</p>}
          {candidate.location && <p className="text-md text-slate-600 flex items-center gap-2"><MapPin className="h-5 w-5 text-slate-500" />{candidate.location}</p>}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="flex items-center gap-2 text-slate-700"><Mail className="h-5 w-5 text-slate-500" />{candidate.email}</p>
          {candidate.phone && <p className="flex items-center gap-2 text-slate-700"><Phone className="h-5 w-5 text-slate-500" />{candidate.phone}</p>}
        </CardContent>
      </Card>

      {candidate.hardSkills && candidate.hardSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {candidate.hardSkills?.map((skill, index) => (
              <Badge key={index} variant="secondary">{skill}</Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {(candidate.professionalBackground || candidate.mainProjects) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {candidate.professionalBackground && <div className="text-slate-700"><h3 className="font-semibold mb-1 flex items-center gap-2"><BookOpen className="h-5 w-5 text-slate-500" />Professional Background</h3><p>{candidate.professionalBackground}</p></div>}
            {candidate.mainProjects && (
              <div className="text-slate-700">
                <h3 className="font-semibold mb-1 flex items-center gap-2"><Clipboard className="h-5 w-5 text-slate-500" />Main Projects</h3>
                <p>{candidate.mainProjects.join(', ')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Application History</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <p className="text-slate-500">No application history for this candidate.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Role at apply time</TableHead>
                  <TableHead>Salary at apply time</TableHead>
                  <TableHead>Applied Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <Link href={`/applications/${app.id}?from=candidate&candidateId=${candidateId}`} className="text-blue-600 hover:underline">
                        {getPositionTitle(app.positionId)}
                      </Link>
                    </TableCell>
                    <TableCell>{clients.find(c => c.id === app.clientId)?.name || "Unknown Client"}</TableCell>
                    <TableCell>{getStageKeyLabel(app.stageKey)}</TableCell>
                    <TableCell>{app.appliedRoleTitle || ''}</TableCell>
                    <TableCell>{app.appliedCompensation || ''}</TableCell>
                    <TableCell>{formatFirestoreDate(app.appliedDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateProfilePage;
