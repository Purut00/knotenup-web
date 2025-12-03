<template>
  <div class="spot-detail-page">
    <div v-if="loading" class="loading">⏳ {{ t('common.loading') }}</div>
    
    <div v-else-if="spot" class="spot-container">
      
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
            🖼️ {{ t('spotDetail.viewPhotos') }}
          </button>
          
          <div class="gallery-overlay">
            <span class="badge-cat">📍 {{ spot.state }}</span>
            <h1>{{ spot.name }}</h1>
            <div class="hero-meta">
              <span>🏔️ {{ spot.height }}m</span>
              <span v-if="spot.difficulty">💪 {{ getLevelLabel(spot.difficulty) }}</span>
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
            <span class="badge-cat">📍 {{ spot.state }}</span>
            <h1>{{ spot.name }}</h1>
            <div class="hero-meta-mobile">
               <span>🏔️ {{ spot.height }}m</span>
            </div>
          </div>
        </div>
      </div>

      <div class="content-wrapper container">
        
        <div class="main-info">
          
          <div class="info-box">
            <div class="header-row">
               <h3>{{ t('spotDetail.locationInfo') }}</h3>
               <div class="header-actions">
                 <button class="btn-translate" @click="toggleTranslation" :disabled="translating">
                    <span v-if="translating">⏳...</span>
                    <span v-else>
                      {{ showingTranslation ? t('spotDetail.original') : t('spotDetail.translate') }}
                    </span>
                 </button>
                 <button class="btn-flag" @click="reportSpot" title="Report this spot">🚩</button>
               </div>
               <div class="avg-rating" v-if="reviews.length > 0">
                  ⭐ {{ averageRating }} <small>({{ reviews.length }})</small>
               </div>
            </div>

            <p class="desc">
              {{ showingTranslation ? translatedDesc : spot.description }}
            </p>
            <p v-if="translationError" class="trans-error"><small>⚠️ {{ t('spotDetail.translationError') }}</small></p>
            
            <div class="extra-info-grid">
               <div class="info-item" v-if="spot.via">
                  <strong>🛤️ {{ t('spotDetail.via') }}</strong> {{ spot.via }}
               </div>
               <div class="info-item">
                  <strong>👮 {{ t('spotDetail.guideStatus') }}</strong> 
                  <span :class="{'text-red': spot.guideRequired === 'Yes', 'text-green': spot.guideRequired === 'No'}">
                      {{ getGuideLabel(spot.guideRequired) }}
                  </span>
               </div>
            </div>

            <div class="permit-alert" v-if="spot.permit && spot.permit !== 'Tidak Perlu' && spot.permit !== 'No'">
               ⚠️ <strong>{{ t('spotDetail.permitRequired') }}</strong> {{ spot.permit }}
            </div>
            <div class="free-alert" v-else>
               ✅ <strong>{{ t('spotDetail.free') }}</strong> {{ t('spotDetail.noPermitNeeded') }}
            </div>
          </div>
          
          <div class="contributor-box">
              <div class="flex-between">
                 <div>
                    <span class="label-text">{{ t('spotDetail.contributedBy') }}</span>
                    <div class="contributor-badge" @click="goToProfile(spot.contributorId)">
                       <AuthorBadge :userId="spot.contributorId" :fallbackName="spot.contributorName" />
                    </div>
                 </div>
                 
                 <button class="btn-history" @click="showHistory = true">📜 {{ t('spotDetail.viewHistory') }}</button>
              </div>

              <p v-if="spot.lastEditedBy" class="edited-text">
                  🔄 {{ t('spotDetail.lastUpdatedBy') }}: <strong>{{ spot.lastEditedBy }}</strong>
              </p>
          </div>

          <div class="review-section">
            <h3>💬 {{ t('spotDetail.reviewsTitle') }}</h3>
            <div class="review-form" v-if="auth.currentUser">
               <div class="star-input">
                  <span v-for="n in 5" :key="n" @click="newRating = n" :class="{ filled: n <= newRating }">★</span>
               </div>
               <textarea v-model="newReviewText" :placeholder="t('spotDetail.shareExperiencePlaceholder')"></textarea>
               <button @click="submitReview" :disabled="!newReviewText || newRating === 0" class="btn-submit-review">{{ t('spotDetail.submitReview') }}</button>
            </div>
            <div v-else class="login-alert">🔒 {{ t('spotDetail.loginToReview') }}</div>
            
            <div class="review-list">
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
                      <button v-if="(auth.currentUser && auth.currentUser.uid === review.userId) || isAdmin" @click="deleteReview(review.id)" class="btn-delete-review">🗑️ {{ t('common.delete') }}</button>
                  </div>
               </div>
               <p v-if="reviews.length === 0" class="no-reviews">{{ t('spotDetail.noReviews') }}</p>
            </div>
          </div>
        </div>

        <div class="sidebar-info">
          
          <div class="pending-updates-box" v-if="suggestions.length > 0">
              <div class="update-header">🚧 {{ t('spotDetail.pendingUpdates') }}</div>
              <div v-for="sugg in suggestions" :key="sugg.id" class="suggestion-card">
                 <p class="sugg-author">{{ t('spotDetail.suggestedBy') }}: <strong>{{ sugg.suggestedBy }}</strong></p>
                 <div class="progress-bar">
                   <div class="progress-fill" :style="{ width: (sugg.votes / 5) * 100 + '%' }"></div>
                   <div class="progress-fill reject" :style="{ width: ((sugg.rejectVotes || 0) / 5) * 100 + '%' }"></div>
                 </div>
                 <div class="sugg-actions">
                    <span class="vote-stats">
                       <span class="text-green">✅ {{ sugg.votes || 0 }}</span> / 
                       <span class="text-red">❌ {{ sugg.rejectVotes || 0 }}</span>
                    </span>
                    <button @click="openCheckModal(sugg)" class="btn-verify">🔍 {{ t('spotDetail.verifyVote') }}</button>
                 </div>
                 <div v-if="isAdmin" class="admin-bypass-actions">
                    <button class="btn-approve-admin" @click="finalizeUpdate(sugg, true)">⚡ {{ t('spotDetail.force') }}</button>
                    <button class="btn-reject-admin" @click="adminReject(sugg)">✖ {{ t('common.reject') }}</button>
                 </div>
              </div>
          </div>

          <div class="map-card" v-if="spot.gpxUrl">
            <h3>{{ t('spotDetail.trailMapGpx') }}</h3>
            <div class="gpx-stats" v-if="gpxData.distance !== '0.00'">
               <div class="stat-row">
                 <div class="stat-box"><span class="label">📏 {{ t('spotDetail.distance') }}</span><span class="value">{{ gpxData.distance }} <small>km</small></span></div>
                 <div class="stat-box"><span class="label">⏱️ {{ t('spotDetail.time') }}</span><span class="value">{{ gpxData.movingTime }}</span></div>
               </div>
               <div class="divider"></div>
               <div class="stat-row">
                 <div class="stat-box"><span class="label">🔺 {{ t('spotDetail.elevationGain') }}</span><span class="value text-green">+{{ gpxData.elevationGain }}m</span></div>
                 <div class="stat-box"><span class="label">🏔️ {{ t('spotDetail.maxHeight') }}</span><span class="value">{{ gpxData.maxElevation }}m</span></div>
               </div>
            </div>
            <div id="gpx-map" class="gpx-map-container"></div>
            <a :href="spot.gpxUrl" download class="btn-gpx">📥 {{ t('spotDetail.downloadGpx') }}</a>
          </div>

          <div class="map-card" v-else>
              <h3>{{ t('spotDetail.mapLocation') }}</h3>
              <span class="no-gpx">{{ t('spotDetail.noGpx') }}</span>
          </div>

          <div class="map-card nav-card">
            <h3>{{ t('spotDetail.navigation') }}</h3>
            <p>{{ t('spotDetail.mapDesc') }}</p>
            <a :href="spot.mapsLink" target="_blank" class="btn-waze">🗺️ {{ t('spotDetail.openMap') }}</a>
          </div>

          <div class="edit-btn-wrapper">
             <button 
                class="btn-edit-spot" 
                :class="{ 'btn-locked': suggestions.length > 0 }"
                :disabled="suggestions.length > 0"
                @click="$router.push('/spots/edit/' + route.params.id)"
             >
                {{ suggestions.length > 0 ? '🔒 ' + t('spotDetail.pendingVerification') : t('spotDetail.editSpot') }}
             </button>
             <p v-if="suggestions.length > 0" class="lock-hint">
                <small>{{ t('spotDetail.editLockedMsg') }}</small>
             </p>
          </div>

        </div>
      </div>
    </div>

    <div v-else class="empty">{{ t('spotDetail.notFound') }}</div>

    <VueEasyLightbox
      :visible="visibleRef"
      :imgs="displayImages"
      :index="indexRef"
      @hide="onHide"
    />

    <div v-if="showDiffModal && selectedSugg" class="modal-overlay">
       <div class="diff-modal card-modal-wrapper">
         <h3>🔍 {{ t('spotDetail.diffTitle') }}</h3>
         <p>{{ t('spotDetail.diffInstructions') }}</p>
         
         <div class="diff-table-wrapper">
            <table class="diff-table">
               <thead>
                  <tr>
                     <th>{{ t('spotDetail.infoLabel') }}</th>
                     <th>{{ t('spotDetail.current') }}</th>
                     <th>{{ t('spotDetail.newSuggestion') }}</th>
                  </tr>
               </thead>
               <tbody>
                  <tr v-for="key in compareKeys" :key="key.field">
                     <td>{{ key.label }}</td>
                     <td v-if="key.field === 'image'">
                        <img v-if="spot.image" :src="spot.image" class="diff-thumb" />
                        <span v-else>-</span>
                     </td>
                     <td v-else class="old-val">{{ spot[key.field] || '-' }}</td>
                     <td v-if="key.field === 'image'" :class="{'new-val-bg': spot.image != selectedSugg.image}">
                        <img v-if="selectedSugg.image" :src="selectedSugg.image" class="diff-thumb" />
                        <span v-else>-</span>
                     </td>
                     <td v-else :class="{'new-val': spot[key.field] != selectedSugg[key.field]}">
                        {{ selectedSugg[key.field] || '-' }}
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>

         <div class="modal-actions-spread">
            <button class="btn-cancel" @click="showDiffModal = false">{{ t('common.close') }}</button>
            <div class="vote-actions">
               <button class="btn-reject" @click="confirmVote(selectedSugg, 'reject')">
                 ❌ {{ t('common.reject') }}
               </button>
               <button class="btn-confirm" @click="confirmVote(selectedSugg, 'approve')">
                 ✅ {{ t('common.approve') }}
               </button>
            </div>
         </div>
       </div>
    </div>

    <div v-if="showHistory" class="modal-overlay" @click.self="showHistory = false">
       <div class="history-modal card-modal-wrapper">
         <h3>📜 {{ t('spotDetail.editHistoryTitle') }}</h3>
         <button class="close-btn-hist" @click="showHistory = false">✖</button>
         <div class="history-list">
            <div v-for="log in historyLogs" :key="log.id" class="hist-item">
               <div class="hist-header">
                  <strong>{{ log.editorName }}</strong>
                  <span class="hist-date">{{ formatDate(log.timestamp) }}</span>
               </div>
               <p class="hist-desc">{{ t('spotDetail.updateLocationLog') }}</p>
            </div>
            <p v-if="historyLogs.length === 0" class="no-hist">{{ t('spotDetail.noHistory') }}</p>
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
  if (imgs.length === 0 && spot.value.image) {
    imgs.push(spot.value.image);
  }
  return [...new Set(imgs)].filter(url => url && url.length > 5);
});

