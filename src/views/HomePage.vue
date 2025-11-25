<template>
  <div class="home">
    
    <div class="search-strip-container">
      <div class="container">
        <div class="search-row">
          <div class="search-input-wrapper">
             <input 
               type="text" 
               v-model="searchQuery"
               :placeholder="t('home.searchPlaceholder')" 
               @keyup.enter="executeSearch" 
             />
             <button class="btn-search-strip" @click="executeSearch">
               {{ t('common.search') }}
             </button>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content-wrapper container">
      
      <section class="hero-grid-section">
        
        <div class="banner-large-slider">
          <swiper
            :modules="[Autoplay, Pagination]"
            :slides-per-view="1"
            :loop="true"
            :autoplay="{ delay: 4000, disableOnInteraction: false }"
            :pagination="{ clickable: true }"
            class="mySwiper"
          >
            <swiper-slide v-for="(slide, index) in banners.largeSlides" :key="index">
              <div 
                class="banner-slide-item" 
                :style="{ backgroundImage: `url(${slide.imageUrl || 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800'})` }"
                @click="goToLink(slide.linkUrl)"
              >
                <div class="slide-caption" v-if="slide.title">
                  <h3>{{ slide.title }}</h3>
                </div>
              </div>
            </swiper-slide>
          </swiper>
        </div>

        <div class="banner-stack">
          <div 
            class="banner-small" 
            :style="{ backgroundImage: `url(${banners.small1.imageUrl || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500'})` }"
            @click="goToLink(banners.small1.linkUrl)"
          >
          </div>
          <div 
            class="banner-small" 
            :style="{ backgroundImage: `url(${banners.small2.imageUrl || 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=500'})` }"
            @click="goToLink(banners.small2.linkUrl)"
          >
          </div>
        </div>

      </section>

      <section class="category-section">
        <div class="category-list">
          <div class="cat-item" v-for="item in popularActivities" :key="item.name" @click="filterBy(item.name)">
            <div class="cat-circle">{{ item.emoji }}</div>
            <span class="cat-label">{{ item.name }}</span>
          </div>
          <div class="cat-item" @click="$router.push('/trips')">
            <div class="cat-circle">...</div>
            <span class="cat-label">Lagi</span>
          </div>
        </div>
      </section>

      <section class="section-container">
        <div class="section-header">
          <h3>{{ t('home.latestTrips') }}</h3>
          <a href="#" @click.prevent="$router.push('/trips')" class="see-more">Lihat Semua ></a>
        </div>
        
        <div v-if="loadingTrips" class="loading-text">⏳ {{ t('common.loading') }}</div>
        
        <div v-else-if="latestTrips.length > 0" class="trip-grid">
          <TripCard v-for="trip in latestTrips" :key="trip.id" :trip="trip" />
        </div>
        
        <div v-else class="empty-text">Belum ada trip terkini.</div>
      </section>

      <section class="section-container">
        <div class="section-header">
          <h3>{{ t('home.communityDiscuss') }}</h3>
          <a href="#" @click.prevent="$router.push('/forum')" class="see-more">Ke Forum ></a>
        </div>

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

// 🔥 IMPORT SWIPER 🔥
// IMPORT SWIPER
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination } from 'swiper/modules';

// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/pagination';

const { t } = useI18n();
const router = useRouter();
const latestTrips = ref<any[]>([]);
const latestPosts = ref<any[]>([]);
const loadingTrips = ref(true);
const loadingPosts = ref(true);
const searchQuery = ref('');

