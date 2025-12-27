<template>
  <div class="service-detail-page">
    
    <!-- BACKGROUND LAYERS (Sama Macam Page Lain) -->
    <div class="contour-lines"></div>
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <!-- MAIN CONTAINER (Padding Besar Untuk Elak Navbar) -->
    <div class="content-container" style="padding-top: 100px; padding-bottom: 4rem;">
      
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Sedang memuatkan...</p>
      </div>

      <div v-else-if="service" class="fade-up">
        
        <!-- 🔥 HERO GALLERY (BENTO GRID) 🔥 -->
        <div class="hero-gallery-wrapper mb-8">
          
          <!-- Desktop Grid -->
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
            
            <!-- Button View Photos -->
            <button class="btn-show-all" @click="openLightbox(0)">
              <i class="fas fa-images mr-2"></i> {{ t('service.viewPhotos') || 'Lihat Semua Gambar' }}
            </button>

            <!-- Title Overlay (Absolute on Image) -->
            <div class="gallery-title-overlay">
              <span class="badge-cat">{{ service.category }}</span>
              <h1>{{ service.name }}</h1>
              <div class="hero-meta">
                <i class="fas fa-map-marker-alt text-red-400"></i> {{ service.location }}, {{ service.state }}
              </div>
            </div>
          </div>

          <!-- Mobile Swiper -->
          <div class="mobile-gallery">
            <swiper 
              :modules="[Pagination, Navigation]" 
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
              <span class="badge-cat">{{ service.category }}</span>
              <h1>{{ service.name }}</h1>
              <p><i class="fas fa-map-pin"></i> {{ service.location }}</p>
            </div>
          </div>
        </div>

        <!-- MAIN LAYOUT (Columns) -->
        <div class="main-layout">
          
          <!-- LEFT CONTENT -->
          <div class="left-content">
            
            <!-- Description -->
            <div class="glass-panel mb-6">
              <h3><i class="fas fa-book-open text-purple-400 mr-2"></i> {{ t('service.info') || 'Tentang Servis' }}</h3>
              <p class="desc-text">{{ service.description }}</p>
            </div>

            <!-- Accommodation Info -->
            <div v-if="['Campsite', 'Chalet', 'Event'].includes(service.category)" class="glass-panel mb-6">
              <h3><i class="fas fa-campground text-orange-400 mr-2"></i> Info Penginapan</h3>
              <div class="info-row">
                <div class="info-box">
                  <span class="label">Check-In</span>
                  <strong>{{ service.details.checkIn || '2:00 PM' }}</strong>
                </div>
                <div class="info-box">
                  <span class="label">Check-Out</span>
                  <strong>{{ service.details.checkOut || '12:00 PM' }}</strong>
                </div>
              </div>
              
              <div class="divider"></div>
              
              <h4>Fasiliti Disediakan:</h4>
              <div class="facilities-grid">
                <div v-for="fac in service.details.facilities" :key="fac" class="fac-pill">
                  <i class="fas fa-check-circle text-green-400"></i> {{ fac }}
                </div>
              </div>
            </div>

            <!-- Guide Info -->
            <div v-if="service.category === 'Guide'" class="glass-panel mb-6">
              <h3><i class="fas fa-hiking text-green-400 mr-2"></i> Info Guide</h3>
              <div class="info-grid-2">
                <div class="info-box">
                  <span class="label">Nisbah Guide</span>
                  <strong>{{ service.details.guideRatio || '-' }}</strong>
                </div>
                <div class="info-box">
                  <span class="label">Sijil / Lesen</span>
                  <strong>{{ service.details.certification || '-' }}</strong>
                </div>
              </div>
            </div>

            <!-- Transport Info -->
            <div v-if="service.category === 'Transport'" class="glass-panel mb-6">
              <h3><i class="fas fa-shuttle-van text-blue-400 mr-2"></i> Info Transport</h3>
              <div class="info-grid-2">
                <div class="info-box">
                  <span class="label">Jenis Kenderaan</span>
                  <strong>{{ service.details.vehicleType }}</strong>
                </div>
                <div class="info-box">
                  <span class="label">Max Penumpang</span>
                  <strong>{{ service.details.maxPax }} Pax</strong>
                </div>
              </div>
              <div class="mt-4 info-box-wide">
                <span class="label">Kawasan Liputan:</span>
                <p>{{ service.details.coverageArea }}</p>
              </div>
            </div>

            <!-- Rental Info -->
            <div v-if="service.category === 'Rental'" class="glass-panel mb-6">
              <h3><i class="fas fa-tools text-yellow-400 mr-2"></i> Senarai Barang</h3>
              <div class="rental-list">
                <p class="pre-line">{{ service.details.equipmentList }}</p>
              </div>
              <div class="mt-4 info-box-highlight">
                📍 <strong>Lokasi Pickup:</strong> {{ service.details.pickupLocation }}
              </div>
            </div>

            <!-- Organizer Info -->
            <div class="glass-panel organizer-card">
              <div class="flex items-center gap-4">
                 <img :src="service.ownerAvatar || 'https://i.pravatar.cc/150'" class="org-avatar" />
                 <div class="org-info">
                   <small class="text-gray-400 text-xs uppercase tracking-wider">Disediakan Oleh</small>
                   <h4>{{ service.ownerName }}</h4>
                 </div>
              </div>
              <button class="btn-view-profile" @click="$router.push(`/user/${service.ownerId}`)">
                Lihat Profil
              </button>
            </div>

          </div>

          <!-- RIGHT SIDEBAR (Sticky) -->
          <div class="right-sidebar">
            <div class="glass-panel price-card">
              <div class="price-header">
                <span class="label text-gray-400">Harga Bermula</span>
                
                <div v-if="service.category === 'Guide'">
                  <span class="amount">RM {{ service.details.price }}</span>
                  <span class="unit">/ {{ service.details.priceType }}</span>
                </div>
                <div v-else-if="service.details.priceDisplay">
                  <span class="amount-text">{{ service.details.priceDisplay }}</span>
                </div>
                <div v-else>
                  <span class="amount-text text-sm">Hubungi untuk harga</span>
                </div>
              </div>

              <button 
                 v-if="contactInfo && contactInfo.href !== '#'"
                 @click="openLiabilityModal" 
                 class="btn-whatsapp"
                 :class="contactInfo.color"
              >
                <i :class="[contactInfo.icon, 'text-xl mr-2']"></i> {{ contactInfo.label }}
              </button>
              <button v-else class="btn-whatsapp opacity-50 cursor-not-allowed" disabled>
                 No Contact Info
              </button>
              
              <p class="note">Link akan membawa anda ke WhatsApp/Email rasmi penyedia servis.</p>
              
              <div v-if="isOwner" class="owner-actions">
                <button class="btn-edit" @click="$router.push(`/service/edit/${serviceId}`)">
                  <i class="fas fa-edit"></i> Edit Iklan
                </button>
              </div>

               <!-- REPORT BUTTON -->
               <div v-if="!isOwner" class="mt-4 text-center">
                 <button @click="showReportModal = true" class="text-xs text-red-400 hover:text-red-300 underline flex items-center justify-center gap-1 mx-auto">
                   <i class="fas fa-flag"></i> Report Service
                 </button>
               </div>
            </div>
          </div>

        </div>
      </div>

      <div v-else class="error-container glass-panel">
        <h2 class="text-white">Servis Tidak Dijumpai 😔</h2>
        <button @click="$router.push('/directory')" class="btn-back">Kembali ke Direktori</button>
      </div>

      <!-- 🔥 LIGHTBOX COMPONENT 🔥 -->
      <VueEasyLightbox
        :visible="visibleRef"
        :imgs="displayImages"
        :index="indexRef"
        @hide="onHide"
      />

      <ReportModal
        v-if="service"
        v-model:visible="showReportModal"
        :targetId="service.id"
        targetType="service"
        :targetName="service.name"
      />

      <LiabilityModal
        v-model:visible="showLiabilityModal"
        context="join"
        @proceed="proceedToJoin"
      />

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useI18n } from 'vue-i18n'; 
import { getContactLink } from '../utils/contactHelper'; 
import { defineAsyncComponent } from 'vue';

