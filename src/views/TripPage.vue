<template>
  <div class="trip-page">
    
    <div class="page-header-strip">
      <div class="container header-row">
        <h2 class="page-title">{{ t('trip.headerTitle') }}</h2>
        
        <div class="mini-search-wrapper">
           <input type="text" :placeholder="t('trip.filterDest')" v-model="searchQuery" @input="filterLocal" />
           <button class="btn-mini-search">🔍</button>
        </div>
      </div>
    </div>

    <div class="filter-strip">
      <div class="container filter-row">
        <div class="filter-group">
          <span class="filter-label">{{ t('trip.filterDate') }}:</span>
          <select v-model="filterDate">
            <option value="">{{ t('components.anyDate') }}</option>
            <option value="week">{{ t('components.thisWeek') }}</option>
            <option value="month">{{ t('components.nextMonth') }}</option>
          </select>
        </div>

        <div class="filter-group">
          <span class="filter-label">{{ t('trip.filterLevel') }}:</span>
          <select v-model="filterLevel">
            <option value="">{{ t('components.allLevels') }}</option>
            <option>🟢 Santai (Easy)</option>
            <option>🟡 Sederhana (Moderate)</option>
            <option>🔴 Hardcore (Hard)</option>
          </select>
        </div>

        <div class="filter-group">
           <span class="filter-label">{{ t('createTrip.category') }}:</span>
           <select v-model="currentFilter">
              <option value="">All</option>
              <optgroup v-for="group in ACTIVITY_CATEGORIES" :key="group.group" :label="group.group">
                <option v-for="item in group.items" :key="item" :value="item">{{ item }}</option>
              </optgroup>
           </select>
        </div>

        <button class="btn-reset" @click="resetFilters">{{ t('components.reset') }}</button>
      </div>
    </div>

    <div class="content-container container">
      <div class="results-meta">
        <span>Menunjukkan <strong>{{ filteredTrips.length }}</strong> trip aktif</span>
      </div>
      
      <div v-if="loading" class="loading-box">⏳ {{ t('common.loading') }}</div>

      <div v-else class="trip-grid">
        <TripCard v-for="trip in filteredTrips" :key="trip.id" :trip="trip" />
      </div>
      
      <div v-if="!loading && filteredTrips.length === 0" class="empty-box">
        <p>Tiada trip ditemui.</p>
        <button class="btn-outline" @click="resetFilters">Lihat Semua</button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import TripCard from '../components/trip/TripCard.vue';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ACTIVITY_CATEGORIES } from '../constants/data'; // Import Kategori

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const trips = ref<any[]>([]);
const loading = ref(true);

// Filter States
const searchQuery = ref('');
const currentFilter = ref(''); // Category
const filterLevel = ref('');
const filterDate = ref('');

const resetFilters = () => {
  searchQuery.value = '';
  currentFilter.value = '';
  filterLevel.value = '';
  filterDate.value = '';
  router.replace({ query: {} });
};

// Logic Filter Gabungan
const filteredTrips = computed(() => {
  return trips.value.filter(trip => {
    // 1. Search Text
    const matchSearch = !searchQuery.value || trip.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || trip.location.toLowerCase().includes(searchQuery.value.toLowerCase());
    // 2. Category
    const matchCat = !currentFilter.value || (trip.category && trip.category.toLowerCase() === currentFilter.value.toLowerCase());
    // 3. Level
    const matchLevel = !filterLevel.value || trip.difficulty === filterLevel.value;
    
    return matchSearch && matchCat && matchLevel;
  });
});

const filterLocal = () => { /* Triggered by input */ };

onMounted(async () => {
  if (route.query.category) currentFilter.value = route.query.category as string;

  try {
    const q = query(collection(db, "trips"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    trips.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) { console.error(error); } 
  finally { loading.value = false; }
});
</script>

<style scoped>
.trip-page { background-color: #f5f5f5; min-height: 100vh; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }

/* HEADER STRIP (Putih, Nipis) */
.page-header-strip { background: white; border-bottom: 1px solid #eee; padding: 1rem 0; }
.header-row { display: flex; justify-content: space-between; align-items: center; }
.page-title { margin: 0; font-size: 1.2rem; color: #2c3e50; text-transform: uppercase; font-weight: bold; border-left: 4px solid #e67e22; padding-left: 10px; }

/* MINI SEARCH */
.mini-search-wrapper { display: flex; width: 300px; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
.mini-search-wrapper input { width: 100%; border: none; padding: 0.5rem; outline: none; font-size: 0.9rem; }
.btn-mini-search { background: #2c3e50; color: white; border: none; padding: 0 1rem; cursor: pointer; }

/* FILTER STRIP (Baris kedua) */
.filter-strip { background: #fff; border-bottom: 1px solid #eee; padding: 0.8rem 0; margin-bottom: 1rem; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
.filter-row { display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap; }
.filter-group { display: flex; align-items: center; gap: 5px; font-size: 0.9rem; }
.filter-label { color: #777; font-weight: bold; font-size: 0.8rem; }
select { border: 1px solid #ddd; padding: 0.4rem; border-radius: 4px; font-size: 0.9rem; color: #333; outline: none; background: #f9f9f9; }
select:focus { border-color: #27ae60; }

.btn-reset { margin-left: auto; background: none; border: none; color: #e67e22; font-size: 0.85rem; cursor: pointer; font-weight: bold; }
.btn-reset:hover { text-decoration: underline; }

/* CONTENT */
.results-meta { margin-bottom: 1rem; color: #777; font-size: 0.85rem; text-align: right; }
.trip-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; } /* 5 Column (Compact) */

.loading-box, .empty-box { text-align: center; padding: 3rem; color: #999; background: white; margin-top: 2rem; }
.btn-outline { margin-top: 1rem; padding: 0.5rem 1.5rem; border: 1px solid #2c3e50; background: transparent; cursor: pointer; border-radius: 4px; font-size: 0.9rem; }

/* RESPONSIVE */
@media (max-width: 1024px) { .trip-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { 
  .trip-grid { grid-template-columns: repeat(2, 1fr); } 
  .header-row { flex-direction: column; align-items: flex-start; gap: 10px; }
  .mini-search-wrapper { width: 100%; }
  .filter-row { gap: 10px; }
  .filter-group { width: 48%; flex-direction: column; align-items: flex-start; }
  select { width: 100%; }
}
</style>