const displayImages = computed(() => {
  const imgs = [...allImages.value];
  if (imgs.length === 0) return new Array(5).fill('https://via.placeholder.com/800x600?text=No+Image');
  while (imgs.length < 5) {
     imgs.push(imgs[0]); 
  }
  return imgs;
});

const openLightbox = (index: number) => {
  indexRef.value = index;
  visibleRef.value = true;
};

const onHide = () => {
  visibleRef.value = false;
};

const toggleTranslation = async () => {
  if (showingTranslation.value) {
    showingTranslation.value = false;
    return;
  }
  if (translatedDesc.value) {
    showingTranslation.value = true;
    return;
  }
  if (!spot.value.description) return;
  translating.value = true;
  translationError.value = '';
  try {
     const targetLang = locale.value === 'ms' ? 'ms' : 'en'; 
     const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(spot.value.description)}&langpair=Autodetect|${targetLang}`);
     const data = await response.json();
     if (data.responseData && data.responseData.translatedText) {
        translatedDesc.value = data.responseData.translatedText;
        showingTranslation.value = true;
     } else {
        throw new Error("Translation failed");
     }
  } catch (e) {
     console.error(e);
     translationError.value = t('spotDetail.translationError');
  } finally {
     translating.value = false;
  }
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

const openCheckModal = (sugg: any) => {
   selectedSugg.value = sugg;
   showDiffModal.value = true;
};

const finalizeUpdate = async (sugg: any, forceAdmin = false) => {
   const cleanedData = { ...sugg };
   delete cleanedData.id; delete cleanedData.votes; delete cleanedData.rejectVotes; 
   delete cleanedData.verifiedUsers; delete cleanedData.votedUsers;
   delete cleanedData.createdAt; delete cleanedData.suggestedBy; delete cleanedData.suggestedById;

   const editorName = forceAdmin ? (sugg.suggestedBy + " (Admin Approved)") : sugg.suggestedBy;

   await updateDoc(doc(db, "spots", spotId), { 
      ...cleanedData, 
      lastEditedBy: editorName, 
      lastEditedAt: serverTimestamp() 
   });
   
   await addDoc(collection(db, "spots", spotId, "history"), {
      editorName: editorName,
      editorId: sugg.suggestedById,
      timestamp: serverTimestamp(),
      type: 'update'
   });

   await deleteDoc(doc(db, "spots", spotId, "suggestions", sugg.id));
   
   alert(t('spotDetail.infoUpdatedAlert')); 
   window.location.reload();
};

const rejectSuggestion = async (suggId: string) => {
    await deleteDoc(doc(db, "spots", spotId, "suggestions", suggId));
    alert(t('spotDetail.suggestionCancelledAlert'));
    showDiffModal.value = false;
};

const confirmVote = async (sugg: any, voteType: 'approve' | 'reject') => {
  if (!auth.currentUser) return alert(t('common.pleaseLogin'));
  
  const hasVoted = (sugg.votedUsers && sugg.votedUsers.includes(auth.currentUser.uid)) || 
                   (sugg.verifiedUsers && sugg.verifiedUsers.includes(auth.currentUser.uid));

  if (hasVoted) return alert(t('spotDetail.alreadyVotedAlert'));
  
  const suggRef = doc(db, "spots", spotId, "suggestions", sugg.id);
  
  if (voteType === 'approve') {
      const newVotes = (sugg.votes || 0) + 1;
      if (newVotes >= 5) {
          await finalizeUpdate(sugg, false);
      } else {
          await updateDoc(suggRef, { 
             votes: increment(1), 
             votedUsers: arrayUnion(auth.currentUser.uid) 
          });
          alert(t('spotDetail.voteApprovedAlert'));
          showDiffModal.value = false;
      }
  } else {
      const newRejectVotes = (sugg.rejectVotes || 0) + 1;
      if (newRejectVotes >= 5) {
          await rejectSuggestion(sugg.id);
      } else {
          await updateDoc(suggRef, { 
             rejectVotes: increment(1), 
             votedUsers: arrayUnion(auth.currentUser.uid) 
          });
          alert(t('spotDetail.voteRejectedAlert'));
          showDiffModal.value = false;
      }
  }
};

const adminReject = async (sugg: any) => {
   if(!confirm(t('spotDetail.forceRejectConfirm'))) return;
   await deleteDoc(doc(db, "spots", spotId, "suggestions", sugg.id));
   alert(t('spotDetail.suggestionRejectedAlert'));
};

const reportSpot = async () => { 
    if (!auth.currentUser) return alert(t('common.loginToReport')); 
    const reason = prompt(t('spotDetail.reportReasonPrompt')); 
    if (reason) { 
        await addDoc(collection(db, "reports"), { targetId: spotId, targetType: 'spot', reason: reason, reportedBy: auth.currentUser.uid, createdAt: serverTimestamp() }); 
        alert(t('spotDetail.reportSuccess')); 
    } 
};

const submitReview = async () => { 
    if (!auth.currentUser) return alert(t('common.pleaseLogin')); 
    if (newRating.value === 0) return alert(t('spotDetail.pleaseRate')); 
    try { 
        // 🔥 UPDATE: Tambah votedUsers: [] semasa create review
        await addDoc(collection(db, "spots", spotId, "reviews"), { 
            text: newReviewText.value, 
            rating: newRating.value, 
            userId: auth.currentUser.uid, 
            userName: auth.currentUser.displayName || 'User', 
            userAvatar: auth.currentUser.photoURL || '', 
            createdAt: serverTimestamp(), 
            votes: 0,
            votedUsers: [] // Init empty array
        }); 
        newReviewText.value = ''; 
        newRating.value = 0; 
    } catch (e) { 
        console.error(e); 
    } 
};

// 🔥 UPDATE: Fungsi Vote Review dengan Anti-Spam 🔥
const voteReview = async (review: any, val: number) => { 
    if (!auth.currentUser) return alert(t('common.pleaseLogin')); 
    
    // 1. Check Local State (Array votedUsers)
    const uid = auth.currentUser.uid;
    const hasVoted = review.votedUsers && review.votedUsers.includes(uid);

    if (hasVoted) {
        return alert("Anda sudah mengundi ulasan ini.");
    }

    // 2. Execute Update
    const reviewRef = doc(db, "spots", spotId, "reviews", review.id); 
    try {
        await updateDoc(reviewRef, { 
            votes: increment(val),
            votedUsers: arrayUnion(uid) // Kunci ID user dalam array
        });
    } catch (e) {
        console.error("Gagal vote:", e);
    }
};

const deleteReview = async (reviewId: string) => { 
    if (!confirm(t('common.confirmDelete'))) return; 
    try { 
        await deleteDoc(doc(db, "spots", spotId, "reviews", reviewId)); 
    } catch (e) { 
        alert(t('common.failed')); 
    } 
};

const initMap = () => { if (!spot.value.gpxUrl) return; nextTick(() => { const mapElement = document.getElementById('gpx-map'); if (!mapElement) return; if (mapInstance) { mapInstance.remove(); mapInstance = null; } mapInstance = L.map('gpx-map', { scrollWheelZoom: false }).setView([4.2105, 101.9758], 6); L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '&copy; OSM &copy; CARTO', maxZoom: 19 }).addTo(mapInstance); setTimeout(() => { if(mapInstance) mapInstance.invalidateSize(); }, 300); new (L as any).GPX(spot.value.gpxUrl, { async: true, marker_options: { startIconUrl: 'https://raw.githubusercontent.com/mpetazzoni/leaflet-gpx/master/pin-icon-start.png', endIconUrl: 'https://raw.githubusercontent.com/mpetazzoni/leaflet-gpx/master/pin-icon-end.png', shadowUrl: 'https://raw.githubusercontent.com/mpetazzoni/leaflet-gpx/master/pin-shadow.png' }, polyline_options: { color: '#e67e22', opacity: 0.8, weight: 5, lineCap: 'round' } }).on('loaded', function(e: any) { if(mapInstance) { mapInstance.fitBounds(e.target.getBounds()); setTimeout(() => { mapInstance.invalidateSize(); }, 200); const gpx = e.target; gpxData.distance = (gpx.get_distance() / 1000).toFixed(2); gpxData.elevationGain = gpx.get_elevation_gain().toFixed(0); gpxData.elevationLoss = gpx.get_elevation_loss().toFixed(0); gpxData.maxElevation = gpx.get_elevation_max().toFixed(0); gpxData.minElevation = gpx.get_elevation_min().toFixed(0); gpxData.movingTime = formatTime(gpx.get_moving_time()); } }).addTo(mapInstance); }); };

onMounted(async () => {
  try {
    const docSnap = await getDoc(doc(db, "spots", spotId));
    if (docSnap.exists()) {
      spot.value = docSnap.data();
      if (spot.value.gpxUrl) setTimeout(() => initMap(), 100);
    }
    if (auth.currentUser && ADMIN_EMAILS.includes(auth.currentUser.email!)) isAdmin.value = true;

    const qReview = query(collection(db, "spots", spotId, "reviews"), orderBy("createdAt", "desc"));
    onSnapshot(qReview, (snap) => { reviews.value = snap.docs.map(d => ({ id: d.id, ...d.data() })); });
    const qSugg = query(collection(db, "spots", spotId, "suggestions"));
    onSnapshot(qSugg, (snap) => { suggestions.value = snap.docs.map(d => ({ id: d.id, ...d.data() })); });
    
    const qHist = query(collection(db, "spots", spotId, "history"), orderBy("timestamp", "desc"));
    onSnapshot(qHist, (snap) => { historyLogs.value = snap.docs.map(d => ({ id: d.id, ...d.data() })); });

  } catch (e) { console.error(e); }
  finally { loading.value = false; }
});
onUnmounted(() => { if (mapInstance) { mapInstance.remove(); mapInstance = null; } });
</script>

<style scoped>
/* STYLE KEKAL SAMA - TIADA PERUBAHAN */
.spot-detail-page { background: #f5f5f5; min-height: 100vh; padding-bottom: 2rem; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }

.hero-gallery-wrapper { position: relative; margin-bottom: 2rem; max-width: 1200px; margin: 0 auto 2rem auto; padding: 1rem 1rem 0 1rem; }

.desktop-gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; height: 400px; border-radius: 16px; overflow: hidden; position: relative; background: #000; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
.main-item { width: 100%; height: 100%; background-size: cover; background-position: center; cursor: pointer; transition: filter 0.2s; }
.main-item:hover { filter: brightness(0.9); }
.sub-gallery { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 8px; }
.gallery-item { background-size: cover; background-position: center; cursor: pointer; transition: filter 0.2s; position: relative; }
.gallery-item:hover { filter: brightness(0.9); }
.btn-show-all { position: absolute; bottom: 20px; right: 20px; background: white; border: 1px solid #333; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 0.9rem; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 5; transition: transform 0.2s; }
.btn-show-all:hover { transform: scale(1.05); }

.gallery-overlay { position: absolute; bottom: 0; left: 0; width: 50%; padding: 2rem; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); color: white; pointer-events: none; }
.badge-cat { background: #e67e22; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; color: white; display: inline-block; margin-bottom: 5px; }
h1 { margin: 5px 0 10px 0; font-size: 2.2rem; font-weight: 800; text-shadow: 0 2px 5px rgba(0,0,0,0.5); color: white; line-height: 1.2; }
.hero-meta { display: flex; gap: 15px; font-size: 1rem; opacity: 0.9; color: white; }
.mobile-gallery { display: none; }

/* CONTENT STYLES */
.content-wrapper { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-top: 0; position: relative; z-index: 10; }
.main-info { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); display: flex; flex-direction: column; gap: 2rem; height: fit-content; }
.info-box h3 { margin-top: 0; margin-bottom: 0; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 10px; }
.header-actions { display: flex; align-items: center; gap: 10px; }
.btn-translate { background: #f0f0f0; border: 1px solid #ddd; padding: 5px 12px; border-radius: 20px; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; gap: 5px; color: #555; transition: 0.2s; }
.btn-translate:hover { background: #e0e0e0; color: #333; }
.trans-error { color: #e74c3c; margin-top: -10px; margin-bottom: 10px; }
.avg-rating { background: #fdf2e9; padding: 5px 10px; border-radius: 20px; font-weight: bold; color: #e67e22; border: 1px solid #f9dcc4; margin-left: auto; }
.desc { line-height: 1.8; color: #444; white-space: pre-line; font-size: 1.1rem; }
.permit-alert { background: #fff3e0; color: #e65100; padding: 1rem; border-radius: 6px; margin-top: 2rem; border: 1px solid #ffcc80; }
.free-alert { background: #e8f5e9; color: #2e7d32; padding: 1rem; border-radius: 6px; margin-top: 2rem; border: 1px solid #a5d6a7; }
.extra-info-grid { display: flex; gap: 20px; margin-top: 1rem; border-bottom: 1px dashed #eee; padding-bottom: 1rem; }
.info-item { background: #f9f9f9; padding: 8px 12px; border-radius: 6px; font-size: 0.9rem; color: #555; }
.text-red { color: #e74c3c; font-weight: bold; }
.text-green { color: #27ae60; font-weight: bold; }
.btn-flag { background: none; border: none; font-size: 1.2rem; cursor: pointer; opacity: 0.5; transition: opacity 0.2s; }
.btn-flag:hover { opacity: 1; }
.review-section { border-top: 2px dashed #eee; padding-top: 2rem; }
.review-form { background: #f9f9f9; padding: 1.5rem; border-radius: 8px; border: 1px solid #eee; margin-bottom: 2rem; }
.star-input { font-size: 1.5rem; color: #ccc; cursor: pointer; margin-bottom: 10px; }
.star-input span.filled { color: #f1c40f; }
.review-form textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; min-height: 80px; margin-bottom: 10px; }
.btn-submit-review { background: #2c3e50; color: white; border: none; padding: 8px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-submit-review:disabled { background: #ccc; }
.login-alert { background: #eee; padding: 1rem; text-align: center; border-radius: 6px; color: #555; }
.review-list { display: flex; flex-direction: column; gap: 1.5rem; }
.review-item { border-bottom: 1px solid #f0f0f0; padding-bottom: 1rem; }
.review-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; cursor: pointer; }
.review-stars { color: #f1c40f; font-size: 0.9rem; }
.review-stars span { color: #e0e0e0; }
.review-stars span.filled { color: #f1c40f; }
.review-date { font-size: 0.7rem; color: #999; margin-left: 5px; }
.review-text { font-size: 0.95rem; color: #333; line-height: 1.5; margin: 5px 0 0 0; }
.review-footer { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
.vote-pill { display: flex; align-items: center; background-color: #f6f7f8; border-radius: 20px; padding: 2px 5px; border: 1px solid #eee; }
.vote-btn { background: none; border: none; cursor: pointer; color: #878a8c; padding: 4px; border-radius: 50%; display: flex; align-items: center; }
.vote-btn:hover { background-color: #e2e2e2; color: #e67e22; }
.vote-count { font-weight: bold; font-size: 12px; margin: 0 6px; color: #333; min-width: 15px; text-align: center; }
.vote-count.positive { color: #e67e22; }
.vote-count.negative { color: #7193ff; }
.btn-delete-review { background: none; border: none; color: #e74c3c; font-size: 0.8rem; cursor: pointer; text-decoration: underline; margin-left: auto; }
.no-reviews { text-align: center; color: #888; font-style: italic; }
.contributor-box { margin-top: 2rem; padding-top: 1rem; border-top: 1px dashed #eee; color: #777; font-size: 0.9rem; }
.label-text { display: block; margin-bottom: 8px; font-size: 0.8rem; }
.flex-between { display: flex; justify-content: space-between; align-items: center; }
.contributor-badge { display: inline-block; cursor: pointer; padding: 5px 10px; background: #f9f9f9; border-radius: 30px; border: 1px solid #eee; transition: background 0.2s; }
.contributor-badge:hover { background: #eee; }
.edited-text { font-size: 0.8rem; color: #999; margin-top: 10px; }
.btn-history { background: none; border: none; color: #3498db; font-size: 0.8rem; cursor: pointer; text-decoration: underline; }

.sidebar-info { display: flex; flex-direction: column; gap: 1rem; }
.map-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); text-align: center; }
.nav-card { margin-top: 0; }
.gpx-stats { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.03); }
.stat-row { display: flex; justify-content: space-around; margin-bottom: 5px; }
.divider { height: 1px; background: #eee; margin: 10px 0; }
.stat-box { display: flex; flex-direction: column; align-items: center; flex: 1; }
.stat-box .label { font-size: 0.7rem; color: #888; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px; }
.stat-box .value { font-size: 1.1rem; font-weight: 800; color: #2c3e50; }
.stat-box .value small { font-size: 0.8rem; font-weight: normal; color: #777; }
.gpx-map-container { height: 300px; width: 100%; background: #f0f0f0; border-radius: 8px; margin: 10px 0; border: 1px solid #ddd; z-index: 0; position: relative; }
.btn-waze { display: block; background: #3498db; color: white; padding: 1rem; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 1rem; transition: transform 0.2s; }
.btn-waze:hover { transform: translateY(-3px); background: #2980b9; }
.btn-gpx { display: block; background: #e67e22; color: white; padding: 0.8rem; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px; text-align: center; transition: background 0.2s; }
.btn-gpx:hover { background: #d35400; }
.no-gpx { display: block; margin-top: 10px; color: #999; font-size: 0.8rem; font-style: italic; }

/* BTN LOCKED STATE */
.btn-edit-spot { width: 100%; margin-top: 0; background: white; border: 1px solid #2c3e50; color: #2c3e50; padding: 0.8rem; border-radius: 8px; cursor: pointer; font-weight: bold; transition: background 0.2s; }
.btn-edit-spot:hover:not(:disabled) { background: #f0f0f0; }
.btn-locked { background: #f0f0f0; color: #999; border-color: #ddd; cursor: not-allowed; }
.lock-hint { text-align: center; color: #999; margin-top: 5px; font-size: 0.8rem; font-style: italic; }

/* MODAL STYLES */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; justify-content: center; align-items: center; padding: 1rem; backdrop-filter: blur(5px); }
.card-modal-wrapper { background: white; padding: 2rem; border-radius: 12px; max-width: 600px; width: 100%; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.3); max-height: 80vh; overflow-y: auto;}
.card-modal-wrapper h3 { margin-top: 0; margin-bottom: 1rem; color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; }
.diff-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem; }
.diff-table th, .diff-table td { padding: 10px; border-bottom: 1px solid #eee; text-align: left; vertical-align: middle; }
.diff-table th { background: #f9f9f9; color: #777; }
.old-val { color: #e74c3c; text-decoration: line-through; opacity: 0.6; font-size: 0.8rem; }
.new-val { color: #27ae60; font-weight: bold; background: #e8f5e9; padding: 2px 5px; border-radius: 4px; }
.new-val-bg { background: #e8f5e9; }
.diff-thumb { width: 80px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd; }

/* MODAL ACTION BUTTONS */
.modal-actions-spread { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 1rem; }
.vote-actions { display: flex; gap: 10px; }
.btn-cancel { background: #eee; color: #333; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: bold; }
.btn-confirm { background: #27ae60; color: white; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: bold; }
.btn-reject { background: #e74c3c; color: white; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: bold; }
.btn-reject:hover { background: #c0392b; }

.history-list { display: flex; flex-direction: column; gap: 10px; }
.hist-item { border-left: 3px solid #3498db; padding-left: 10px; }
.hist-header { display: flex; justify-content: space-between; font-size: 0.9rem; }
.hist-date { color: #999; font-size: 0.8rem; }
.hist-desc { margin: 2px 0 0 0; font-size: 0.85rem; color: #555; }
.close-btn-hist { position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 1.5rem; cursor: pointer; }
.no-hist { text-align: center; color: #999; font-style: italic; }

/* PENDING BOX & PROGRESS */
.pending-updates-box { background: #fff3e0; border: 1px solid #ffcc80; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
.update-header { font-weight: bold; color: #e65100; margin-bottom: 10px; border-bottom: 1px dashed #ffcc80; padding-bottom: 5px; }
.suggestion-card { background: white; padding: 10px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #f9dcc4; }
.sugg-author { font-size: 0.8rem; color: #666; margin: 0 0 5px 0; }
.progress-bar { height: 6px; background: #eee; border-radius: 10px; overflow: hidden; margin-bottom: 8px; display: flex; }
.progress-fill { height: 100%; background: #27ae60; transition: width 0.3s; }
.progress-fill.reject { background: #e74c3c; }
.sugg-actions { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; }
.btn-verify { background: #27ae60; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
.btn-verify:hover { background: #219150; }
.admin-bypass-actions { display: flex; gap: 5px; margin-top: 5px; border-top: 1px solid #eee; padding-top: 5px; }
.btn-approve-admin { background: #27ae60; color: white; border: none; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; cursor: pointer; }
.btn-reject-admin { background: #e74c3c; color: white; border: none; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; cursor: pointer; }
.loading, .empty { text-align: center; padding: 5rem; font-size: 1.5rem; color: #888; }

@media (max-width: 768px) {
  .hero-gallery-wrapper { padding: 0; margin-bottom: 1rem; }
  .desktop-gallery { display: none; }
  .mobile-gallery { display: block; height: 300px; position: relative; }
  .detail-swiper, .slide-bg { height: 100%; width: 100%; background-size: cover; background-position: center; }
  .mobile-overlay { position: absolute; bottom: 0; left: 0; width: 100%; padding: 1.5rem 1rem; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); color: white; z-index: 10; pointer-events: none; }
  .mobile-overlay h1 { font-size: 2rem; margin: 0; text-shadow: 2px 2px 5px black; }
  .badges-mobile { display: flex; gap: 5px; margin-top: 5px; }
  .content-wrapper { grid-template-columns: 1fr; margin-top: 0; padding: 0 1rem; }
  .main-info { padding: 1.5rem; }
  .modal-actions-spread { flex-direction: column-reverse; gap: 10px; }
  .vote-actions { width: 100%; display: flex; gap: 10px; }
  .btn-reject, .btn-confirm { flex: 1; }
  .btn-cancel { width: 100%; }
}
</style>