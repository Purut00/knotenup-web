<template>
  <div class="spot-detail-page">
    
    <!-- BACKGROUND LAYERS -->
    <div class="contour-lines"></div>
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <!-- MAIN CONTAINER (Padding 120px) -->
    <div class="content-container" style="padding-top: 120px; padding-bottom: 4rem;">
      
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Sedang memuatkan...</p>
      </div>

      <div v-else-if="spot" class="fade-up">
        
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
            <button class="btn-show-all" @click="openLightbox(0)">
              <i class="fas fa-images mr-2"></i> {{ t('spotDetail.viewPhotos') || 'Lihat Gambar' }}
            </button>
            <div class="gallery-title-overlay">
              <span class="badge-cat"><i class="fas fa-map-marker-alt mr-1"></i> {{ spot.state }}</span>
              <h1>{{ spot.name }}</h1>
              <div class="hero-meta">
                <span><i class="fas fa-mountain text-green-400"></i> {{ spot.height }}m</span>
                <span v-if="spot.difficulty" class="ml-4">
                  <i class="fas fa-tachometer-alt text-yellow-400"></i> {{ getLevelLabel(spot.difficulty) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Mobile Swiper -->
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
              <span class="badge-cat">{{ spot.state }}</span>
              <h1>{{ spot.name }}</h1>
              <div class="hero-meta-mobile">
                 <span>🏔️ {{ spot.height }}m</span>
              </div>
            </div>
          </div>
        </div>

        <!-- MAIN LAYOUT -->
        <div class="main-layout">
          
          <!-- LEFT CONTENT -->
          <div class="left-content">
            
            <!-- Description & Info -->
            <div class="glass-panel mb-6">
              <div class="header-row">
                 <h3><i class="fas fa-info-circle text-purple-400 mr-2"></i> {{ t('spotDetail.locationInfo') || 'Info Lokasi' }}</h3>
                 
                 <div class="header-actions">
                   <button class="btn-translate" @click="toggleTranslation" :disabled="translating">
                      <span v-if="translating">⏳...</span>
                      <span v-else>
                        {{ showingTranslation ? t('spotDetail.original') : t('spotDetail.translate') }}
                      </span>
                   </button>
                   <button class="btn-flag" @click="reportSpot" title="Report">🚩</button>
                 </div>
              </div>

              <!-- Rating Badge -->
              <div class="avg-rating mb-4" v-if="reviews.length > 0">
                 ⭐ {{ averageRating }} <small class="text-gray-400">({{ reviews.length }} reviews)</small>
              </div>

              <p class="desc-text">
                {{ showingTranslation ? translatedDesc : spot.description }}
              </p>
              <p v-if="translationError" class="trans-error"><small>⚠️ {{ t('spotDetail.translationError') }}</small></p>
              
              <!-- Key Info Grid -->
              <div class="info-grid-2 mt-6">
                 <div class="info-box" v-if="spot.via">
                    <span class="label">Laluan Masuk (Via)</span>
                    <strong>{{ spot.via }}</strong>
                 </div>
                 <div class="info-box">
                    <span class="label">Keperluan Guide</span>
                    <span :class="{'text-red-400': spot.guideRequired === 'Yes', 'text-green-400': spot.guideRequired === 'No'}">
                       {{ getGuideLabel(spot.guideRequired) }}
                    </span>
                 </div>
              </div>

              <!-- Permit Alerts -->
              <div class="permit-alert glass-alert mt-4" v-if="spot.permit && spot.permit !== 'Tidak Perlu' && spot.permit !== 'No'">
                 <i class="fas fa-exclamation-triangle text-orange-400 mr-2"></i>
                 <span><strong>{{ t('spotDetail.permitRequired') }}</strong> {{ spot.permit }}</span>
              </div>
              <div class="free-alert glass-alert mt-4" v-else>
                 <i class="fas fa-check-circle text-green-400 mr-2"></i>
                 <span><strong>{{ t('spotDetail.free') }}</strong> {{ t('spotDetail.noPermitNeeded') }}</span>
              </div>
            </div>
            
            <!-- Contributor Info -->
            <div class="glass-panel organizer-card mb-6">
               <div class="flex items-center justify-between">
                  <div>
                     <span class="label mb-2 block">{{ t('spotDetail.contributedBy') }}</span>
                     <div @click="goToProfile(spot.contributorId)" class="cursor-pointer">
                        <AuthorBadge :userId="spot.contributorId" :fallbackName="spot.contributorName" />
                     </div>
                  </div>
                  <button class="btn-text-action" @click="showHistory = true">
                    <i class="fas fa-history mr-1"></i> {{ t('spotDetail.viewHistory') }}
                  </button>
               </div>
               <p v-if="spot.lastEditedBy" class="text-xs text-gray-500 mt-3 border-t border-gray-700 pt-2">
                  🔄 Updated by: <strong class="text-gray-300">{{ spot.lastEditedBy }}</strong>
               </p>
            </div>

            <!-- Review Section -->
            <div class="glass-panel">
              <h3><i class="fas fa-comments text-yellow-400 mr-2"></i> {{ t('spotDetail.reviewsTitle') }}</h3>
              
              <div class="review-form glass-inset" v-if="auth.currentUser">
                 <div class="star-input">
                    <span v-for="n in 5" :key="n" @click="newRating = n" :class="{ filled: n <= newRating }">★</span>
                 </div>
                 <textarea v-model="newReviewText" class="glass-input" :placeholder="t('spotDetail.shareExperiencePlaceholder')"></textarea>
                 <button @click="submitReview" :disabled="!newReviewText || newRating === 0" class="btn-submit">
                    {{ t('spotDetail.submitReview') }}
                 </button>
              </div>
              <div v-else class="login-alert glass-inset text-center">
                 🔒 {{ t('spotDetail.loginToReview') }}
              </div>
              
              <div class="review-list mt-6">
                 <div v-for="review in sortedReviews" :key="review.id" class="review-item">
                    <div class="review-header" @click="goToProfile(review.userId)">
                        <AuthorBadge :userId="review.userId" :fallbackName="review.userName" :fallbackAvatar="review.userAvatar">
                            <template #subtext><span class="review-date">{{ formatDate(review.createdAt) }}</span></template>
                        </AuthorBadge>
                        <div class="review-stars"><span v-for="n in 5" :key="n" :class="{ filled: n <= review.rating }">★</span></div>
                    </div>
                    <p class="review-text">{{ review.text }}</p>
                    <div class="review-footer">
                        <div class="vote-pill">
                            <button class="vote-btn up" @click="voteReview(review, 1)">▲</button>
                            <span class="vote-count" :class="{ positive: (review.votes||0)>0 }">{{ review.votes || 0 }}</span>
                            <button class="vote-btn down" @click="voteReview(review, -1)">▼</button>
                        </div>
                        <button v-if="(auth.currentUser && auth.currentUser.uid === review.userId) || isAdmin" @click="deleteReview(review.id)" class="btn-delete-text">
                           🗑️ {{ t('common.delete') }}
                        </button>
                    </div>
                 </div>
                 <p v-if="reviews.length === 0" class="text-center text-gray-500 italic py-4">{{ t('spotDetail.noReviews') }}</p>
              </div>
            </div>

          </div>

          <!-- RIGHT SIDEBAR (Sticky) -->
          <div class="right-sidebar">
            
            <!-- Pending Updates (If any) -->
            <div class="glass-panel border-orange mb-6" v-if="suggestions.length > 0">
               <div class="update-header text-orange-400 font-bold mb-3 border-b border-orange-400/30 pb-2">
                 🚧 {{ t('spotDetail.pendingUpdates') }}
               </div>
               <div v-for="sugg in suggestions" :key="sugg.id" class="suggestion-card glass-inset mb-3">
                  <p class="text-xs text-gray-400 mb-2">By: {{ sugg.suggestedBy }}</p>
                  <div class="progress-bar">
                    <div class="progress-fill bg-green-500" :style="{ width: (sugg.votes / 5) * 100 + '%' }"></div>
                    <div class="progress-fill bg-red-500" :style="{ width: ((sugg.rejectVotes || 0) / 5) * 100 + '%' }"></div>
                  </div>
                  <div class="flex justify-between mt-2">
                     <span class="text-xs">✅ {{ sugg.votes || 0 }} / ❌ {{ sugg.rejectVotes || 0 }}</span>
                     <button @click="openCheckModal(sugg)" class="text-xs bg-blue-600 px-2 py-1 rounded">Verify</button>
                  </div>
               </div>
            </div>

            <!-- Map Card (GPX) -->
            <div class="glass-panel mb-6" v-if="spot.gpxUrl">
               <h3><i class="fas fa-map text-blue-400 mr-2"></i> {{ t('spotDetail.trailMapGpx') }}</h3>
               <div class="gpx-stats glass-inset p-3 mb-3 rounded-lg" v-if="gpxData.distance !== '0.00'">
                  <div class="flex justify-between mb-2">
                     <div class="text-center"><span class="label block">Jarak</span><strong class="text-white">{{ gpxData.distance }} km</strong></div>
                     <div class="text-center"><span class="label block">Masa</span><strong class="text-white">{{ gpxData.movingTime }}</strong></div>
                  </div>
                  <div class="h-px bg-white/10 my-2"></div>
                  <div class="flex justify-between">
                     <div class="text-center"><span class="label block">EG</span><strong class="text-green-400">+{{ gpxData.elevationGain }}m</strong></div>
                     <div class="text-center"><span class="label block">Max</span><strong class="text-white">{{ gpxData.maxElevation }}m</strong></div>
                  </div>
               </div>
               <div id="gpx-map" class="gpx-map-container"></div>
               <a :href="spot.gpxUrl" download class="btn-action w-full mt-3 block text-center">
                 <i class="fas fa-download mr-2"></i> {{ t('spotDetail.downloadGpx') }}
               </a>
            </div>

            <!-- Basic Map / No GPX -->
            <div class="glass-panel mb-6" v-else>
               <h3><i class="fas fa-map-marker-alt text-red-400 mr-2"></i> {{ t('spotDetail.mapLocation') }}</h3>
               <p class="text-center text-gray-500 italic py-4">{{ t('spotDetail.noGpx') }}</p>
            </div>

            <!-- Navigation -->
            <div class="glass-panel mb-6">
               <h3><i class="fas fa-directions text-green-400 mr-2"></i> {{ t('spotDetail.navigation') }}</h3>
               <p class="text-sm text-gray-400 mb-4">{{ t('spotDetail.mapDesc') }}</p>
               <a :href="spot.mapsLink" target="_blank" class="btn-waze w-full block text-center">
                 <i class="fab fa-waze mr-2"></i> {{ t('spotDetail.openMap') }}
               </a>
            </div>

            <!-- Edit Button -->
            <div class="edit-btn-wrapper">
               <button 
                 class="btn-edit w-full" 
                 :class="{ 'opacity-50 cursor-not-allowed': suggestions.length > 0 }"
                 :disabled="suggestions.length > 0"
                 @click="$router.push('/spots/edit/' + route.params.id)"
               >
                 <i class="fas fa-edit mr-2"></i> 
                 {{ suggestions.length > 0 ? t('spotDetail.pendingVerification') : t('spotDetail.editSpot') }}
               </button>
               <p v-if="suggestions.length > 0" class="text-center text-xs text-red-400 mt-2">
                 {{ t('spotDetail.editLockedMsg') }}
               </p>
            </div>

          </div>

        </div>
      </div>

      <div v-else class="error-container glass-panel">
        <h2 class="text-white">Lokasi Tidak Dijumpai 😔</h2>
        <button @click="$router.push('/spots')" class="btn-back">Kembali ke Senarai</button>
      </div>

      <VueEasyLightbox :visible="visibleRef" :imgs="displayImages" :index="indexRef" @hide="onHide" />

      <!-- MODALS (Diff & History) -->
      <!-- Diff Modal -->
      <div v-if="showDiffModal && selectedSugg" class="modal-overlay">
         <div class="glass-modal">
           <h3 class="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">🔍 Semakan Perubahan</h3>
           <p class="text-gray-400 mb-4 text-sm">{{ t('spotDetail.diffInstructions') }}</p>
           
           <div class="diff-table-wrapper custom-scrollbar">
              <table class="w-full text-sm text-left text-gray-300">
                 <thead class="text-xs text-gray-400 uppercase bg-gray-700/50">
                    <tr><th class="px-4 py-2">Info</th><th class="px-4 py-2">Asal</th><th class="px-4 py-2">Cadangan</th></tr>
                 </thead>
                 <tbody>
                    <tr v-for="key in compareKeys" :key="key.field" class="border-b border-gray-700">
                       <td class="px-4 py-2 font-medium">{{ key.label }}</td>
                       <td class="px-4 py-2 text-red-300 line-through decoration-red-500/50">
                          <img v-if="key.field === 'image' && spot.image" :src="spot.image" class="w-16 h-12 object-cover rounded" />
                          <span v-else>{{ spot[key.field] || '-' }}</span>
                       </td>
                       <td class="px-4 py-2" :class="{'bg-green-900/20 text-green-300': spot[key.field] != selectedSugg[key.field]}">
                          <img v-if="key.field === 'image' && selectedSugg.image" :src="selectedSugg.image" class="w-16 h-12 object-cover rounded" />
                          <span v-else>{{ selectedSugg[key.field] || '-' }}</span>
                       </td>
                    </tr>
                 </tbody>
              </table>
           </div>

           <div class="flex justify-between mt-6 pt-4 border-t border-gray-700">
              <button class="btn-text-action" @click="showDiffModal = false">Tutup</button>
              <div class="flex gap-3">
                 <button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition" @click="confirmVote(selectedSugg, 'reject')">❌ Tolak</button>
                 <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition" @click="confirmVote(selectedSugg, 'approve')">✅ Sahkan</button>
              </div>
           </div>
         </div>
      </div>

      <!-- History Modal -->
      <div v-if="showHistory" class="modal-overlay" @click.self="showHistory = false">
         <div class="glass-modal">
            <div class="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
               <h3 class="text-xl font-bold text-white">📜 Sejarah Kemaskini</h3>
               <button class="text-gray-400 hover:text-white" @click="showHistory = false">✖</button>
            </div>
            <div class="history-list custom-scrollbar max-h-[60vh] overflow-y-auto">
               <div v-for="log in historyLogs" :key="log.id" class="border-l-2 border-purple-500 pl-4 mb-4">
                  <div class="flex justify-between items-baseline">
                     <strong class="text-white">{{ log.editorName }}</strong>
                     <span class="text-xs text-gray-500">{{ formatDate(log.timestamp) }}</span>
                  </div>
                  <p class="text-sm text-gray-400 mt-1">Mengemaskini maklumat lokasi.</p>
               </div>
               <p v-if="historyLogs.length === 0" class="text-center text-gray-500 italic">Tiada sejarah rekod.</p>
            </div>
         </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'; 
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import AuthorBadge from '../components/common/AuthorBadge.vue'; 
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-gpx';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { isSpam } from '../utils/spamFilter';
import { checkRateLimit } from '../utils/rateLimiter';

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

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const { t, locale } = useI18n(); 
const route = useRoute();
const router = useRouter(); 
const spotId = route.params.id as string;

const spot = ref<any>(null);
const loading = ref(true);
const isAdmin = ref(false);
let mapInstance: any = null;
const reviews = ref<any[]>([]);
const newReviewText = ref('');
const newRating = ref(0);
const suggestions = ref<any[]>([]);
const historyLogs = ref<any[]>([]);
const showDiffModal = ref(false);
const showHistory = ref(false);
const selectedSugg = ref<any>(null);
const visibleRef = ref(false);
const indexRef = ref(0);
const translatedDesc = ref('');
const showingTranslation = ref(false);
const translating = ref(false);
const translationError = ref('');
const gpxData = reactive({ distance: '0.00', elevationGain: '0', elevationLoss: '0', maxElevation: '0', minElevation: '0', movingTime: '-' });
const ADMIN_EMAILS = ["knotenup@gmail.com", "admin@knotenup.com"];

const compareKeys = computed(() => [
   { field: 'image', label: t('spotDetail.fieldImage') },
   { field: 'via', label: t('spotDetail.fieldVia') },
   { field: 'height', label: t('spotDetail.fieldHeight') },
   { field: 'difficulty', label: t('spotDetail.fieldDifficulty') },
   { field: 'permit', label: t('spotDetail.fieldPermit') },
   { field: 'guideRequired', label: t('spotDetail.fieldGuide') },
   { field: 'description', label: t('spotDetail.fieldDesc') },
   { field: 'mapsLink', label: t('spotDetail.fieldMaps') }
]);

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

const openLightbox = (index: number) => { indexRef.value = index; visibleRef.value = true; };
const onHide = () => { visibleRef.value = false; };

const toggleTranslation = async () => {
  if (showingTranslation.value) { showingTranslation.value = false; return; }
  if (translatedDesc.value) { showingTranslation.value = true; return; }
  if (!spot.value.description) return;
  translating.value = true; translationError.value = '';
  try {
     const targetLang = locale.value === 'ms' ? 'ms' : 'en'; 
     const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(spot.value.description)}&langpair=Autodetect|${targetLang}`);
     const data = await response.json();
     if (data.responseData && data.responseData.translatedText) {
        translatedDesc.value = data.responseData.translatedText;
        showingTranslation.value = true;
     } else { throw new Error("Translation failed"); }
  } catch (e) { console.error(e); translationError.value = t('spotDetail.translationError'); } 
  finally { translating.value = false; }
};

const getLevelLabel = (level: string) => { if (!level) return ''; const key = level.toLowerCase(); return t(`components.${key}`) !== `components.${key}` ? t(`components.${key}`) : level; };
const getGuideLabel = (val: string) => { 
   if(val === 'Yes') return t('createSpot.guideYes') || 'Wajib';
   if(val === 'Optional') return t('createSpot.guideOptional') || 'Pilihan';
   return t('createSpot.guideNo') || 'Tidak Perlu';
};
const formatTime = (ms: number) => { if (!ms || ms === 0) return '-'; const totalSeconds = ms / 1000; const hours = Math.floor(totalSeconds / 3600); const minutes = Math.floor((totalSeconds % 3600) / 60); if (hours > 0) return `${hours}j ${minutes}m`; return `${minutes} min`; };
const formatDate = (timestamp: any) => { if (!timestamp) return ''; return new Date(timestamp.seconds * 1000).toLocaleDateString("en-MY", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' }); };
const averageRating = computed(() => { if (reviews.value.length === 0) return 0; const total = reviews.value.reduce((acc, curr) => acc + (curr.rating || 0), 0); return (total / reviews.value.length).toFixed(1); });
const sortedReviews = computed(() => { return [...reviews.value].sort((a, b) => (b.votes || 0) - (a.votes || 0)); });
const goToProfile = (userId: string) => { if (userId) router.push(`/user/${userId}`); };

const openCheckModal = (sugg: any) => { selectedSugg.value = sugg; showDiffModal.value = true; };

const finalizeUpdate = async (sugg: any, forceAdmin = false) => {
   const cleanedData = { ...sugg };
   delete cleanedData.id; delete cleanedData.votes; delete cleanedData.rejectVotes; delete cleanedData.verifiedUsers; delete cleanedData.votedUsers; delete cleanedData.createdAt; delete cleanedData.suggestedBy; delete cleanedData.suggestedById;
   const editorName = forceAdmin ? (sugg.suggestedBy + " (Admin Approved)") : sugg.suggestedBy;
   await updateDoc(doc(db, "spots", spotId), { ...cleanedData, lastEditedBy: editorName, lastEditedAt: serverTimestamp() });
   await addDoc(collection(db, "spots", spotId, "history"), { editorName: editorName, editorId: sugg.suggestedById, timestamp: serverTimestamp(), type: 'update' });
   await deleteDoc(doc(db, "spots", spotId, "suggestions", sugg.id));
   alert(t('spotDetail.infoUpdatedAlert')); window.location.reload();
};

const rejectSuggestion = async (suggId: string) => { await deleteDoc(doc(db, "spots", spotId, "suggestions", suggId)); alert(t('spotDetail.suggestionCancelledAlert')); showDiffModal.value = false; };

const confirmVote = async (sugg: any, voteType: 'approve' | 'reject') => {
  if (!auth.currentUser) return alert(t('common.pleaseLogin'));
  const hasVoted = (sugg.votedUsers && sugg.votedUsers.includes(auth.currentUser.uid)) || (sugg.verifiedUsers && sugg.verifiedUsers.includes(auth.currentUser.uid));
  if (hasVoted) return alert(t('spotDetail.alreadyVotedAlert'));
  const suggRef = doc(db, "spots", spotId, "suggestions", sugg.id);
  if (voteType === 'approve') {
      const newVotes = (sugg.votes || 0) + 1;
      if (newVotes >= 5) { await finalizeUpdate(sugg, false); } 
      else { await updateDoc(suggRef, { votes: increment(1), votedUsers: arrayUnion(auth.currentUser.uid) }); alert(t('spotDetail.voteApprovedAlert')); showDiffModal.value = false; }
  } else {
      const newRejectVotes = (sugg.rejectVotes || 0) + 1;
      if (newRejectVotes >= 5) { await rejectSuggestion(sugg.id); } 
      else { await updateDoc(suggRef, { rejectVotes: increment(1), votedUsers: arrayUnion(auth.currentUser.uid) }); alert(t('spotDetail.voteRejectedAlert')); showDiffModal.value = false; }
  }
};

const adminReject = async (sugg: any) => { if(!confirm(t('spotDetail.forceRejectConfirm'))) return; await deleteDoc(doc(db, "spots", spotId, "suggestions", sugg.id)); alert(t('spotDetail.suggestionRejectedAlert')); };
const reportSpot = async () => { if (!auth.currentUser) return alert(t('common.loginToReport')); const reason = prompt(t('spotDetail.reportReasonPrompt')); if (reason) { await addDoc(collection(db, "reports"), { targetId: spotId, targetType: 'spot', reason: reason, reportedBy: auth.currentUser.uid, createdAt: serverTimestamp() }); alert(t('spotDetail.reportSuccess')); } };

// 🔥 SECURITY FIX: Spam & Rate Limit for Reviews 🔥
const submitReview = async () => { 
    if (!auth.currentUser) return alert(t('common.pleaseLogin')); 
    if (newRating.value === 0) return alert(t('spotDetail.pleaseRate')); 
    const limitCheck = checkRateLimit('submit_review');
    if (!limitCheck.allowed) return alert(limitCheck.message);
    if (isSpam(newReviewText.value)) return alert("Maaf, ulasan mengandungi perkataan dilarang.");

    try { 
        await addDoc(collection(db, "spots", spotId, "reviews"), { 
            text: newReviewText.value, rating: newRating.value, userId: auth.currentUser.uid, userName: auth.currentUser.displayName || 'User', 
            userAvatar: auth.currentUser.photoURL || '', createdAt: serverTimestamp(), votes: 0, votedUsers: [] 
        }); 
        newReviewText.value = ''; newRating.value = 0; 
    } catch (e) { console.error(e); } 
};

const voteReview = async (review: any, val: number) => { 
    if (!auth.currentUser) return alert(t('common.pleaseLogin')); 
    const uid = auth.currentUser.uid;
    if (review.votedUsers && review.votedUsers.includes(uid)) return alert("Sudah undi.");
    try { await updateDoc(doc(db, "spots", spotId, "reviews", review.id), { votes: increment(val), votedUsers: arrayUnion(uid) }); } catch (e) { console.error(e); }
};

const deleteReview = async (reviewId: string) => { if (!confirm(t('common.confirmDelete'))) return; try { await deleteDoc(doc(db, "spots", spotId, "reviews", reviewId)); } catch (e) { alert(t('common.failed')); } };

const initMap = () => { if (!spot.value.gpxUrl) return; nextTick(() => { const mapElement = document.getElementById('gpx-map'); if (!mapElement) return; if (mapInstance) { mapInstance.remove(); mapInstance = null; } mapInstance = L.map('gpx-map', { scrollWheelZoom: false }).setView([4.2105, 101.9758], 6); L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '&copy; OSM &copy; CARTO', maxZoom: 19 }).addTo(mapInstance); setTimeout(() => { if(mapInstance) mapInstance.invalidateSize(); }, 300); new (L as any).GPX(spot.value.gpxUrl, { async: true, marker_options: { startIconUrl: 'https://raw.githubusercontent.com/mpetazzoni/leaflet-gpx/master/pin-icon-start.png', endIconUrl: 'https://raw.githubusercontent.com/mpetazzoni/leaflet-gpx/master/pin-icon-end.png', shadowUrl: 'https://raw.githubusercontent.com/mpetazzoni/leaflet-gpx/master/pin-shadow.png' }, polyline_options: { color: '#e67e22', opacity: 0.8, weight: 5, lineCap: 'round' } }).on('loaded', function(e: any) { if(mapInstance) { mapInstance.fitBounds(e.target.getBounds()); setTimeout(() => { mapInstance.invalidateSize(); }, 200); const gpx = e.target; gpxData.distance = (gpx.get_distance() / 1000).toFixed(2); gpxData.elevationGain = gpx.get_elevation_gain().toFixed(0); gpxData.elevationLoss = gpx.get_elevation_loss().toFixed(0); gpxData.maxElevation = gpx.get_elevation_max().toFixed(0); gpxData.minElevation = gpx.get_elevation_min().toFixed(0); gpxData.movingTime = formatTime(gpx.get_moving_time()); } }).addTo(mapInstance); }); };

onMounted(async () => {
  try {
    const docSnap = await getDoc(doc(db, "spots", spotId));
    if (docSnap.exists()) { spot.value = docSnap.data(); if (spot.value.gpxUrl) setTimeout(() => initMap(), 100); }
    if (auth.currentUser && ADMIN_EMAILS.includes(auth.currentUser.email!)) isAdmin.value = true;
    onSnapshot(query(collection(db, "spots", spotId, "reviews"), orderBy("createdAt", "desc")), (snap) => { reviews.value = snap.docs.map(d => ({ id: d.id, ...d.data() })); });
    onSnapshot(query(collection(db, "spots", spotId, "suggestions")), (snap) => { suggestions.value = snap.docs.map(d => ({ id: d.id, ...d.data() })); });
    onSnapshot(query(collection(db, "spots", spotId, "history"), orderBy("timestamp", "desc")), (snap) => { historyLogs.value = snap.docs.map(d => ({ id: d.id, ...d.data() })); });
  } catch (e) { console.error(e); } finally { loading.value = false; }
});
onUnmounted(() => { if (mapInstance) { mapInstance.remove(); mapInstance = null; } });
</script>

<style scoped>
/* --- BASE THEME (DARK GLASS) --- */
.spot-detail-page { 
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

/* --- HERO GALLERY (BENTO GRID) --- */
.hero-gallery-wrapper { position: relative; margin-bottom: 2rem; }

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
  background: rgba(255, 255, 255, 0.05);
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

.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; }
.header-row h3 { border: none; margin: 0; padding: 0; }
.header-actions { display: flex; gap: 10px; }

/* Buttons */
.btn-translate { background: rgba(255,255,255,0.1); border: none; padding: 5px 12px; border-radius: 20px; cursor: pointer; color: #ccc; font-size: 0.8rem; }
.btn-translate:hover { background: rgba(255,255,255,0.2); color: white; }
.btn-flag { background: none; border: none; font-size: 1.2rem; cursor: pointer; opacity: 0.5; }
.btn-flag:hover { opacity: 1; }

.avg-rating { background: rgba(251, 191, 36, 0.1); padding: 5px 10px; border-radius: 20px; font-weight: bold; color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.3); }

/* Alerts */
.glass-alert { padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); }
.permit-alert { background: rgba(234, 88, 12, 0.1); color: #fb923c; border-color: rgba(234, 88, 12, 0.3); }
.free-alert { background: rgba(22, 163, 74, 0.1); color: #4ade80; border-color: rgba(22, 163, 74, 0.3); }

/* Organizer Card */
.organizer-card { display: flex; align-items: center; justify-content: space-between; }
.btn-text-action { background: none; border: none; color: #6c63ff; cursor: pointer; font-size: 0.85rem; }
.btn-text-action:hover { color: #a78bfa; text-decoration: underline; }

/* Review Section */
.glass-inset { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 12px; }
.star-input { font-size: 1.5rem; color: #555; cursor: pointer; margin-bottom: 10px; }
.star-input span.filled { color: #fbbf24; }
.glass-input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: white; outline: none; }
.btn-submit { margin-top: 10px; padding: 8px 20px; background: #6c63ff; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-submit:hover { background: #5b54e0; }
.btn-submit:disabled { background: #555; cursor: not-allowed; }

.review-item { border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; margin-bottom: 1rem; }
.review-header { display: flex; justify-content: space-between; cursor: pointer; }
.review-text { color: #cbd5e1; line-height: 1.5; margin: 8px 0; }
.review-stars { color: #fbbf24; }
.review-date { font-size: 0.7rem; color: #94a3b8; margin-left: 8px; }

.vote-pill { background: rgba(255,255,255,0.1); border-radius: 20px; padding: 2px 8px; display: inline-flex; align-items: center; }
.vote-btn { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; }
.vote-btn:hover { color: white; }
.vote-count { font-weight: bold; margin: 0 8px; font-size: 0.8rem; }
.vote-count.positive { color: #fbbf24; }
.btn-delete-text { color: #ef4444; background: none; border: none; font-size: 0.8rem; cursor: pointer; margin-left: auto; }

/* --- RIGHT SIDEBAR --- */
.right-sidebar { position: sticky; top: 120px; height: fit-content; }

/* Suggestions */
.border-orange { border: 1px solid rgba(251, 146, 60, 0.3); background: rgba(251, 146, 60, 0.05); }
.progress-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; display: flex; }
.progress-fill { height: 100%; transition: width 0.3s; }

/* GPX Stats */
.gpx-stats { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
.gpx-map-container { height: 250px; width: 100%; background: #1e293b; border-radius: 12px; overflow: hidden; position: relative; z-index: 1; }

.btn-action { display: block; padding: 12px; background: #2c3e50; color: white; text-align: center; border-radius: 8px; font-weight: bold; transition: 0.2s; }
.btn-action:hover { background: #34495e; }

.btn-waze { background: #3498db; color: white; padding: 12px; border-radius: 8px; font-weight: bold; display: block; text-align: center; transition: 0.2s; }
.btn-waze:hover { background: #2980b9; }

.btn-edit { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: white; padding: 10px; border-radius: 8px; width: 100%; cursor: pointer; transition: 0.2s; }
.btn-edit:hover { background: rgba(255,255,255,0.1); border-color: white; }

/* MODALS */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; justify-content: center; align-items: center; padding: 1rem; backdrop-filter: blur(5px); }
.glass-modal { background: rgba(30, 41, 59, 0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 2rem; width: 100%; max-width: 600px; max-height: 85vh; display: flex; flex-direction: column; }
.custom-scrollbar { overflow-y: auto; padding-right: 5px; }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #6c63ff; border-radius: 5px; }

/* Utils */
.loading-container, .error-container { text-align: center; padding: 5rem; color: #94a3b8; }
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
  .right-sidebar { order: -1; position: static; }
}
</style>