<template>
  <div class="detail-page">
    
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>⏳ {{ t('common.loading') }}</p>
    </div>

    <div v-else-if="trip" class="trip-container">
      
      <div class="hero-gallery-wrapper">
        
        <div class="desktop-gallery">
          <div class="gallery-item main-item" 
               :style="{ backgroundImage: `url(${displayImages[0]})` }"
               @click="openLightbox(0)">
          </div>
          <div class="sub-gallery">
            <div class="gallery-item" 
                 v-for="(img, index) in displayImages.slice(1, 5)" 
                 :key="index"
                 :style="{ backgroundImage: `url(${img})` }"
                 @click="openLightbox(index + 1)">
            </div>
          </div>
          <button class="btn-show-all" @click="openLightbox(0)">
            🖼️ {{ t('trip.viewPhotos') }}
          </button>
          <div class="gallery-overlay">
            <span class="badge-cat">{{ trip.category }}</span>
            <h1>{{ trip.title }}</h1>
            <div class="hero-meta">
              <span>📍 {{ trip.location }}</span>
              <span v-if="trip.duration">⏱️ {{ trip.duration }}</span>
              <span>💪 {{ trip.difficulty }}</span>
            </div>
          </div>
        </div>

        <div class="mobile-gallery">
          <swiper
            :modules="[Pagination, Navigation]"
            :slides-per-view="1"
            :pagination="{ clickable: true }"
            class="detail-swiper"
          >
            <swiper-slide v-for="(img, index) in displayImages" :key="index">
              <div class="slide-bg" :style="{ backgroundImage: `url(${img})` }" @click="openLightbox(index)"></div>
            </swiper-slide>
          </swiper>
          <div class="mobile-overlay">
            <span class="badge-cat">{{ trip.category }}</span>
            <h1>{{ trip.title }}</h1>
            <div class="hero-meta-mobile"><span>📍 {{ trip.location }}</span></div>
          </div>
        </div>
      </div>

      <div class="content-wrapper">
        
        <div class="main-info">
          
          <div class="section-box">
            <h3>📖 {{ t('trip.about') }}</h3>
            <p class="desc-text">{{ trip.description }}</p>
          </div>

          <div class="section-box date-box">
            <h3>📅 {{ t('trip.schedule') }}</h3>
            <div class="date-row">
              <div class="date-item">
                <small>{{ t('createTrip.startDate') }}</small>
                <strong>{{ formatDate(trip.startDate) }}</strong>
              </div>
              <div class="arrow">➝</div>
              <div class="date-item">
                <small>{{ t('createTrip.endDate') }}</small>
                <strong>{{ formatDate(trip.endDate) }}</strong>
              </div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-card warning" v-if="trip.mandatory">
              <h4>⚠️ {{ t('createTrip.mandatory') }}</h4>
              <p>{{ trip.mandatory }}</p>
            </div>
            <div class="info-card tip" v-if="trip.tips">
              <h4>💡 {{ t('createTrip.tips') }}</h4>
              <p>{{ trip.tips }}</p>
            </div>
            <div class="info-card recommend" v-if="trip.recommended">
              <h4>🎒 {{ t('createTrip.recommended') }}</h4>
              <p>{{ trip.recommended }}</p>
            </div>
          </div>

          <div class="section-box" v-if="trip.includes && trip.includes.length">
            <h3>✅ {{ t('createTrip.includes') }}</h3>
            <ul class="includes-list">
              <li v-for="item in trip.includes" :key="item">
                <span class="check-icon">✔</span> {{ item }}
              </li>
            </ul>
          </div>

          <div class="organizer-card" @click="$router.push(`/user/${trip.organizerId}`)">
            <img :src="trip.organizerImage || 'https://i.pravatar.cc/150?img=3'" class="org-avatar" />
            <div class="org-info">
              <small>{{ t('trip.organizedBy') }}:</small>
              <h4>{{ trip.organizerName }}</h4>
            </div>
            <button class="btn-view-profile">{{ t('trip.viewProfile') }}</button>
          </div>

        </div>

        <div class="booking-sidebar">
          <div class="price-card">
            <div class="price-tag">
              <span class="currency">RM</span>
              <span class="amount">{{ trip.price }}</span>
              <span class="unit">{{ t('trip.perPax') }}</span>
            </div>
            
            <div class="slots-info">
              <div class="progress-bar">
                <div class="fill" :style="{ width: (trip.currentSlots / trip.maxSlots) * 100 + '%' }"></div>
              </div>
              <div class="slot-text">
                <span>{{ trip.currentSlots }} {{ t('trip.taken') }}</span>
                <span class="slot-left">{{ trip.maxSlots - trip.currentSlots }} {{ t('trip.empty') }}</span>
              </div>
            </div>

            <div class="action-buttons">
              <a v-if="trip.groupLink" :href="trip.groupLink" target="_blank" class="btn-join">
                🚀 {{ t('trip.joinChat') }}
              </a>
              <button v-else class="btn-join disabled" disabled>{{ t('trip.noLink') }}</button>
            </div>

            <p class="note">* {{ t('trip.paymentNote') }}</p>
          </div>
        </div>

      </div>
    </div>

    <div v-else class="error-container">
      <h2>{{ t('trip.notFound') }} 😔</h2>
      <button @click="$router.push('/trips')" class="btn-back">{{ t('trip.backList') }}</button>
    </div>

    <VueEasyLightbox
      :visible="visibleRef"
      :imgs="displayImages"
      :index="indexRef"
      @hide="onHide"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

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

