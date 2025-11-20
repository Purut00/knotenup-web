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
        <span>Menunjukkan <strong>{{ trips.length }}</strong> trip aktif</span>
      </div>
      
      <div v-if="loading" style="text-align: center; padding: 2rem;">
        <p>⏳ {{ t('common.loading') }}</p>
      </div>

      <div v-else class="trip-grid">
        <TripCard 
          v-for="trip in trips" 
          :key="trip.id" 
          :trip="trip" 
        />
      </div>
      
      <div v-if="!loading && trips.length === 0" style="text-align: center; margin-top: 2rem;">
        <p>Belum ada trip buat masa ini.</p>
      </div>
      
      <div v-if="trips.length > 0" class="load-more">
        <button>Lihat Banyak Lagi</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import TripFilter from '../components/trip/TripFilter.vue';
import TripCard from '../components/trip/TripCard.vue';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const { t } = useI18n();
const trips = ref<any[]>([]); // Array kosong mula-mula
const loading = ref(true);

onMounted(async () => {
  try {
    // Query: Ambil semua trip, susun ikut tarikh create (descending)
    const q = query(collection(db, "trips"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const fetchedTrips: any[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Masukkan ID document sekali
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
.results-meta { margin-bottom: 1.5rem; color: #666; font-size: 0.9rem; }
.trip-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; }
.load-more { text-align: center; margin-top: 3rem; }
.load-more button { padding: 0.8rem 2rem; border: 1px solid #2c3e50; background: transparent; cursor: pointer; border-radius: 50px; font-weight: bold; transition: all 0.3s; }
.load-more button:hover { background: #2c3e50; color: white; }
</style>