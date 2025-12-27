import { ref } from 'vue';
import { db } from '../firebaseConfig';
import { collection, getDocs, getDoc, doc, query, orderBy, limit, where } from 'firebase/firestore';
import type { Spot } from '../types';

export function useSpots() {
    const spots = ref<Spot[]>([]);
    // const masterSpots = ref<Spot[]>([]); // Removed: caching not used

    const loading = ref(false);
    const error = ref<string | null>(null);

    // Limit to 500 to prevent overload, but usually enough for spots list
    const FETCH_LIMIT = 500;

    const fetchSpots = async (filters: any = {}, isLoadMore = false) => {
        if (!isLoadMore) {
            spots.value = [];
            loading.value = true;
        }
        error.value = null;

        try {
            const spotsRef = collection(db, "spots");
            let constraints: any[] = [];

            // 1. Filter Logic
            if (filters.state) {
                constraints.push(where("state", "==", filters.state));
            }

            if (filters.category) {
                constraints.push(where("category", "==", filters.category));
            }

            // 2. Search Logic (Client-side mostly, but we can try prefix if needed)
            // Note: Firestore doesn't support native full-text search. 
            // We'll trust the results to be filtered by client if searchQuery exists,
            // OR we can rely on specific 'name_lowercase' prefix queries if simple.
            // For now, let's keep it simple: Filter by constraints first.

            // 3. Ordering
            // Firestore requires an index for 'state' + 'createdAt'. 
            // If index is missing, it will throw an error with a link to create it.
            // For safety, if filtering is applied, we might dropdown to simple filtering without sort 
            // or ensure indices exist.
            constraints.push(orderBy("createdAt", "desc"));
            constraints.push(limit(FETCH_LIMIT));

            const q = query(spotsRef, ...constraints);
            const snap = await getDocs(q);
            let results = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Spot[];

            // 4. Client-side Search refinement (since Firestore can't search substring)
            if (filters.searchQuery?.trim()) {
                const term = filters.searchQuery.toLowerCase().trim();
                results = results.filter(s =>
                    (s.name && s.name.toLowerCase().includes(term)) ||
                    (s.state && s.state.toLowerCase().includes(term))
                );
            }

            if (isLoadMore) {
                spots.value = [...spots.value, ...results];
            } else {
                spots.value = results;
            }

        } catch (e: any) {
            console.error("Fetch spots error:", e);
            error.value = e.message;

            // Fallback: If index error, try fetching without sort
            if (e.code === 'failed-precondition') {
                console.warn("Index missing. Trying simple fetch.");
                // Retry logic could go here, or just alert dev.
            }
        } finally {
            loading.value = false;
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
        spots, loading, error,
        fetchSpots, fetchSpotById, fetchRelatedTrips, translateDescription
    };
}
