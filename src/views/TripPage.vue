<template>
  <div class="trip-page">
    
    <!-- 1. HEADER SECTION -->
    <div class="trip-header text-center pt-10 pb-6">
      <div class="container">
        <h1 class="text-3xl md:text-4xl font-bold mb-2">
          Destinasi & <span class="text-gradient-animate">Pengembaraan</span>
        </h1>
        <p class="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
          {{ t('trip.headerSubtitle') || 'Cari trip idaman anda mengikut kategori, tarikh, dan bajet.' }}
        </p>
      </div>
    </div>

    <!-- 2. STICKY SEARCH & FILTER BAR -->
    <div class="sticky-filter-bar">
      <div class="container">
        
        <!-- Baris Atas: Search & Secondary Filters -->
        <div class="flex flex-col md:flex-row gap-3 mb-4 items-center justify-between">
          
          <!-- Search Box -->
          <div class="search-box-sunset flex-1 w-full">
             <i class="fas fa-search text-gray-400 ml-3"></i>
             <input 
               type="text" 
               v-model="searchQuery"
               :placeholder="t('trip.filterDest') || 'Cari lokasi...'" 
               @input="filterLocal"
             />
          </div>

          <!-- Secondary Filters (Date & Level) -->
          <div class="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
            
            <!-- Date Filter -->
            <div class="filter-dropdown-wrapper">
              <i class="far fa-calendar-alt text-sunset-orange text-xs absolute left-3 top-1/2 transform -translate-y-1/2"></i>
              <select v-model="filterDate" class="filter-select pl-8">
                <option value="">{{ t('components.anyDate') || 'Bila-bila' }}</option>
                <option value="week">{{ t('components.thisWeek') || 'Minggu Ini' }}</option>
                <option value="month">{{ t('components.nextMonth') || 'Bulan Depan' }}</option>
              </select>
            </div>

            <!-- Level Filter -->
            <div class="filter-dropdown-wrapper">
              <i class="fas fa-tachometer-alt text-sunset-purple text-xs absolute left-3 top-1/2 transform -translate-y-1/2"></i>
              <select v-model="filterLevel" class="filter-select pl-8">
                <option value="">{{ t('components.allLevels') || 'Semua Level' }}</option>
                <option value="Easy">🟢 {{ t('levels.easy') || 'Mudah' }}</option>
                <option value="Moderate">🟡 {{ t('levels.moderate') || 'Sederhana' }}</option>
                <option value="Hard">🔴 {{ t('levels.hard') || 'Sukar' }}</option>
              </select>
            </div>
            
            <!-- Reset Button -->
            <button 
              v-if="searchQuery || currentFilter || filterLevel || filterDate" 
              class="btn-reset-icon" 
              @click="resetFilters" 
              title="Reset"
            >
              <i class="fas fa-undo"></i>
            </button>
          </div>
        </div>

        <!-- Baris Bawah: Category Pills (Scrollable) -->
        <div class="category-scroll-container">
          <div 
            class="cat-pill" 
            :class="{ 'active': currentFilter === '' }"
            @click="selectCategory('')"
          >
            <span>{{ t('directory.catAll') || 'Semua' }}</span>
          </div>

          <div 
            v-for="item in categoriesData" 
            :key="item.key"
            class="cat-pill"
            :class="{ 'active': currentFilter === item.key }"
            @click="selectCategory(item.key)"
          >
            <!-- Icon dengan warna dynamic -->
            <i :class="item.icon" :style="{ color: currentFilter === item.key ? 'white' : item.color }"></i>
            <span>{{ t('activities.' + item.key) || item.label }}</span>
          </div>
        </div>

      </div>
    </div>

    <!-- 3. CONTENT GRID -->
    <div class="container py-8 min-h-screen">
      
      <!-- Meta Results -->
      <div class="flex justify-between items-center mb-6 px-1">
         <span class="text-sm text-gray-500 font-medium">
           {{ t('trip.showingActiveTrips', { count: filteredTrips.length }) || `Menunjukkan ${filteredTrips.length} trip` }}
         </span>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-gray-400">
        <div class="spinner mb-4"></div>
        <p>{{ t('common.loading') }}...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredTrips.length === 0" class="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-50">
        <div class="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
           <i class="fas fa-search text-3xl text-gray-300"></i>
        </div>
        <h3 class="text-lg font-bold text-gray-600">{{ t('trip.notFound') || 'Tiada Trip Ditemui' }}</h3>
        <p class="text-gray-400 text-sm mb-4">Cuba ubah kata kunci atau tetapan filter anda.</p>
        <button @click="resetFilters" class="text-sunset-orange hover:underline text-sm font-bold">
          {{ t('home.viewAllTrips') || 'Reset Filter' }}
        </button>
      </div>

      <!-- Grid Content -->
      <div v-else class="trip-grid-layout">
         <TripCard v-for="trip in filteredTrips" :key="trip.id" :trip="trip" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import TripCard from '../components/trip/TripCard.vue';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// --- SETUP ---
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// --- STATE ---
const trips = ref<any[]>([]);
const loading = ref(true);

// Filter States
const searchQuery = ref('');
const currentFilter = ref(''); 
const filterLevel = ref('');
const filterDate = ref('');

