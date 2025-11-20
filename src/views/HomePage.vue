<template>
  <div class="home">
    
    <div class="search-strip-container">
      <div class="search-row">
        <div class="search-input-wrapper">
           <input type="text" v-model="searchQuery" :placeholder="t('home.searchPlaceholder')" @keyup.enter="executeSearch" />
        </div>
        <button class="btn-search-strip" @click="executeSearch">{{ t('common.search') }}</button>
      </div>
    </div>

    <div class="main-content-wrapper">
      
      <section class="hero-grid-section">
        
        <div 
          class="banner-large" 
          :style="{ backgroundImage: `url(${banners.large.imageUrl || 'https://via.placeholder.com/800x600?text=No+Image'})` }"
        >
          <div class="banner-text">
            <h2>{{ banners.large.title || 'Welcome to KnotenUp' }}</h2>
            <button @click="goToLink(banners.large.linkUrl)">Lihat</button>
          </div>
        </div>

        <div class="banner-stack">
          <div 
            class="banner-small" 
            :style="{ backgroundImage: `url(${banners.small1.imageUrl || 'https://via.placeholder.com/500x250?text=Promo+1'})` }"
            @click="goToLink(banners.small1.linkUrl)"
          >
            </div>

          <div 
            class="banner-small" 
            :style="{ backgroundImage: `url(${banners.small2.imageUrl || 'https://via.placeholder.com/500x250?text=Promo+2'})` }"
            @click="goToLink(banners.small2.linkUrl)"
          >
          </div>
        </div>

        <div class="icon-sidebar">
          <div class="icon-box" v-for="item in popularActivities" :key="item.name" @click="filterBy(item.name)">
            <div class="icon-circle">{{ item.emoji }}</div>
            <span class="icon-label">{{ item.name }}</span>
          </div>
          <div class="icon-box" @click="$router.push('/trips')">
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

      <section class="section-container">
        <h2>{{ t('home.communityDiscuss') }}</h2>
        <div v-if="loadingPosts" class="loading-text">⏳ {{ t('common.loading') }}</div>
        <div v-else-if="latestPosts.length > 0" class="forum-grid">
          <ForumPostCard v-for="post in latestPosts" :key="post.id" :post="post" />
        </div>
        <div v-else class="empty-text">Belum ada perbincangan.</div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import TripCard from '../components/trip/TripCard.vue'; 
import ForumPostCard from '../components/forum/ForumPostCard.vue'; 
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';

const { t } = useI18n();
const router = useRouter();
const latestTrips = ref<any[]>([]);
const latestPosts = ref<any[]>([]);
const loadingTrips = ref(true);
const loadingPosts = ref(true);
const searchQuery = ref('');

// Banners State (Dynamic)
const banners = reactive({
  large: { imageUrl: '', linkUrl: '', title: '' },
  small1: { imageUrl: '', linkUrl: '' },
  small2: { imageUrl: '', linkUrl: '' }
});

const popularActivities = [
  { name: 'Hiking', emoji: '⛰️' },
  { name: 'Camping', emoji: '⛺' },
  { name: 'Diving', emoji: '🤿' },
  { name: 'Cycling', emoji: '🚴' }
];

