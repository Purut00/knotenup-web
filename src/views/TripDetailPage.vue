<template>
  <div class="min-h-screen relative overflow-x-hidden text-white bg-slate-900">
    
    <!-- Background Decor -->
    <div class="absolute inset-0 z-0 opacity-[0.08] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' viewBox=\'0 0 1000 1000\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400\' stroke=\'white\' fill=\'none\' stroke-width=\'2\' opacity=\'0.5\'/%3E%3C/svg%3E')] bg-cover"></div>
    <div class="absolute -top-[10%] -right-[10%] w-[60vw] h-[60vw] bg-[#6c63ff] blur-[150px] opacity-15 pointer-events-none rounded-full z-0"></div>
    <div class="absolute -bottom-[10%] -left-[10%] w-[60vw] h-[60vw] bg-[#ff8c42] blur-[150px] opacity-10 pointer-events-none rounded-full z-0"></div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 pt-[120px] pb-16">

      <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-slate-400">
        <div class="w-10 h-10 border-4 border-white/10 border-t-[#6c63ff] rounded-full animate-spin mb-4"></div>
        <p>Sedang memuatkan...</p>
      </div>

      <div v-else-if="trip" class="animate-fade-in-up">
        
        <!-- HERO GALLERY -->
        <div class="relative mb-8">
          
          <!-- GALLERY UNIFIED -->
          <div class="grid grid-cols-[2fr_1fr] gap-2.5 h-[450px] rounded-[20px] overflow-hidden border border-white/10 relative">
            <div class="w-full h-full bg-cover bg-center cursor-pointer transition-all hover:brightness-90 relative" 
                 :style="{ backgroundImage: `url(${displayImages[0]})` }"
                 @click="openLightbox(0)">
                 <div class="absolute inset-0 bg-gradient-to-t from-[#0f172a]/95 via-transparent to-transparent opacity-60"></div>
            </div>
            
            <div class="grid grid-cols-2 grid-rows-2 gap-2.5">
              <div class="bg-cover bg-center cursor-pointer transition-all hover:brightness-90 bg-gray-700" 
                   v-for="(img, index) in displayImages.slice(1, 5)" 
                   :key="index" 
                   :style="{ backgroundImage: `url(${img})` }"
                   @click="openLightbox(index + 1)">
              </div>
            </div>
            
            <button class="absolute bottom-5 right-5 bg-white/90 text-slate-900 px-5 py-2.5 rounded-full font-bold cursor-pointer transition-transform hover:scale-105 hover:bg-white z-10 flex items-center" @click="openLightbox(0)">
              <i class="fas fa-images mr-2"></i> {{ t('trip.viewPhotos') || 'Lihat Gambar' }}
            </button>
            
            <div class="absolute bottom-[30px] left-[30px] z-[5] max-w-[70%]">
              <span class="inline-block bg-[#e67e22] text-white px-3 py-1 rounded-[30px] font-bold text-xs uppercase tracking-wider mb-2">{{ trip.category }}</span>
              <h1 class="text-5xl font-extrabold leading-[1.1] mb-2 drop-shadow-md">{{ trip.title }}</h1>
              <div class="text-lg text-slate-300 flex items-center gap-4">
                <span><i class="fas fa-map-marker-alt text-red-400"></i> {{ trip.location }}</span>
                <span v-if="trip.duration"><i class="fas fa-clock text-blue-400 ml-2"></i> {{ trip.duration }}</span>
                <span class="ml-2"><i class="fas fa-tachometer-alt text-yellow-400"></i> {{ trip.difficulty }}</span>
              </div>
            </div>
          </div>

          <!-- Mobile Gallery Removed -->
        </div>

        <!-- MAIN LAYOUT -->
        <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
          
          <!-- LEFT CONTENT -->
          <div class="flex flex-col">
            
            <div v-if="trip.spotId" 
                 class="mb-6 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-md cursor-pointer hover:border-purple-400 transition group"
                 @click="$router.push('/spots/' + trip.spotId)">
              <div class="flex items-center justify-between">
                <div>
                   <small class="text-purple-300 uppercase font-bold tracking-wider text-xs flex items-center gap-2">
                     <i class="fas fa-mountain"></i> Info Lokasi Rasmi
                   </small>
                   <h3 class="text-xl font-bold text-white m-0 p-0 flex items-center gap-2 group-hover:text-purple-300 transition mt-1">
                     {{ trip.spotName || 'Lihat Detail Gunung/Bukit' }}
                   </h3>
                   <p class="text-sm text-gray-300 mt-1">
                     Klik untuk lihat info penuh (GPX, Review, Fasiliti & Peta).
                   </p>
                </div>
                <div class="text-2xl text-purple-400 group-hover:translate-x-2 transition">
                  <i class="fas fa-chevron-right"></i>
                </div>
              </div>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md text-white mb-6">
              <h3 class="text-xl font-bold text-white border-b border-white/10 pb-2 mb-6 flex items-center"><i class="fas fa-book-open text-purple-400 mr-2"></i> {{ t('trip.about') || 'Tentang Trip' }}</h3>
              <p class="text-base leading-relaxed text-slate-300 whitespace-pre-wrap">{{ trip.description }}</p>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md text-white mb-6">
              <h3 class="text-xl font-bold text-white border-b border-white/10 pb-2 mb-6 flex items-center"><i class="far fa-calendar-alt text-orange-400 mr-2"></i> {{ t('trip.schedule') || 'Jadual' }}</h3>
              <div class="flex items-center justify-around bg-white/5 p-4 rounded-xl border border-white/20 border-dashed">
                <div class="text-center">
                  <small class="block text-slate-400 text-xs uppercase tracking-wide">{{ t('createTrip.startDate') }}</small>
                  <strong class="block text-white text-lg mt-1">{{ formatDate(trip.startDate) }}</strong>
                </div>
                <div class="text-2xl text-[#6c63ff]"><i class="fas fa-arrow-right"></i></div>
                <div class="text-center">
                  <small class="block text-slate-400 text-xs uppercase tracking-wide">{{ t('createTrip.endDate') }}</small>
                  <strong class="block text-white text-lg mt-1">{{ formatDate(trip.endDate) }}</strong>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div class="p-6 rounded-xl bg-red-500/10 border-l-4 border-red-500" v-if="trip.mandatory">
                <h4 class="text-red-300 font-bold mb-2 flex items-center"><i class="fas fa-exclamation-triangle mr-2"></i> {{ t('createTrip.mandatory') }}</h4>
                <p class="text-sm text-slate-300 whitespace-pre-wrap">{{ trip.mandatory }}</p>
              </div>
              <div class="p-6 rounded-xl bg-amber-500/10 border-l-4 border-amber-400" v-if="trip.tips">
                <h4 class="text-amber-300 font-bold mb-2 flex items-center"><i class="fas fa-lightbulb mr-2"></i> {{ t('createTrip.tips') }}</h4>
                <p class="text-sm text-slate-300 whitespace-pre-wrap">{{ trip.tips }}</p>
              </div>
              <div class="p-6 rounded-xl bg-blue-500/10 border-l-4 border-blue-500 col-span-1 md:col-span-2" v-if="trip.recommended">
                <h4 class="text-blue-300 font-bold mb-2 flex items-center"><i class="fas fa-hiking mr-2"></i> {{ t('createTrip.recommended') }}</h4>
                <p class="text-sm text-slate-300 whitespace-pre-wrap">{{ trip.recommended }}</p>
              </div>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md text-white mb-6" v-if="trip.includes && trip.includes.length">
              <h3 class="text-xl font-bold text-white border-b border-white/10 pb-2 mb-6 flex items-center"><i class="fas fa-check-circle text-green-400 mr-2"></i> {{ t('createTrip.includes') }}</h3>
              <ul class="grid grid-cols-1 md:grid-cols-2 gap-3 p-0 list-none">
                <li v-for="item in trip.includes" :key="item" class="flex items-center gap-2.5 text-slate-300 text-[0.95rem]">
                  <i class="fas fa-check text-green-400"></i> {{ item }}
                </li>
              </ul>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md text-white mb-6 flex items-center justify-between cursor-pointer transition hover:bg-white/10" @click="$router.push(`/user/${trip.organizerId}`)">
              <div class="flex items-center gap-4">
                <img :src="(organizer && organizer.avatar) || trip.organizerImage || 'https://i.pravatar.cc/150?img=3'" class="w-[60px] h-[60px] rounded-full object-cover border-2 border-white/20" />
                <div class="flex-grow">
                  <small class="text-slate-400 text-xs uppercase tracking-wider block">{{ t('trip.organizedBy') }}</small>
                  <h4 class="m-0 text-white text-lg font-bold">{{ (organizer && (organizer.name || organizer.fullName)) || trip.organizerName }}</h4>
                </div>
              </div>
              <button class="bg-transparent border border-white/30 text-white px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition hover:bg-white hover:text-slate-900">{{ t('trip.viewProfile') }}</button>
            </div>

          </div>

          <!-- RIGHT SIDEBAR -->
          <div class="md:sticky md:top-[120px] h-fit md:order-last order-first mb-6 md:mb-0">
            
            <div v-if="isOwner" class="mb-4 rounded-2xl p-6 backdrop-blur-md border border-red-500/30 bg-red-900/10">
               <h3 class="text-red-400 text-sm mb-3 font-bold uppercase tracking-widest border-b border-red-500/20 pb-2">
                 <i class="fas fa-user-shield mr-2"></i> Zon Penganjur
               </h3>
               <button @click="archiveTrip" :disabled="isProcessing" class="w-full p-2.5 rounded-lg border border-red-500/30 bg-red-500/15 text-red-300 font-semibold text-sm transition hover:bg-red-500/30 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                 <i class="fas fa-trash-alt mr-2"></i>
                 {{ isProcessing ? 'Memproses...' : 'Padam Trip (Arkib)' }}
               </button>
               <p class="text-xs text-red-300 mt-2 italic text-center">
                 * Data tidak dipadam kekal, hanya diarkibkan demi keselamatan.
               </p>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md text-center border-t-4 border-t-[#e67e22]">
              <div class="mb-6 text-center">
                <span class="text-xl text-slate-400 align-top relative top-1">RM</span>
                <span class="text-5xl font-extrabold text-[#fbbf24]">{{ trip.price }}</span>
                <span class="text-slate-400 text-base">/ {{ t('trip.perPax') }}</span>
              </div>
              
              <div class="text-left mt-6">
                <div class="h-2.5 bg-white/10 rounded-full overflow-hidden mb-2">
                  <div class="h-full bg-[#27ae60] rounded-full transition-all duration-500" :style="{ width: (trip.currentSlots / trip.maxSlots) * 100 + '%' }"></div>
                </div>
                <div class="flex justify-between text-sm font-semibold text-slate-300">
                  <span>{{ trip.currentSlots }} {{ t('trip.taken') }}</span>
                  <span class="text-[#fbbf24]">{{ trip.maxSlots - trip.currentSlots }} {{ t('trip.empty') }}</span>
                </div>
              </div>

              <div class="mt-6">
                <div v-if="isOwner">
                  <button class="w-full p-4 bg-white/10 text-gray-500 rounded-xl cursor-not-allowed font-bold" disabled>Ini Trip Anda</button>
                </div>
                
                <div v-else>
                   <button 
                      v-if="contactInfo && contactInfo.href !== '#'"
                      @click="openLiabilityModal" 
                      class="w-full flex items-center justify-center p-4 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-xl font-bold text-base transition transform hover:-translate-y-0.5 shadow-lg shadow-emerald-500/30 border-none cursor-pointer mb-2"
                      :class="contactInfo.color"
                   >
                    <i :class="[contactInfo.icon, 'text-xl mr-2']"></i> {{ contactInfo.label }}
                  </button>
                  <button v-else class="w-full p-4 bg-white/10 text-gray-500 rounded-xl cursor-not-allowed font-bold" disabled>{{ t('trip.noLink') }}</button>
                  
                  <p class="text-[10px] text-gray-400 text-center mt-2 italic">
                     Link akan membawa anda ke WhatsApp/Email rasmi organizer.
                  </p>

                  <!-- REPORT BUTTON -->
                  <div class="mt-4 text-center">
                    <button @click="showReportModal = true" class="text-xs text-red-400 hover:text-red-300 underline flex items-center justify-center gap-1 mx-auto bg-transparent border-none cursor-pointer">
                      <i class="fas fa-flag"></i> Report Trip
                    </button>
                  </div>
                </div>
              </div>
              <p class="text-xs text-slate-500 italic mt-4 leading-normal">* {{ t('trip.paymentNote') }}</p>
            </div>
          </div>

        </div>
      </div>

      <div v-else class="text-center p-20 text-xl text-slate-400 bg-white/5 border border-white/10 rounded-2xl">
        <h2 class="text-white mb-4">{{ t('trip.notFound') }} 😔</h2>
        <button @click="$router.push('/trips')" class="bg-[#6c63ff] text-white px-5 py-2.5 rounded-full border-none cursor-pointer">{{ t('trip.backList') }}</button>
      </div>

      <VueEasyLightbox
        :visible="visibleRef"
        :imgs="displayImages"
        :index="indexRef"
        @hide="onHide"
      />

      <ReportModal
        v-if="trip"
        v-model:visible="showReportModal"
        :targetId="trip.id"
        targetType="trip"
        :targetName="trip.title"
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
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { db, auth } from '../firebaseConfig'; // Path asal
import { doc, getDoc, updateDoc } from 'firebase/firestore'; 
import { getContactLink } from '../utils/contactHelper'; // Import baru
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
const router = useRouter();
const trip = ref<any>(null);
const organizer = ref<any>(null); // State untuk simpan data organizer
const loading = ref(true);
const isProcessing = ref(false);

// Lightbox State
const visibleRef = ref(false);
const indexRef = ref(0);
const showReportModal = ref(false);
const showLiabilityModal = ref(false);

const openLiabilityModal = () => { showLiabilityModal.value = true; };
const proceedToJoin = () => {
    if (contactInfo.value?.href) window.open(contactInfo.value.href, '_blank');
};

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

// [NEW] Computed Contact Info
const contactInfo = computed(() => {
  if (!trip.value) return null;
  return getContactLink(trip.value, organizer.value);
});

// [SECURITY] Soft Delete Function
const archiveTrip = async () => {
  if (!confirm("Adakah anda pasti? Trip akan diarkibkan dan tidak lagi kelihatan kepada umum.")) return;
  
  isProcessing.value = true;
  try {
    const tripRef = doc(db, "trips", trip.value.id);
    
    // SOFT DELETE: Tukar status kepada 'archived'.
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

         // [NEW] Fetch Organizer Data (untuk dapatkan phone number dia)
         if (trip.value.organizerId) {
            try {
              const orgSnap = await getDoc(doc(db, 'users', trip.value.organizerId));
              if (orgSnap.exists()) {
                organizer.value = orgSnap.data();
              }
            } catch (err) {
              // console.log("Organizer info restricted or not found");
            }
         }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    loading.value = false;
  }
});
</script>