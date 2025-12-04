<template>
  <div class="spots-page">
    
    <!-- BACKGROUND LAYERS -->
    <div class="contour-lines"></div>
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <!-- MAIN CONTAINER -->
    <!-- Guna style margin-top manual untuk paksa turun ke bawah -->
    <div class="container main-content" style="padding-top: 0px; padding-bottom: 3rem;">
      
      <!-- HEADER SECTION -->
      <div class="header-section mb-8 relative z-10 flex flex-col md:flex-row justify-between items-end gap-4">
        <div class="text-center md:text-left">
          <h1 class="text-3xl font-bold text-white mb-2">{{ t('spots.title') || 'Lokasi Menarik' }}</h1>
          <p class="text-gray-400 max-w-lg">{{ t('spots.sub') || 'Temui gunung, bukit, air terjun dan lokasi rekreasi terbaik di Malaysia.' }}</p>
        </div>
        
        <!-- BUTTON: Tema Ungu -->
        <button class="btn-create-spot" @click="$router.push('/create-spot')">
          <span class="btn-content">
            <i class="fas fa-plus-circle text-xl"></i>
            <span class="text-sm font-bold ml-2 uppercase tracking-wide">{{ t('spots.addBtn') || 'Tambah Spot' }}</span>
          </span>
          <div class="btn-glow"></div>
        </button>
      </div>

      <!-- FILTER SECTION -->
      <div class="filter-section mb-8 relative z-10">
        <div class="filter-container">
          
          <!-- Row 1: Search Bar (Memanjang) -->
          <div class="search-row">
            <div class="search-wrapper-full">
               <i class="fas fa-search search-icon"></i>
               <input 
                 type="text" 
                 v-model="searchQuery"
                 class="search-input-full"
                 :placeholder="t('spots.searchPlaceholder') || 'Cari nama bukit, gunung, sungai...'" 
               />
               <button class="btn-search-main">Cari</button>
            </div>
          </div>

          <!-- Row 2: Filters (Bawah Search Bar) -->
          <div class="filters-row mt-4">
             
             <!-- Filter: State -->
             <div class="select-wrapper">
                <i class="fas fa-map-marker-alt select-icon text-red-400"></i>
                <select v-model="filterState" class="custom-select">
                  <option value="">{{ t('spots.allStates') || 'Semua Negeri' }}</option>
                  <option v-for="s in MALAYSIA_STATES" :key="s" :value="s">{{ s }}</option>
                </select>
             </div>

             <!-- Filter: Category -->
             <div class="select-wrapper">
                <i class="fas fa-tree select-icon text-purple-400"></i>
                <select v-model="filterCategory" class="custom-select">
                  <option value="">Semua Jenis</option>
                  <option value="Mountain">Gunung</option>
                  <option value="Hill">Bukit</option>
                  <option value="Waterfall">Air Terjun</option>
                  <option value="Cave">Gua</option>
                  <option value="Beach">Pantai</option>
                </select>
             </div>

             <!-- Reset -->
             <button 
                v-if="searchQuery || filterState || filterCategory" 
                class="btn-reset" 
                @click="resetFilters"
                title="Reset Filter"
             >
               <i class="fas fa-undo"></i>
             </button>
          </div>
        </div>
      </div>

      <!-- CONTENT GRID -->
      <div class="content-area relative z-10">
        
        <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-gray-400">
          <div class="spinner mb-4"></div>
          <p>{{ t('common.loading') }}...</p>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="filteredSpots.length === 0" class="empty-state glass-panel">
          <i class="fas fa-mountain text-4xl mb-4 opacity-30 text-gray-400"></i>
          <h3 class="text-lg font-bold text-gray-300">{{ t('spots.empty') || 'Tiada Lokasi Dijumpai' }}</h3>
          <p class="text-gray-500 text-sm">Jadilah yang pertama menambah lokasi ini!</p>
        </div>

        <!-- Spot Grid -->
        <div v-else class="spot-grid">
          <div 
            v-for="spot in filteredSpots" 
            :key="spot.id" 
            class="spot-card glass-card" 
            @click="$router.push('/spots/' + spot.id)"
          >
            <!-- Image Area -->
            <div class="card-img" :style="{ backgroundImage: `url(${spot.image || 'https://via.placeholder.com/300'})` }">
              <div class="overlay-gradient"></div>
              
              <span class="level-badge" :class="spot.difficulty ? spot.difficulty.toLowerCase() : 'easy'">
                 {{ getLevelLabel(spot.difficulty) }}
              </span>
            </div>

            <!-- Body Area -->
            <div class="card-body">
              <div class="flex justify-between items-start mb-2">
                <!-- Highlight Ungu bila Hover -->
                <h3 class="text-lg font-bold text-white leading-tight card-title transition-colors">
                    {{ spot.name }}
                </h3>
              </div>
              
              <div class="meta-info">
                 <span class="flex items-center gap-1"><i class="fas fa-map-pin text-red-400 text-xs"></i> {{ spot.state }}</span>
                 <span v-if="spot.height" class="flex items-center gap-1"><i class="fas fa-ruler-vertical text-blue-400 text-xs"></i> {{ spot.height }}m</span>
              </div>
              
              <div class="tags-container">
                <span v-if="spot.permit === 'Yes' || spot.permit === 'Perlu'" class="tag permit">
                    <i class="fas fa-file-signature mr-1"></i> {{ t('spots.permit') || 'Permit' }}
                </span>
                <span v-else class="tag free">
                    <i class="fas fa-check-circle mr-1"></i> {{ t('spots.noPermit') || 'Bebas' }}
                </span>

                <span class="tag category">
                    <i class="fas fa-tree mr-1"></i> {{ spot.category || 'Nature' }}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { MALAYSIA_STATES } from '../constants/data';

