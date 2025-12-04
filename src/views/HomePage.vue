<template>
  <div class="home">
    
    <div class="hero-header-section">
      <div class="container text-center">
        <h1 class="hero-title">
          Terokai Keindahan <br>
          <span class="text-gradient-animate">{{ t('home.heroHighlight') || 'Alam Semulajadi' }}</span>
        </h1>
        <p class="hero-subtitle">
          {{ t('home.heroSubtitle') || 'Temui aktiviti luar yang menarik, daripada hiking hingga menyelam.' }}
        </p>

        <div class="search-wrapper-floating">
          <div class="search-glow"></div>
          <div class="search-box">
             <i class="fas fa-location-dot search-icon-left"></i>
             <input 
               type="text" 
               v-model="searchQuery"
               :placeholder="t('home.searchPlaceholder')" 
               @keyup.enter="executeSearch" 
             />
             <button class="btn-search-sunset" @click="executeSearch">
               {{ t('common.search') }}
             </button>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content-wrapper container">
      
      <section class="banner-grid-section">
        <div class="banner-large-slider">
          <swiper
            :modules="[Autoplay, Pagination]"
            :slides-per-view="1"
            :loop="true"
            :autoplay="{ delay: 5000, disableOnInteraction: false }"
            :pagination="{ clickable: true }"
            class="mySwiper"
          >
            <swiper-slide v-for="(slide, index) in banners.largeSlides" :key="index">
              <div 
                class="banner-slide-item" 
                :style="{ backgroundImage: `url(${slide.imageUrl})` }"
                @click="goToLink(slide.linkUrl)"
              >
                <div class="overlay-gradient-bottom"></div>
                <div class="slide-caption" v-if="slide.title">
                  <h3>{{ t(slide.title) }}</h3>
                </div>
              </div>
            </swiper-slide>
          </swiper>
        </div>
        
        <div class="banner-stack">
           <div 
            class="banner-small" 
            :style="{ backgroundImage: `url(${banners.small1.imageUrl})` }"
            @click="goToLink(banners.small1.linkUrl)"
          ></div>
           <div 
            class="banner-small" 
            :style="{ backgroundImage: `url(${banners.small2.imageUrl})` }"
            @click="goToLink(banners.small2.linkUrl)"
          ></div>
        </div>
      </section>

      <section class="category-section">
        <div class="category-list">
          <div 
            class="cat-item" 
            v-for="item in popularActivities" 
            :key="item.key" 
            @click="filterBy(item.key)"
          >
            <div class="cat-circle" :style="{ '--icon-color': item.color }">
               <i :class="item.icon"></i>
            </div>
            <span class="cat-label">{{ t('activities.' + item.key) }}</span>
          </div>
          
          <div class="cat-item" @click="$router.push('/trips')">
            <div class="cat-circle more-circle">
                <i class="fas fa-arrow-right"></i>
            </div>
            <span class="cat-label">{{ t('home.more') }}</span>
          </div>
        </div>
      </section>

      <section class="section-container">
        <div class="section-header">
          <h3 class="section-title">Trip <span class="text-gradient-animate">Popular</span></h3>
          <a href="#" @click.prevent="$router.push('/trips')" class="see-more-link">
            {{ t('home.viewAll') }} <i class="fas fa-chevron-right text-xs"></i>
          </a>
        </div>
        
        <div v-if="loadingTrips" class="loading-area">
            <div class="spinner"></div>
            <span>{{ t('common.loading') }}</span>
        </div>
        
        <div v-else-if="latestTrips.length > 0" class="trip-grid">
          <TripCard v-for="trip in latestTrips" :key="trip.id" :trip="trip" />
        </div>
        
        <div v-else class="empty-text">{{ t('home.noTrips') }}</div>
      </section>

      <section class="section-container">
        <div class="section-header">
          <h3 class="section-title">{{ t('home.communityDiscuss') }}</h3>
          <a href="#" @click.prevent="$router.push('/forum')" class="see-more-link">
            {{ t('home.goToForum') }} <i class="fas fa-chevron-right text-xs"></i>
          </a>
        </div>

        <div v-if="loadingPosts" class="loading-area">
             <div class="spinner"></div>
        </div>
        <div v-else-if="latestPosts.length > 0" class="forum-grid">
          <ForumPostCard v-for="post in latestPosts" :key="post.id" :post="post" />
        </div>
        <div v-else class="empty-text">{{ t('home.noPosts') }}</div>
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
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const { t, locale } = useI18n();
const router = useRouter();

// State
const latestTrips = ref<any[]>([]);
const latestPosts = ref<any[]>([]);
const loadingTrips = ref(true);
const loadingPosts = ref(true);
const searchQuery = ref('');

