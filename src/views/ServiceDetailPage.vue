<template>
  <div class="detail-page">
    
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>⏳ {{ t('common.loading') }}</p>
    </div>

    <div v-else-if="service" class="content-container">
      
      <div class="hero-gallery-wrapper">
        <div class="desktop-gallery">
          <div class="gallery-item main-item" :style="{ backgroundImage: `url(${displayImages[0]})` }"></div>
          <div class="sub-gallery">
            <div class="gallery-item" v-for="(img, index) in displayImages.slice(1, 5)" :key="index" :style="{ backgroundImage: `url(${img})` }"></div>
          </div>
          <div class="gallery-overlay">
            <span class="badge-cat">{{ service.category }}</span>
            <h1>{{ service.name }}</h1>
            <div class="hero-meta">📍 {{ service.location }}, {{ service.state }}</div>
          </div>
        </div>

        <div class="mobile-gallery">
          <swiper :modules="[Pagination]" :pagination="{ clickable: true }" class="detail-swiper">
            <swiper-slide v-for="(img, index) in displayImages" :key="index">
              <div class="slide-bg" :style="{ backgroundImage: `url(${img})` }"></div>
            </swiper-slide>
          </swiper>
          <div class="mobile-overlay">
            <span class="badge-cat">{{ service.category }}</span>
            <h1>{{ service.name }}</h1>
          </div>
        </div>
      </div>

      <div class="main-layout">
        
        <div class="left-content">
          
          <div class="section-box">
            <h3>📖 {{ t('service.info') }}</h3>
            <p class="desc-text">{{ service.description }}</p>
          </div>

          <div v-if="['Campsite', 'Chalet', 'Event'].includes(service.category)" class="section-box">
            <h3>⛺ {{ t('service.accommodationInfo') }}</h3>
            <div class="info-row">
              <div class="info-item">
                <span class="label">{{ t('service.checkIn') }}</span>
                <strong>{{ service.details.checkIn || '2:00 PM' }}</strong>
              </div>
              <div class="info-item">
                <span class="label">{{ t('service.checkOut') }}</span>
                <strong>{{ service.details.checkOut || '12:00 PM' }}</strong>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <h4>{{ t('service.facilities') }}:</h4>
            <div class="facilities-grid">
              <div v-for="fac in service.details.facilities" :key="fac" class="fac-item">
                ✅ {{ fac }}
              </div>
            </div>
          </div>

          <div v-if="service.category === 'Guide'" class="section-box">
            <h3>🧗 {{ t('service.guideInfo') }}</h3>
            <div class="info-grid-2">
              <div class="info-card">
                <span class="label">{{ t('service.ratio') }}</span>
                <strong>{{ service.details.guideRatio || '-' }}</strong>
              </div>
              <div class="info-card">
                <span class="label">{{ t('service.cert') }}</span>
                <strong>{{ service.details.certification || '-' }}</strong>
              </div>
            </div>
          </div>

          <div v-if="service.category === 'Transport'" class="section-box">
            <h3>🚙 {{ t('service.transportInfo') }}</h3>
            <div class="info-grid-2">
              <div class="info-card">
                <span class="label">{{ t('service.vehicleType') }}</span>
                <strong>{{ service.details.vehicleType }}</strong>
              </div>
              <div class="info-card">
                <span class="label">{{ t('service.maxPax') }}</span>
                <strong>{{ service.details.maxPax }} {{ t('service.pax') }}</strong>
              </div>
            </div>
            <div class="mt-4">
              <strong>{{ t('service.coverage') }}:</strong>
              <p>{{ service.details.coverageArea }}</p>
            </div>
          </div>

          <div v-if="service.category === 'Rental'" class="section-box">
            <h3>🎒 {{ t('service.rentalList') }}</h3>
            <div class="rental-list">
              <p class="pre-line">{{ service.details.equipmentList }}</p>
            </div>
            <div class="mt-4 alert-box">
              📍 <strong>{{ t('service.pickup') }}:</strong> {{ service.details.pickupLocation }}
            </div>
          </div>

          <div class="organizer-card">
            <img :src="service.ownerAvatar || 'https://i.pravatar.cc/150'" class="org-avatar" />
            <div class="org-info">
              <small>{{ t('service.hostedBy') }}:</small>
              <h4>{{ service.ownerName }}</h4>
            </div>
            <button class="btn-view-profile" @click="$router.push(`/user/${service.ownerId}`)">
              {{ t('trip.viewProfile') }}
            </button>
          </div>

        </div>

        <div class="right-sidebar">
          <div class="price-card">
            <div class="price-header">
              <span class="label">{{ t('service.startingPrice') }}</span>
              
              <div v-if="service.category === 'Guide'">
                <span class="amount">RM {{ service.details.price }}</span>
                <span class="unit">/ {{ service.details.priceType }}</span>
              </div>
              <div v-else-if="service.details.priceDisplay">
                <span class="amount-text">{{ service.details.priceDisplay }}</span>
              </div>
              <div v-else>
                <span class="amount-text">{{ t('service.contactForPrice') }}</span>
              </div>
            </div>

            <a :href="whatsappUrl" target="_blank" class="btn-whatsapp">
              📞 {{ t('service.whatsappAction') }}
            </a>
            <p class="note">{{ t('service.whatsappNote') }}</p>
            
            <div v-if="isOwner" class="owner-actions">
              <button class="btn-edit" @click="$router.push(`/service/edit/${serviceId}`)">
                ✏️ {{ t('service.editAd') }}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div v-else class="error-container">
      <h2>{{ t('service.notFound') }} 😔</h2>
      <button @click="$router.push('/directory')" class="btn-back">{{ t('service.backToDirectory') }}</button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useI18n } from 'vue-i18n'; // IMPORT I18N

