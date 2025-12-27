import { ref } from 'vue';
import { db } from '../firebaseConfig';
import { collection, getDocs, getDoc, doc, query, where, orderBy, limit, startAfter, type QueryDocumentSnapshot } from 'firebase/firestore';
import type { Spot } from '../types';

export function useSpots() {
    const spots = ref<Spot[]>([]);
    const loading = ref(false);
    const loadingMore = ref(false);
    const error = ref<string | null>(null);
    const allLoaded = ref(false);
    const lastVisible = ref<QueryDocumentSnapshot | null>(null);

    const BATCH_SIZE = 8;

    const buildQuery = (filters: any, isLoadMore = false) => {
        const spotsRef = collection(db, "spots");
        const constraints: any[] = [];

        // Search
        if (filters.searchQuery?.trim()) {
            const term = filters.searchQuery.toLowerCase().trim();
            constraints.push(where('name_lowercase', '>=', term));
            constraints.push(where('name_lowercase', '<=', term + '\uf8ff'));
            constraints.push(orderBy('name_lowercase'));
        } else {
            constraints.push(orderBy("createdAt", "desc"));
        }

        // Filters
        if (filters.state) constraints.push(where('state', '==', filters.state));
        if (filters.category) constraints.push(where('category', '==', filters.category));

        // Limit
        constraints.push(limit(BATCH_SIZE));

        // Pagination
        if (isLoadMore && lastVisible.value) constraints.push(startAfter(lastVisible.value));

        return query(spotsRef, ...constraints);
    };

    const fetchSpots = async (filters: any = {}, isLoadMore = false) => {
        if (isLoadMore) {
            if (loadingMore.value || allLoaded.value) return;
            loadingMore.value = true;
        } else {
            loading.value = true;
            allLoaded.value = false;
            lastVisible.value = null;
            spots.value = [];
        }
        error.value = null;

        try {
            const q = buildQuery(filters, isLoadMore);
            const snap = await getDocs(q);

            if (!snap.empty) {
                const newSpots = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Spot[];
                if (isLoadMore) {
                    // Filter duplicates
                    const unique = newSpots.filter(ns => !spots.value.some(s => s.id === ns.id));
                    spots.value.push(...unique);
                } else {
                    spots.value = newSpots;
                }

                lastVisible.value = snap.docs[snap.docs.length - 1] || null;
                if (snap.docs.length < BATCH_SIZE) allLoaded.value = true;
            } else {
                allLoaded.value = true;
            }
        } catch (e: any) {
            console.error("Fetch spots error:", e);
            error.value = e.message;
            if (e.message.includes("requires an index")) {
                console.warn("⚠️ INDEX REQUIRED: Check Firebase Console.");
            }
        } finally {
            loading.value = false;
            loadingMore.value = false;
        }
    };

    const fetchSpotById = async (id: string) => {
        loading.value = true;
        try {
            const snap = await getDoc(doc(db, "spots", id));
            if (snap.exists()) return { id: snap.id, ...snap.data() } as Spot;
            return null;
        } catch (e: any) {
            error.value = e.message;
            return null;
        } finally {
            loading.value = false;
        }
    };

    const fetchRelatedTrips = async (spotId: string) => {
        try {
            const tripQ = query(
                collection(db, "trips"),
                where("spotId", "==", spotId),
                where("status", "==", "open")
            );
            const tripSnap = await getDocs(tripQ);
            return tripSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("Error fetching related trips", e);
            return [];
        }
    };

    const translateDescription = async (text: string, locale: string) => {
        try {
            const targetLang = locale === 'ms' ? 'ms' : 'en';
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=Autodetect|${targetLang}`);
            const data = await response.json();
            if (data.responseData && data.responseData.translatedText) {
                return data.responseData.translatedText;
            }
            throw new Error("Translation failed");
        } catch (e) {
            throw e;
        }
    };

    return {
        spots, loading, loadingMore, error, allLoaded,
        fetchSpots, fetchSpotById, fetchRelatedTrips, translateDescription
    };
}
