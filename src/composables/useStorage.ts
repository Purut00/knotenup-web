import { ref } from 'vue';
import { storage } from '../firebaseConfig';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { validateImageFile } from '../utils/security';

export function useStorage() {
    const uploading = ref(false);
    const error = ref<string | null>(null);

    const uploadImage = async (file: File, path: string): Promise<string | null> => {
        uploading.value = true;
        error.value = null;
        try {
            // 1. Validate Size (Max 5MB)
            if (file.size > 5 * 1024 * 1024) throw new Error("File too large (Max 5MB).");

            // 2. Security Check
            const isValid = await validateImageFile(file);
            if (!isValid) throw new Error("Invalid image file detected.");

            // 3. Upload
            const fileRef = storageRef(storage, path);
            const snapshot = await uploadBytes(fileRef, file);
            const url = await getDownloadURL(snapshot.ref);
            return url;
        } catch (err: any) {
            console.error("Upload error:", err);
            error.value = err.message || "Upload failed";
            return null;
        } finally {
            uploading.value = false;
        }
    };

    const uploadMultipleImages = async (files: (File | null)[], basePath: string): Promise<string[]> => {
        uploading.value = true;
        const urls: string[] = [];
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file) {
                    const path = `${basePath}_${i}.jpg`;
                    const url = await uploadImage(file, path);
                    if (url) urls.push(url);
                }
            }
            return urls;
        } finally {
            uploading.value = false;
        }
    };

    return { uploadImage, uploadMultipleImages, uploading, error };
}
