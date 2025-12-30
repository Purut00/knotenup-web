<template>
  <div class="min-h-screen bg-slate-900 text-white relative overflow-x-hidden">
    
    <!-- Background Decor -->
    <div class="absolute inset-0 z-0 opacity-[0.08] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' viewBox=\'0 0 1000 1000\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400\' stroke=\'white\' fill=\'none\' stroke-width=\'2\' opacity=\'0.5\'/%3E%3C/svg%3E')] bg-cover"></div>
    <div class="absolute top-0 left-0 w-[60vw] h-[60vw] bg-[#6c63ff] blur-[150px] opacity-15 pointer-events-none rounded-full z-0"></div>
    <div class="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-[#ff8c42] blur-[150px] opacity-10 pointer-events-none rounded-full z-0"></div>

    <div v-if="loading" class="min-h-[80vh] flex items-center justify-center relative z-10">
      <div class="inline-block px-8 py-6 bg-[#0f172a]/75 border border-white/10 rounded-[20px] backdrop-blur-md shadow-xl">
          <i class="fas fa-spinner fa-spin text-3xl text-purple-400 mb-3 block text-center"></i>
          <p class="text-gray-300">⏳ {{ t('common.loading') }}</p>
      </div>
    </div>

    <div v-else-if="!spot" class="min-h-[80vh] flex items-center justify-center relative z-10">
      <div class="inline-block px-8 py-6 bg-[#0f172a]/75 border border-red-500/30 rounded-[20px] backdrop-blur-md shadow-xl text-center">
          <i class="fas fa-exclamation-triangle text-3xl text-red-400 mb-3 block"></i>
          <p class="text-red-300">{{ t('spotDetail.notFound') }}</p>
          <button @click="$router.push('/spots')" class="mt-4 bg-white/5 text-slate-300 px-4 py-2 rounded-lg text-sm border border-white/10 cursor-pointer transition hover:bg-white/15 hover:text-white">Kembali</button>
      </div>
    </div>

    <div v-else class="container mx-auto px-6 relative z-10 max-w-7xl pt-[150px] pb-[80px]">
      
      <!-- Gallery Component -->
      <SpotGallery :spot="spot" :images="displayImages" />

      <!-- Map Component -->
      <SpotMap :spot="spot" />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up delay-100">
        
        <div class="lg:col-span-2 space-y-8">

            <div v-if="relatedTrips.length > 0" class="bg-[#0f172a]/75 border border-white/10 rounded-[20px] backdrop-blur-md shadow-xl p-6 md:p-8 border-l-4 border-l-orange-500">
               <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                 <i class="fas fa-hiking text-orange-400"></i> Trip Akan Datang di Sini
               </h3>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <TripCard v-for="trip in relatedTrips" :key="trip.id" :trip="trip" />
               </div>
               <div class="mt-4 text-center">
                 <small class="text-gray-400 italic">Senarai trip yang masih dibuka untuk pendaftaran.</small>
               </div>
            </div>
            
            <div class="bg-[#0f172a]/75 border border-white/10 rounded-[20px] backdrop-blur-md shadow-xl p-6 md:p-8">
                <div class="flex flex-wrap justify-between items-start mb-6 gap-4">
                    <h3 class="text-xl font-bold text-white">Maklumat Trek</h3>
                    <div class="flex items-center gap-3">
                         <button class="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center cursor-pointer transition hover:bg-white/15 hover:scale-105" @click="toggleTranslation" :disabled="translating" title="Translate">
                            <i class="fas fa-language"></i> 
                            <span class="text-xs ml-1" v-if="translating">...</span>
                         </button>
                         <button class="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer transition hover:bg-white/15 hover:scale-105 text-red-400 hover:text-red-300" @click="handleReport" title="Report">
                            <i class="fas fa-flag"></i>
                         </button>
                    </div>
                </div>

                <div class="text-gray-300 leading-relaxed whitespace-pre-line mb-6 text-lg">
                    {{ showingTranslation ? translatedDesc : spot.description }}
                </div>
                <p v-if="translationError" class="text-red-400 text-xs mb-4">⚠️ {{ t('spotDetail.translationError') }}</p>

                <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    
                    <div class="p-3 bg-black/30 rounded-lg border border-white/5">
                        <span class="block text-[0.7rem] text-slate-400 uppercase tracking-wide mb-1">🏳️ Negeri</span>
                        <span class="text-base text-white font-semibold">{{ spot.state || '-' }}</span>
                    </div>

                    <div class="p-3 bg-black/30 rounded-lg border border-white/5">
                        <span class="block text-[0.7rem] text-slate-400 uppercase tracking-wide mb-1">🏔️ Ketinggian</span>
                        <span class="text-base text-white font-semibold">{{ spot.height ? spot.height + ' m' : '-' }}</span>
                    </div>

                    <div class="p-3 bg-black/30 rounded-lg border border-white/5">
                        <span class="block text-[0.7rem] text-slate-400 uppercase tracking-wide mb-1">📏 Jarak</span>
                        <span class="text-base text-white font-semibold">{{ spot.distance ? spot.distance + ' km' : '-' }}</span>
                    </div>

                    <div class="p-3 bg-black/30 rounded-lg border border-white/5">
                        <span class="block text-[0.7rem] text-slate-400 uppercase tracking-wide mb-1">⏱️ Masa</span>
                        <span class="text-base text-white font-semibold">{{ spot.duration || '-' }}</span>
                    </div>

                    <div class="p-3 bg-black/30 rounded-lg border border-white/5">
                        <span class="block text-[0.7rem] text-slate-400 uppercase tracking-wide mb-1">🛤️ Via</span>
                        <span class="text-base text-white font-semibold">{{ spot.via || '-' }}</span>
                    </div>

                    <div class="p-3 bg-black/30 rounded-lg border border-white/5">
                        <span class="block text-[0.7rem] text-slate-400 uppercase tracking-wide mb-1">💪 Tahap</span>
                        <span class="text-base text-white font-semibold">{{ getLevelLabel(spot.difficulty) }}</span>
                    </div>

                    <div class="p-3 bg-black/30 rounded-lg border border-white/5">
                        <span class="block text-[0.7rem] text-slate-400 uppercase tracking-wide mb-1">📜 Permit</span>
                        <span class="text-base font-bold" :class="(!spot.permit || spot.permit === 'No' || spot.permit === 'Tidak Perlu') ? 'text-green-400' : 'text-orange-400'">
                           {{ (!spot.permit || spot.permit === 'No' || spot.permit === 'Tidak Perlu') ? 'Tidak' : 'Perlu' }}
                        </span>
                    </div>

                    <div class="p-3 bg-black/30 rounded-lg border border-white/5">
                        <span class="block text-[0.7rem] text-slate-400 uppercase tracking-wide mb-1">👮 Guide</span>
                        <span class="text-base font-bold" :class="spot.guideRequired === 'Yes' ? 'text-red-400' : 'text-green-400'">
                            {{ getGuideLabel(spot.guideRequired) }}
                        </span>
                    </div>

                    <div class="p-3 bg-black/30 rounded-lg border border-white/5" v-if="spot.location">
                        <span class="block text-[0.7rem] text-slate-400 uppercase tracking-wide mb-1">📍 Koordinat</span>
                        <span class="text-xs font-mono text-white font-semibold">
                          {{ spot.location.latitude.toFixed(4) }}, {{ spot.location.longitude.toFixed(4) }}
                        </span>
                    </div>
                </div>

                <div v-if="spot.parking" class="mb-6 p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg flex items-start gap-3">
                    <div class="mt-0.5"><i class="fas fa-parking text-blue-400 text-lg"></i></div>
                    <div>
                        <span class="block text-xs text-blue-300 uppercase font-bold mb-1">Info Parking</span>
                        <span class="text-gray-200 text-sm">{{ spot.parking }}</span>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" v-if="spot.checkpointDetail || spot.tips">
                    
                    <div v-if="spot.checkpointDetail" class="p-4 rounded-xl bg-white/5 border border-white/5">
                        <h4 class="text-orange-400 font-bold mb-2 flex items-center gap-2 text-sm uppercase">
                            <i class="fas fa-map-signs"></i> Info Checkpoint
                        </h4>
                        <p class="text-sm text-gray-300 whitespace-pre-line">{{ spot.checkpointDetail }}</p>
                    </div>

                    <div v-if="spot.tips" class="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                        <h4 class="text-yellow-400 font-bold mb-2 flex items-center gap-2 text-sm uppercase">
                            <i class="fas fa-lightbulb"></i> Tips Pendaki
                        </h4>
                        <p class="text-sm text-gray-300 whitespace-pre-line">{{ spot.tips }}</p>
                    </div>

                </div>

                <div v-if="spot.facilities && spot.facilities.length > 0" class="mb-6">
                    <h4 class="text-sm font-bold text-gray-400 mb-3 uppercase flex items-center gap-2">
                        <i class="fas fa-concierge-bell"></i> Fasiliti Disediakan
                    </h4>
                    <div class="flex flex-wrap gap-2">
                        <span v-for="fac in spot.facilities" :key="fac" class="px-3 py-1.5 bg-green-900/30 text-green-300 text-xs font-bold rounded-lg border border-green-500/20 flex items-center gap-2">
                            <i class="fas fa-check"></i> {{ fac }}
                        </span>
                    </div>
                </div>

                <div class="mt-8 pt-6 border-t border-white/10 flex justify-between items-center flex-wrap gap-4">
                    <div class="flex items-center gap-2">
                        <span class="text-gray-500 text-sm">{{ t('spotDetail.contributedBy') }}</span>
                        <div class="cursor-pointer hover:opacity-80 transition" @click="goToProfile(spot.contributorId)">
                           <AuthorBadge :userId="spot.contributorId" :fallbackName="spot.contributorName" />
                        </div>
                    </div>
                    <button class="text-blue-400 hover:text-blue-300 text-sm underline flex items-center gap-1 bg-transparent border-none cursor-pointer" @click="showHistory = true">
                        📜 {{ t('spotDetail.viewHistory') }}
                    </button>
                </div>
                <p v-if="spot.lastEditedBy" class="text-xs text-gray-600 mt-2">
                    🔄 {{ t('spotDetail.lastUpdatedBy') }}: <strong class="text-gray-500">{{ spot.lastEditedBy }}</strong>
                </p>
            </div>

            <!-- Reviews Component -->
            <SpotReviews :spotId="spotId" :isAdmin="isAdmin" />

        </div>

        <div class="space-y-6">
            
            <!-- Suggestions & Admin Actions -->
            <SpotSuggestions 
                :spotId="spotId" 
                :spot="spot" 
                :isAdmin="isAdmin" 
                :isOwner="isOwner" 
            />

            <!-- Navigation Box -->
            <div class="bg-[#0f172a]/75 border border-white/10 rounded-[20px] backdrop-blur-md shadow-xl p-5">
                <h3 class="font-bold text-white mb-2">{{ t('spotDetail.navigation') }}</h3>
                <a :href="spot.mapsLink" target="_blank" class="flex items-center justify-center gap-2 w-full py-2 bg-blue-700/80 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition mb-2 no-underline">
                    🚗 📍 Trailhead (Google Maps)
                </a>
                
                <a v-if="spot.location" 
                   :href="`https://www.google.com/maps/search/?api=1&query=${spot.location.latitude},${spot.location.longitude}`" 
                   target="_blank" 
                   class="flex items-center justify-center gap-2 w-full py-2 bg-green-700/80 hover:bg-green-600 text-white rounded-lg text-sm font-bold transition no-underline">
                    📍 Koordinat (Map)
                </a>
            </div>

        </div>
      </div>
    </div>

    <!-- History Modal -->
    <SpotHistory v-model:visible="showHistory" :spotId="spotId" />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'; 
