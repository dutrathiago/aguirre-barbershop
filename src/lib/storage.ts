import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadImage(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      reject,
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
}

export async function uploadBarberPhoto(barberId: string, file: File): Promise<string> {
  return uploadImage(file, `barbers/${barberId}/photo_${Date.now()}`);
}

export async function uploadServicePhoto(serviceId: string, file: File): Promise<string> {
  return uploadImage(file, `services/${serviceId}/photo_${Date.now()}`);
}

export async function uploadUserPhoto(uid: string, file: File): Promise<string> {
  return uploadImage(file, `users/${uid}/photo_${Date.now()}`);
}
