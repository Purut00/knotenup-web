<template>
  <div class="trip-detail-page">
    
    <div class="contour-lines"></div>
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <div class="content-container" style="padding-top: 120px; padding-bottom: 4rem;">

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Sedang memuatkan...</p>
      </div>

      <div v-else-if="trip" class="fade-up">
        
        <div class="hero-gallery-wrapper mb-8">
          
          <div class="desktop-gallery">
            <div class="gallery-item main-item" 
                 :style="{ backgroundImage: `url(${displayImages[0]})` }"
                 @click="openLightbox(0)">
                 <div class="overlay-gradient-heavy"></div>
            </div>
            <div class="sub-gallery">
              <div class="gallery-item" 
                   v-for="(img, index) in displayImages.slice(1, 5)" 
                   :key="index" 
                   :style="{ backgroundImage: `url(${img})` }"
                   @click="openLightbox(index + 1)">
                   <div class="overlay-hover"></div>
              </div>
            </div>
            
            <button class="btn-show-all" @click="openLightbox(0)">
              <i class="fas fa-images mr-2"></i> {{ t('trip.viewPhotos') || 'Lihat Gambar' }}
            </button>
            
            <div class="gallery-title-overlay">
              <span class="badge-cat">{{ trip.category }}</span>
              <h1>{{ trip.title }}</h1>
              <div class="hero-meta">
                <span><i class="fas fa-map-marker-alt text-red-400"></i> {{ trip.location }}</span>
                <span v-if="trip.duration"><i class="fas fa-clock text-blue-400 ml-3"></i> {{ trip.duration }}</span>
                <span class="ml-3"><i class="fas fa-tachometer-alt text-yellow-400"></i> {{ trip.difficulty }}</span>
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
                <div class="slide-bg" :style="{ backgroundImage: `url(${img})` }" @click="openLightbox(index)">
                   <div class="overlay-gradient-mobile"></div>
                </div>
              </swiper-slide>
            </swiper>
            <div class="mobile-title-overlay">
              <span class="badge-cat">{{ trip.category }}</span>
              <h1>{{ trip.title }}</h1>
              <div class="hero-meta-mobile"><span>📍 {{ trip.location }}</span></div>
            </div>
          </div>
        </div>

        <div class="main-layout">
          
          <div class="left-content">
            
            <div class="glass-panel mb-6">
              <h3><i class="fas fa-book-open text-purple-400 mr-2"></i> {{ t('trip.about') || 'Tentang Trip' }}</h3>
              <p class="desc-text">{{ trip.description }}</p>
            </div>

            <div class="glass-panel mb-6">
              <h3><i class="far fa-calendar-alt text-orange-400 mr-2"></i> {{ t('trip.schedule') || 'Jadual' }}</h3>
              <div class="date-row">
                <div class="date-item">
                  <small>{{ t('createTrip.startDate') }}</small>
                  <strong>{{ formatDate(trip.startDate) }}</strong>
                </div>
                <div class="arrow"><i class="fas fa-arrow-right"></i></div>
                <div class="date-item">
                  <small>{{ t('createTrip.endDate') }}</small>
                  <strong>{{ formatDate(trip.endDate) }}</strong>
                </div>
              </div>
            </div>

            <div class="info-grid mb-6">
              <div class="info-card warning" v-if="trip.mandatory">
                <h4><i class="fas fa-exclamation-triangle mr-1"></i> {{ t('createTrip.mandatory') }}</h4>
                <p>{{ trip.mandatory }}</p>
              </div>
              <div class="info-card tip" v-if="trip.tips">
                <h4><i class="fas fa-lightbulb mr-1"></i> {{ t('createTrip.tips') }}</h4>
                <p>{{ trip.tips }}</p>
              </div>
              <div class="info-card recommend" v-if="trip.recommended">
                <h4><i class="fas fa-hiking mr-1"></i> {{ t('createTrip.recommended') }}</h4>
                <p>{{ trip.recommended }}</p>
              </div>
            </div>

            <div class="glass-panel mb-6" v-if="trip.includes && trip.includes.length">
              <h3><i class="fas fa-check-circle text-green-400 mr-2"></i> {{ t('createTrip.includes') }}</h3>
              <ul class="includes-list">
                <li v-for="item in trip.includes" :key="item">
                  <i class="fas fa-check text-green-400 mr-2"></i> {{ item }}
                </li>
              </ul>
            </div>

            <div class="glass-panel organizer-card" @click="$router.push(`/user/${trip.organizerId}`)">
              <div class="flex items-center gap-4">
                <img :src="trip.organizerImage || 'https://i.pravatar.cc/150?img=3'" class="org-avatar" />
                <div class="org-info">
                  <small class="text-gray-400 text-xs uppercase tracking-wider">{{ t('trip.organizedBy') }}</small>
                  <h4>{{ trip.organizerName }}</h4>
                </div>
              </div>
              <button class="btn-view-profile">{{ t('trip.viewProfile') }}</button>
            </div>

          </div>

          <div class="right-sidebar">
            
            <div v-if="isOwner" class="glass-panel mb-4 border border-red-500/30 bg-red-900/10">
               <h3 class="text-red-400 text-sm mb-3 font-bold uppercase tracking-widest border-b border-red-500/20 pb-2">
                 <i class="fas fa-user-shield mr-2"></i> Zon Penganjur
               </h3>
               <button @click="archiveTrip" :disabled="isProcessing" class="w-full btn-delete-soft">
                 <i class="fas fa-trash-alt mr-2"></i>
                 {{ isProcessing ? 'Memproses...' : 'Padam Trip (Arkib)' }}
               </button>
               <p class="text-xs text-red-300 mt-2 italic text-center">
                 * Data tidak dipadam kekal, hanya diarkibkan demi keselamatan.
               </p>
            </div>

            <div class="glass-panel price-card">
              <div class="price-tag">
                <span class="currency">RM</span>
                <span class="amount">{{ trip.price }}</span>
                <span class="unit">/ {{ t('trip.perPax') }}</span>
              </div>
              
              <div class="slots-info mt-6">
                <div class="progress-bar">
                  <div class="fill" :style="{ width: (trip.currentSlots / trip.maxSlots) * 100 + '%' }"></div>
                </div>
                <div class="slot-text mt-2">
                  <span>{{ trip.currentSlots }} {{ t('trip.taken') }}</span>
                  <span class="slot-left text-orange-400">{{ trip.maxSlots - trip.currentSlots }} {{ t('trip.empty') }}</span>
                </div>
              </div>

              <div class="action-buttons mt-6">
                <a v-if="trip.groupLink" :href="trip.groupLink" target="_blank" class="btn-join">
                  <i class="fab fa-whatsapp text-xl mr-2"></i> {{ t('trip.joinChat') }}
                </a>
                <button v-else class="btn-join disabled" disabled>{{ t('trip.noLink') }}</button>
              </div>

              <p class="note mt-4">* {{ t('trip.paymentNote') }}</p>
            </div>
          </div>

        </div>
      </div>

      <div v-else class="error-container glass-panel">
        <h2 class="text-white">{{ t('trip.notFound') }} 😔</h2>
        <button @click="$router.push('/trips')" class="btn-back">{{ t('trip.backList') }}</button>
      </div>

      <VueEasyLightbox
        :visible="visibleRef"
        :imgs="displayImages"
        :index="indexRef"
        @hide="onHide"
      />

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { db, auth } from '../firebaseConfig'; // Import Auth
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Guna updateDoc, bukan deleteDoc

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
const router = useRouter();
const trip = ref<any>(null);
const loading = ref(true);
const isProcessing = ref(false);