const { t } = useI18n();
const loading = ref(true);
const spots = ref<any[]>([]);
const searchQuery = ref('');
const filterState = ref('');
const filterCategory = ref('');

const getLevelLabel = (level: string) => {
  if (!level) return 'Easy';
  const key = level.toLowerCase();
  const labels: any = { easy: 'Mudah', moderate: 'Sederhana', hard: 'Sukar', extreme: 'Extreme' };
  return t(`components.${key}`) !== `components.${key}` ? t(`components.${key}`) : (labels[key] || level);
};

const resetFilters = () => {
    searchQuery.value = '';
    filterState.value = '';
    filterCategory.value = '';
};

const filteredSpots = computed(() => {
  return spots.value.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchState = filterState.value === '' || s.state === filterState.value;
    const matchCat = filterCategory.value === '' || (s.category && s.category === filterCategory.value);
    return matchSearch && matchState && matchCat;
  });
});

onMounted(async () => {
  try {
    const q = query(collection(db, "spots"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    spots.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
});
</script>

<style scoped>
/* --- BASE THEME --- */
.spots-page { 
  background-color: #0f172a; 
  min-height: 100vh; position: relative; overflow-x: hidden; color: white;
}

/* FIX: Guna Margin Top Besar untuk elak Navbar */
.main-content {
  margin-top: 140px; /* Jarak selamat dari navbar */
  padding-bottom: 3rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  z-index: 2;
}

/* GLOWS */
.page-glow-purple {
  position: absolute; top: -10%; right: -10%; width: 60vw; height: 60vw;
  background: #6c63ff; filter: blur(150px); opacity: 0.15; pointer-events: none; border-radius: 50%;
}
.page-glow-orange {
  position: absolute; bottom: -10%; left: -10%; width: 60vw; height: 60vw;
  background: #ff8c42; filter: blur(150px); opacity: 0.1; pointer-events: none; border-radius: 50%;
}
.contour-lines {
  position: absolute; inset: 0; z-index: 0; opacity: 0.08;
  background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400' stroke='white' fill='none' stroke-width='2' opacity='0.5'/%3E%3C/svg%3E");
  background-size: cover; pointer-events: none;
}

/* --- HEADER BUTTON (UNGU) --- */
.btn-create-spot {
  position: relative;
  background: transparent; border: none; padding: 0; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.btn-content {
  position: relative; z-index: 2;
  display: flex; align-items: center;
  background: linear-gradient(135deg, #6c63ff, #5b54e0); /* Gradient Ungu */
  color: white; padding: 12px 24px; border-radius: 50px;
  box-shadow: 0 4px 15px rgba(108, 99, 255, 0.4);
  transition: transform 0.2s;
}
.btn-create-spot:hover .btn-content { transform: translateY(-2px); background: linear-gradient(135deg, #5b54e0, #4c46c0); }
.btn-glow {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: #6c63ff; filter: blur(15px); opacity: 0.5; z-index: 1;
  transition: opacity 0.3s;
}
.btn-create-spot:hover .btn-glow { opacity: 0.8; }

/* --- FILTER SECTION --- */
.filter-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px; padding: 1.5rem;
  backdrop-filter: blur(10px);
}
.filter-container { display: flex; flex-direction: column; gap: 8px; }

/* Search Row */
.search-row { width: 100%; }
.search-wrapper-full { position: relative; display: flex; width: 100%; align-items: center; }
.search-input-full {
  width: 100%; padding: 10px 100px 10px 44px;
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.2); color: white; outline: none; transition: 0.3s; font-size: 1rem;
}
.search-input-full:focus { border-color: #6c63ff; background: rgba(0,0,0,0.4); }
.search-icon { position: absolute; left: 16px; color: #94a3b8; font-size: 1.1rem; }
.btn-search-main {
  position: absolute; right: 4px; top: 4px; bottom: 4px;
  background: #6c63ff; color: white; border: none; padding: 0 20px;
  border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.3s;
}
.btn-search-main:hover { background: #5b54e0; }

/* Filters Row */
.filters-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.select-wrapper { position: relative; flex: 1; min-width: 160px; }
.custom-select {
  width: 100%; appearance: none; padding: 10px 36px 10px 38px;
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.2); color: #e2e8f0; outline: none; cursor: pointer; transition: 0.3s;
}
.custom-select:hover { background: rgba(0,0,0,0.3); }
.custom-select:focus { border-color: #6c63ff; }
.select-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.select-wrapper::after {
  content: '▼'; font-size: 0.7rem; color: #94a3b8; position: absolute; right: 14px; top: 50%; transform: translateY(-50%); pointer-events: none;
}
.btn-reset {
  width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
  border-radius: 10px; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: none; cursor: pointer;
}
.btn-reset:hover { background: rgba(239, 68, 68, 0.3); }

/* --- GRID & CARDS --- */
.spot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px; overflow: hidden;
  backdrop-filter: blur(10px);
  transition: 0.3s; cursor: pointer;
  display: flex; flex-direction: column;
}
/* HIGHLIGHT UNGU SINI */
.glass-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.06);
  border-color: #6c63ff; /* Border Ungu bila hover */
  box-shadow: 0 10px 30px rgba(108, 99, 255, 0.15); /* Shadow Ungu lembut */
}
.card-title:hover {
  color: #a78bfa; /* Ungu cerah (Tailwind violet-400) */
}

.card-img { height: 180px; background-size: cover; position: relative; }
.overlay-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(15, 23, 42, 0.8));
}

.level-badge {
  position: absolute; top: 10px; right: 10px; padding: 4px 10px;
  border-radius: 20px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase;
  color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}
.level-badge.easy { background: #10b981; }
.level-badge.moderate { background: #f59e0b; }
.level-badge.hard, .level-badge.extreme { background: #ef4444; }

.card-body { padding: 1.2rem; display: flex; flex-direction: column; flex: 1; }

.meta-info { font-size: 0.85rem; color: #94a3b8; display: flex; gap: 12px; margin-bottom: 12px; }

.tags-container { margin-top: auto; display: flex; gap: 6px; flex-wrap: wrap; }
.tag { font-size: 0.75rem; padding: 4px 10px; border-radius: 6px; font-weight: 600; display: flex; align-items: center; }
.tag.free { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.tag.permit { background: rgba(239, 68, 68, 0.2); color: #f87171; }
.tag.category { background: rgba(255,255,255,0.1); color: #cbd5e1; }

.spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #6c63ff; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 3rem; display: flex; flex-direction: column; align-items: center; }

@media (max-width: 768px) {
  .header-section { flex-direction: column; text-align: center; align-items: center; }
  .filters-row { flex-direction: column; }
  .select-wrapper { width: 100%; }
}
</style>