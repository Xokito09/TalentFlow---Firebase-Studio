import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from 'firebase/firestore';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFirestoreDate(timestamp: Timestamp | Date | undefined): string {
  if (!timestamp) {
    return 'N/A';
  }

  const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export const fetchImageAsDataUrl = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error fetching image as data URL:', error);
    // Return a placeholder or default image data URL if fetching fails
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  }
};

export const serializePlain = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    // Check if the value is a Firestore Timestamp
    if (value && typeof value === 'object' && value.seconds !== undefined && value.nanoseconds !== undefined) {
      // Create a new Date object from the timestamp's seconds and milliseconds
      return new Date(value.seconds * 1000 + value.nanoseconds / 1000000).toISOString();
    }
    return value;
  }));
};

export function formatCurrency(amount: number, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
