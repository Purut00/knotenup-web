<template>
  <div class="trip-page min-h-screen relative overflow-x-hidden text-white bg-slate-900">
    
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <div class="container mx-auto px-6 pt-24 pb-12 relative z-10 max-w-7xl">
      
      <div class="mb-10 animate-fade-in-up">
        <h1 class="text-4xl font-extrabold text-white mb-3">Semua Trip</h1>
        <p class="text-gray-400 text-lg">Cari pengembaraan seterusnya di sini.</p>
      </div>

      <div class="filter-section mb-10 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl animate-fade-in-up" style="animation-delay: 0.1s;">
        
        <div class="flex flex-col lg:flex-row gap-4 mb-6">
          
          <div class="search-wrapper relative flex-grow-[2] min-w-[250px]">
             <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
             <input 
               type="text" 
               v-model="filters.searchQuery"
               class="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white placeholder-slate-500 focus:border-purple-500 focus:bg-black/40 transition outline-none"
               :placeholder="t('trip.searchPlaceholder') || 'Cari lokasi atau aktiviti...'" 
             />
          </div>

          <div class="flex flex-wrap gap-3 flex-grow justify-end">
             
             <div class="select-wrapper relative flex-1 min-w-[150px]">
                <i class="fas fa-map-marker-alt absolute left-3 top-1/2 -translate-y-1/2 text-red-400 pointer-events-none"></i>
                <select v-model="filters.location" class="custom-select pl-10">
                  <option value="">{{ t('trip.locationAny') || 'Semua Lokasi' }}</option>
                  <option v-for="loc in LOCATIONS" :key="loc" :value="loc">{{ loc }}</option>
                </select>
             </div>

             <div class="select-wrapper relative flex-1 min-w-[150px]">
                <i class="far fa-calendar-alt absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none"></i>
                <select v-model="filters.date" class="custom-select pl-10">
                  <option value="">{{ t('components.anyDate') || 'Bila-bila' }}</option>
                  <option v-for="dateOpt in DATE_FILTERS" :key="dateOpt.value" :value="dateOpt.value">
                    {{ dateOpt.label }}
                  </option>
                </select>
             </div>

             <div class="select-wrapper relative flex-1 min-w-[150px]">
                <i class="fas fa-tachometer-alt absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none"></i>
                <select v-model="filters.level" class="custom-select pl-10">
                  <option value="">{{ t('components.allLevels') || 'Semua Level' }}</option>
                  <option v-for="lvl in DIFFICULTY_LEVELS" :key="lvl.value" :value="lvl.value">
                    {{ lvl.label }}
                  </option>
                </select>
             </div>

             <button 
                v-if="hasActiveFilters" 
                class="btn-reset w-12 h-12 flex items-center justify-center rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500/30 transition shadow-lg" 
                @click="resetFilters"
                title="Reset Filter"
             >
               <i class="fas fa-undo"></i>
             </button>
          </div>
        </div>

        <div class="category-scroll-container flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              class="cat-pill whitespace-nowrap px-5 py-2 rounded-full border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition" 
              :class="{ 'active-pill': filters.category === '' }"
              @click="selectCategory('')"
            >
              Semua
            </button>
            <button 
              v-for="item in TRIP_CATEGORIES" 
              :key="item.key"
              class="cat-pill whitespace-nowrap px-5 py-2 rounded-full border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition flex items-center gap-2"
              :class="{ 'active-pill': filters.category === item.key }"
              @click="selectCategory(item.key)"
            >
              <i :class="item.icon"></i>
              {{ item.label }}
            </button>
        </div>

      </div>

      <div class="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
         <h2 class="text-xl font-bold text-white">
           {{ filteredTrips.length }} Trip Ditemui
         </h2>
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-24 text-gray-400">
        <div class="spinner w-10 h-10 border-4 border-white/10 border-t-purple-500 rounded-full animate-spin mb-4"></div>
        <p>Sedang memuatkan...</p>
      </div>

      <div v-else-if="filteredTrips.length === 0" class="text-center py-24 text-gray-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
        <i class="fas fa-search text-5xl mb-4 opacity-30"></i>
        <p class="text-lg">Tiada trip ditemui untuk carian ini.</p>
        <button @click="resetFilters" class="text-purple-400 hover:text-purple-300 underline mt-3 font-medium">Reset Filter</button>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
         <TripCard v-for="trip in filteredTrips" :key="trip.id" :trip="trip" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