// --- DATA: ACTIVITIES (UPDATED LIST) ---
const popularActivities = [
  { key: 'hiking',       icon: 'fas fa-hiking',          color: '#48bb78' }, // Hiking (Green)
  { key: 'camping',      icon: 'fas fa-campground',      color: '#ed8936' }, // Camping (Orange)
  { key: 'climbing',     icon: 'fas fa-mountain',        color: '#718096' }, // Climbing (Gray) - NEW
  { key: 'caving',       icon: 'fas fa-dungeon',         color: '#4a5568' }, // Caving (Dark Gray)
  { key: 'diving',       icon: 'fas fa-mask-snorkel',    color: '#4299e1' }, // Scuba Diving (Blue)
  { key: 'kayaking',     icon: 'fas fa-sailboat',        color: '#38b2ac' }, // Kayaking (Teal)
  { key: 'rafting',      icon: 'fas fa-water',           color: '#3182ce' }, // Rafting (Indigo) - NEW
  { key: 'surfing',      icon: 'fas fa-person-surfing',  color: '#0bc5ea' }, // Surfing (Cyan) - NEW
  { key: 'fishing',      icon: 'fas fa-fish',            color: '#2b6cb0' }, // Fishing (Navy)
  { key: 'paragliding',  icon: 'fas fa-paper-plane',     color: '#9f7aea' }, // Paragliding (Purple) - NEW (Air Category)
];

