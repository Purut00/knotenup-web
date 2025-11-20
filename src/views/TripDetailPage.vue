<template>
  <div class="detail-page">
    
    <div v-if="loading" class="loading-container">
      <p>⏳ {{ t('common.loading') }}</p>
    </div>

    <div v-else-if="trip" class="trip-container">
      
      <div class="hero-banner" :style="{ backgroundImage: `url(${trip.image})` }">
        <div class="overlay">
          <span class="badge-cat">{{ trip.category }}</span>
          <h1>{{ trip.title }}</h1>
          <div class="hero-meta">
            <span>📍 {{ trip.location }}</span>
            <span>📅 {{ formatDate(trip.startDate) }}</span>
            <span>💪 {{ trip.difficulty }}</span>
          </div>
        </div>
      </div>

      <div class="content-wrapper">
        <div class="main-info">
          
          <div class="section-box">
            <h3>Tentang Trip Ini</h3>
            <p class="desc-text">{{ trip.description }}</p>
          </div>

          <div class="section-box">
            <h3>Pakej Termasuk</h3>
            <ul class="includes-list">
              <li v-for="item in trip.includes" :key="item">✅ {{ item }}</li>
            </ul>
          </div>

          <div class="organizer-card">
            <img :src="trip.organizerImage || 'https://i.pravatar.cc/150?img=3'" class="org-avatar" />
            <div class="org-info">
              <small>Dianjurkan oleh:</small>
              <h4>{{ trip.organizerName }}</h4>
            </div>
            <button class="btn-chat">💬 Chat</button>
          </div>

        </div>

        <div class="booking-sidebar">
          <div class="price-card">
            <div class="price-tag">
              <span class="amount">RM {{ trip.price }}</span>
              <span class="unit">/ pax</span>
            </div>
            
            <div class="slots-info">
              <div class="progress-bar">
                <div class="fill" :style="{ width: (trip.currentSlots / trip.maxSlots) * 100 + '%' }"></div>
              </div>
              <p>{{ trip.currentSlots }} / {{ trip.maxSlots }} tempat dipenuhi</p>
            </div>

            <div class="action-buttons">
              <a v-if="trip.groupLink" :href="trip.groupLink" target="_blank" class="btn-join">
                🚀 Sertai Sekarang (WhatsApp)
              </a>
              <button v-else class="btn-join" disabled>Link Belum Disediakan</button>
            </div>

            <p class="note">Hubungi organizer untuk pembayaran.</p>
          </div>
        </div>
      </div>

    </div>

    <div v-else class="error-container">
      <h2>Trip tidak dijumpai 😔</h2>
      <button @click="$router.push('/trips')">Kembali ke Senarai</button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const { t } = useI18n();
const route = useRoute();
const trip = ref<any>(null);
const loading = ref(true);

// Helper: Format Tarikh (cth: 2025-12-12 -> 12 Dec 2025)
const formatDate = (dateString: string) => {
  if(!dateString) return '';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-MY', options);
};

onMounted(async () => {
  const tripId = route.params.id as string;
  
  try {
    const docRef = doc(db, "trips", tripId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      trip.value = docSnap.data();
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error getting trip:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.detail-page { background-color: #f4f6f8; min-height: 100vh; padding-bottom: 3rem; }
.loading-container, .error-container { text-align: center; padding: 5rem; font-size: 1.2rem; color: #666; }

/* HERO BANNER */
.hero-banner { height: 400px; background-size: cover; background-position: center; position: relative; }
.overlay { background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8)); height: 100%; display: flex; flex-direction: column; justify-content: flex-end; padding: 2rem; color: white; max-width: 1200px; margin: 0 auto; width: 100%; box-sizing: border-box; }
.badge-cat { background: #e67e22; padding: 5px 12px; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 0.8rem; width: fit-content; margin-bottom: 10px; }
h1 { font-size: 2.5rem; margin: 0 0 1rem 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
.hero-meta { display: flex; gap: 20px; font-size: 1.1rem; }

/* LAYOUT */
.content-wrapper { max-width: 1200px; margin: -50px auto 0; padding: 0 1rem; display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; position: relative; z-index: 10; }

/* LEFT COLUMN */
.section-box { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 2rem; }
.section-box h3 { margin-top: 0; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 1rem; }
.desc-text { line-height: 1.8; color: #444; white-space: pre-line; /* Kekalkan perenggan */ }
.includes-list { list-style: none; padding: 0; }
.includes-list li { padding: 8px 0; border-bottom: 1px dashed #eee; color: #555; }

/* ORGANIZER CARD */
.organizer-card { background: white; padding: 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 1rem; border: 1px solid #eee; }
.org-avatar { width: 50px; height: 50px; border-radius: 50%; }
.org-info { flex-grow: 1; }
.org-info small { color: #888; }
.org-info h4 { margin: 0; color: #333; }
.btn-chat { border: 1px solid #ccc; background: white; padding: 0.5rem 1rem; border-radius: 50px; cursor: pointer; font-weight: bold; }

/* RIGHT COLUMN (SIDEBAR) */
.booking-sidebar { position: sticky; top: 100px; }
.price-card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); text-align: center; border-top: 5px solid #e67e22; }
.amount { font-size: 2.5rem; font-weight: 900; color: #2c3e50; }
.unit { color: #888; font-size: 1rem; }

.slots-info { margin: 1.5rem 0; text-align: left; }
.progress-bar { height: 8px; background: #eee; border-radius: 4px; overflow: hidden; margin-bottom: 5px; }
.fill { height: 100%; background: #2ecc71; }
.slots-info p { font-size: 0.85rem; color: #666; margin: 0; text-align: center; }

.btn-join { display: block; width: 100%; padding: 1rem; background-color: #2c3e50; color: white; text-decoration: none; font-weight: bold; border-radius: 8px; margin-bottom: 10px; transition: background 0.2s; border: none; cursor: pointer; }
.btn-join:hover { background-color: #1a252f; }
.btn-join:disabled { background-color: #ccc; cursor: not-allowed; }

.note { font-size: 0.8rem; color: #999; margin-top: 1rem; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .content-wrapper { grid-template-columns: 1fr; margin-top: 0; }
  .hero-banner { height: 300px; }
  h1 { font-size: 1.8rem; }
}
</style>