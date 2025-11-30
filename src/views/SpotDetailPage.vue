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
            <h3>{{ t('spotDetail.locationInfo') }}</h3>
            <p class="desc">{{ spot.description }}</p>
            
            <div class="permit-alert" v-if="spot.permit && spot.permit !== 'Tidak Perlu' && spot.permit !== 'No'">
              ⚠️ <strong>{{ t('spotDetail.permitRequired') }}</strong> {{ spot.permit }}
            </div>
            <div class="free-alert" v-else>
              ✅ <strong>{{ t('spotDetail.free') }}</strong> {{ t('spotDetail.noPermitNeeded') }}
            </div>
          </div>
          
          <div class="contributor-box">
             <p>{{ t('spotDetail.contributedBy') }} <strong>{{ spot.contributorName }}</strong></p>
             <p v-if="spot.lastEditedBy" class="edited-text">
                🔄 {{ t('spotDetail.lastEdited') }} <strong>{{ spot.lastEditedBy }}</strong>
             </p>
          </div>
        </div>

        <div class="sidebar-info">
          
          <div class="map-card" v-if="spot.gpxUrl">
            <h3>Peta Trail (GPX)</h3>
            
            <div id="gpx-map" class="gpx-map-container"></div>
            
            <a :href="spot.gpxUrl" download class="btn-gpx">
               📥 {{ t('spotDetail.downloadGpx') }}
            </a>
          </div>

          <div class="map-card" v-else>
             <h3>{{ t('spotDetail.mapLocation') }}</h3>
             <span class="no-gpx">{{ t('spotDetail.noGpx') }}</span>
          </div>

          <div class="map-card nav-card">
            <h3>Navigasi</h3>
            <p>{{ t('spotDetail.mapDesc') }}</p>
            <a :href="spot.mapsLink" target="_blank" class="btn-waze">
              🗺️ {{ t('spotDetail.openMap') }}
            </a>
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
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n'; 
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// 🔥 IMPORT LEAFLET 🔥
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-gpx';

// Fix Icon Leaflet Standard
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
const spot = ref<any>(null);
const loading = ref(true);
let mapInstance: any = null; // Simpan reference map

const getLevelLabel = (level: string) => {
  if (!level) return '';
  const key = level.toLowerCase();
  return t(`components.${key}`) !== `components.${key}` ? t(`components.${key}`) : level;
};

// 🔥 FUNGSI RENDER PETA (VERSI STABIL) 🔥
const initMap = () => {
  if (!spot.value.gpxUrl) return;

  nextTick(() => {
    const mapElement = document.getElementById('gpx-map');
    if (!mapElement) return;

    // 1. Bersihkan Map Lama (PENTING!)
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }

    // 2. Setup Map Baru
    mapInstance = L.map('gpx-map', {
      scrollWheelZoom: false, // Elak user terscroll peta bila scroll page
    }).setView([4.2105, 101.9758], 6); 

    // 3. Guna Peta CartoDB (Lebih Cantik & Stabil)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    }).addTo(mapInstance);

    // 4. Paksa Map Refresh Saiz (Tunggu 300ms)
    setTimeout(() => {
       if(mapInstance) mapInstance.invalidateSize();
    }, 300);

    // 5. Load GPX
    new (L as any).GPX(spot.value.gpxUrl, {
      async: true,
      marker_options: {
        startIconUrl: 'https://raw.githubusercontent.com/mpetazzoni/leaflet-gpx/master/pin-icon-start.png',
        endIconUrl: 'https://raw.githubusercontent.com/mpetazzoni/leaflet-gpx/master/pin-icon-end.png',
        shadowUrl: 'https://raw.githubusercontent.com/mpetazzoni/leaflet-gpx/master/pin-shadow.png'
      },
      polyline_options: {
        color: '#e67e22', // Warna line oren (macam tema KnotEnUp)
        opacity: 0.8,
        weight: 5,
        lineCap: 'round'
      }
    }).on('loaded', function(e: any) {
      if(mapInstance) {
        mapInstance.fitBounds(e.target.getBounds()); 
        // Resize sekali lagi lepas data masuk
        setTimeout(() => { mapInstance.invalidateSize(); }, 200); 
      }
    }).on('error', function(e: any) {
      console.error("GPX Gagal Load (Error):", e);
    }).addTo(mapInstance);
  });
};

