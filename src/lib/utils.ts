import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from 'firebase/firestore';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string) {
  if (!name) return "";
  const parts = name.split(" ");
  let initials = "";
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].length > 0 && parts[i] !== "") {
      initials += parts[i][0];
    }
  }
  return initials.toUpperCase();
}

export async function fetchImageAsDataUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); 

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      return null;
    }

    const blob = await response.blob();
    
    if (!blob.type.startsWith('image/')) {
        console.error(`Fetched content is not an image: ${blob.type}`);
        return null;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          console.error("Failed to read blob as Data URL");
          resolve(null);
        }
      };
      reader.onerror = () => {
        console.error("FileReader error");
        resolve(null);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error("Image fetch timed out:", url);
    } else {
      console.error("Failed to fetch or process image:", error);
    }
    return null;
  }
}

export const formatFirestoreDate = (date: Timestamp | Date | string | undefined | null): string => {
    if (!date) return '';
  
    let dateObj: Date;
    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      return '';
    }
  
    if (isNaN(dateObj.getTime())) {
      return '';
    }
  
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
};

export const serializePlain = <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
  
    if (Array.isArray(obj)) {
      return obj.map(serializePlain) as any;
    }
  
    if (obj instanceof Timestamp) {
      return obj.toDate().toISOString() as any;
    }
  
    if (obj instanceof Date) {
        return obj.toISOString() as any;
    }
  
    const plainObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        plainObj[key] = serializePlain((obj as any)[key]);
      }
    }
  
    return plainObj as T;
};