import { auth, db } from '../firebaseConfig';
import { doc, addDoc, collection, serverTimestamp, getDoc } from 'firebase/firestore'; 
import AuthorBadge from '../components/common/AuthorBadge.vue'; 
import TripCard from '../components/trip/TripCard.vue';
import SpotGallery from '../components/spots/SpotGallery.vue';
import SpotMap from '../components/spots/SpotMap.vue';
import SpotReviews from '../components/spots/SpotReviews.vue';
import SpotSuggestions from '../components/spots/SpotSuggestions.vue';
import SpotHistory from '../components/spots/SpotHistory.vue';
import { useSpots } from '../composables/useSpots';

const { t, locale } = useI18n(); 
const route = useRoute();
const router = useRouter(); 
const spotId = route.params.id as string;

const { fetchSpotById, fetchRelatedTrips, translateDescription, loading } = useSpots();

const spot = ref<any>(null);
const isAdmin = ref(false);
const isOwner = ref(false); 
const showHistory = ref(false);
const translatedDesc = ref('');
const showingTranslation = ref(false);
const translating = ref(false);
const translationError = ref('');

const relatedTrips = ref<any[]>([]); 

const allImages = computed(() => {
  if (!spot.value) return [];
  let imgs = spot.value.images && Array.isArray(spot.value.images) ? [...spot.value.images] : [];
  if (imgs.length === 0 && spot.value.image) imgs.push(spot.value.image);
  return [...new Set(imgs)].filter(url => url && url.length > 5);
});