// DATA BANNER
const defaultBanners = {
  large: [
    { imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', linkUrl: '/trips', title: 'home.bannerExplore' },
    { imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', linkUrl: '/forum', title: 'home.bannerCommunity' }
  ],
  small1: { imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500', linkUrl: '/trips' },
  small2: { imageUrl: 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=500', linkUrl: '/trips' }
};

const banners = reactive({
  largeSlides: [...defaultBanners.large],
  small1: { ...defaultBanners.small1 },
  small2: { ...defaultBanners.small2 }
});

// Helpers
const formatDate = (dateString: string) => { 
  if(!dateString) return ''; 
  return new Date(dateString).toLocaleDateString(locale.value, { day: 'numeric', month: 'short' }); 
};

const getTimeAgo = (timestamp: any) => { 
  if (!timestamp) return t('time.justNow'); 
  const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(); 
  const now = new Date(); 
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000); 
  if (seconds < 60) return `${seconds}${t('time.s')}`; 
  const minutes = Math.floor(seconds / 60); 
  if (minutes < 60) return `${minutes}${t('time.m')}`; 
  const hours = Math.floor(minutes / 60); 
  if (hours < 24) return `${hours}${t('time.h')}`; 
  return `${Math.floor(hours / 24)}${t('time.d')}`; 
};

const executeSearch = () => { if (searchQuery.value.trim()) router.push({ name: 'search', query: { q: searchQuery.value } }); };
const filterBy = (activityKey: string) => { router.push({ path: '/trips', query: { category: activityKey } }); };
const goToLink = (url: string) => { if (!url) return; if (url.startsWith('http')) window.open(url, '_blank'); else router.push(url); };

onMounted(async () => {
  // Fetch Banners
  try {
    const docSnap = await getDoc(doc(db, "site_settings", "banners"));
    if (docSnap.exists()) { 
      const data = docSnap.data(); 
      if(data.largeSlides && Array.isArray(data.largeSlides) && data.largeSlides.length > 0) banners.largeSlides = data.largeSlides;
      if(data.small1?.imageUrl) Object.assign(banners.small1, data.small1); 
      if(data.small2?.imageUrl) Object.assign(banners.small2, data.small2); 
    }
  } catch (e) { console.log("Default banners used"); }

  // Fetch Trips
  try {
    const qTrips = query(collection(db, "trips"), orderBy("createdAt", "desc"), limit(8));
    const snapTrips = await getDocs(qTrips);
    latestTrips.value = snapTrips.docs.map(doc => ({ id: doc.id, ...doc.data(), date: formatDate(doc.data().startDate) }));
  } catch (e) {} finally { loadingTrips.value = false; }

  // Fetch Posts
  try {
    const qPosts = query(collection(db, "forum_posts"), orderBy("createdAt", "desc"), limit(4));
    const snapPosts = await getDocs(qPosts);
    latestPosts.value = snapPosts.docs.map(doc => ({ id: doc.id, ...doc.data(), excerpt: doc.data().content, timeAgo: getTimeAgo(doc.data().createdAt) }));
  } catch (e) {} finally { loadingPosts.value = false; }
});
</script>

<style scoped>
/* Scoped styles khusus untuk Homepage Layout */
.container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }

/* --- HERO SECTION --- */
.hero-header-section {
  padding: 4rem 1rem 2rem;
  text-align: center;
  background: transparent; /* Background body dah handle warna */
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.hero-subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto 2.5rem;
}

/* --- FLOATING SEARCH BAR --- */
.search-wrapper-floating {
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
}

.search-glow {
  position: absolute;
  inset: -5px;
  background: var(--gradient-sunset);
  border-radius: 50px;
  opacity: 0.2;
  filter: blur(10px);
  transition: opacity 0.3s;
}
.search-wrapper-floating:hover .search-glow { opacity: 0.4; }

.search-box {
  position: relative;
  background: #ffffff;
  border-radius: 50px;
  padding: 8px 8px 8px 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.02);
}

.search-icon-left { color: #cbd5e0; margin-right: 12px; font-size: 1.1rem; }
.search-box input {
  flex: 1; border: none; outline: none; background: transparent;
  font-size: 1rem; color: var(--text-primary);
}

.btn-search-sunset {
  background: var(--gradient-sunset);
  color: white; border: none;
  padding: 12px 32px; border-radius: 50px;
  font-weight: 500; font-size: 0.95rem;
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-search-sunset:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(255, 126, 95, 0.3);
}

/* --- BANNER GRID --- */
.banner-grid-section {
  display: grid; grid-template-columns: 2.5fr 1fr; gap: 20px;
  height: 400px; margin-bottom: 3rem; margin-top: 1rem;
}

.banner-large-slider {
  border-radius: 24px; overflow: hidden; height: 100%;
  box-shadow: var(--shadow-sm);
}

.mySwiper, .banner-slide-item { width: 100%; height: 100%; }
.banner-slide-item {
  background-size: cover; background-position: center;
  position: relative; cursor: pointer;
}

.overlay-gradient-bottom {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%);
}

.slide-caption {
  position: absolute; bottom: 25px; left: 25px; z-index: 2;
}
.slide-caption h3 {
  color: white; font-size: 1.8rem; margin: 0; text-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

.banner-stack { display: flex; flex-direction: column; gap: 20px; height: 100%; }
.banner-small {
  flex: 1; border-radius: 20px; background-size: cover; background-position: center;
  cursor: pointer; transition: transform 0.3s;
}
.banner-small:hover { transform: translateY(-5px); }


/* --- CATEGORY ICONS (STYLE BARU) --- */
.category-section { margin-bottom: 3rem; padding: 10px 0; }
.category-list {
  display: flex; gap: 25px; justify-content: center; flex-wrap: wrap;
}

.cat-item {
  display: flex; flex-direction: column; align-items: center;
  cursor: pointer;
}

/* Bulatan Putih */
.cat-circle {
  width: 65px; height: 65px;
  background: #ffffff;
  border-radius: 20px; /* Squircles (sedikit petak rounded) */
  display: flex; align-items: center; justify-content: center;
  font-size: 1.6rem;
  margin-bottom: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  border: 1px solid #f1f5f9;
  
  /* Gunakan CSS variable utk warna icon */
  color: #a0aec0; /* Default Grey */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Icon dalam bulatan */
.cat-circle i { transition: transform 0.3s; }

/* HOVER EFFECTS - MAGIC HAPPENS HERE */
.cat-item:hover .cat-circle {
  transform: translateY(-8px);
  box-shadow: var(--shadow-float);
  color: var(--icon-color); /* Bertukar warna ikut jenis aktiviti */
  background: white;
  border-color: transparent;
}

.cat-item:hover .cat-circle i { transform: scale(1.1); }
.cat-item:hover .cat-label { color: var(--c-sunset-purple); }

.more-circle { color: var(--c-sunset-purple); background: #fdfaff; }
.cat-label { font-size: 0.85rem; font-weight: 500; color: var(--text-secondary); transition: color 0.3s; }

/* --- SECTION HEADERS --- */
.section-container { margin-bottom: 4rem; }
.section-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1.5rem;
}

.section-title { font-size: 1.5rem; font-weight: 700; margin: 0; }
.see-more-link {
  color: var(--c-sunset-orange); font-size: 0.9rem;
  display: flex; align-items: center; gap: 5px;
}

/* GRIDS */
.trip-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; }
.forum-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; }
.loading-area { text-align: center; padding: 3rem; color: #cbd5e0; }

.spinner {
  width: 30px; height: 30px; margin: 0 auto 10px;
  border: 3px solid #edf2f7; border-top-color: var(--c-sunset-orange);
  border-radius: 50%; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.empty-text { text-align: center; color: #a0aec0; padding: 3rem; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .hero-title { font-size: 2rem; }
  .banner-grid-section { grid-template-columns: 1fr; height: auto; gap: 15px; }
  .banner-large-slider { height: 250px; border-radius: 16px; }
  .banner-stack { display: none; /* Hide stack banner on mobile for clean look */ }
  .category-list { gap: 15px; justify-content: flex-start; overflow-x: auto; padding-bottom: 20px; padding-left: 10px; }
  .cat-item { min-width: 70px; }
  .trip-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .forum-grid { grid-template-columns: 1fr; }
}
</style>