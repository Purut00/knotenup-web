<template>
  <div class="trip-page">
    
    <!-- GLOW BACKGROUND (Ikut Homepage) -->
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <div class="container pt-8 pb-12">
      
      <!-- HEADER SIMPLE -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Semua Trip</h1>
        <p class="text-gray-400">Cari pengembaraan seterusnya di sini.</p>
      </div>

      <!-- FILTER SECTION (Clean Row) -->
      <div class="filter-section mb-8">
        
        <!-- Row 1: Inputs -->
        <div class="filter-row">
          
          <!-- Search -->
          <div class="search-wrapper">
             <i class="fas fa-search search-icon"></i>
             <input 
               type="text" 
               v-model="searchQuery"
               class="search-input"
               :placeholder="t('trip.searchPlaceholder') || 'Cari lokasi atau aktiviti...'" 
             />
          </div>

          <!-- Filters -->
          <div class="filters-wrapper">
             
             <!-- Location -->
             <div class="select-wrapper">
                <i class="fas fa-map-marker-alt select-icon text-red-400"></i>
                <select v-model="filterLocation" class="custom-select">
                  <option value="">{{ t('trip.locationAny') || 'Semua Lokasi' }}</option>
                  <option value="Selangor">Selangor</option>
                  <option value="KL">Kuala Lumpur</option>
                  <option value="Pahang">Pahang</option>
                  <option value="Perak">Perak</option>
                  <option value="Sabah">Sabah</option>
                  <option value="Sarawak">Sarawak</option>
                </select>
             </div>

             <!-- Date -->
             <div class="select-wrapper">
                <i class="far fa-calendar-alt select-icon text-orange-400"></i>
                <select v-model="filterDate" class="custom-select">
                  <option value="">{{ t('components.anyDate') || 'Bila-bila' }}</option>
                  <option value="week">{{ t('components.thisWeek') || 'Minggu Ini' }}</option>
                  <option value="month">{{ t('components.nextMonth') || 'Bulan Depan' }}</option>
                </select>
             </div>

             <!-- Level -->
             <div class="select-wrapper">
                <i class="fas fa-tachometer-alt select-icon text-purple-400"></i>
                <select v-model="filterLevel" class="custom-select">
                  <option value="">{{ t('components.allLevels') || 'Semua Level' }}</option>
                  <option value="Easy">🟢 Mudah</option>
                  <option value="Moderate">🟡 Sederhana</option>
                  <option value="Hard">🔴 Sukar</option>
                </select>
             </div>

             <!-- Reset -->
             <button 
                v-if="searchQuery || currentFilter || filterLevel || filterDate || filterLocation" 
                class="btn-reset" 
                @click="resetFilters"
             >
               <i class="fas fa-undo"></i>
             </button>
          </div>
        </div>

        <!-- Row 2: Categories -->
        <div class="category-scroll-container mt-4">
            <button 
              class="cat-pill" 
              :class="{ 'active': currentFilter === '' }"
              @click="selectCategory('')"
            >
              Semua
            </button>
            <button 
              v-for="item in categoriesData" 
              :key="item.key"
              class="cat-pill"
              :class="{ 'active': currentFilter === item.key }"
              @click="selectCategory(item.key)"
            >
              <i :class="item.icon" class="mr-2"></i>
              {{ item.label }}
            </button>
        </div>

      </div>

      <!-- RESULTS INFO -->
      <div class="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
         <h2 class="text-xl font-bold text-white">
           {{ filteredTrips.length }} Trip Ditemui
         </h2>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-gray-400">
        <div class="spinner mb-4"></div>
        <p>Sedang memuatkan...</p>
      </div>

      <!-- EMPTY STATE -->
      <div v-else-if="filteredTrips.length === 0" class="text-center py-20 text-gray-500">
        <i class="fas fa-search text-4xl mb-4 opacity-30"></i>
        <p>Tiada trip ditemui untuk carian ini.</p>
        <button @click="resetFilters" class="text-purple-400 underline mt-2">Reset Filter</button>
      </div>

      <!-- GRID LAYOUT (Sama macam Homepage) -->
      <div v-else class="trip-grid">
         <TripCard v-for="trip in filteredTrips" :key="trip.id" :trip="trip" />
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

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// State
const trips = ref<any[]>([]);
const loading = ref(true);

// Filters
const searchQuery = ref('');
const currentFilter = ref(''); 
const filterLevel = ref('');
const filterDate = ref('');
const filterLocation = ref('');

// Data Kategori
const categoriesData = [
  { key: 'hiking',      label: 'Hiking',      icon: 'fas fa-hiking' },
  { key: 'camping',     label: 'Camping',     icon: 'fas fa-campground' },
  { key: 'climbing',    label: 'Climbing',    icon: 'fas fa-mountain' },
  { key: 'caving',      label: 'Caving',      icon: 'fas fa-dungeon' },
  { key: 'kayaking',    label: 'Kayaking',    icon: 'fas fa-sailboat' },
  { key: 'rafting',     label: 'Rafting',     icon: 'fas fa-water' },
  { key: 'paragliding', label: 'Paragliding', icon: 'fas fa-paper-plane' },
  { key: 'fishing',     label: 'Fishing',     icon: 'fas fa-fish' },
];

const resetFilters = () => {
  searchQuery.value = '';
  currentFilter.value = '';
  filterLevel.value = '';
  filterDate.value = '';
  filterLocation.value = '';
  router.replace({ query: {} });
};

