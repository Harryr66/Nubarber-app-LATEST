import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function uploadFile(file: File, path: string): Promise<string> {
  const { getFirebaseStorage } = await import('./firebase');
  const storage = getFirebaseStorage();
  const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
  
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
}

// Optimized version for logo uploads
export async function uploadLogoFile(file: File, path: string): Promise<string> {
  const { getFirebaseStorage } = await import('./firebase');
  const storage = getFirebaseStorage();
  const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
  
  // Add metadata for better caching
  const metadata = {
    cacheControl: 'public, max-age=31536000', // 1 year cache
    contentType: file.type,
  };
  
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file, metadata);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
}
