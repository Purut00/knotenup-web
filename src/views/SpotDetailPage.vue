<template>
  <div class="spot-detail-page">
    <div v-if="loading" class="loading">⏳ {{ t('common.loading') }}</div>
    
    <div v-else-if="spot" class="spot-container">
      
      <div class="hero-image" :style="{ backgroundImage: `url(${spot.image || 'https://via.placeholder.com/800x400'})` }">
        <div class="overlay">
          <h1>{{ spot.name }}</h1>
          <div class="badges">
            <span class="badge state">📍 {{ spot.state }}</span>
            <span class="badge height">🏔️ {{ spot.height }}m</span>
            <span class="badge diff">{{ getLevelLabel(spot.difficulty) }}</span>
          </div>
        </div>
      </div>

      <div class="content-wrapper container">
        
        <div class="main-info">
          
          <div class="info-box">
            <div class="header-row">
               <h3>{{ t('spotDetail.locationInfo') }}</h3>
               <div class="avg-rating" v-if="reviews.length > 0">
                  ⭐ {{ averageRating }} <small>({{ reviews.length }})</small>
               </div>
            </div>

            <p class="desc">{{ spot.description }}</p>
            
            <div class="permit-alert" v-if="spot.permit && spot.permit !== 'Tidak Perlu' && spot.permit !== 'No'">
              ⚠️ <strong>{{ t('spotDetail.permitRequired') }}</strong> {{ spot.permit }}
            </div>
            <div class="free-alert" v-else>
              ✅ <strong>{{ t('spotDetail.free') }}</strong> {{ t('spotDetail.noPermitNeeded') }}
            </div>
          </div>
          
          <div class="contributor-box">
             <span class="label-text">{{ t('spotDetail.contributedBy') }}</span>
             <div class="contributor-badge" @click="goToProfile(spot.contributorId)">
                <AuthorBadge 
                   :userId="spot.contributorId" 
                   :fallbackName="spot.contributorName"
                />
             </div>
             
             <p v-if="spot.lastEditedBy" class="edited-text">
                🔄 {{ t('spotDetail.lastEdited') }} <strong>{{ spot.lastEditedBy }}</strong>
             </p>
          </div>

          <div class="review-section">
            <h3>💬 Ulasan & Pengalaman</h3>

            <div class="review-form" v-if="auth.currentUser">
               <div class="star-input">
                  <span v-for="n in 5" :key="n" @click="newRating = n" :class="{ filled: n <= newRating }">★</span>
               </div>
               <textarea v-model="newReviewText" placeholder="Kongsi pengalaman anda (trek, view, pacat?)..."></textarea>
               <button @click="submitReview" :disabled="!newReviewText || newRating === 0" class="btn-submit-review">
                 Hantar Review
               </button>
            </div>
            <div v-else class="login-alert">🔒 Sila login untuk tulis review.</div>

            <div class="review-list">
               <div v-for="review in sortedReviews" :key="review.id" class="review-item">
                  
                  <div class="review-header" @click="goToProfile(review.userId)">
                     <AuthorBadge 
                        :userId="review.userId" 
                        :fallbackName="review.userName" 
                        :fallbackAvatar="review.userAvatar"
                     >
                        <template #subtext>
                           <span class="review-date">{{ formatDate(review.createdAt) }}</span>
                        </template>
                     </AuthorBadge>
                     
                     <div class="review-stars">
                        <span v-for="n in 5" :key="n" :class="{ filled: n <= review.rating }">★</span>
                     </div>
                  </div>
                  
                  <p class="review-text">{{ review.text }}</p>
                  
                  <div class="review-footer">
                     <div class="vote-pill">
                        <button class="vote-btn up" @click="voteReview(review, 1)">
                           <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4L3 15h6v5h6v-5h6z"/></svg>
                        </button>
                        <span class="vote-count" :class="{ positive: (review.votes || 0) > 0, negative: (review.votes || 0) < 0 }">
                           {{ review.votes || 0 }}
                        </span>
                        <button class="vote-btn down" @click="voteReview(review, -1)">
                           <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20L21 9h-6V4h-6v5H3z"/></svg>
                        </button>
                     </div>

                     <button v-if="auth.currentUser && auth.currentUser.uid === review.userId" 
                             @click="deleteReview(review.id)" 
                             class="btn-delete-review">
                        🗑️ Padam
                     </button>
                  </div>

               </div>

               <p v-if="reviews.length === 0" class="no-reviews">Belum ada ulasan.</p>
            </div>
          </div>

        </div>

        <div class="sidebar-info">
          
          <div class="map-card" v-if="spot.gpxUrl">
            <h3>Peta Trail (GPX)</h3>
            
            <div class="gpx-stats" v-if="gpxData.distance !== '0.00'">
               <div class="stat-row">
                 <div class="stat-box"><span class="label">📏 Jarak</span><span class="value">{{ gpxData.distance }} <small>km</small></span></div>
                 <div class="stat-box"><span class="label">⏱️ Masa</span><span class="value">{{ gpxData.movingTime }}</span></div>
               </div>
               <div class="divider"></div>
               <div class="stat-row">
                 <div class="stat-box"><span class="label">🔺 EG</span><span class="value text-green">+{{ gpxData.elevationGain }}m</span></div>
                 <div class="stat-box"><span class="label">🏔️ Max</span><span class="value">{{ gpxData.maxElevation }}m</span></div>
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
            <h3>Navigasi</h3>
            <p>{{ t('spotDetail.mapDesc') }}</p>
            <a :href="spot.mapsLink" target="_blank" class="btn-waze">🗺️ {{ t('spotDetail.openMap') }}</a>
          </div>

          <button class="btn-edit-spot" @click="$router.push('/spots/edit/' + route.params.id)">
             {{ t('spotDetail.editSpot') }}
          </button>

        </div>
      </div>
    </div>

    <div v-else class="empty">{{ t('spotDetail.notFound') }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'; 
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import AuthorBadge from '../components/common/AuthorBadge.vue'; 

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-gpx';

// Icon Fix
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const { t } = useI18n(); 
const route = useRoute();
const router = useRouter(); 
const spotId = route.params.id as string;

const spot = ref<any>(null);
const loading = ref(true);
let mapInstance: any = null;

// Review State
const reviews = ref<any[]>([]);
const newReviewText = ref('');
const newRating = ref(0);

const gpxData = reactive({
  distance: '0.00',
  elevationGain: '0',
  elevationLoss: '0',
  maxElevation: '0',
  minElevation: '0',
  movingTime: '-'
});

const getLevelLabel = (level: string) => {
  if (!level) return '';
  const key = level.toLowerCase();
  return t(`components.${key}`) !== `components.${key}` ? t(`components.${key}`) : level;
};

const formatTime = (ms: number) => {
  if (!ms || ms === 0) return '-';
  const totalSeconds = ms / 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}j ${minutes}m`;
  return `${minutes} min`;
};

const formatDate = (timestamp: any) => {
  if (!timestamp) return '';
  return new Date(timestamp.seconds * 1000).toLocaleDateString("en-MY", {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0;
  const total = reviews.value.reduce((acc, curr) => acc + (curr.rating || 0), 0);
  return (total / reviews.value.length).toFixed(1);
});

const sortedReviews = computed(() => {
  return [...reviews.value].sort((a, b) => (b.votes || 0) - (a.votes || 0));
});

const goToProfile = (userId: string) => {
  if (userId) router.push(`/user/${userId}`);
};

const submitReview = async () => {
  if (!auth.currentUser) return alert("Sila login.");
  if (newRating.value === 0) return alert("Sila bagi rating bintang.");

  try {
    await addDoc(collection(db, "spots", spotId, "reviews"), {
      text: newReviewText.value,
      rating: newRating.value,
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'User',
      userAvatar: auth.currentUser.photoURL || '',
      createdAt: serverTimestamp(),
      votes: 0 
    });
    newReviewText.value = '';
    newRating.value = 0;
  } catch (e) { console.error(e); }
};

const voteReview = async (review: any, val: number) => {
  if (!auth.currentUser) return alert(t('forum.loginToVote'));
  const reviewRef = doc(db, "spots", spotId, "reviews", review.id);
  await updateDoc(reviewRef, { votes: increment(val) });
};

const deleteReview = async (reviewId: string) => {
  if (!confirm("Padam review ini?")) return;
  try {
    await deleteDoc(doc(db, "spots", spotId, "reviews", reviewId));
  } catch (e) { alert("Gagal padam."); }
};

const initMap = () => {
  if (!spot.value.gpxUrl) return;
  nextTick(() => {
    const mapElement = document.getElementById('gpx-map');
    if (!mapElement) return;
    if (mapInstance) { mapInstance.remove(); mapInstance = null; }

    mapInstance = L.map('gpx-map', { scrollWheelZoom: false }).setView([4.2105, 101.9758], 6); 
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19
    }).addTo(mapInstance);

    setTimeout(() => { if(mapInstance) mapInstance.invalidateSize(); }, 300);

    new (L as any).GPX(spot.value.gpxUrl, {
      async: true,
      marker_options: {
        startIconUrl: 'https://raw.githubusercontent.com/mpetazzoni/leaflet-gpx/master/pin-icon-start.png',
        endIconUrl: 'https://raw.githubusercontent.com/mpetazzoni/leaflet-gpx/master/pin-icon-end.png',
        shadowUrl: 'https://raw.githubusercontent.com/mpetazzoni/leaflet-gpx/master/pin-shadow.png'
      },
      polyline_options: { color: '#e67e22', opacity: 0.8, weight: 5, lineCap: 'round' }
    }).on('loaded', function(e: any) {
      if(mapInstance) {
        mapInstance.fitBounds(e.target.getBounds()); 
        setTimeout(() => { mapInstance.invalidateSize(); }, 200); 
        const gpx = e.target;
        gpxData.distance = (gpx.get_distance() / 1000).toFixed(2);
        gpxData.elevationGain = gpx.get_elevation_gain().toFixed(0);
        gpxData.elevationLoss = gpx.get_elevation_loss().toFixed(0);
        gpxData.maxElevation = gpx.get_elevation_max().toFixed(0);
        gpxData.minElevation = gpx.get_elevation_min().toFixed(0);
        gpxData.movingTime = formatTime(gpx.get_moving_time());
      }
    }).addTo(mapInstance);
  });
};

onMounted(async () => {
  try {
    const docSnap = await getDoc(doc(db, "spots", spotId));
    if (docSnap.exists()) {
      spot.value = docSnap.data();
      if (spot.value.gpxUrl) setTimeout(() => initMap(), 100);
    }
    const q = query(collection(db, "spots", spotId, "reviews"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snap) => { reviews.value = snap.docs.map(d => ({ id: d.id, ...d.data() })); });
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
});

onUnmounted(() => {
  if (mapInstance) { mapInstance.remove(); mapInstance = null; }
});
</script>

<style scoped>
.spot-detail-page { background: #f5f5f5; min-height: 100vh; }
.container { max-width: 1000px; margin: 0 auto; padding: 2rem 1rem; }

.hero-image { height: 400px; background-size: cover; background-position: center; position: relative; }
.overlay { height: 100%; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); display: flex; flex-direction: column; justify-content: flex-end; padding: 2rem; color: white; text-align: center; }
h1 { font-size: 3rem; margin: 0 0 1rem 0; text-shadow: 2px 2px 5px black; }

.badges { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.badge { padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 0.9rem; background: rgba(255,255,255,0.2); backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.5); text-transform: uppercase;}

.content-wrapper { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-top: -50px; position: relative; z-index: 10; }
.main-info { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); display: flex; flex-direction: column; gap: 2rem; }
.info-box h3 { margin-top: 0; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.avg-rating { background: #fdf2e9; padding: 5px 10px; border-radius: 20px; font-weight: bold; color: #e67e22; border: 1px solid #f9dcc4; }

.desc { line-height: 1.8; color: #444; white-space: pre-line; font-size: 1.1rem; }

.permit-alert { background: #fff3e0; color: #e65100; padding: 1rem; border-radius: 6px; margin-top: 1rem; border: 1px solid #ffcc80; }
.free-alert { background: #e8f5e9; color: #2e7d32; padding: 1rem; border-radius: 6px; margin-top: 1rem; border: 1px solid #a5d6a7; }

/* REVIEW STYLE BARU (HORIZONTAL PILL) */
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

/* Header Review (Atas) */
.review-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; cursor: pointer; }
.review-stars { color: #f1c40f; font-size: 0.9rem; }
.review-stars span { color: #e0e0e0; }
.review-stars span.filled { color: #f1c40f; }
.review-date { font-size: 0.7rem; color: #999; margin-left: 5px; }

/* Text Review */
.review-text { font-size: 0.95rem; color: #333; line-height: 1.5; margin: 0 0 10px 0; }

/* Footer Review (Bawah - Vote & Delete) */
.review-footer { display: flex; align-items: center; gap: 10px; }

/* Vote Pill (Macam Forum) */
.vote-pill {
  display: flex;
  align-items: center;
  background-color: #f6f7f8;
  border-radius: 20px;
  padding: 2px 5px;
  border: 1px solid #eee;
}
.vote-btn { background: none; border: none; cursor: pointer; color: #878a8c; padding: 4px; border-radius: 50%; display: flex; align-items: center; }
.vote-btn:hover { background-color: #e2e2e2; color: #e67e22; }
.vote-count { font-weight: bold; font-size: 12px; margin: 0 6px; color: #333; min-width: 15px; text-align: center; }
.vote-count.positive { color: #e67e22; }
.vote-count.negative { color: #7193ff; }
.icon-sm { width: 16px; height: 16px; }

.btn-delete-review { background: none; border: none; color: #e74c3c; font-size: 0.8rem; cursor: pointer; text-decoration: underline; margin-left: auto; }
.no-reviews { text-align: center; color: #888; font-style: italic; }

/* CONTRIBUTOR STYLE */
.contributor-box { margin-top: 2rem; padding-top: 1rem; border-top: 1px dashed #eee; color: #777; font-size: 0.9rem; }
.label-text { display: block; margin-bottom: 8px; font-size: 0.8rem; }
.contributor-badge { display: inline-block; cursor: pointer; padding: 5px 10px; background: #f9f9f9; border-radius: 30px; border: 1px solid #eee; transition: background 0.2s; }
.contributor-badge:hover { background: #eee; }
.edited-text { font-size: 0.8rem; color: #999; margin-top: 10px; }

/* SIDEBAR & MAP */
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
.text-green { color: #27ae60 !important; }
.text-red { color: #c0392b !important; }
.gpx-map-container { height: 300px; width: 100%; background: #f0f0f0; border-radius: 8px; margin: 10px 0; border: 1px solid #ddd; z-index: 0; position: relative; }
.btn-waze { display: block; background: #3498db; color: white; padding: 1rem; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 1rem; transition: transform 0.2s; }
.btn-waze:hover { transform: translateY(-3px); background: #2980b9; }
.btn-gpx { display: block; background: #e67e22; color: white; padding: 0.8rem; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px; text-align: center; transition: background 0.2s; }
.btn-gpx:hover { background: #d35400; }
.no-gpx { display: block; margin-top: 10px; color: #999; font-size: 0.8rem; font-style: italic; }
.btn-edit-spot { width: 100%; margin-top: 0; background: white; border: 1px solid #2c3e50; color: #2c3e50; padding: 0.8rem; border-radius: 8px; cursor: pointer; font-weight: bold; transition: background 0.2s; }
.btn-edit-spot:hover { background: #f0f0f0; }
.loading, .empty { text-align: center; padding: 5rem; font-size: 1.5rem; color: #888; }

@media (max-width: 768px) {
  .content-wrapper { grid-template-columns: 1fr; margin-top: 0; }
  .hero-image { height: 300px; }
  h1 { font-size: 2rem; }
}
</style>