<template>
  <div class="hero-gallery-wrapper mb-8 fade-up">
    <!-- Desktop Gallery -->
    <div class="desktop-gallery hidden md:grid">
      <div 
        class="gallery-item main-item" 
        :style="{ backgroundImage: `url(${images[0]})` }"
        @click="openLightbox(0)"
      >
        <div class="gallery-overlay">
          <span class="badge-cat">📍 {{ spot.state }}</span>
          <h1 class="text-4xl font-bold text-white mb-2 drop-shadow-md">{{ spot.name }}</h1>
          <div class="hero-meta flex gap-4 text-white/90">
            <span>🏔️ {{ spot.height }}m</span>
            <span v-if="spot.difficulty">💪 {{ getLevelLabel(spot.difficulty) }}</span>
          </div>
        </div>
      </div>
      <div class="sub-gallery grid grid-cols-2 grid-rows-2 gap-2">
        <div 
          class="gallery-item h-full" 
          v-for="(img, index) in images.slice(1, 5)" 
          :key="index"
          :style="{ backgroundImage: `url(${img})` }"
          @click="openLightbox(index + 1)"
        >
        </div>
      </div>
      <button 
        class="btn-show-all absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 backdrop-blur text-white px-4 py-2 rounded-lg border border-white/10 transition" 
        @click="openLightbox(0)"
      >
        🖼️ {{ t('spotDetail.viewPhotos') || 'Lihat Gambar' }}
      </button>
    </div>

    <!-- Mobile Gallery -->
    <div class="mobile-gallery md:hidden rounded-2xl overflow-hidden relative h-[350px]">
      <swiper
        :modules="[Pagination, Navigation]"
        :slides-per-view="1"
        :pagination="{ clickable: true }"
        class="detail-swiper h-full"
      >
        <swiper-slide v-for="(img, index) in images" :key="index">
          <div 
            class="slide-bg h-full bg-cover bg-center" 
            :style="{ backgroundImage: `url(${img})` }" 
            @click="openLightbox(index)"
          ></div>
        </swiper-slide>
      </swiper>
      <div class="mobile-overlay absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-10">
        <span class="badge-cat bg-orange-500 text-white text-xs px-2 py-1 rounded mb-2 inline-block">📍 {{ spot.state }}</span>
        <h1 class="text-2xl font-bold text-white mb-1">{{ spot.name }}</h1>
        <div class="hero-meta-mobile text-white/80 text-sm">
           <span>🏔️ {{ spot.height }}m</span>
        </div>
      </div>
    </div>

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

<style scoped>
.hero-gallery-wrapper { position: relative; }
.desktop-gallery { display: grid; grid-template-columns: 2fr 1fr; gap: 8px; height: 450px; border-radius: 24px; overflow: hidden; }
.gallery-item { background-size: cover; background-position: center; cursor: pointer; position: relative; transition: filter 0.3s; }
.gallery-item:hover { filter: brightness(1.1); }
.main-item { position: relative; }
.gallery-overlay {
    position: absolute; bottom: 0; left: 0; width: 100%; padding: 2rem;
    background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
    pointer-events: none;
}
.badge-cat {
    background: #e67e22; padding: 4px 10px; border-radius: 6px; 
    font-size: 0.75rem; font-weight: bold; text-transform: uppercase; 
    color: white; display: inline-block; margin-bottom: 8px;
    box-shadow: 0 4px 10px rgba(230, 126, 34, 0.4);
}
:deep(.swiper-pagination-bullet) { background: white; opacity: 0.5; }
:deep(.swiper-pagination-bullet-active) { opacity: 1; background: #6c63ff; }
</style>
