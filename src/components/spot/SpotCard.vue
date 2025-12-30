<template>
  <div 
    class="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:border-purple-500/30 transition duration-300 cursor-pointer flex flex-col h-full"
    @click="$router.push('/spots/' + spot.id)"
  >
    <div class="h-56 bg-cover bg-center relative" :style="{ backgroundImage: `url(${spot.image || 'https://via.placeholder.com/300'})` }">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent"></div>
        
        <span 
            class="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md backdrop-blur-md"
            :class="difficultyColor"
        >
            {{ difficultyLabel }}
        </span>
    </div>

    <div class="p-5 flex flex-col flex-1">
        <h3 class="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors line-clamp-1">
            {{ spot.name }}
        </h3>
        
        <div class="flex items-center gap-4 text-sm text-gray-400 mb-4">
            <span class="flex items-center gap-1.5"><i class="fas fa-map-pin text-red-400"></i> {{ spot.state }}</span>
            <span v-if="spot.height" class="flex items-center gap-1.5"><i class="fas fa-ruler-vertical text-blue-400"></i> {{ spot.height }}m</span>
        </div>
        
        <div class="mt-auto flex flex-wrap gap-2">
            <span 
                class="px-2.5 py-1 rounded-md text-xs font-semibold flex items-center"
                :class="permitStyle.class"
            >
                <i class="mr-1.5" :class="permitStyle.icon"></i> 
                {{ permitStyle.label }}
            </span>

            <span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/10 text-gray-300 flex items-center">
                <i class="fas fa-tree mr-1.5"></i> {{ categoryLabel }}
            </span>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { DIFFICULTY_LEVELS, SPOT_CATEGORIES } from '../../constants/spotData';

const { t } = useI18n();

const props = defineProps({
  spot: {
    type: Object,
    required: true
  }
});

// --- Computed Logic ---

// 1. Difficulty Label
const difficultyLabel = computed(() => {
    const level = props.spot.difficulty || 'Easy';
    const key = `components.${level.toLowerCase()}`;
    if (t(key) !== key) return t(key);
    const found = DIFFICULTY_LEVELS.find(l => l.value.toLowerCase() === level.toLowerCase());
    return found ? found.label : level;
});

const difficultyColor = computed(() => {
    const level = props.spot.difficulty || 'Easy';
    const found = DIFFICULTY_LEVELS.find(l => l.value.toLowerCase() === level.toLowerCase());
    return found ? found.color : 'bg-emerald-500';
});

// 2. Category Label
const categoryLabel = computed(() => {
    const cat = props.spot.category;
    if (!cat) return 'Nature';
    const key = `spots.categories.${cat.toLowerCase()}`;
    if (t(key) !== key) return t(key);
    const found = SPOT_CATEGORIES.find(c => c.value === cat);
    return found ? found.label : cat;
});

// 3. Permit Logic (3 Statuses: Required, Not Required, Unknown)
const permitStyle = computed(() => {
    const p = props.spot.permit;

    // A. Case: Perlu (Merah)
    if (p && (p === 'Yes' || p.includes('Perlu'))) {
        return {
            class: 'bg-red-500/20 text-red-400',
            icon: 'fas fa-file-signature',
            label: t('spots.permit') || 'Perlu Permit'
        };
    }
    
    // B. Case: Tidak Perlu (Hijau)
    // Semak jika 'No', 'Tidak', atau 'Tidak Perlu'
    else if (p && (p === 'No' || p.toLowerCase().includes('tidak'))) {
        return {
            class: 'bg-emerald-500/20 text-emerald-400',
            icon: 'fas fa-check-circle',
            label: t('spots.noPermit') || 'Bebas Permit'
        };
    }
    
    // C. Case: Unknown / Tak Tahu (Kelabu)
    else {
        return {
            class: 'bg-gray-500/20 text-gray-400',
            icon: 'fas fa-question-circle',
            label: t('spots.unknownPermit') || 'Info Permit T/A'
        };
    }
});
</script>