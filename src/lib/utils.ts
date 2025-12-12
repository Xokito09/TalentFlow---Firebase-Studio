import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportCandidatePdf(candidateId: string) {
  console.log(`Exporting PDF for candidate: ${candidateId}`);
  // Placeholder for actual PDF export logic
  alert(`Exporting PDF for candidate: ${candidateId}`);
}