// --- DATA KATEGORI UTK UI (Ada Ikon & Warna) ---
// Kita map key ini supaya sama dengan value 'category' dalam database
const categoriesData = [
  { key: 'hiking',       label: 'Hiking',      icon: 'fas fa-hiking',          color: '#48bb78' },
  { key: 'camping',      label: 'Camping',     icon: 'fas fa-campground',      color: '#ed8936' },
  { key: 'climbing',     label: 'Climbing',    icon: 'fas fa-mountain',        color: '#718096' },
  { key: 'caving',       label: 'Caving',      icon: 'fas fa-dungeon',         color: '#4a5568' },
  { key: 'diving',       label: 'Diving',      icon: 'fas fa-mask-snorkel',    color: '#4299e1' },
  { key: 'kayaking',     label: 'Kayaking',    icon: 'fas fa-sailboat',        color: '#38b2ac' },
  { key: 'rafting',      label: 'Rafting',     icon: 'fas fa-water',           color: '#3182ce' },
  { key: 'surfing',      label: 'Surfing',     icon: 'fas fa-person-surfing',  color: '#0bc5ea' },
  { key: 'paragliding',  label: 'Paragliding', icon: 'fas fa-paper-plane',     color: '#9f7aea' },
  { key: 'fishing',      label: 'Fishing',     icon: 'fas fa-fish',            color: '#2b6cb0' },
];

// --- LOGIC ---

const resetFilters = () => {
  searchQuery.value = '';
  currentFilter.value = '';
  filterLevel.value = '';
  filterDate.value = '';
  router.replace({ query: {} });
};

const selectCategory = (catKey: string) => {
  currentFilter.value = catKey;
  // Optional: Update URL supaya user boleh share link kategori
  router.replace({ query: { ...route.query, category: catKey || undefined } });
};

const filterLocal = () => { /* Triggered by input if needed specific logic */ };

// Logic Filter Computed (Sama macam asal, cuma tambah sorting sikit kalau nak)
const filteredTrips = computed(() => {
  return trips.value.filter(trip => {
    // 1. Search Text
    const matchSearch = !searchQuery.value || 
      (trip.title && trip.title.toLowerCase().includes(searchQuery.value.toLowerCase())) || 
      (trip.location && trip.location.toLowerCase().includes(searchQuery.value.toLowerCase()));
    
    // 2. Category
    const matchCat = !currentFilter.value || 
      (trip.category && trip.category.toLowerCase() === currentFilter.value.toLowerCase());
    
    // 3. Level
    const matchLevel = !filterLevel.value || trip.difficulty === filterLevel.value;
    
    // 4. Date Logic (Simple example implementation)
    // Anda boleh tambah logic date comparison sebenar di sini menggunakan trip.startDate
    let matchDate = true;
    if (filterDate.value === 'week') {
       // Logic minggu ini...
    }
    
    return matchSearch && matchCat && matchLevel && matchDate;
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
  } finally { 
    loading.value = false; 
  }
});

// Watch query changes from router (e.g. back button)
watch(() => route.query, (newQuery) => {
    if(newQuery.category !== undefined) currentFilter.value = newQuery.category as string;
    else if(!newQuery.category && currentFilter.value) currentFilter.value = '';
});

</script>

<style scoped>
/* --- BASE & COLORS --- */
.trip-page { 
  background-color: var(--bg-body, #F8FAFC); 
  min-height: 100vh; 
}
.container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }

/* --- HEADER ANIMATION --- */
.text-gradient-animate {
  background: linear-gradient(to right, #FF7E5F, #FEB47B, #6C63FF, #FF7E5F);
  background-size: 200% auto;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: shine 5s linear infinite;
}
@keyframes shine { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }

/* --- STICKY FILTER BAR --- */
.sticky-filter-bar {
  position: sticky;
  top: 0; 
  z-index: 40;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #f1f5f9;
  padding: 1rem 0 0.5rem 0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
}

/* Search Box Minimalist */
.search-box-sunset {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 50px;
  padding: 8px 10px;
  transition: all 0.3s;
}
.search-box-sunset:focus-within {
  background: white;
  border-color: #FF7E5F;
  box-shadow: 0 0 0 3px rgba(255, 126, 95, 0.1);
}
.search-box-sunset input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 6px 10px;
  color: #333;
  font-size: 0.95rem;
}

/* Secondary Filters (Dropdowns) */
.filter-dropdown-wrapper {
  position: relative;
  min-width: 140px;
}
.filter-select {
  width: 100%;
  appearance: none;
  background: white;
  border: 1px solid #e2e8f0;
  padding: 8px 12px 8px 32px; /* Space for icon */
  border-radius: 50px;
  font-size: 0.85rem;
  color: #64748b;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
}
.filter-select:hover { border-color: #cbd5e1; }
.filter-select:focus { border-color: #FF7E5F; color: #333; }

.btn-reset-icon {
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: #fff1f2;
  color: #e11d48;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.btn-reset-icon:hover { background: #ffe4e6; transform: rotate(-90deg); }

/* --- CATEGORY PILLS (Horizontal Scroll) --- */
.category-scroll-container {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px 2px;
  scrollbar-width: none;
}
.category-scroll-container::-webkit-scrollbar { display: none; }

.cat-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #f1f5f9;
  padding: 8px 16px;
  border-radius: 50px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.cat-pill i { font-size: 1rem; transition: color 0.3s; }

.cat-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.05);
  border-color: #ffe4e6;
}

.cat-pill.active {
  background: linear-gradient(135deg, #FF7E5F, #FEB47B);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(255, 126, 95, 0.3);
}

/* --- GRID LAYOUT --- */
.trip-grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
}

/* Spinner */
.spinner {
  width: 30px; height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #FF7E5F;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Helpers */
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* Responsive Adjustments */
@media (max-width: 768px) {
  .trip-grid-layout { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .filter-dropdown-wrapper { min-width: 120px; }
}
@media (max-width: 480px) {
  .trip-grid-layout { grid-template-columns: 1fr; }
}
</style>