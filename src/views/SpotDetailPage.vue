<template>
  <div class="spot-detail-page">
    <div v-if="loading" class="loading">⏳ Memuatkan...</div>
    
    <div v-else-if="spot" class="spot-container">
      <div class="hero-image" :style="{ backgroundImage: `url(${spot.image || 'https://via.placeholder.com/800x400'})` }">
        <div class="overlay">
          <h1>{{ spot.name }}</h1>
          <div class="badges">
            <span class="badge state">📍 {{ spot.state }}</span>
            <span class="badge height">🏔️ {{ spot.height }}m</span>
            <span class="badge diff">{{ spot.difficulty }}</span>
          </div>
        </div>
      </div>

      <div class="content-wrapper container">
        <div class="main-info">
          <div class="info-box">
            <h3>Info Lokasi</h3>
            <p class="desc">{{ spot.description }}</p>
            
            <div class="permit-alert" v-if="spot.permit !== 'Tidak Perlu'">
              ⚠️ <strong>PERMIT DIPERLUKAN:</strong> {{ spot.permit }}
            </div>
            <div class="free-alert" v-else>
              ✅ <strong>PERCUMA:</strong> Tiada permit diperlukan.
            </div>
          </div>
          
          <p class="contributor">Disumbangkan oleh: <strong>{{ spot.contributorName }}</strong></p>
        </div>

        <div class="sidebar-info">
          <div class="map-card">
            <h3>Lokasi Peta</h3>
            <p>Klik untuk navigasi ke parking/trailhead.</p>
            <a :href="spot.mapsLink" target="_blank" class="btn-waze">🗺️ Buka Google Maps / Waze</a>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty">Lokasi tidak dijumpai.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const route = useRoute();
const spot = ref<any>(null);
const loading = ref(true);

onMounted(async () => {
  const spotId = route.params.id as string;
  try {
    const docSnap = await getDoc(doc(db, "spots", spotId));
    if (docSnap.exists()) spot.value = docSnap.data();
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
});
</script>

<style scoped>
.spot-detail-page { background: #f5f5f5; min-height: 100vh; }
.container { max-width: 1000px; margin: 0 auto; padding: 2rem 1rem; }

.hero-image { height: 400px; background-size: cover; background-position: center; position: relative; }
.overlay { height: 100%; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); display: flex; flex-direction: column; justify-content: flex-end; padding: 2rem; color: white; text-align: center; }
h1 { font-size: 3rem; margin: 0 0 1rem 0; text-shadow: 2px 2px 5px black; }

.badges { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.badge { padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 0.9rem; background: rgba(255,255,255,0.2); backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.5); }

.content-wrapper { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-top: -50px; position: relative; z-index: 10; }
.main-info { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); }
.desc { line-height: 1.8; color: #444; white-space: pre-line; font-size: 1.1rem; }

.permit-alert { background: #fff3e0; color: #e65100; padding: 1rem; border-radius: 6px; margin-top: 2rem; border: 1px solid #ffcc80; }
.free-alert { background: #e8f5e9; color: #2e7d32; padding: 1rem; border-radius: 6px; margin-top: 2rem; border: 1px solid #a5d6a7; }

.sidebar-info .map-card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); text-align: center; }
.btn-waze { display: block; background: #3498db; color: white; padding: 1rem; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 1rem; transition: transform 0.2s; }
.btn-waze:hover { transform: translateY(-3px); background: #2980b9; }

.contributor { margin-top: 2rem; font-size: 0.8rem; color: #888; border-top: 1px dashed #eee; padding-top: 1rem; }
.loading, .empty { text-align: center; padding: 5rem; font-size: 1.5rem; color: #888; }

@media (max-width: 768px) {
  .content-wrapper { grid-template-columns: 1fr; margin-top: 0; }
  .hero-image { height: 300px; }
  h1 { font-size: 2rem; }
}
</style>