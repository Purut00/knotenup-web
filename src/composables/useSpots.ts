import { ref } from 'vue';
import { db } from '../firebaseConfig';
import { collection, getDocs, getDoc, doc, query, orderBy, limit, where } from 'firebase/firestore';
import type { Spot } from '../types';

export function useSpots() {
    const spots = ref<Spot[]>([]);
    const masterSpots = ref<Spot[]>([]); // Store all spots here
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Limit to 500 to prevent overload, but usually enough for spots list
    const FETCH_LIMIT = 500;

    const fetchSpots = async (filters: any = {}, _isLoadMore = false) => {
        // Ignored _isLoadMore (Lazy loading removed)
        loading.value = true;
        error.value = null;

        try {
            // 1. Fetch EVERYTHING (if empty)
            if (masterSpots.value.length === 0) {
                const spotsRef = collection(db, "spots");
                // Only order by createdAt, no complex filtering here
                const q = query(spotsRef, orderBy("createdAt", "desc"), limit(FETCH_LIMIT));
                const snap = await getDocs(q);
                masterSpots.value = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Spot[];
            }

            // 2. Perform Client-Side Filtering
            let results = [...masterSpots.value];

            // Search Filter
            if (filters.searchQuery?.trim()) {
                const term = filters.searchQuery.toLowerCase().trim();
                results = results.filter(s =>
                    (s.name && s.name.toLowerCase().includes(term)) ||
                    (s.state && s.state.toLowerCase().includes(term))
                );
            }

            // State Filter
            if (filters.state) {
                results = results.filter(s => s.state === filters.state);
            }

            // Category Filter
            if (filters.category) {
                results = results.filter(s => s.category === filters.category);
            }

            spots.value = results;

        } catch (e: any) {
            console.error("Fetch spots error:", e);
            error.value = e.message;
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
