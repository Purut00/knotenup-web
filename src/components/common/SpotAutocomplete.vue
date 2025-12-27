<template>
  <div class="relative w-full" ref="containerRef">
    <div class="relative">
      <input 
        type="text" 
        :value="modelValue"
        @input="handleInput"
        @focus="showDropdown = true"
        class="glass-input pr-10"
        :placeholder="t('createTrip.placeholderPlaceMy') || 'Cari nama lokasi...'" 
      />
      <!-- Loading Indicator -->
      <div v-if="loading" class="absolute right-3 top-1/2 -translate-y-1/2">
        <i class="fas fa-spinner fa-spin text-purple-400"></i>
      </div>
      <!-- Clear Button -->
      <button 
        v-else-if="modelValue" 
        @click="clearInput"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Dropdown Results -->
    <div v-if="showDropdown && results.length > 0" class="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
      <div 
        v-for="spot in results" 
        :key="spot.id" 
        @click="selectSpot(spot)"
        class="p-3 hover:bg-slate-700 cursor-pointer transition-colors border-b border-white/5 last:border-0"
      >
        <div class="font-bold text-white">{{ spot.name }}</div>
        <div class="text-xs text-slate-400 flex justify-between">
          <span>{{ spot.state }}</span>
          <span v-if="spot.height">{{ spot.height }}m</span>
        </div>
      </div>
    </div>
    
    <!-- No Results Hint -->
    <div v-if="showDropdown && modelValue && results.length === 0 && !loading" class="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-3 text-sm text-slate-400">
      <i class="fas fa-info-circle mr-2"></i> Tekan enter atau teruskan menaip untuk guna nama ini.
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useI18n } from 'vue-i18n';

// Simple debounce implementation if lodash not available
const debounceFn = (fn: Function, delay: number) => {
  let timeoutId: any;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const props = defineProps<{
  modelValue: string;
  initialState?: string;
}>();

const emit = defineEmits(['update:modelValue', 'select']);
const { t } = useI18n();

const containerRef = ref<HTMLElement | null>(null);
const loading = ref(false);
const showDropdown = ref(false);
const results = ref<any[]>([]);

// Handle outside click to close dropdown
const handleClickOutside = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    showDropdown.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));

const searchSpots = async (term: string) => {
  if (!term || term.length < 2) {
    results.value = [];
    return;
  }

  loading.value = true;
  try {
    const spotsRef = collection(db, 'spots');
    const termLower = term.toLowerCase();
    
    // Prefix search on name_lowercase
    // Note: This requires name_lowercase to be indexed in Firestore for '>=', '<=' queries
    // Fallback: Just query limit 10 then filter client side if index issue, 
    // but better to use range query: where('name_lowercase', '>=', term), where('name_lowercase', '<=', term + '\uf8ff')
    
    const q = query(
      spotsRef, 
      where('name_lowercase', '>=', termLower),
      where('name_lowercase', '<=', termLower + '\uf8ff'),
      limit(10)
    );
    
    const snap = await getDocs(q);
    results.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
  } catch (e) {
    console.error("Search error", e);
  } finally {
    loading.value = false;
  }
};

const debouncedSearch = debounceFn(searchSpots, 300);

const handleInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  emit('update:modelValue', val);
  showDropdown.value = true;
  debouncedSearch(val);
  
  // Also perform a "fresh" clear of selected spot ID in parent if user types
  if(val !== props.modelValue) {
      // Logic handled by parent regarding spotId clearing, 
      // but here we just ensure we emit the text update
  }
};

const selectSpot = (spot: any) => {
  emit('update:modelValue', spot.name);
  emit('select', spot);
  showDropdown.value = false;
};

const clearInput = () => {
  emit('update:modelValue', '');
  results.value = [];
};
</script>

<style scoped>
.glass-input {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(30, 41, 59, 0.5); /* lighter slate */
  color: white;
  outline: none;
  transition: all 0.3s;
}
.glass-input:focus {
  border-color: #a855f7; /* purple-500 */
  background: rgba(30, 41, 59, 0.8);
}
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
</style>
