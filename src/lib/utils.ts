import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportCandidatePdf(candidateId: string) {
  console.log(`Exporting PDF for candidate: ${candidateId}`);
  // Placeholder for actual PDF export logic
  alert(`Exporting PDF for candidate: ${candidateId}`);
}

/**
 * Safely formats a Firestore Timestamp, Date object, or a string/number representation of a date.
 * Handles cases where Timestamp might be serialized as a plain object with { seconds, nanoseconds }.
 * Returns a formatted date string (e.g., "MM/DD/YYYY") or an empty string if the value is invalid.
 */
export function formatFirestoreDate(value: any): string {
  if (!value) {
      return '';
  }

  let date: Date | null = null;

  if (value && typeof value.toDate === 'function') { // It's a Firestore Timestamp
      date = value.toDate();
  } else if (value instanceof Date) { // It's already a Date object
      date = value;
  } else if (typeof value === 'string' || typeof value === 'number') { // It's a string or number
      try {
          const parsedDate = new Date(value);
          // Check if the created date is valid
          if (!isNaN(parsedDate.getTime())) {
              date = parsedDate;
          }
      } catch (e) {
          console.error("Error parsing date:", e);
          return '';
      }
  } else if (value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
      // It's a serialized Firestore Timestamp
      try {
          date = new Timestamp(value.seconds, value.nanoseconds).toDate();
      } catch(e) {
          console.error("Error converting serialized timestamp to date:", e);
          return '';
      }
  }

  if (date) {
      // You can customize the format here if needed
      return date.toLocaleDateString();
  }

  return '';
}
