<template>
  <div class="home">
    
    <div class="search-strip-container">
      <div class="search-row">
        <div class="category-dropdown">
          <span>All Category</span>
          <span class="arrow">▼</span>
        </div>
        
        <div class="search-input-wrapper">
           <input type="text" :placeholder="t('home.searchPlaceholder')" @keyup.enter="handleSearch" />
        </div>

        <button class="btn-search-strip" @click="handleSearch">
          {{ t('common.search') }}
        </button>
      </div>
    </div>

    <div class="main-content-wrapper">
      
      <section class="hero-grid-section">
        
        <div class="banner-large" :style="{ backgroundImage: `url('https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800')` }">
          <div class="banner-text">
            <h2>Hiking Adventure</h2>
            <button>Lihat</button>
          </div>
        </div>

        <div class="banner-stack">
          <div class="banner-small" :style="{ backgroundImage: `url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500')` }">
            <span>Diving Promo</span>
          </div>
          <div class="banner-small" :style="{ backgroundImage: `url('https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=500')` }">
            <span>Camping Gear</span>
          </div>
        </div>

        <div class="icon-sidebar">
          <div class="icon-box" v-for="item in popularActivities" :key="item.name" @click="filterBy(item.name)">
            <div class="icon-circle">{{ item.emoji }}</div>
            <span class="icon-label">{{ item.name }}</span>
          </div>
          <div class="icon-box">
            <div class="icon-circle">...</div>
            <span class="icon-label">More</span>
          </div>
        </div>

      </section>

      <section class="section-container">
        <h2>{{ t('home.latestTrips') }}</h2>
        
        <div v-if="loadingTrips" class="loading-text">⏳ {{ t('common.loading') }}</div>
        
        <div v-else-if="latestTrips.length > 0" class="trip-grid">
          <TripCard v-for="trip in latestTrips" :key="trip.id" :trip="trip" />
        </div>
        
        <div v-else class="empty-text">Belum ada trip terkini.</div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import TripCard from '../components/trip/TripCard.vue'; 
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const { t } = useI18n();
const router = useRouter();
const latestTrips = ref<any[]>([]);
const loadingTrips = ref(true);

// Ikon untuk Sidebar Kanan
const popularActivities = [
  { name: 'Hiking', emoji: '⛰️' },
  { name: 'Camping', emoji: '⛺' },
  { name: 'Diving', emoji: '🤿' },
  { name: 'Cycling', emoji: '🚴' }
];

const formatDate = (dateString: string) => {
  if(!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
};

const handleSearch = () => { alert("Searching..."); };
const filterBy = (activity: string) => { router.push('/trips'); };

onMounted(async () => {
  try {
    const qTrips = query(collection(db, "trips"), orderBy("createdAt", "desc"), limit(8));
    const snapTrips = await getDocs(qTrips);
    latestTrips.value = snapTrips.docs.map(doc => ({ id: doc.id, ...doc.data(), date: formatDate(doc.data().startDate) }));
  } catch (e) { console.error(e); } 
  finally { loadingTrips.value = false; }
});
</script>

<style scoped>
.home { background-color: #f4f6f8; min-height: 100vh; }
.main-content-wrapper { max-width: 1200px; margin: 0 auto; padding: 1rem; }

/* --- SEARCH STRIP --- */
.search-strip-container { background: white; padding: 1rem 0; border-bottom: 1px solid #ddd; }
.search-row { max-width: 1000px; margin: 0 auto; display: flex; border: 2px solid #2c3e50; border-radius: 8px; overflow: hidden; }

.category-dropdown { background: #f9f9f9; padding: 0.8rem 1.5rem; border-right: 1px solid #ddd; cursor: pointer; display: flex; align-items: center; gap: 10px; font-weight: bold; color: #555; }
.search-input-wrapper { flex-grow: 1; }
.search-input-wrapper input { width: 100%; height: 100%; border: none; padding: 0 1rem; font-size: 1rem; outline: none; }
.btn-search-strip { background: #2c3e50; color: white; border: none; padding: 0 2rem; font-weight: bold; cursor: pointer; font-size: 1rem; }
.btn-search-strip:hover { background: #34495e; }

/* --- HERO GRID LAYOUT --- */
.hero-grid-section {
  display: grid;
  grid-template-columns: 2fr 1fr 80px; /* Kiri (Besar), Tengah (Stack), Kanan (Icon) */
  gap: 1rem;
  margin-top: 1.5rem;
  height: 400px;
}

/* Banner Besar */
.banner-large { background-size: cover; background-position: center; border-radius: 12px; position: relative; display: flex; align-items: flex-end; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.banner-text { padding: 2rem; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); width: 100%; color: white; }
.banner-text h2 { margin: 0 0 10px 0; font-size: 2rem; }
.banner-text button { padding: 0.5rem 1.5rem; background: #e67e22; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }

/* Banner Stack */
.banner-stack { display: flex; flex-direction: column; gap: 1rem; }
.banner-small { flex: 1; background-size: cover; background-position: center; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; text-shadow: 0 2px 5px rgba(0,0,0,0.5); font-size: 1.2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s; cursor: pointer; }
.banner-small:hover { transform: scale(1.02); }

/* Icon Sidebar */
.icon-sidebar { display: flex; flex-direction: column; gap: 10px; align-items: center; }
.icon-box { display: flex; flex-direction: column; align-items: center; cursor: pointer; width: 100%; }
.icon-circle { width: 50px; height: 50px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; border: 1px solid #ddd; transition: all 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.icon-box:hover .icon-circle { border-color: #e67e22; background: #fff8f0; }
.icon-label { font-size: 0.7rem; margin-top: 4px; color: #555; font-weight: 600; text-align: center; }

/* Section Trip Bawah */
.section-container { margin-top: 3rem; }
.trip-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }

/* RESPONSIVE */
@media (max-width: 900px) {
  .hero-grid-section { grid-template-columns: 1fr; height: auto; }
  .banner-large { height: 250px; }
  .banner-stack { flex-direction: row; height: 150px; }
  .icon-sidebar { flex-direction: row; justify-content: center; flex-wrap: wrap; }
}
</style>