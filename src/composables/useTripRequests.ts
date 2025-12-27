import { ref } from 'vue';
import { db, auth } from '../firebaseConfig';
import {
    collection, getDocs, deleteDoc, doc,
    query, orderBy, where, collectionGroup
} from 'firebase/firestore';

export function useTripRequests() {
    const requests = ref<any[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const myOfferedRequestIds = ref<Set<string>>(new Set());

    const fetchRequests = async () => {
        loading.value = true;
        error.value = null;
        try {
            const q = query(
                collection(db, "trip_requests"),
                where("status", "==", "open"),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const fetchedData: any[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                let dateString = '';
                if (data.date) dateString = new Date(data.date).toLocaleDateString("en-MY", { day: 'numeric', month: 'short', year: 'numeric' });
                fetchedData.push({ id: doc.id, ...data, dateString });
            });
            requests.value = fetchedData;

            if (auth.currentUser) {
                await fetchMyOffers(auth.currentUser.uid);
            }
        } catch (e: any) {
            console.error("Error fetching requests:", e);
            error.value = e.message;
        } finally {
            loading.value = false;
        }
    };

    const fetchMyOffers = async (userId: string) => {
        try {
            const q = query(collectionGroup(db, 'offers'), where('organizerId', '==', userId));
            const querySnapshot = await getDocs(q);
            myOfferedRequestIds.value.clear();
            querySnapshot.forEach((docSnap) => {
                const parent = docSnap.ref.parent.parent;
                if (parent) {
                    myOfferedRequestIds.value.add(parent.id);
                }
            });
        } catch (e) {
            console.warn("CollectionGroup query error (likely missing index):", e);
        }
    };

    const deleteRequest = async (id: string) => {
        try {
            await deleteDoc(doc(db, "trip_requests", id));
            requests.value = requests.value.filter(r => r.id !== id);
            return true;
        } catch (e: any) {
            error.value = e.message;
            return false;
        }
    };

    const hasOffered = (req: any): boolean => {
        const currentUser = auth.currentUser;
        if (!currentUser) return false;
        if (myOfferedRequestIds.value.has(req.id)) return true;
        if (req.offeredBy && req.offeredBy.includes(currentUser.uid)) return true;
        return false;
    };

    const isOwner = (reqUserId: string): boolean => {
        return auth.currentUser ? auth.currentUser.uid === reqUserId : false;
    };

    return {
        requests,
        loading,
        error,
        myOfferedRequestIds,
        fetchRequests,
        fetchMyOffers,
        deleteRequest,
        hasOffered,
        isOwner
    };
}
