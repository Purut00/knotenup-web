<template>
  <div class="min-h-screen bg-slate-900 text-white relative overflow-x-hidden">
    
    <!-- BACKGROUND LAYERS -->
    <div class="absolute inset-0 z-0 opacity-[0.08] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' viewBox=\'0 0 1000 1000\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400\' stroke=\'white\' fill=\'none\' stroke-width=\'2\' opacity=\'0.5\'/%3E%3C/svg%3E')] bg-cover"></div>
    <div class="absolute top-0 right-0 w-[60vw] h-[60vw] bg-[#6c63ff] blur-[150px] opacity-15 pointer-events-none rounded-full z-0 translate-x-[10%] -translate-y-[10%]"></div>
    <div class="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-[#ff8c42] blur-[150px] opacity-10 pointer-events-none rounded-full z-0 translate-x-[-10%] translate-y-[10%]"></div>

    <!-- MAIN CONTAINER -->
    <div class="container mx-auto px-6 pt-[100px] pb-16 relative z-10 max-w-[1200px]">
      
      <div v-if="loading" class="text-center text-slate-400 py-12">
        <div class="w-10 h-10 border-4 border-white/10 border-t-[#6c63ff] rounded-full animate-spin mx-auto mb-4"></div>
        <p>Sedang memuatkan...</p>
      </div>

      <div v-else-if="service" class="animate-fade-in-up">
        
        <!-- 🔥 HERO GALLERY (BENTO GRID) 🔥 -->
        <div class="mb-8 relative">
          
          <!-- Unified Grid -->
          <div class="grid grid-cols-[2fr_1fr] gap-2.5 h-[450px] rounded-[20px] overflow-hidden relative border border-white/10">
            <div class="w-full h-full bg-cover bg-center cursor-pointer relative bg-slate-800 transition md:hover:brightness-110" 
                 :style="{ backgroundImage: `url(${displayImages[0]})` }"
                 @click="openLightbox(0)">
                 <div class="absolute inset-0 bg-gradient-to-t from-[#0f172a]/95 via-transparent to-transparent opacity-100"></div>
            </div>
            <div class="grid grid-rows-2 gap-2.5">
              <div class="bg-cover bg-center cursor-pointer relative transition md:hover:brightness-110 bg-slate-800"
                   v-for="(img, index) in displayImages.slice(1, 5)" 
                   v-show="index < 2"
                   :key="index" 
                   :style="{ backgroundImage: `url(${img})` }"
                   @click="openLightbox(index + 1)">
              </div>
            </div>
            
            <!-- Button View Photos -->
            <button class="absolute bottom-5 right-5 bg-white/90 text-slate-900 px-5 py-2.5 rounded-full font-bold cursor-pointer transition transform hover:scale-105 hover:bg-white z-[5] border-none" @click="openLightbox(0)">
              <i class="fas fa-images mr-2"></i> {{ t('service.viewPhotos') || 'Lihat Semua Gambar' }}
            </button>

            <!-- Title Overlay (Absolute on Image) -->
            <div class="absolute bottom-[30px] left-[30px] z-[5] max-w-[70%]">
              <span class="bg-[#e67e22] text-white px-3 py-[5px] rounded-[30px] font-bold text-xs uppercase tracking-widest">{{ service.category }}</span>
              <h1 class="text-5xl font-extrabold leading-[1.1] my-2.5 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">{{ service.name }}</h1>
              <div class="text-[1.1rem] text-slate-300">
                <i class="fas fa-map-marker-alt text-red-400"></i> {{ service.location }}, {{ service.state }}
              </div>
            </div>
          </div>

          <!-- Mobile Swiper Removed -->
        </div>

        <!-- MAIN LAYOUT (Columns) -->
        <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
          
          <!-- LEFT CONTENT -->
          <div class="space-y-6">
            
            <!-- Description -->
            <div class="bg-white/5 border border-white/10 rounded-[16px] p-8 backdrop-blur-md text-white">
              <h3 class="mt-0 text-[1.3rem] border-b border-white/10 pb-2.5 mb-6 font-bold flex items-center text-white"><i class="fas fa-book-open text-purple-400 mr-2"></i> {{ t('service.info') || 'Tentang Servis' }}</h3>
              <p class="leading-[1.8] text-slate-300 whitespace-pre-line text-base">{{ service.description }}</p>
            </div>

            <!-- Accommodation Info -->
            <div v-if="['Campsite', 'Chalet', 'Event'].includes(service.category)" class="bg-white/5 border border-white/10 rounded-[16px] p-8 backdrop-blur-md text-white">
              <h3 class="mt-0 text-[1.3rem] border-b border-white/10 pb-2.5 mb-6 font-bold flex items-center text-white"><i class="fas fa-campground text-orange-400 mr-2"></i> Info Penginapan</h3>
              <div class="flex gap-8">
                <div class="bg-white/5 p-4 rounded-xl flex-1">
                  <span class="block text-xs text-slate-400 uppercase mb-[5px] font-semibold">Check-In</span>
                  <strong class="text-[1.1rem] text-white">{{ service.details.checkIn || '2:00 PM' }}</strong>
                </div>
                <div class="bg-white/5 p-4 rounded-xl flex-1">
                  <span class="block text-xs text-slate-400 uppercase mb-[5px] font-semibold">Check-Out</span>
                  <strong class="text-[1.1rem] text-white">{{ service.details.checkOut || '12:00 PM' }}</strong>
                </div>
              </div>
              
              <div class="h-px bg-white/10 my-6"></div>
              
              <h4 class="font-bold mb-2">Fasiliti Disediakan:</h4>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-2.5">
                <div v-for="fac in service.details.facilities" :key="fac" class="bg-white/5 px-3 py-2 rounded-lg text-sm text-slate-300 flex items-center gap-2">
                  <i class="fas fa-check-circle text-green-400"></i> {{ fac }}
                </div>
              </div>
            </div>

            <!-- Guide Info -->
            <div v-if="service.category === 'Guide'" class="bg-white/5 border border-white/10 rounded-[16px] p-8 backdrop-blur-md text-white">
              <h3 class="mt-0 text-[1.3rem] border-b border-white/10 pb-2.5 mb-6 font-bold flex items-center text-white"><i class="fas fa-hiking text-green-400 mr-2"></i> Info Guide</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white/5 p-4 rounded-xl flex-1">
                  <span class="block text-xs text-slate-400 uppercase mb-[5px] font-semibold">Nisbah Guide</span>
                  <strong class="text-[1.1rem] text-white">{{ service.details.guideRatio || '-' }}</strong>
                </div>
                <div class="bg-white/5 p-4 rounded-xl flex-1">
                  <span class="block text-xs text-slate-400 uppercase mb-[5px] font-semibold">Sijil / Lesen</span>
                  <strong class="text-[1.1rem] text-white">{{ service.details.certification || '-' }}</strong>
                </div>
              </div>
            </div>

            <!-- Transport Info -->
            <div v-if="service.category === 'Transport'" class="bg-white/5 border border-white/10 rounded-[16px] p-8 backdrop-blur-md text-white">
              <h3 class="mt-0 text-[1.3rem] border-b border-white/10 pb-2.5 mb-6 font-bold flex items-center text-white"><i class="fas fa-shuttle-van text-blue-400 mr-2"></i> Info Transport</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white/5 p-4 rounded-xl flex-1">
                  <span class="block text-xs text-slate-400 uppercase mb-[5px] font-semibold">Jenis Kenderaan</span>
                  <strong class="text-[1.1rem] text-white">{{ service.details.vehicleType }}</strong>
                </div>
                <div class="bg-white/5 p-4 rounded-xl flex-1">
                  <span class="block text-xs text-slate-400 uppercase mb-[5px] font-semibold">Max Penumpang</span>
                  <strong class="text-[1.1rem] text-white">{{ service.details.maxPax }} Pax</strong>
                </div>
              </div>
              <div class="mt-4 bg-white/5 p-4 rounded-xl flex-1">
                <span class="block text-xs text-slate-400 uppercase mb-[5px] font-semibold">Kawasan Liputan:</span>
                <p>{{ service.details.coverageArea }}</p>
              </div>
            </div>

            <!-- Rental Info -->
            <div v-if="service.category === 'Rental'" class="bg-white/5 border border-white/10 rounded-[16px] p-8 backdrop-blur-md text-white">
              <h3 class="mt-0 text-[1.3rem] border-b border-white/10 pb-2.5 mb-6 font-bold flex items-center text-white"><i class="fas fa-tools text-yellow-400 mr-2"></i> Senarai Barang</h3>
              <div class="bg-black/20 p-4 rounded-xl font-mono text-slate-200">
                <p class="whitespace-pre-line">{{ service.details.equipmentList }}</p>
              </div>
              <div class="mt-4 bg-[#6c63ff]/10 p-4 rounded-xl border border-[#6c63ff]/30 text-[#a78bfa]">
                📍 <strong>Lokasi Pickup:</strong> {{ service.details.pickupLocation }}
              </div>
            </div>

            <!-- Organizer Info -->
            <div class="bg-white/5 border border-white/10 rounded-[16px] p-8 backdrop-blur-md text-white flex items-center justify-between flex-wrap gap-4">
              <div class="flex items-center gap-4">
                 <img :src="service.ownerAvatar || 'https://i.pravatar.cc/150'" class="w-[60px] h-[60px] rounded-full border-2 border-white/20 object-cover" />
                 <div>
                   <small class="text-gray-400 text-xs uppercase tracking-wider block">Disediakan Oleh</small>
                   <h4 class="m-0 text-[1.2rem] text-white">{{ service.ownerName }}</h4>
                 </div>
              </div>
              <button class="bg-transparent border border-white/30 text-white px-5 py-2 rounded-full cursor-pointer transition hover:bg-white hover:text-slate-900" @click="$router.push(`/user/${service.ownerId}`)">
                Lihat Profil
              </button>
            </div>

          </div>

          <!-- RIGHT SIDEBAR (Sticky) -->
          <div class="sticky top-[120px] h-fit md:order-none order-first">
            <div class="bg-white/5 border border-white/10 rounded-[16px] p-8 backdrop-blur-md text-white text-center border-t-4 border-t-[#e67e22]">
              <div class="mb-4">
                <span class="block text-gray-400 text-xs uppercase font-semibold mb-1">Harga Bermula</span>
                
                <div v-if="service.category === 'Guide'">
                  <span class="text-[2.2rem] font-extrabold text-[#fbbf24]">RM {{ service.details.price }}</span>
                  <span class="text-slate-400">/ {{ service.details.priceType }}</span>
                </div>
                <div v-else-if="service.details.priceDisplay">
                  <span class="text-[1.5rem] font-extrabold text-white">{{ service.details.priceDisplay }}</span>
                </div>
                <div v-else>
                  <span class="text-sm font-bold text-white">Hubungi untuk harga</span>
                </div>
              </div>

              <button 
                 v-if="contactInfo && contactInfo.href !== '#'"
                 @click="openLiabilityModal" 
                 class="flex items-center justify-center gap-2.5 w-full p-4 mt-6 bg-gradient-to-br from-[#10b981] to-[#059669] text-white text-base font-bold rounded-xl transition transform hover:-translate-y-0.5 shadow-lg border-none cursor-pointer no-underline visited:text-white"
                 :class="contactInfo.color"
              >
                <i :class="[contactInfo.icon, 'text-xl mr-2']"></i> {{ contactInfo.label }}
              </button>
              <button v-else class="flex items-center justify-center gap-2.5 w-full p-4 mt-6 bg-gradient-to-br from-[#10b981] to-[#059669] text-white text-base font-bold rounded-xl opacity-50 cursor-not-allowed border-none" disabled>
                 No Contact Info
              </button>
              
              <p class="text-[0.8rem] text-slate-500 mt-2.5">Link akan membawa anda ke WhatsApp/Email rasmi penyedia servis.</p>
              
              <div v-if="isOwner" class="mt-2.5">
                <button class="w-full mt-2.5 p-2.5 bg-slate-700 text-white border-none rounded-lg cursor-pointer hover:bg-slate-600 transition" @click="$router.push(`/service/edit/${serviceId}`)">
                  <i class="fas fa-edit"></i> Edit Iklan
                </button>
              </div>

               <!-- REPORT BUTTON -->
               <div v-if="!isOwner" class="mt-4 text-center">
                 <button @click="showReportModal = true" class="text-xs text-red-400 hover:text-red-300 underline flex items-center justify-center gap-1 mx-auto bg-transparent border-none cursor-pointer">
                   <i class="fas fa-flag"></i> Report Service
                 </button>
               </div>
            </div>
          </div>

        </div>
      </div>

      <div v-else class="text-center text-slate-400 bg-white/5 border border-white/10 rounded-[16px] p-8 backdrop-blur-md">
        <h2 class="text-white mb-4">Servis Tidak Dijumpai 😔</h2>
        <button @click="$router.push('/directory')" class="mt-5 px-5 py-2.5 bg-[#6c63ff] text-white border-none rounded-full cursor-pointer hover:bg-[#5a52d5] transition">Kembali ke Direktori</button>
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