const ReportModal = defineAsyncComponent(() => 
  import('../components/common/ReportModal.vue')
);
const LiabilityModal = defineAsyncComponent(() => 
  import('../components/common/LiabilityModal.vue')
); 

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
const serviceId = route.params.id as string;
const service = ref<any>(null);
const owner = ref<any>(null); // Owner profile data
const loading = ref(true);
const currentUser = ref<any>(null);

// LIGHTBOX STATE
const visibleRef = ref(false);
const indexRef = ref(0);
const showReportModal = ref(false);
const showLiabilityModal = ref(false);

const openLiabilityModal = () => { showLiabilityModal.value = true; };
const proceedToJoin = () => {
    if (contactInfo.value?.href) window.open(contactInfo.value.href, '_blank');
};

const displayImages = computed(() => {
  if (service.value?.images && service.value.images.length > 0) {
    let imgs = [...service.value.images];
    while (imgs.length < 5) imgs.push(imgs[0]); 
    return imgs;
  }
  return new Array(5).fill('https://via.placeholder.com/800x600?text=No+Image');
});

const contactInfo = computed(() => {
  if (!service.value) return null;
  return getContactLink(service.value, owner.value);
});

const isOwner = computed(() => {
  return currentUser.value && service.value && currentUser.value.uid === service.value.ownerId;
});

const openLightbox = (index: number) => {
  indexRef.value = index;
  visibleRef.value = true;
};

const onHide = () => {
  visibleRef.value = false;
};

