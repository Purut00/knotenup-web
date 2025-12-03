<template>
  <div class="trip-page">
    
    <!-- SEARCH STRIP -->
    <div class="search-strip-container">
      <div class="container">
        <div class="search-row">
          <div class="search-input-wrapper">
            
            <select v-model="currentFilter" class="search-select">
              <option value="">{{ t('directory.catAll') }}</option>
              <!-- Translate nama group & items -->
              <optgroup v-for="group in ACTIVITY_CATEGORIES" :key="group.group" :label="t('activities.' + group.group)">
                <option v-for="item in group.items" :key="item" :value="item">
                  {{ t('activities.' + item) }}
                </option>
              </optgroup>
            </select>
            
            <input 
              type="text" 
              v-model="searchQuery"
              :placeholder="t('trip.filterDest')" 
              @input="filterLocal"
            />

            <button class="btn-search-strip">
              {{ t('common.search') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- SECONDARY FILTERS -->
    <div class="container secondary-filter-container">
      <div class="filter-row">
        <div class="filter-group">
          <span class="filter-label">{{ t('trip.filterDate') }}:</span>
          <select v-model="filterDate" class="mini-select">
            <option value="">{{ t('components.anyDate') }}</option>
            <option value="week">{{ t('components.thisWeek') }}</option>
            <option value="month">{{ t('components.nextMonth') }}</option>
          </select>
        </div>

        <div class="filter-group">
          <span class="filter-label">{{ t('trip.filterLevel') }}:</span>
          <select v-model="filterLevel" class="mini-select">
            <option value="">{{ t('components.allLevels') }}</option>
            <option value="Easy">🟢 {{ t('levels.easy') }}</option>
            <option value="Moderate">🟡 {{ t('levels.moderate') }}</option>
            <option value="Hard">🔴 {{ t('levels.hard') }}</option>
          </select>
        </div>

        <button class="btn-reset" @click="resetFilters">{{ t('components.reset') }}</button>
      </div>
    </div>

    <!-- CONTENT GRID -->
    <div class="content-container container">
      <div class="results-meta">
        <!-- Guna t() dengan parameter count -->
        <span>{{ t('trip.showingActiveTrips', { count: filteredTrips.length }) }}</span>
      </div>
      
      <div v-if="loading" class="loading-box">⏳ {{ t('common.loading') }}</div>

      <div v-else class="trip-grid">
        <TripCard v-for="trip in filteredTrips" :key="trip.id" :trip="trip" />
      </div>
      
      <div v-if="!loading && filteredTrips.length === 0" class="empty-box">
        <p>{{ t('trip.notFound') }}</p>
        <button class="btn-outline" @click="resetFilters">{{ t('home.viewAllTrips') }}</button>
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
import { ACTIVITY_CATEGORIES } from '../constants/data';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const trips = ref<any[]>([]);
const loading = ref(true);

// Filter States
const searchQuery = ref('');
const currentFilter = ref(''); 
const filterLevel = ref('');
const filterDate = ref('');

const resetFilters = () => {
  searchQuery.value = '';
  currentFilter.value = '';
  filterLevel.value = '';
  filterDate.value = '';
  router.replace({ query: {} });
};

// Logic Filter
const filteredTrips = computed(() => {
  return trips.value.filter(trip => {
    // 1. Search Text
    const matchSearch = !searchQuery.value || 
      trip.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      (trip.location && trip.location.toLowerCase().includes(searchQuery.value.toLowerCase()));
    
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
    // Simpan data raw. Formatting tarikh & translate kategori dibuat di TripCard supaya reaktif
    trips.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) { console.error(error); } 
  finally { loading.value = false; }
});
</script>

<style scoped>
.trip-page { background-color: #f5f5f5; min-height: 100vh; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }

/* SEARCH STRIP */
.search-strip-container { 
  background: white; 
  padding: 1.5rem 0 0.8rem 0; 
  border-bottom: 1px solid #eaeaea; 
  margin-bottom: 1rem; 
  position: sticky; 
  top: 0; 
  z-index: 99; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}

.search-row { display: flex; justify-content: center; padding: 0 1rem; }

.search-input-wrapper { 
  display: flex; 
  width: 100%; 
  max-width: 800px; 
  border: 2px solid #27ae60; 
  border-radius: 4px; 
  overflow: hidden; 
  background: white;
}

.search-select {
  border: none;
  border-right: 1px solid #eee;
  padding: 0.5rem 1rem;
  background: #fdfdfd;
  color: #555;
  font-weight: bold;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  max-width: 180px; 
  appearance: auto; 
}

.search-input-wrapper input { 
  flex: 1; 
  border: none; 
  padding: 0.5rem 1rem; 
  outline: none; 
  font-size: 0.9rem; 
}

.btn-search-strip { 
  background: #27ae60; 
  color: white; 
  border: none; 
  padding: 0 2rem; 
  cursor: pointer; 
  font-size: 0.95rem; 
  font-weight: bold; 
  white-space: nowrap;
}
.btn-search-strip:hover { background: #219150; }

/* SECONDARY FILTERS */
.secondary-filter-container { margin-bottom: 1rem; }
.filter-row { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; padding: 0.5rem 0; border-bottom: 1px dashed #ddd;}

.filter-group { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }
.filter-label { color: #777; font-weight: bold; font-size: 0.8rem; }
.mini-select { border: 1px solid #ddd; padding: 0.4rem; border-radius: 4px; font-size: 0.85rem; color: #333; outline: none; background: white; }
.mini-select:focus { border-color: #27ae60; }

.btn-reset { margin-left: auto; background: none; border: none; color: #e67e22; font-size: 0.85rem; cursor: pointer; font-weight: bold; }
.btn-reset:hover { text-decoration: underline; }

/* CONTENT */
.results-meta { margin-bottom: 1rem; color: #777; font-size: 0.85rem; text-align: right; }
.trip-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; } 

.loading-box, .empty-box { text-align: center; padding: 3rem; color: #999; background: white; margin-top: 2rem; }
.btn-outline { margin-top: 1rem; padding: 0.5rem 1.5rem; border: 1px solid #2c3e50; background: transparent; cursor: pointer; border-radius: 4px; font-size: 0.9rem; }

/* RESPONSIVE */
@media (max-width: 1024px) { .trip-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { 
  .search-select { display: none; }
  .trip-grid { grid-template-columns: repeat(2, 1fr); } 
  .filter-row { justify-content: space-between; }
}
</style>