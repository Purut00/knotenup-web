import { ref } from 'vue';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function useServices() {
    const loading = ref(false);
    const error = ref<string | null>(null);

    const createService = async (serviceData: any) => {
        loading.value = true;
        error.value = null;
        try {
            const docRef = await addDoc(collection(db, 'services'), {
                ...serviceData,
                createdAt: serverTimestamp()
            });
            return docRef.id;
        } catch (err: any) {
            console.error("Create Service Error:", err);
            error.value = err.message;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return { createService, loading, error };
}