// Lightbox State
const visibleRef = ref(false);
const indexRef = ref(0);

// Helper Date
const formatDate = (dateString: string) => {
  if(!dateString) return '-';
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

// [SECURITY] Check Owner
const isOwner = computed(() => {
  return auth.currentUser && trip.value && auth.currentUser.uid === trip.value.organizerId;
});

// [SECURITY] Soft Delete Function
const archiveTrip = async () => {
  if (!confirm("Adakah anda pasti? Trip akan diarkibkan dan tidak lagi kelihatan kepada umum.")) return;
  
  isProcessing.value = true;
  try {
    const tripRef = doc(db, "trips", trip.value.id);
    
    // SOFT DELETE: Tukar status kepada 'archived'.
    // Rules Firestore akan halang 'deleteDoc', tapi benarkan update status ke 'archived'
    await updateDoc(tripRef, {
      status: 'archived',
      isVisible: false,
      archivedAt: new Date()
    });

    alert("Trip berjaya dipadam (diarkibkan).");
    router.push('/trips');
  } catch (error) {
    console.error("Error archiving trip:", error);
    alert("Gagal memadam trip. Sila cuba lagi.");
  } finally {
    isProcessing.value = false;
  }
};

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
      const data = docSnap.data();
      // Pilihan: Redirect jika user biasa cuba akses trip archived
      if (data.status === 'archived' && (!auth.currentUser || auth.currentUser.uid !== data.organizerId)) {
         trip.value = null; // Tunjuk 'Trip Not Found'
      } else {
         trip.value = { id: docSnap.id, ...data };
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* --- BASE THEME (DARK GLASS) --- */
.trip-detail-page { 
  background-color: #0f172a; /* Dark Blue Base */
  min-height: 100vh; position: relative; overflow-x: hidden; color: white;
}
.content-container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; position: relative; z-index: 2; }

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

/* --- HERO GALLERY --- */
.hero-gallery-wrapper { position: relative; margin-bottom: 2rem; }

.desktop-gallery { 
  display: grid; grid-template-columns: 2fr 1fr; gap: 10px; 
  height: 450px; border-radius: 20px; overflow: hidden; position: relative; 
  border: 1px solid rgba(255,255,255,0.1);
}
.main-item { width: 100%; height: 100%; background-size: cover; background-position: center; cursor: pointer; transition: filter 0.2s; position: relative; }
.main-item:hover { filter: brightness(0.9); }
.sub-gallery { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 10px; }
.gallery-item { background-size: cover; background-position: center; cursor: pointer; transition: filter 0.2s; position: relative; }
.gallery-item:hover { filter: brightness(0.9); }

/* Overlays */
.overlay-gradient-heavy { position: absolute; inset: 0; background: linear-gradient(to top, rgba(15, 23, 42, 0.95), transparent 60%); }
.gallery-title-overlay { 
  position: absolute; bottom: 30px; left: 30px; z-index: 5; max-width: 70%; 
}
.gallery-title-overlay h1 { font-size: 3rem; font-weight: 800; line-height: 1.1; margin: 10px 0; text-shadow: 0 4px 10px rgba(0,0,0,0.5); }
.badge-cat { 
  background: #e67e22; color: white; padding: 5px 12px; 
  border-radius: 30px; font-weight: bold; font-size: 0.8rem; text-transform: uppercase; 
  letter-spacing: 1px;
}
.hero-meta { font-size: 1.1rem; color: #cbd5e1; }

.btn-show-all { 
  position: absolute; bottom: 20px; right: 20px; 
  background: rgba(255, 255, 255, 0.9); color: #0f172a; 
  padding: 10px 20px; border-radius: 50px; font-weight: bold; 
  cursor: pointer; transition: transform 0.2s; z-index: 5; 
}
.btn-show-all:hover { transform: scale(1.05); background: white; }

/* Mobile Gallery */
.mobile-gallery { display: none; }

/* --- MAIN LAYOUT --- */
.main-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }

/* --- GLASS PANELS (Dark) --- */
.glass-panel {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px; padding: 2rem;
  backdrop-filter: blur(10px);
  color: white;
}

.glass-panel h3 { margin-top: 0; color: white; font-size: 1.3rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 1.5rem; font-weight: 700; display: flex; align-items: center; }
.desc-text { line-height: 1.8; color: #cbd5e1; white-space: pre-wrap; font-size: 1rem; }

/* Date Box */
.date-row { display: flex; align-items: center; justify-content: space-around; background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; border: 1px dashed rgba(255,255,255,0.2); }
.date-item { text-align: center; }
.date-item small { display: block; color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; }
.date-item strong { display: block; color: white; font-size: 1.2rem; margin-top: 5px; }
.arrow { font-size: 1.5rem; color: #6c63ff; }

/* Info Cards */
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
.info-card { padding: 1.5rem; border-radius: 12px; border-left: 4px solid #ccc; background: rgba(255,255,255,0.05); }
.info-card h4 { margin: 0 0 10px 0; font-size: 1rem; color: white; }
.info-card p { margin: 0; font-size: 0.9rem; color: #cbd5e1; white-space: pre-wrap; }

.info-card.warning { border-color: #ef4444; background: rgba(239, 68, 68, 0.1); }
.info-card.warning h4 { color: #fca5a5; }
.info-card.tip { border-color: #fbbf24; background: rgba(251, 191, 36, 0.1); }
.info-card.tip h4 { color: #fcd34d; }
.info-card.recommend { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); grid-column: 1 / -1; }
.info-card.recommend h4 { color: #93c5fd; }

/* Includes List */
.includes-list { list-style: none; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.includes-list li { display: flex; align-items: center; gap: 10px; color: #cbd5e1; font-size: 0.95rem; }

/* Organizer Card */
.organizer-card { display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: 0.2s; }
.organizer-card:hover { background: rgba(255,255,255,0.08); }
.org-avatar { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.2); }
.org-info { flex-grow: 1; }
.org-info small { color: #94a3b8; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; }
.org-info h4 { margin: 0; color: white; font-size: 1.1rem; }
.btn-view-profile { background: transparent; border: 1px solid rgba(255,255,255,0.3); color: white; padding: 6px 16px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; font-weight: bold; transition: 0.2s; }
.btn-view-profile:hover { background: white; color: #0f172a; }

/* --- RIGHT SIDEBAR --- */
.right-sidebar { position: sticky; top: 120px; height: fit-content; }
.price-card { text-align: center; border-top: 4px solid #e67e22; }
.price-tag { margin-bottom: 1.5rem; }
.currency { font-size: 1.2rem; color: #94a3b8; vertical-align: top; position: relative; top: 5px; }
.amount { font-size: 3rem; font-weight: 800; color: #fbbf24; } /* Gold */
.unit { color: #94a3b8; font-size: 1rem; }

.slots-info { text-align: left; }
.progress-bar { height: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; overflow: hidden; margin-bottom: 8px; }
.fill { height: 100%; background: #27ae60; border-radius: 5px; transition: width 0.5s; }
.slot-text { display: flex; justify-content: space-between; font-size: 0.85rem; color: #cbd5e1; font-weight: 600; }
.slot-left { color: #fbbf24; }

.btn-join { 
  display: flex; align-items: center; justify-content: center; width: 100%; padding: 1rem; 
  background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; font-weight: bold; 
  border-radius: 12px; margin-bottom: 10px; transition: transform 0.2s; border: none; cursor: pointer; font-size: 1rem; 
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); 
}
.btn-join:hover { transform: translateY(-2px); }
.btn-join.disabled { background: rgba(255,255,255,0.1); color: #666; cursor: not-allowed; box-shadow: none; transform: none; background-image: none; }

/* DELETE SOFT BUTTON */
.btn-delete-soft {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  font-weight: 600;
  font-size: 0.9rem;
  transition: 0.3s;
}
.btn-delete-soft:hover {
  background: rgba(239, 68, 68, 0.3);
  color: white;
}
.btn-delete-soft:disabled {
  opacity: 0.5; cursor: not-allowed;
}

.note { font-size: 0.8rem; color: #64748b; line-height: 1.4; margin-top: 1rem; font-style: italic; }

/* Loading/Error */
.loading-container, .error-container { text-align: center; padding: 5rem; font-size: 1.2rem; color: #94a3b8; }
.spinner { border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid #6c63ff; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px; }
@keyframes spin { to { transform: rotate(360deg); } }
.btn-back { margin-top: 20px; padding: 10px 20px; background: #6c63ff; color: white; border: none; border-radius: 50px; cursor: pointer; }

.fade-up { animation: fadeUp 0.6s ease-out; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 768px) {
  .hero-gallery-wrapper { margin-bottom: 1rem; }
  .desktop-gallery { display: none; }
  .mobile-gallery { display: block; height: 350px; position: relative; border-radius: 0; margin-left: -1.5rem; margin-right: -1.5rem; width: calc(100% + 3rem); }
  .slide-bg { height: 100%; background-size: cover; background-position: center; position: relative; }
  .overlay-gradient-mobile { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 50%, rgba(15,23,42,0.95)); }
  .mobile-title-overlay { position: absolute; bottom: 40px; left: 1.5rem; z-index: 10; color: white; }
  .mobile-title-overlay h1 { font-size: 2rem; margin: 5px 0; line-height: 1.2; }
  .main-layout { grid-template-columns: 1fr; gap: 1.5rem; }
  .right-sidebar { order: -1; position: static; }
  .info-grid { grid-template-columns: 1fr; }
}
</style>