onMounted(async () => {
  onAuthStateChanged(auth, (user) => { currentUser.value = user; });

  try {
    const docSnap = await getDoc(doc(db, 'services', serviceId));
    if (docSnap.exists()) {
      service.value = docSnap.data();

      // Fetch Owner Profile for Contact Fallback
      if (service.value.ownerId) {
        try {
          const ownerSnap = await getDoc(doc(db, 'users', service.value.ownerId));
          if (ownerSnap.exists()) owner.value = ownerSnap.data();
        } catch (err) { /* ignore */ }
      }
    }
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
});
</script>

<style scoped>
/* --- BASE THEME --- */
.service-detail-page { 
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
.hero-gallery-wrapper { position: relative; }

.desktop-gallery { 
  display: grid; grid-template-columns: 2fr 1fr; gap: 10px; 
  height: 450px; border-radius: 20px; overflow: hidden; position: relative; 
  border: 1px solid rgba(255,255,255,0.1);
}
.main-item { width: 100%; height: 100%; background-size: cover; background-position: center; cursor: pointer; position: relative; }
.sub-gallery { display: grid; grid-template-rows: 1fr 1fr; gap: 10px; }
.gallery-item { background-size: cover; background-position: center; cursor: pointer; position: relative; transition: filter 0.3s; }
.gallery-item:hover { filter: brightness(1.1); }

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
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px; padding: 2rem;
  backdrop-filter: blur(10px);
  color: white;
}

.glass-panel h3 { margin-top: 0; color: white; font-size: 1.3rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 1.5rem; font-weight: 700; display: flex; align-items: center; }
.desc-text { line-height: 1.8; color: #cbd5e1; white-space: pre-line; font-size: 1rem; }

/* Info Boxes */
.info-row { display: flex; gap: 2rem; }
.info-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.info-box { background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 10px; flex: 1; }
.label { display: block; font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px; font-weight: 600; }
.info-box strong { font-size: 1.1rem; color: white; }

.divider { height: 1px; background: rgba(255,255,255,0.1); margin: 1.5rem 0; }

.facilities-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; margin-top: 10px; }
.fac-pill { background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; font-size: 0.9rem; color: #cbd5e1; display: flex; align-items: center; gap: 8px; }

.info-box-highlight { background: rgba(108, 99, 255, 0.1); padding: 1rem; border-radius: 10px; border: 1px solid rgba(108, 99, 255, 0.3); color: #a78bfa; }
.rental-list { background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 10px; font-family: monospace; color: #e2e8f0; }

/* Organizer Card */
.organizer-card { display: flex; align-items: center; justify-content: space-between; }
.org-avatar { width: 60px; height: 60px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); object-fit: cover; }
.org-info h4 { margin: 0; font-size: 1.2rem; color: white; }
.btn-view-profile { 
  background: transparent; border: 1px solid rgba(255,255,255,0.3); 
  color: white; padding: 8px 20px; border-radius: 50px; cursor: pointer; transition: 0.2s; 
}
.btn-view-profile:hover { background: white; color: #0f172a; }

/* --- RIGHT SIDEBAR --- */
.right-sidebar { position: sticky; top: 120px; height: fit-content; }
.price-card { text-align: center; border-top: 4px solid #e67e22; }
.amount { font-size: 2.2rem; font-weight: 800; color: #fbbf24; } /* Gold/Yellow */
.amount-text { font-size: 1.5rem; font-weight: 800; color: white; }
.unit { color: #94a3b8; }

.btn-whatsapp { 
  display: flex; align-items: center; justify-content: center; gap: 10px;
  width: 100%; padding: 1rem; margin-top: 1.5rem;
  background: linear-gradient(135deg, #10b981, #059669); /* Green Gradient */
  color: white; text-decoration: none; font-weight: bold; border-radius: 12px; 
  transition: transform 0.2s; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}
.btn-whatsapp:hover { transform: translateY(-2px); filter: brightness(1.1); }
.note { font-size: 0.8rem; color: #64748b; margin-top: 10px; }

.btn-edit { width: 100%; margin-top: 10px; padding: 10px; background: #334155; color: white; border: none; border-radius: 8px; cursor: pointer; }

/* Loading/Error */
.loading-container, .error-container { text-align: center; color: #94a3b8; }
.spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #6c63ff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }
@keyframes spin { to { transform: rotate(360deg); } }
.btn-back { margin-top: 20px; padding: 10px 20px; background: #6c63ff; color: white; border: none; border-radius: 50px; cursor: pointer; }

.fade-up { animation: fadeUp 0.6s ease-out; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* RESPONSIVE */
@media (max-width: 768px) {
  .hero-gallery-wrapper { margin-bottom: 1rem; }
  .desktop-gallery { display: none; }
  .mobile-gallery { display: block; height: 350px; position: relative; border-radius: 0; margin-left: -1.5rem; margin-right: -1.5rem; width: calc(100% + 3rem); }
  .slide-bg { height: 100%; background-size: cover; background-position: center; position: relative; }
  .overlay-gradient-mobile { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 50%, rgba(15,23,42,0.95)); }
  
  .mobile-title-overlay { position: absolute; bottom: 40px; left: 1.5rem; z-index: 10; color: white; }
  .mobile-title-overlay h1 { font-size: 2rem; margin: 5px 0; line-height: 1.2; }
  
  .main-layout { grid-template-columns: 1fr; gap: 1.5rem; }
  .right-sidebar { order: -1; position: static; } /* Price card on top for mobile */
}
</style>