onMounted(async () => {
  const spotId = route.params.id as string;
  try {
    const docSnap = await getDoc(doc(db, "spots", spotId));
    if (docSnap.exists()) {
      spot.value = docSnap.data();
      if (spot.value.gpxUrl) {
        // Tunggu sekejap sebelum init map
        setTimeout(() => initMap(), 100);
      }
    }
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
});

// Cuci memory bila keluar page
onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
});
</script>

<style scoped>
/* ... (Style atas kekal sama) ... */

/* 🔥 UPDATE STYLE MAP CONTAINER 🔥 */
.gpx-map-container {
  height: 300px; /* Tinggikan sikit */
  width: 100%;
  background: #f0f0f0; /* Warna kelabu cair kalau map lambat load */
  border-radius: 8px;
  margin: 10px 0;
  border: 1px solid #ddd;
  z-index: 0; /* Rendahkan z-index supaya tak tutup dropdown */
  position: relative;
}

/* ... (Style bawah kekal sama) ... */
.spot-detail-page { background: #f5f5f5; min-height: 100vh; }
.container { max-width: 1000px; margin: 0 auto; padding: 2rem 1rem; }

.hero-image { height: 400px; background-size: cover; background-position: center; position: relative; }
.overlay { height: 100%; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); display: flex; flex-direction: column; justify-content: flex-end; padding: 2rem; color: white; text-align: center; }
h1 { font-size: 3rem; margin: 0 0 1rem 0; text-shadow: 2px 2px 5px black; }

.badges { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.badge { padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 0.9rem; background: rgba(255,255,255,0.2); backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.5); text-transform: uppercase;}

.content-wrapper { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-top: -50px; position: relative; z-index: 10; }
.main-info { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); }
.desc { line-height: 1.8; color: #444; white-space: pre-line; font-size: 1.1rem; }

.permit-alert { background: #fff3e0; color: #e65100; padding: 1rem; border-radius: 6px; margin-top: 2rem; border: 1px solid #ffcc80; }
.free-alert { background: #e8f5e9; color: #2e7d32; padding: 1rem; border-radius: 6px; margin-top: 2rem; border: 1px solid #a5d6a7; }

/* SIDEBAR */
.sidebar-info { display: flex; flex-direction: column; gap: 1rem; }

.map-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); text-align: center; }
.nav-card { margin-top: 0; }

.btn-waze { display: block; background: #3498db; color: white; padding: 1rem; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 1rem; transition: transform 0.2s; }
.btn-waze:hover { transform: translateY(-3px); background: #2980b9; }

.btn-gpx { display: block; background: #e67e22; color: white; padding: 0.8rem; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px; text-align: center; transition: background 0.2s; }
.btn-gpx:hover { background: #d35400; }
.no-gpx { display: block; margin-top: 10px; color: #999; font-size: 0.8rem; font-style: italic; }

.btn-edit-spot { width: 100%; margin-top: 0; background: white; border: 1px solid #2c3e50; color: #2c3e50; padding: 0.8rem; border-radius: 8px; cursor: pointer; font-weight: bold; transition: background 0.2s; }
.btn-edit-spot:hover { background: #f0f0f0; }

.contributor-box { margin-top: 2rem; padding-top: 1rem; border-top: 1px dashed #eee; color: #777; font-size: 0.9rem; }
.edited-text { font-size: 0.8rem; color: #999; margin-top: 5px; }

.loading, .empty { text-align: center; padding: 5rem; font-size: 1.5rem; color: #888; }

@media (max-width: 768px) {
  .content-wrapper { grid-template-columns: 1fr; margin-top: 0; }
  .hero-image { height: 300px; }
  h1 { font-size: 2rem; }
}
</style>