// Swiper
// @ts-ignore
import { Swiper, SwiperSlide } from 'swiper/vue';
// @ts-ignore
import { Pagination } from 'swiper/modules';
// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/pagination';

const { t } = useI18n(); // INIT I18N
const route = useRoute();
const serviceId = route.params.id as string;
const service = ref<any>(null);
const loading = ref(true);
const currentUser = ref<any>(null);

// Gambar Logic
const displayImages = computed(() => {
  if (service.value?.images && service.value.images.length > 0) {
    let imgs = [...service.value.images];
    while (imgs.length < 5) imgs.push(imgs[0]); 
    return imgs;
  }
  return new Array(5).fill('https://via.placeholder.com/800x600?text=No+Image');
});

// WhatsApp Link Logic
const whatsappUrl = computed(() => {
  if (!service.value?.whatsapp) return '#';
  const message = `Hi ${service.value.ownerName}, saya berminat dengan servis ${service.value.name} yang saya lihat di KnotenUp.`;
  return `https://wa.me/60${service.value.whatsapp}?text=${encodeURIComponent(message)}`;
});

const isOwner = computed(() => {
  return currentUser.value && service.value && currentUser.value.uid === service.value.ownerId;
});

onMounted(async () => {
  onAuthStateChanged(auth, (user) => { currentUser.value = user; });

  try {
    const docSnap = await getDoc(doc(db, 'services', serviceId));
    if (docSnap.exists()) {
      service.value = docSnap.data();
    }
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
});
</script>

<style scoped>
.detail-page { background-color: #f8f9fa; min-height: 100vh; padding-bottom: 3rem; }
.content-container { max-width: 1200px; margin: 0 auto; }
.loading-container, .error-container { text-align: center; padding: 5rem; color: #666; display: flex; flex-direction: column; align-items: center; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 10px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* HERO GALLERY (Bento Style) */
.hero-gallery-wrapper { position: relative; margin-bottom: 2rem; padding: 1rem; }
.desktop-gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; height: 400px; border-radius: 16px; overflow: hidden; position: relative; }
.main-item { width: 100%; height: 100%; background-size: cover; background-position: center; }
.sub-gallery { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 8px; }
.gallery-item { background-size: cover; background-position: center; cursor: pointer; transition: 0.2s; }
.gallery-item:hover { filter: brightness(0.9); }

.gallery-overlay { position: absolute; bottom: 0; left: 0; width: 100%; padding: 2rem; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); color: white; pointer-events: none; }
.badge-cat { background: #e67e22; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 0.8rem; text-transform: uppercase; }
h1 { margin: 10px 0; font-size: 2.5rem; font-weight: 800; text-shadow: 0 2px 5px rgba(0,0,0,0.5); }

/* Mobile Gallery */
.mobile-gallery { display: none; }

/* MAIN LAYOUT */
.main-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; padding: 0 1rem; }

/* SECTION BOXES */
.section-box { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 15px rgba(0,0,0,0.05); margin-bottom: 2rem; }
.section-box h3 { margin-top: 0; color: #2c3e50; font-size: 1.2rem; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 1rem; }
.desc-text { line-height: 1.7; color: #555; white-space: pre-line; }

/* Dynamic Info Styles */
.info-row { display: flex; gap: 2rem; }
.info-item { display: flex; flex-direction: column; }
.label { font-size: 0.8rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
.info-item strong { font-size: 1.1rem; color: #2c3e50; }

.divider { height: 1px; background: #eee; margin: 1.5rem 0; }

.facilities-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
.fac-item { background: #f9f9f9; padding: 8px 12px; border-radius: 6px; font-size: 0.9rem; color: #555; }

.info-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.info-card { background: #f8f9fa; padding: 1rem; border-radius: 8px; border: 1px solid #eee; }
.rental-list { background: #fff8e1; padding: 1rem; border-radius: 8px; font-family: monospace; line-height: 1.6; }
.pre-line { white-space: pre-line; }
.alert-box { background: #e3f2fd; padding: 1rem; border-radius: 8px; color: #0d47a1; }

/* Organizer */
.organizer-card { background: white; padding: 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 1rem; border: 1px solid #eee; }
.org-avatar { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; }
.org-info h4 { margin: 0; font-size: 1.1rem; }
.btn-view-profile { margin-left: auto; border: 1px solid #ccc; background: white; padding: 5px 15px; border-radius: 20px; cursor: pointer; font-size: 0.8rem; }

/* SIDEBAR */
.right-sidebar { position: sticky; top: 100px; height: fit-content; }
.price-card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 5px 25px rgba(0,0,0,0.1); text-align: center; border-top: 5px solid #e67e22; }
.price-header { margin-bottom: 1.5rem; }
.amount { font-size: 2rem; font-weight: 800; color: #e67e22; }
.amount-text { font-size: 1.5rem; font-weight: 800; color: #2c3e50; }
.unit { color: #999; }

.btn-whatsapp { display: block; width: 100%; padding: 1rem; background: #25D366; color: white; text-decoration: none; font-weight: bold; border-radius: 8px; transition: 0.2s; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.3); }
.btn-whatsapp:hover { background: #1ebe57; transform: translateY(-2px); }
.note { font-size: 0.8rem; color: #999; margin-top: 10px; }

.owner-actions { margin-top: 1rem; border-top: 1px dashed #ccc; padding-top: 1rem; }
.btn-edit { width: 100%; padding: 0.8rem; background: #34495e; color: white; border: none; border-radius: 6px; cursor: pointer; }
.btn-back { padding: 10px 20px; background: #34495e; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px; }

/* MOBILE */
@media (max-width: 768px) {
  .desktop-gallery { display: none; }
  .mobile-gallery { display: block; height: 250px; position: relative; }
  .detail-swiper, .slide-bg { height: 100%; background-size: cover; background-position: center; }
  .mobile-overlay { position: absolute; bottom: 0; left: 0; width: 100%; padding: 1rem; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); color: white; z-index: 10; }
  .main-layout { grid-template-columns: 1fr; }
  .right-sidebar { position: static; margin-top: 2rem; }
}
</style>