// 🔥 STRUKTUR BANNER BARU 🔥
// Saya letak default images supaya slider tak kosong mula-mula
const banners = reactive({
  largeSlides: [
    { imageUrl: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800', linkUrl: '/trips', title: 'Jelajah Alam' },
    { imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', linkUrl: '/forum', title: 'Komuniti Outdoor' },
    { imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32119?w=800', linkUrl: '/directory', title: 'Cari Servis' }
  ],
  small1: { imageUrl: '', linkUrl: '' },
  small2: { imageUrl: '', linkUrl: '' }
});

const popularActivities = [
  { name: 'Hiking', emoji: '⛰️' },
  { name: 'Camping', emoji: '⛺' },
  { name: 'Diving', emoji: '🤿' },
  { name: 'Cycling', emoji: '🚴' },
  { name: 'Climbing', emoji: '🧗' },
  { name: 'Kayaking', emoji: '🛶' },
  { name: 'Rafting', emoji: '🌊' },
  { name: 'Fishing', emoji: '🎣' },
  { name: 'Caving', emoji: '🦇' },
  { name: 'Surfing', emoji: '🏄' },
  { name: 'Run', emoji: '🏃' },
];

const formatDate = (dateString: string) => { if(!dateString) return ''; return new Date(dateString).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' }); };
const getTimeAgo = (timestamp: any) => { if (!timestamp) return 'Baru saja'; const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(); const now = new Date(); const seconds = Math.floor((now.getTime() - date.getTime()) / 1000); if (seconds < 60) return `${seconds}s`; const minutes = Math.floor(seconds / 60); if (minutes < 60) return `${minutes}m`; const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours}h`; return `${Math.floor(hours / 24)}d`; };
const executeSearch = () => { if (searchQuery.value.trim()) router.push({ name: 'search', query: { q: searchQuery.value } }); };
const filterBy = (activity: string) => { router.push({ path: '/trips', query: { category: activity } }); };
const goToLink = (url: string) => { if (!url) return; if (url.startsWith('http')) window.open(url, '_blank'); else router.push(url); };

onMounted(async () => {
  // 1. Fetch Banner Settings
  try {
    const docSnap = await getDoc(doc(db, "site_settings", "banners"));
    if (docSnap.exists()) { 
      const data = docSnap.data(); 
      // Kalau ada array slides dalam DB, guna itu
      if(data.largeSlides && Array.isArray(data.largeSlides) && data.largeSlides.length > 0) {
         banners.largeSlides = data.largeSlides; 
      }
      // Kalau cuma ada 'large' (structure lama), kita masukkan dia dalam array supaya slider tetap jalan
      else if (data.large) {
         banners.largeSlides = [data.large];
      }

      if(data.small1) Object.assign(banners.small1, data.small1); 
      if(data.small2) Object.assign(banners.small2, data.small2); 
    }
  } catch (e) { console.log("Gagal load banners", e); }

  // 2. Fetch Trips
  try {
    const qTrips = query(collection(db, "trips"), orderBy("createdAt", "desc"), limit(12));
    const snapTrips = await getDocs(qTrips);
    latestTrips.value = snapTrips.docs.map(doc => ({ id: doc.id, ...doc.data(), date: formatDate(doc.data().startDate) }));
  } catch (e) {} finally { loadingTrips.value = false; }

  // 3. Fetch Posts
  try {
    const qPosts = query(collection(db, "forum_posts"), orderBy("createdAt", "desc"), limit(4));
    const snapPosts = await getDocs(qPosts);
    latestPosts.value = snapPosts.docs.map(doc => ({ id: doc.id, ...doc.data(), excerpt: doc.data().content, timeAgo: getTimeAgo(doc.data().createdAt) }));
  } catch (e) {} finally { loadingPosts.value = false; }
});
</script>

<style scoped>
.home { background-color: #f5f5f5; min-height: 100vh; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }

/* SEARCH STRIP */
.search-strip-container { background: white; padding: 0.8rem 0; border-bottom: 1px solid #eaeaea; margin-bottom: 0.8rem; position: sticky; top: 0; z-index: 999; }
.search-row { display: flex; justify-content: center; }
.search-input-wrapper { display: flex; width: 100%; max-width: 800px; border: 2px solid #27ae60; border-radius: 4px; overflow: hidden; }
.search-input-wrapper input { flex: 1; border: none; padding: 0.5rem 1rem; outline: none; font-size: 0.9rem; }
.btn-search-strip { background: #27ae60; color: white; border: none; padding: 0 2rem; cursor: pointer; font-size: 0.95rem; font-weight: bold; white-space: nowrap; }
.btn-search-strip:hover { background: #219150; }

/* 🔥 HERO GRID BARU (420px Tinggi) 🔥 */
.hero-grid-section { 
  display: grid; 
  grid-template-columns: 2fr 1fr; 
  gap: 10px; 
  height: 420px; /* TINGGI DITAMBAH */
  margin-bottom: 1.5rem; 
}

/* Wrapper Slider Kiri */
.banner-large-slider { 
  height: 100%; 
  border-radius: 6px; 
  overflow: hidden; 
  box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
  position: relative;
}

.mySwiper { width: 100%; height: 100%; }

.banner-slide-item { 
  width: 100%; 
  height: 100%; 
  background-size: cover; 
  background-position: center; 
  cursor: pointer; 
  position: relative;
}

/* Caption atas banner (optional) */
.slide-caption {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0,0,0,0.5);
  color: white;
  padding: 5px 15px;
  border-radius: 4px;
  backdrop-filter: blur(2px);
}
.slide-caption h3 { margin: 0; font-size: 1.2rem; }

/* Stack Kanan */
.banner-stack { display: flex; flex-direction: column; gap: 10px; height: 100%; }
.banner-small { 
  flex: 1; 
  background-size: cover; 
  background-position: center; 
  border-radius: 6px; 
  cursor: pointer; 
  box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
  transition: transform 0.2s;
}
.banner-small:hover { transform: translateY(-3px); }

/* Pagination Dots Customization */
:deep(.swiper-pagination-bullet) { background: white; opacity: 0.6; }
:deep(.swiper-pagination-bullet-active) { background: #27ae60; opacity: 1; }

/* CATEGORY */
.category-section { background: white; padding: 1rem 0.5rem; border-radius: 3px; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.category-list { display: flex; justify-content: flex-start; gap: 1.5rem; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none; }
.category-list::-webkit-scrollbar { display: none; }
.cat-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; min-width: 60px; transition: transform 0.1s; }
.cat-item:hover { transform: translateY(-2px); }
.cat-circle { width: 40px; height: 40px; border: 1px solid #eee; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; margin-bottom: 5px; background: #fff; }
.cat-label { font-size: 0.7rem; color: #555; text-align: center; line-height: 1.2; font-weight: 500; }

/* SECTIONS */
.section-container { margin-bottom: 1.5rem; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; padding: 0.8rem 1rem; background: white; border-bottom: 1px solid #f0f0f0; border-radius: 3px 3px 0 0; }
.section-header h3 { margin: 0; font-size: 1rem; color: #27ae60; text-transform: uppercase; font-weight: bold; }
.see-more { color: #777; text-decoration: none; font-size: 0.8rem; }
.see-more:hover { color: #27ae60; }

.trip-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; } 
.forum-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }

.loading-text, .empty-text { text-align: center; color: #999; padding: 1.5rem; font-style: italic; background: white; font-size: 0.9rem; }

/* RESPONSIVE MOBILE */
@media (max-width: 1024px) { .trip-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 768px) {
  .hero-grid-section { 
    height: auto; 
    grid-template-columns: 1fr; 
    gap: 10px;
  }
  .banner-large-slider { 
    height: 250px; /* Tinggi slider di mobile */
  }
  .banner-stack { 
    flex-direction: row; 
    height: 120px; 
    gap: 10px;
  }
  .trip-grid { grid-template-columns: repeat(2, 1fr); }
  .forum-grid { grid-template-columns: 1fr; }
  .category-list { gap: 1rem; }
}
</style>