const { t } = useI18n();
const route = useRoute();
const trip = ref<any>(null);
const loading = ref(true);

// Lightbox State
const visibleRef = ref(false);
const indexRef = ref(0);

// Helper Date
const formatDate = (dateString: string) => {
  if(!dateString) return '-';
  // Menggunakan 'default' supaya ikut bahasa browser/sistem user, atau boleh hardcode 'en-MY' jika mahu English sentiasa
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' };
  return new Date(dateString).toLocaleDateString('default', options);
};

// Logic Gambar
const displayImages = computed(() => {
  if (trip.value?.images && trip.value.images.length > 0) {
    let imgs = [...trip.value.images];
    while (imgs.length < 5) {
      imgs.push('https://via.placeholder.com/500x500?text=KnotenUp'); 
    }
    return imgs;
  }
  return new Array(5).fill(trip.value?.image || 'https://via.placeholder.com/1200x500');
});

const openLightbox = (index: number) => {
  indexRef.value = index;
  visibleRef.value = true;
};

const onHide = () => {
  visibleRef.value = false;
};

onMounted(async () => {
  const tripId = route.params.id as string;
  try {
    const docRef = doc(db, "trips", tripId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      trip.value = docSnap.data();
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* CSS SAMA MACAM SEBELUM NI (BENTO GRID) */
.detail-page { background-color: #f8f9fa; min-height: 100vh; padding-bottom: 4rem; }
.loading-container, .error-container { text-align: center; padding: 5rem; font-size: 1.2rem; color: #666; display: flex; flex-direction: column; align-items: center; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 10px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* HERO GALLERY WRAPPER */
.hero-gallery-wrapper { position: relative; margin-bottom: 2rem; max-width: 1200px; margin: 0 auto 2rem auto; padding: 1rem 1rem 0 1rem; }

/* DESKTOP GRID */
.desktop-gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; height: 400px; border-radius: 16px; overflow: hidden; position: relative; background: #000; }
.main-item { width: 100%; height: 100%; background-size: cover; background-position: center; cursor: pointer; transition: filter 0.2s; }
.main-item:hover { filter: brightness(0.9); }
.sub-gallery { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 8px; }
.gallery-item { background-size: cover; background-position: center; cursor: pointer; transition: filter 0.2s; position: relative; }
.gallery-item:hover { filter: brightness(0.9); }
.btn-show-all { position: absolute; bottom: 20px; right: 20px; background: white; border: 1px solid #333; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 0.9rem; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 5; transition: transform 0.2s; }
.btn-show-all:hover { transform: scale(1.05); }
.gallery-overlay { position: absolute; bottom: 0; left: 0; width: 50%; padding: 2rem; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); color: white; pointer-events: none; }

/* MOBILE STYLE */
.mobile-gallery { display: none; } 

/* CONTENT */
.content-wrapper { max-width: 1200px; margin: 0 auto; padding: 0 1rem; display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; position: relative; z-index: 20; margin-top: 2rem;}
.section-box { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-bottom: 2rem; }
.section-box h3 { margin-top: 0; color: #2c3e50; font-size: 1.3rem; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; margin-bottom: 1rem; }
.desc-text { line-height: 1.8; color: #444; white-space: pre-wrap; font-size: 1rem; }

.date-row { display: flex; align-items: center; justify-content: space-around; background: #f9f9f9; padding: 1rem; border-radius: 8px; border: 1px dashed #ccc; }
.date-item { text-align: center; }
.date-item small { display: block; color: #7f8c8d; font-size: 0.8rem; text-transform: uppercase; }
.date-item strong { display: block; color: #2c3e50; font-size: 1.2rem; margin-top: 5px; }
.arrow { font-size: 1.5rem; color: #bdc3c7; }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
.info-card { padding: 1.5rem; border-radius: 10px; border-left: 5px solid #ccc; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
.info-card h4 { margin: 0 0 10px 0; font-size: 1rem; }
.info-card p { margin: 0; font-size: 0.9rem; color: #555; white-space: pre-wrap; }
.info-card.warning { border-color: #e74c3c; background: #fff5f5; }
.info-card.warning h4 { color: #c0392b; }
.info-card.tip { border-color: #f1c40f; background: #fef9e7; }
.info-card.tip h4 { color: #d35400; }
.info-card.recommend { border-color: #3498db; background: #f0f8ff; grid-column: 1 / -1; }
.info-card.recommend h4 { color: #2980b9; }

.includes-list { list-style: none; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.includes-list li { display: flex; align-items: center; gap: 10px; color: #555; font-size: 0.95rem; }
.check-icon { color: #27ae60; font-weight: bold; }

.organizer-card { background: white; padding: 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 1rem; border: 1px solid #eee; cursor: pointer; transition: transform 0.2s; }
.organizer-card:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
.org-avatar { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #eee; }
.org-info { flex-grow: 1; }
.org-info small { color: #888; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }
.org-info h4 { margin: 0; color: #2c3e50; font-size: 1.1rem; }
.btn-view-profile { background: none; border: 1px solid #3498db; color: #3498db; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.8rem; cursor: pointer; font-weight: bold; }
.btn-view-profile:hover { background: #3498db; color: white; }

/* SIDEBAR */
.booking-sidebar { position: sticky; top: 100px; }
.price-card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); text-align: center; border-top: 6px solid #27ae60; }
.price-tag { margin-bottom: 1.5rem; }
.currency { font-size: 1.2rem; color: #888; vertical-align: top; position: relative; top: 5px; }
.amount { font-size: 3rem; font-weight: 800; color: #2c3e50; }
.unit { color: #999; font-size: 1rem; }

.slots-info { margin-bottom: 2rem; text-align: left; }
.progress-bar { height: 10px; background: #f0f0f0; border-radius: 5px; overflow: hidden; margin-bottom: 8px; }
.fill { height: 100%; background: #27ae60; border-radius: 5px; transition: width 0.5s; }
.slot-text { display: flex; justify-content: space-between; font-size: 0.85rem; color: #666; font-weight: 600; }
.slot-left { color: #e67e22; }

.btn-join { display: flex; align-items: center; justify-content: center; width: 100%; padding: 1.2rem; background-color: #25D366; color: white; text-decoration: none; font-weight: bold; border-radius: 8px; margin-bottom: 10px; transition: transform 0.2s; border: none; cursor: pointer; font-size: 1rem; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3); }
.btn-join:hover { transform: translateY(-2px); background-color: #1ebc57; }
.btn-join.disabled { background-color: #bdc3c7; cursor: not-allowed; box-shadow: none; transform: none; }

.note { font-size: 0.8rem; color: #95a5a6; line-height: 1.4; margin-top: 1rem; font-style: italic; }
.btn-back { padding: 10px 20px; background: #34495e; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px; }

/* OVERLAY & MOBILE */
.badge-cat { background: #e67e22; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; color: white; display: inline-block; margin-bottom: 5px; }
h1 { margin: 5px 0 10px 0; font-size: 2.2rem; font-weight: 800; text-shadow: 0 2px 5px rgba(0,0,0,0.5); color: white;}
.hero-meta { display: flex; gap: 15px; font-size: 1rem; opacity: 0.9; color: white; }

@media (max-width: 768px) {
  .hero-gallery-wrapper { padding: 0; margin-bottom: 1rem; }
  .desktop-gallery { display: none; } 
  .mobile-gallery { display: block; position: relative; height: 300px; } 
  .detail-swiper { height: 100%; }
  .slide-bg { height: 100%; background-size: cover; background-position: center; }
  .mobile-overlay { position: absolute; bottom: 0; left: 0; width: 100%; padding: 1.5rem; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); color: white; z-index: 10; }
  .hero-meta-mobile { font-size: 0.9rem; opacity: 0.9; }
  .content-wrapper { grid-template-columns: 1fr; margin-top: 0; }
  .booking-sidebar { position: static; margin-top: 2rem; }
  .info-grid { grid-template-columns: 1fr; }
}
</style>