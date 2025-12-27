<template>
  <!-- Card Container -->
  <div 
    class="relative flex flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/85 backdrop-blur-xl text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-500 hover:shadow-xl cursor-pointer group"
    :class="isCompact ? 'flex-row h-32 items-stretch' : ''"
    @click="goToDetail"
  >
    
    <!-- Status Badge (Only for Full View) -->
    <div v-if="!isCompact" 
         class="absolute top-3 left-3 z-10 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider shadow-sm"
         :class="trip.status === 'open' ? 'bg-purple-600 text-white' : 'bg-red-500 text-white'">
      {{ trip.status === 'open' ? (t('trip.open') || 'OPEN') : (t('trip.full') || 'FULL') }}
    </div>

    <!-- Image Section -->
    <div class="relative bg-cover bg-center transition-all bg-gray-200"
         :class="isCompact ? 'w-[35%] min-w-[120px] max-w-[160px]' : 'h-48 w-full'"
         :style="{ backgroundImage: `url(${trip.image || 'https://via.placeholder.com/400'})` }">
      
      <!-- Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>

      <!-- Level Badge (Only Full) -->
      <div v-if="!isCompact" class="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
        <i class="fas fa-mountain text-[10px]"></i> {{ translateLevel(trip.difficulty) }}
      </div>

      <!-- Wishlist Btn (Only Full) -->
      <button v-if="!isCompact" class="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-pink-500 shadow-sm transition hover:scale-110 hover:bg-white">
        <i class="far fa-heart"></i>
      </button>
    </div>

    <!-- Content Section -->
    <div class="flex flex-1 flex-col justify-between p-4" :class="{ 'p-3': isCompact }">
      
      <!-- Header -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-orange-500">{{ translateCategory(trip.category) }}</span>
          <div v-if="!isCompact" class="flex items-center gap-1 text-xs font-medium text-yellow-500">
            <i class="fas fa-star"></i> {{ trip.rating || '5.0' }}
          </div>
        </div>

        <h3 class="font-medium text-slate-800 leading-snug group-hover:text-purple-600 transition-colors"
            :class="isCompact ? 'text-sm line-clamp-2' : 'text-lg line-clamp-2 mb-2'">
          {{ trip.title }}
        </h3>

        <!-- Info Row -->
        <div class="flex gap-4 text-xs text-slate-500" :class="{ 'flex-col gap-1 mt-0': isCompact, 'mt-1': !isCompact }">
           <div class="flex items-center gap-1.5">
              <i class="far fa-calendar-alt text-purple-500"></i>
              <span>{{ formattedDate }}</span>
           </div>
           <div class="flex items-center gap-1.5">
              <i class="far fa-clock text-purple-500"></i>
              <span>{{ trip.duration }}</span>
           </div>
        </div>
      </div>

      <!-- Footer / Progress -->
      <div class="mt-3 border-t border-slate-100 pt-3" :class="{ 'border-none mt-0 pt-0': isCompact }">
        
        <!-- Progress Bar (Only Full) -->
        <div v-if="!isCompact" class="mb-3">
           <div class="flex justify-between text-[10px] font-medium text-slate-500 mb-1">
             <span>{{ trip.currentSlots }}/{{ trip.maxSlots }} Slots</span>
             <span v-if="trip.maxSlots - trip.currentSlots <= 5" class="text-red-500 animate-pulse">
               🔥 {{ trip.maxSlots - trip.currentSlots }} left!
             </span>
           </div>
           <div class="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
             <div class="h-full bg-gradient-to-r from-purple-500 to-orange-400 rounded-full" 
                  :style="{ width: (trip.currentSlots / trip.maxSlots) * 100 + '%' }"></div>
           </div>
        </div>

        <!-- Meta Footer -->
        <div class="flex items-center justify-between" :class="{ 'justify-end': isCompact }">
           <div v-if="!isCompact" class="flex items-center gap-2">
             <img :src="trip.organizerImage || 'https://i.pravatar.cc/150'" class="h-6 w-6 rounded-full border border-slate-200 object-cover">
             <span class="text-xs text-slate-600 truncate max-w-[100px]">{{ trip.organizerName }}</span>
           </div>
           
           <div class="flex items-baseline gap-0.5 text-slate-800">
             <span class="text-[10px] text-slate-500">RM</span>
             <span class="text-lg font-bold leading-none">{{ trip.price }}</span>
           </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const props = defineProps<{ 
  trip: any;
  isCompact?: boolean;
}>();

const { t, locale } = useI18n(); 
const router = useRouter();

const formattedDate = computed(() => {
  if (!props.trip.startDate) return '';
  const date = new Date(props.trip.startDate);
  return date.toLocaleDateString(locale.value, { day: 'numeric', month: 'short' });
});

const translateCategory = (cat: string) => {
  if (!cat) return '';
  return t(`activities.${cat.toLowerCase()}`) || cat; 
};

const translateLevel = (level: string) => {
  if (!level) return '';
  return t(`levels.${level.toLowerCase()}`) || level;
};

const goToDetail = () => {
  router.push(`/trips/${props.trip.id}`);
};
</script>