// Imports (Types & Constants)
import TripCard from '../components/trip/TripCard.vue';
import type { Trip } from '../types';
import { TRIP_CATEGORIES, LOCATIONS, DIFFICULTY_LEVELS, DATE_FILTERS } from '../constants/tripData';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// State
const trips = ref<Trip[]>([]);
const loading = ref(true);

// Reactive Filter Object (Lebih kemas dari multiple refs)
const filters = reactive({
  searchQuery: '',
  category: '',
  location: '',
  date: '',
  level: ''
});

// --- ACTIONS ---

const resetFilters = () => {
  filters.searchQuery = '';
  filters.category = '';
  filters.location = '';
  filters.date = '';
  filters.level = '';
  router.replace({ query: {} });
};

const selectCategory = (catKey: string) => {
  filters.category = catKey;
  router.replace({ query: { ...route.query, category: catKey || undefined } });
};

// Check if any filter is active (untuk butang reset)
const hasActiveFilters = computed(() => {
  return !!filters.searchQuery || !!filters.category || !!filters.location || !!filters.date || !!filters.level;
});

// Helper: Date Logic
const checkDateFilter = (dateStr: string, filterType: string): boolean => {
  if (!dateStr) return true;
  const tripDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0,0,0,0);

  if (filterType === 'week') {
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return tripDate >= today && tripDate <= nextWeek;
  }
  
  if (filterType === 'month') {
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);
    return tripDate >= today && tripDate <= nextMonth;
  }
  return true;
};

// Main Filtering Logic
const filteredTrips = computed(() => {
  return trips.value.filter(trip => {
    // 1. Search
    const matchSearch = !filters.searchQuery || 
      (trip.title && trip.title.toLowerCase().includes(filters.searchQuery.toLowerCase()));
    
    // 2. Location
    const matchLoc = !filters.location || 
      (trip.location && trip.location.toLowerCase().includes(filters.location.toLowerCase()));

    // 3. Category
    const matchCat = !filters.category || 
      (trip.category && trip.category.toLowerCase() === filters.category.toLowerCase());
    
    // 4. Level
    const matchLevel = !filters.level || trip.difficulty === filters.level;
    
    // 5. Date
    const matchDate = !filters.date || checkDateFilter(trip.startDate, filters.date);
    
    return matchSearch && matchLoc && matchCat && matchLevel && matchDate;
  });
});

// Fetch Data
onMounted(async () => {
  // Set initial filters from URL
  if (route.query.category) filters.category = route.query.category as string;
  if (route.query.q) filters.searchQuery = route.query.q as string;

  try {
    const q = query(
      collection(db, "trips"), 
      where("status", "!=", "archived"), 
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    
    // Map with Type Safety
    trips.value = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Trip[];

  } catch (error) { 
    console.error("Error fetching trips:", error);
  } finally { 
    loading.value = false; 
  }
});
</script>

<style scoped>
/* Custom Styles for Glow Effects & Scrollbar */

.page-glow-purple {
  position: absolute; top: 0; left: 0; width: 50vw; height: 50vw;
  background: #6c63ff; filter: blur(120px); opacity: 0.15; pointer-events: none;
  border-radius: 50%; z-index: 0;
}
.page-glow-orange {
  position: absolute; top: 20%; right: 0; width: 40vw; height: 40vw;
  background: #ff8c42; filter: blur(120px); opacity: 0.1; pointer-events: none;
  border-radius: 50%; z-index: 0;
}

/* Custom Select Styling */
.custom-select {
  width: 100%; appearance: none; padding-right: 2.5rem; padding-top: 0.75rem; padding-bottom: 0.75rem;
  border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.2); color: #e2e8f0; outline: none; cursor: pointer; transition: all 0.2s;
}
.custom-select:hover { background: rgba(0,0,0,0.3); }
.custom-select:focus { border-color: #6c63ff; }

/* Custom Arrow for Select */
.select-wrapper::after {
  content: '▼'; font-size: 0.7rem; color: #94a3b8;
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%); pointer-events: none;
}

/* Active Category Pill */
.active-pill {
  background: #6c63ff !important; 
  color: white !important; 
  border-color: #6c63ff !important;
  box-shadow: 0 0 15px rgba(108, 99, 255, 0.4);
}

/* Hide Scrollbar */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>