// Helpers
const formatDate = (dateString: string) => {
  if(!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
};

const getTimeAgo = (timestamp: any) => {
  if (!timestamp) return 'Baru saja';
  const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date();
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

// Actions
const executeSearch = () => {
  if (searchQuery.value.trim()) router.push({ name: 'search', query: { q: searchQuery.value } });
};

const filterBy = (activity: string) => { router.push({ path: '/trips', query: { category: activity } }); };

// Navigate Banner Links
const goToLink = (url: string) => {
  if (!url) return;
  if (url.startsWith('http')) {
    window.open(url, '_blank'); // Link luar (e.g. youtube)
  } else {
    router.push(url); // Link dalam (e.g. /trips)
  }
};

// Fetch Data
onMounted(async () => {
  // 0. Load Banners Settings
  try {
    const docSnap = await getDoc(doc(db, "site_settings", "banners"));
    if (docSnap.exists()) {
      const data = docSnap.data();
      if(data.large) Object.assign(banners.large, data.large);
      if(data.small1) Object.assign(banners.small1, data.small1);
      if(data.small2) Object.assign(banners.small2, data.small2);
    }
  } catch (e) { console.error("Banner error:", e); }

  // 1. Trips
  try {
    const qTrips = query(collection(db, "trips"), orderBy("createdAt", "desc"), limit(8));
    const snapTrips = await getDocs(qTrips);
    latestTrips.value = snapTrips.docs.map(doc => ({ id: doc.id, ...doc.data(), date: formatDate(doc.data().startDate) }));
  } catch (e) { console.error(e); } 
  finally { loadingTrips.value = false; }

  // 2. Forum
  try {
    const qPosts = query(collection(db, "forum_posts"), orderBy("createdAt", "desc"), limit(4));
    const snapPosts = await getDocs(qPosts);
    latestPosts.value = snapPosts.docs.map(doc => ({
        id: doc.id, ...doc.data(), excerpt: doc.data().content, timeAgo: getTimeAgo(doc.data().createdAt)
    }));
  } catch (e) { console.error(e); } 
  finally { loadingPosts.value = false; }
});
</script>

<style scoped>
.home { background-color: #f4f6f8; min-height: 100vh; }
.main-content-wrapper { max-width: 1200px; margin: 0 auto; padding: 1rem; }

/* SEARCH */
.search-strip-container { background: white; padding: 1rem 0; border-bottom: 1px solid #ddd; }
.search-row { max-width: 800px; margin: 0 auto; display: flex; border: 2px solid #2c3e50; border-radius: 50px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.search-input-wrapper { flex-grow: 1; }
.search-input-wrapper input { width: 100%; height: 100%; border: none; padding: 0 1.5rem; font-size: 1rem; outline: none; }
.btn-search-strip { background: #2c3e50; color: white; border: none; padding: 0.8rem 2.5rem; font-weight: bold; cursor: pointer; font-size: 1rem; transition: background 0.2s; }
.btn-search-strip:hover { background: #34495e; }

/* GRID HERO */
.hero-grid-section { display: grid; grid-template-columns: 2fr 1fr 80px; gap: 1rem; margin-top: 1.5rem; height: 400px; }
.banner-large { background-size: cover; background-position: center; border-radius: 12px; position: relative; display: flex; align-items: flex-end; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.banner-text { padding: 2rem; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); width: 100%; color: white; }
.banner-text h2 { margin: 0 0 10px 0; font-size: 2rem; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); }
.banner-text button { padding: 0.5rem 1.5rem; background: #e67e22; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
.banner-stack { display: flex; flex-direction: column; gap: 1rem; }
.banner-small { flex: 1; background-size: cover; background-position: center; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; text-shadow: 0 2px 5px rgba(0,0,0,0.5); font-size: 1.2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s; cursor: pointer; position: relative; }
.banner-small:hover { transform: scale(1.02); }
.icon-sidebar { display: flex; flex-direction: column; gap: 10px; align-items: center; }
.icon-box { display: flex; flex-direction: column; align-items: center; cursor: pointer; width: 100%; }
.icon-circle { width: 50px; height: 50px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; border: 1px solid #ddd; transition: all 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.icon-box:hover .icon-circle { border-color: #e67e22; background: #fff8f0; }
.icon-label { font-size: 0.7rem; margin-top: 4px; color: #555; font-weight: 600; text-align: center; }
.section-container { margin-top: 3rem; }
h2 { text-align: center; margin-bottom: 3rem; font-size: 2.2rem; color: #2c3e50; }
.trip-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
.forum-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 2rem; }
.loading-text, .empty-text { text-align: center; color: #777; padding: 2rem; }
@media (max-width: 900px) { .hero-grid-section { grid-template-columns: 1fr; height: auto; } .banner-large { height: 250px; } .banner-stack { flex-direction: row; height: 150px; } .icon-sidebar { flex-direction: row; justify-content: center; flex-wrap: wrap; } }
</style>