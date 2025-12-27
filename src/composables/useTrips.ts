import { ref } from 'vue';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs, orderBy, limit, serverTimestamp } from 'firebase/firestore';

export function useTrips() {
    const loading = ref(false);
    const error = ref<string | null>(null);

    const createTrip = async (tripData: any) => {
        loading.value = true;
        error.value = null;
        try {
            // Clean undefined/null
            const cleanedData = JSON.parse(JSON.stringify(tripData));
            const docRef = await addDoc(collection(db, 'trips'), {
                ...cleanedData,
                createdAt: serverTimestamp()
            });
            return docRef.id;
        } catch (err: any) {
            console.error("Create Trip Error:", err);
            error.value = err.message;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const getTrip = async (id: string) => {
        loading.value = true;
        try {
            const docSnap = await getDoc(doc(db, "trips", id));
            if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
            return null;
        } catch (err: any) {
            error.value = err.message;
            return null;
        } finally {
            loading.value = false;
        }
    };

    const archiveTrip = async (id: string) => {
        loading.value = true;
        try {
            await updateDoc(doc(db, "trips", id), {
                status: 'archived',
                isVisible: false,
                archivedAt: new Date()
            });
        } catch (err: any) {
            error.value = err.message;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchLatestTrips = async (limitCount = 8) => {
        loading.value = true;
        try {
            const q = query(collection(db, "trips"), orderBy("createdAt", "desc"), limit(limitCount));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (err: any) {
            error.value = err.message;
            return [];
        } finally {
            loading.value = false;
        }
    };

    return {
        createTrip,
        getTrip,
        archiveTrip,
        fetchLatestTrips,
        loading,
        error
    };
}
