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