const displayImages = computed(() => {
  const imgs = [...allImages.value];
  if (imgs.length === 0) return new Array(5).fill('https://via.placeholder.com/800x600?text=No+Image');
  while (imgs.length < 5) imgs.push(imgs[0]); 
  return imgs;
});

const toggleTranslation = async () => {
  if (showingTranslation.value) { showingTranslation.value = false; return; }
  if (translatedDesc.value) { showingTranslation.value = true; return; }
  if (!spot.value.description) return;
  translating.value = true; translationError.value = '';
  try {
      const text = await translateDescription(spot.value.description, locale.value);
      translatedDesc.value = text;
      showingTranslation.value = true;
  } catch (e) { 
      console.error(e); 
      translationError.value = t('spotDetail.translationError'); 
  } finally { 
      translating.value = false; 
  }
};

const getLevelLabel = (level: string) => { if (!level) return ''; const key = level.toLowerCase(); return t(`components.${key}`) !== `components.${key}` ? t(`components.${key}`) : level; };

const getGuideLabel = (val: string) => { 
    const labels: any = {
       'Yes': t('createSpot.guideYes') !== 'createSpot.guideYes' ? t('createSpot.guideYes') : 'Wajib',
       'Optional': t('createSpot.guideOptional') !== 'createSpot.guideOptional' ? t('createSpot.guideOptional') : 'Pilihan',
       'No': t('createSpot.guideNo') !== 'createSpot.guideNo' ? t('createSpot.guideNo') : 'Tidak Perlu'
    };
    return labels[val] || val || 'Tidak Perlu';
};

const goToProfile = (userId: string) => { if (userId) router.push(`/user/${userId}`); };

const handleReport = async () => { 
    if (!auth.currentUser) return alert(t('common.loginToReport')); 
    const reason = prompt(t('spotDetail.reportReasonPrompt')); 
    if (reason) { 
        await addDoc(collection(db, "reports"), { targetId: spotId, targetType: 'spot', reason: reason, reportedBy: auth.currentUser.uid, createdAt: serverTimestamp() }); 
        alert(t('spotDetail.reportSuccess')); 
    } 
};

onMounted(async () => {
  try {
    const data = await fetchSpotById(spotId);
    if(data) {
        spot.value = data;
        if (auth.currentUser && spot.value.contributorId === auth.currentUser.uid) {
            isOwner.value = true;
        }
    }
    
    relatedTrips.value = await fetchRelatedTrips(spotId);

    // Check Admin (Ideally this should also be a composable or global state)
    if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') isAdmin.value = true;
    }
    
  } catch (e) { console.error(e); } 
});
</script>