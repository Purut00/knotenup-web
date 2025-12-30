<template>
  <div class="relative mb-8 animate-fade-in-up">
    <!-- Desktop Gallery -->
    <div class="grid grid-cols-[2fr_1fr] gap-2 h-[450px] rounded-[24px] overflow-hidden">
      <div 
        class="bg-cover bg-center cursor-pointer relative transition duration-300 hover:brightness-110" 
        :style="{ backgroundImage: `url(${images[0]})` }"
        @click="openLightbox(0)"
      >
        <div class="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
          <span class="bg-[#e67e22] px-[10px] py-1 rounded-md text-xs font-bold uppercase text-white mb-2 inline-block shadow-[0_4px_10px_rgba(230,126,34,0.4)]">📍 {{ spot.state }}</span>
          <h1 class="text-4xl font-bold text-white mb-2 drop-shadow-md">{{ spot.name }}</h1>
          <div class="flex gap-4 text-white/90">
            <span>🏔️ {{ spot.height }}m</span>
            <span v-if="spot.difficulty">💪 {{ getLevelLabel(spot.difficulty) }}</span>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 grid-rows-2 gap-2">
        <div 
          class="bg-cover bg-center cursor-pointer relative transition duration-300 hover:brightness-110 h-full" 
          v-for="(img, index) in images.slice(1, 5)" 
          :key="index"
          :style="{ backgroundImage: `url(${img})` }"
          @click="openLightbox(index + 1)"
        >
        </div>
      </div>
      <button 
        class="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 backdrop-blur text-white px-4 py-2 rounded-lg border border-white/10 transition" 
        @click="openLightbox(0)"
      >
        🖼️ {{ t('spotDetail.viewPhotos') || 'Lihat Gambar' }}
      </button>
    </div>

    <!-- Mobile Gallery removed to unify view -->

    <VueEasyLightbox 
      :visible="visibleRef" 
      :imgs="images" 
      :index="indexRef" 
      @hide="onHide" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
// @ts-ignore
import VueEasyLightbox from 'vue-easy-lightbox';
// @ts-ignore
import { Swiper, SwiperSlide } from 'swiper/vue';
// @ts-ignore
import { Pagination, Navigation } from 'swiper/modules';
// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/pagination';
// @ts-ignore
import 'swiper/css/navigation';

defineProps<{
  spot: any;
  images: string[];
}>();

const { t } = useI18n();
const visibleRef = ref(false);
const indexRef = ref(0);

const openLightbox = (index: number) => { 
  indexRef.value = index; 
  visibleRef.value = true; 
};

const onHide = () => { 
  visibleRef.value = false; 
};

// Helper for labels
const getLevelLabel = (level: string) => { 
  if (!level) return ''; 
  const key = level.toLowerCase(); 
  return t(`components.${key}`) !== `components.${key}` ? t(`components.${key}`) : level; 
};
</script>
