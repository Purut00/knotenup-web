<template>
  <div class="trip-page">
    <div class="trip-header">
      <h1>{{ t('trip.headerTitle') }}</h1>
      <p>{{ t('trip.headerSub') }}</p>
    </div>

    <div class="sticky-filter">
      <TripFilter />
    </div>

    <div class="content-container">
      <div class="results-meta">
        <span v-if="currentFilter">
           Menapis kategori: <strong style="color: #e67e22;">{{ currentFilter }}</strong> 
           <button class="clear-filter" @click="clearFilter">✖ Padam Filter</button>
        </span>
        <span v-else>Menunjukkan <strong>{{ filteredTrips.length }}</strong> trip aktif</span>
      </div>
      
      <div v-if="loading" style="text-align: center; padding: 2rem;">
        <p>⏳ {{ t('common.loading') }}</p>
      </div>

      <div v-else class="trip-grid">
        <TripCard 
          v-for="trip in filteredTrips" 
          :key="trip.id" 
          :trip="trip" 
        />
      </div>
      
      <div v-if="!loading && filteredTrips.length === 0" style="text-align: center; margin-top: 2rem;">
        <p>Tiada trip ditemui untuk kategori ini.</p>
        <button class="btn-outline" @click="clearFilter">Lihat Semua Trip</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router'; // Import Router
import TripFilter from '../components/trip/TripFilter.vue';
import TripCard from '../components/trip/TripCard.vue';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const trips = ref<any[]>([]);
const loading = ref(true);
const currentFilter = ref('');

// Computed Property untuk Filter Data
const filteredTrips = computed(() => {
  if (!currentFilter.value) {
    return trips.value;
  }
  // Tapis berdasarkan Kategori (Case insensitive)
  return trips.value.filter(trip => 
    trip.category && trip.category.toLowerCase() === currentFilter.value.toLowerCase()
  );
});

const clearFilter = () => {
  currentFilter.value = '';
  router.replace({ query: {} }); // Buang query dari URL
};

// Fetch Data
onMounted(async () => {
  // 1. Cek kalau ada arahan dari Homepage (URL Query)
  if (route.query.category) {
    currentFilter.value = route.query.category as string;
  }

  try {
    const q = query(collection(db, "trips"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const fetchedTrips: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      fetchedTrips.push({ id: doc.id, ...data });
    });

    trips.value = fetchedTrips;
  } catch (error) {
    console.error("Error fetching trips:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* ... CSS KEKAL SAMA ... */
.trip-header { background-color: #2c3e50; color: white; padding: 3rem 2rem; text-align: center; }
.sticky-filter { position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.content-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
.results-meta { margin-bottom: 1.5rem; color: #666; font-size: 0.9rem; display: flex; align-items: center; gap: 10px; }
.trip-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; }
.load-more { text-align: center; margin-top: 3rem; }
.load-more button { padding: 0.8rem 2rem; border: 1px solid #2c3e50; background: transparent; cursor: pointer; border-radius: 50px; font-weight: bold; transition: all 0.3s; }
.load-more button:hover { background: #2c3e50; color: white; }
.clear-filter { background: none; border: 1px solid #e67e22; color: #e67e22; border-radius: 20px; padding: 2px 10px; cursor: pointer; font-size: 0.8rem; margin-left: 10px; }
.clear-filter:hover { background: #e67e22; color: white; }
.btn-outline { margin-top: 1rem; padding: 0.6rem 1.5rem; border: 1px solid #2c3e50; background: transparent; cursor: pointer; border-radius: 4px; }
</style>