const selectCategory = (catKey: string) => {
  currentFilter.value = catKey;
  router.replace({ query: { ...route.query, category: catKey || undefined } });
};

const filteredTrips = computed(() => {
  return trips.value.filter(trip => {
    const matchSearch = !searchQuery.value || 
      (trip.title && trip.title.toLowerCase().includes(searchQuery.value.toLowerCase()));
    
    const matchLoc = !filterLocation.value || 
      (trip.location && trip.location.toLowerCase().includes(filterLocation.value.toLowerCase()));

    const matchCat = !currentFilter.value || 
      (trip.category && trip.category.toLowerCase() === currentFilter.value.toLowerCase());
    
    const matchLevel = !filterLevel.value || trip.difficulty === filterLevel.value;
    
    return matchSearch && matchLoc && matchCat && matchLevel;
  });
});

onMounted(async () => {
  if (route.query.category) currentFilter.value = route.query.category as string;
  if (route.query.q) searchQuery.value = route.query.q as string;

  try {
    const q = query(collection(db, "trips"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    trips.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) { 
    console.error("Error fetching trips:", error);
    // Mock Data
    trips.value = [
       { id: 1, title: 'Hiking Gunung Nuang', location: 'Selangor', difficulty: 'Hard', category: 'hiking', status: 'open', price: 50, maxSlots: 20, currentSlots: 5, startDate: '2023-12-25', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800' },
       { id: 2, title: 'Camping di Janda Baik', location: 'Pahang', difficulty: 'Easy', category: 'camping', status: 'open', price: 120, maxSlots: 10, currentSlots: 8, startDate: '2024-01-10', image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800' },
       { id: 3, title: 'White Water Rafting', location: 'Perak', difficulty: 'Moderate', category: 'rafting', status: 'open', price: 180, maxSlots: 15, currentSlots: 2, startDate: '2024-02-05', image: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800' }
    ];
  } finally { 
    loading.value = false; 
  }
});
</script>

<style scoped>
/* --- THEME BACKGROUND (DARK SUNSET) --- */
.trip-page { 
  background-color: #0f172a; /* Dark Blue/Black base */
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  color: white;
}
.container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; position: relative; z-index: 2; }

/* GLOW EFFECTS */
.page-glow-purple {
  position: absolute; top: 0; left: 0; width: 50vw; height: 50vw;
  background: #6c63ff; filter: blur(120px); opacity: 0.15; pointer-events: none;
  border-radius: 50%;
}
.page-glow-orange {
  position: absolute; top: 20%; right: 0; width: 40vw; height: 40vw;
  background: #ff8c42; filter: blur(120px); opacity: 0.1; pointer-events: none;
  border-radius: 50%;
}

/* --- FILTER SECTION --- */
.filter-section {
  background: rgba(255, 255, 255, 0.05); /* Glass Dark */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.2rem;
  backdrop-filter: blur(10px);
}

.filter-row {
  display: flex; gap: 12px; flex-wrap: wrap; align-items: center;
}

/* SEARCH */
.search-wrapper {
  position: relative; flex-grow: 2; min-width: 250px;
}
.search-input {
  width: 100%; padding: 12px 12px 12px 42px;
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.2); color: white;
  outline: none; transition: 0.3s;
}
.search-input:focus { border-color: #6c63ff; background: rgba(0,0,0,0.4); }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }

/* DROPDOWNS */
.filters-wrapper { display: flex; gap: 10px; flex-wrap: wrap; flex-grow: 1; }
.select-wrapper { position: relative; flex: 1; min-width: 140px; }
.custom-select {
  width: 100%; appearance: none;
  padding: 12px 36px 12px 38px;
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.2); color: #e2e8f0;
  outline: none; cursor: pointer; transition: 0.3s;
}
.custom-select:hover { background: rgba(0,0,0,0.3); }
.custom-select:focus { border-color: #6c63ff; }
.select-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; }
/* Arrow Hack for select */
.select-wrapper::after {
  content: '▼'; font-size: 0.7rem; color: #94a3b8;
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%); pointer-events: none;
}

/* CATEGORIES */
.category-scroll-container {
  display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px;
  scrollbar-width: none;
}
.category-scroll-container::-webkit-scrollbar { display: none; }
.cat-pill {
  display: flex; align-items: center;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 8px 16px; border-radius: 50px;
  color: #94a3b8; cursor: pointer; white-space: nowrap; transition: 0.3s;
}
.cat-pill:hover { background: rgba(255,255,255,0.1); color: white; }
.cat-pill.active {
  background: #6c63ff; color: white; border-color: #6c63ff;
  box-shadow: 0 0 15px rgba(108, 99, 255, 0.4);
}

.btn-reset {
  width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;
  border-radius: 10px; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: none; cursor: pointer;
}
.btn-reset:hover { background: rgba(239, 68, 68, 0.3); }

/* --- GRID LAYOUT (MATCH HOMEPAGE) --- */
.trip-grid {
  display: grid;
  /* Grid settings sama dengan Homepage: minmax 260px, gap 30px */
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 30px;
}

.spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #6c63ff; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* RESPONSIVE */
@media (max-width: 768px) {
  .search-wrapper { width: 100%; min-width: 100%; order: 1; }
  .filters-wrapper { width: 100%; order: 2; }
  .trip-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
}
</style>