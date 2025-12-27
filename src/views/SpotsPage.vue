<template>
  <div class="spots-page min-h-screen bg-slate-900 text-white relative overflow-x-hidden">
    
    <div class="contour-lines"></div>
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <div class="container mx-auto px-6 pt-24 pb-12 relative z-10 max-w-7xl">
      
      <div class="flex flex-col md:flex-row justify-between items-end gap-6 mb-10 animate-fade-in-up">
        <div class="text-center md:text-left">
          <h1 class="text-4xl font-extrabold text-white mb-3">{{ t('spots.title') || 'Lokasi Menarik' }}</h1>
          <p class="text-gray-400 text-lg max-w-xl">{{ t('spots.sub') || 'Temui gunung, bukit, air terjun dan lokasi rekreasi terbaik di Malaysia.' }}</p>
        </div>
        
        <div class="flex gap-4">


           <button 
             class="group relative inline-flex items-center justify-center px-6 py-3 font-bold text-white transition-all duration-200 bg-transparent border-none cursor-pointer focus:outline-none"
             @click="$router.push('/create-spot')"
           >
             <span class="absolute inset-0 w-full h-full -mt-1 rounded-full opacity-30 bg-gradient-to-r from-purple-600 to-blue-600 blur-lg group-hover:opacity-60 transition duration-200"></span>
             <span class="relative flex items-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-full px-6 py-3 shadow-xl hover:-translate-y-1 transition transform duration-200">
                <i class="fas fa-plus-circle text-xl mr-2"></i>
                <span class="uppercase tracking-wide text-sm">{{ t('spots.addBtn') || 'Tambah Spot' }}</span>
             </span>
           </button>
        </div>
      </div>

      <div class="mb-10 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md animate-fade-in-up" style="animation-delay: 0.1s;">
        <div class="flex flex-col gap-4">
          
          <div class="relative w-full">
               <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
               <input 
                 type="text" 
                 v-model="filters.searchQuery"
                 @keyup.enter="handleSearch"
                 @input="handleSearch"
                 class="w-full pl-12 pr-24 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:border-purple-500 focus:bg-black/30 outline-none transition"
                 :placeholder="t('spots.searchPlaceholder') || 'Cari nama bukit, gunung, sungai...'" 
               />
               <button 
                 @click="handleSearch"
                 class="absolute right-2 top-2 bottom-2 bg-purple-600 hover:bg-purple-500 text-white px-5 rounded-lg font-semibold transition"
               >
                 Cari
               </button>
          </div>

          <div class="flex flex-wrap gap-3 items-center">
             
             <div class="relative flex-1 min-w-[180px]">
                <i class="fas fa-map-marker-alt absolute left-3 top-1/2 -translate-y-1/2 text-red-400 pointer-events-none"></i>
                <select v-model="filters.state" class="custom-select pl-10" @change="handleSearch">
                  <option value="">{{ t('spots.allStates') || 'Semua Negeri' }}</option>
                  <option v-for="s in MALAYSIA_STATES" :key="s" :value="s">{{ s }}</option>
                </select>
             </div>

             <div class="relative flex-1 min-w-[180px]">
                <i class="fas fa-tree absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none"></i>
                <select v-model="filters.category" class="custom-select pl-10" @change="handleSearch">
                  <option value="">Semua Jenis</option>
                  <option v-for="cat in SPOT_CATEGORIES" :key="cat.value" :value="cat.value">
                    {{ cat.label }}
                  </option>
                </select>
             </div>

             <button 
                v-if="hasActiveFilters" 
                class="w-12 h-12 flex items-center justify-center rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500/30 transition shadow-lg shrink-0" 
                @click="resetFilters"
                title="Reset Filter"
             >
               <i class="fas fa-undo"></i>
             </button>
          </div>
        </div>
      </div>

      <div class="relative z-10">
        
        <div v-if="initialLoading && spots.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400">
          <div class="spinner w-10 h-10 border-4 border-white/10 border-t-purple-500 rounded-full animate-spin mb-4"></div>
          <p>{{ t('common.loading') }}...</p>
        </div>
        
        <div v-else-if="spots.length === 0" class="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/5 border-dashed text-gray-500">
          <i class="fas fa-mountain text-5xl mb-4 opacity-30"></i>
          <h3 class="text-xl font-bold text-gray-300">{{ t('spots.empty') || 'Tiada Lokasi Dijumpai' }}</h3>
          <p class="mt-2 text-sm">Masih belum ada lokasi tersenarai atau cuba filter lain.</p>
          <button @click="resetFilters" class="text-purple-400 hover:text-purple-300 underline mt-3 font-medium">Reset Filter</button>
        </div>

        <div v-else>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <SpotCard v-for="spot in spots" :key="spot.id" :spot="spot" />
            </div>

            <!-- Footer Message (All loaded since we fetch all) -->
            <div v-if="!initialLoading && spots.length > 0" class="text-center py-10 text-gray-500 text-xs uppercase tracking-widest opacity-50">
                -- {{ spots.length }} Lokasi Dijumpai --
            </div>
            
            <!-- Removed lazy load triggers -->
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { MALAYSIA_STATES } from '../constants/data';
import { SPOT_CATEGORIES } from '../constants/spotData';
import SpotCard from '../components/spot/SpotCard.vue';
import { useSpots } from '../composables/useSpots';


const { t } = useI18n();
const { spots, loading: initialLoading, fetchSpots } = useSpots();

const filters = reactive({ searchQuery: '', state: '', category: '' });
const hasActiveFilters = computed(() => !!filters.searchQuery || !!filters.state || !!filters.category);

const handleSearch = () => { fetchSpots(filters); };
const resetFilters = () => {
    filters.searchQuery = ''; filters.state = ''; filters.category = '';
    handleSearch();
};



onMounted(() => {
    fetchSpots(filters);
});

</script>

<style scoped>
.page-glow-purple {
  position: absolute; top: 0; right: 0; width: 60vw; height: 60vw;
  background: #6c63ff; filter: blur(150px); opacity: 0.15; pointer-events: none; border-radius: 50%; z-index: 0;
}
.page-glow-orange {
  position: absolute; bottom: 0; left: 0; width: 60vw; height: 60vw;
  background: #ff8c42; filter: blur(150px); opacity: 0.1; pointer-events: none; border-radius: 50%; z-index: 0;
}
.contour-lines {
  position: absolute; inset: 0; z-index: 0; opacity: 0.08; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400' stroke='white' fill='none' stroke-width='2' opacity='0.5'/%3E%3C/svg%3E");
  background-size: cover;
}

.custom-select {
  width: 100%; appearance: none; padding: 12px 36px 12px 38px;
  border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.2); color: #e2e8f0;
  outline: none; cursor: pointer; transition: 0.3s;
}
.custom-select:hover { background: rgba(0,0,0,0.3); }
.custom-select:focus { border-color: #6c63ff; }
</style>