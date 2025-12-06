<template>
  <div class="home" :style="{ backgroundImage: `url(${bgImage})` }">
    
    <!-- HERO SECTION -->
    <div class="hero-header-section">
      <div class="container text-center">
        <div class="hero-glow-purple"></div>
        <div class="hero-glow-orange"></div>

        <h1 class="hero-title animate-fade-in-up">
          Terokai Keindahan <br>
          <span class="text-gradient-animate">{{ t('home.heroHighlight') || 'Alam Semulajadi' }}</span>
        </h1>
        <p class="hero-subtitle animate-fade-in-up" style="animation-delay: 0.1s;">
          {{ t('home.heroSubtitle') || 'Temui aktiviti luar yang menarik, daripada hiking hingga menyelam.' }}
        </p>

        <!-- SEARCH BAR -->
        <div class="search-wrapper-floating animate-float" style="animation-delay: 0.2s;">
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
      
      <!-- BANNER GRID SECTION -->
      <section class="banner-grid-section animate-fade-in-up" style="animation-delay: 0.3s;">
        <!-- Large Slider -->
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
        
        <!-- Stacked Small Banners -->
        <div class="banner-stack">
           <div 
            class="banner-small" 
            :style="{ backgroundImage: `url(${banners.small1.imageUrl})` }"
            @click="goToLink(banners.small1.linkUrl)"
          >
            <div class="overlay-hover"></div>
          </div>
           <div 
            class="banner-small" 
            :style="{ backgroundImage: `url(${banners.small2.imageUrl})` }"
            @click="goToLink(banners.small2.linkUrl)"
          >
            <div class="overlay-hover"></div>
          </div>
        </div>
      </section>

      <!-- CATEGORY ICONS SECTION -->
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

      <!-- TRIP POPULAR SECTION -->
      <section class="section-container">
        <div class="section-header">
          <div class="flex items-center gap-4">
            <h3 class="section-title"><span class="text-gradient-animate">Trip Popular</span></h3>
            
            <!-- BUTTON TOGGLE VIEW (Ditambah) -->
            <button 
              @click="isCompact = !isCompact"
              class="toggle-view-btn"
              :title="isCompact ? 'Tukar ke Grid Penuh' : 'Tukar ke Grid Ringkas'"
            >
              <i :class="isCompact ? 'fas fa-border-all' : 'fas fa-list-ul'"></i>
              <span class="ml-2 text-xs font-medium hidden sm:inline">{{ isCompact ? 'Compact Grid' : 'Full Grid' }}</span>
            </button>
          </div>

          <a href="#" @click.prevent="$router.push('/trips')" class="see-more-link">
            {{ t('home.viewAll') }} <i class="fas fa-chevron-right text-xs"></i>
          </a>
        </div>
        
        <div v-if="loadingTrips" class="loading-area">
            <div class="spinner"></div>
            <span>{{ t('common.loading') }}</span>
        </div>
        
        <!-- TRIP GRID (Diubah suai) -->
        <!-- Jika isCompact: guna trip-grid-compact (2 cols). Jika tidak: trip-grid (auto-fill) -->
        <div v-else-if="latestTrips.length > 0" :class="isCompact ? 'trip-grid-compact' : 'trip-grid'">
          <TripCard 
            v-for="trip in latestTrips" 
            :key="trip.id" 
            :trip="trip" 
            :is-compact="isCompact"
          />
        </div>
        
        <div v-else class="empty-text">{{ t('home.noTrips') }}</div>
      </section>

      <!-- FORUM SECTION -->
      <section class="section-container">
        <div class="section-header">
          <h3 class="section-title"><span class="text-gradient-animate">{{ t('home.communityDiscuss') }}</span></h3>
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

// Import gambar
import bgImage from '../assets/bg-kp2.png';

const { t, locale } = useI18n();
const router = useRouter();

// State
const latestTrips = ref<any[]>([]);
const latestPosts = ref<any[]>([]);
const loadingTrips = ref(true);
const loadingPosts = ref(true);
const searchQuery = ref('');

// TOGGLE STATE (Ditambah)
const isCompact = ref(false);

// --- DATA: ACTIVITIES ---
const popularActivities = [
  { key: 'hiking',       icon: 'fas fa-hiking',          color: '#48bb78' },
  { key: 'camping',      icon: 'fas fa-campground',      color: '#ed8936' },
  { key: 'climbing',     icon: 'fas fa-mountain',        color: '#718096' },
  { key: 'caving',       icon: 'fas fa-dungeon',         color: '#a0aec0' },
  { key: 'kayaking',     icon: 'fas fa-sailboat',        color: '#38b2ac' },
  { key: 'rafting',      icon: 'fas fa-water',           color: '#3182ce' },
  { key: 'fishing',      icon: 'fas fa-fish',            color: '#2b6cb0' },
  { key: 'paragliding',  icon: 'fas fa-paper-plane',     color: '#9f7aea' },
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
.container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }

.home {
  min-height: 100vh;
  background-size: cover;
  background-position: center center;
  background-attachment: fixed;
}

/* HERO SECTION */
.hero-header-section {
  padding: 6rem 1rem 3rem;
  text-align: center;
  position: relative;
  background: transparent; 
}

/* Glow Decoration */
.hero-glow-purple, .hero-glow-orange {
  position: absolute;
  filter: blur(80px);
  z-index: -1;
  opacity: 0.4;
  pointer-events: none;
}
.hero-glow-purple {
  width: 300px; height: 300px;
  background: var(--c-sunset-purple);
  top: -50px; left: 20%;
}
.hero-glow-orange {
  width: 250px; height: 250px;
  background: var(--c-sunset-orange);
  top: 50px; right: 20%;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.2rem;
  color: #fff;
}

.hero-subtitle {
  color: var(--text-secondary);
  font-size: 1.15rem;
  max-width: 600px;
  margin: 0 auto 3rem;
  font-weight: 300;
}

/* --- FLOATING SEARCH BAR (DARK THEME) --- */
.search-wrapper-floating {
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
}

.search-glow {
  position: absolute;
  inset: -3px;
  background: var(--gradient-sunset);
  border-radius: 50px;
  opacity: 0.3;
  filter: blur(15px);
  transition: opacity 0.3s;
}
.search-wrapper-floating:hover .search-glow { opacity: 0.6; }

.search-box {
  position: relative;
  background: rgba(19, 6, 33, 0.8); 
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  padding: 8px 8px 8px 25px;
  display: flex;
  align-items: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.search-icon-left { color: var(--c-sunset-purple); margin-right: 15px; font-size: 1.2rem; }

.search-box input {
  flex: 1; border: none; outline: none; background: transparent;
  font-size: 1rem; color: #fff;
}
.search-box input:focus { border: none !important; box-shadow: none !important; }

.btn-search-sunset {
  background: var(--gradient-sunset);
  color: white; border: none;
  padding: 12px 36px; border-radius: 50px;
  font-weight: 600; font-size: 0.95rem;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.btn-search-sunset:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 20px rgba(255, 126, 95, 0.4);
}

/* --- BANNER GRID --- */
.banner-grid-section {
  display: grid; grid-template-columns: 2.5fr 1fr; gap: 24px;
  height: 420px; margin-bottom: 4rem; margin-top: 2rem;
}

.banner-large-slider {
  border-radius: 24px; overflow: hidden; height: 100%;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.05);
}

.mySwiper, .banner-slide-item { width: 100%; height: 100%; }
.banner-slide-item {
  background-size: cover; background-position: center;
  position: relative; cursor: pointer;
}

.overlay-gradient-bottom {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(5,1,10,0.9) 0%, transparent 50%);
}

.slide-caption {
  position: absolute; bottom: 30px; left: 30px; z-index: 2;
}
.slide-caption h3 {
  color: white; font-size: 2rem; margin: 0; font-weight: 700;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

.banner-stack { display: flex; flex-direction: column; gap: 24px; height: 100%; }
.banner-small {
  flex: 1; border-radius: 24px; background-size: cover; background-position: center;
  cursor: pointer; transition: transform 0.3s;
  position: relative; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.05);
}
.banner-small:hover { transform: translateY(-5px); }

.overlay-hover {
  position: absolute; inset: 0; background: rgba(0,0,0,0.2);
  transition: background 0.3s;
}
.banner-small:hover .overlay-hover { background: rgba(0,0,0,0); }


/* --- CATEGORY ICONS --- */
.category-section { margin-bottom: 4rem; padding: 10px 0; }
.category-list {
  display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;
}

.cat-item {
  display: flex; flex-direction: column; align-items: center;
  cursor: pointer;
}

.cat-circle {
  width: 70px; height: 70px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 12px;
  color: #94a3b8; 
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.cat-circle i { transition: transform 0.3s; }

.cat-item:hover .cat-circle {
  transform: translateY(-8px);
  box-shadow: 0 10px 25px -5px var(--icon-color), 0 0 10px rgba(255,255,255,0.1) inset;
  color: white;
  background: var(--icon-color);
  border-color: transparent;
}

.cat-item:hover .cat-circle i { transform: scale(1.2); }
.cat-item:hover .cat-label { color: white; }

.more-circle { 
  background: rgba(255, 255, 255, 0.05);
  color: var(--c-sunset-pink);
}
.cat-item:hover .more-circle {
  background: var(--c-sunset-purple);
  box-shadow: 0 10px 20px rgba(108, 99, 255, 0.4);
}

.cat-label { 
  font-size: 0.9rem; font-weight: 500; 
  color: var(--text-secondary); transition: color 0.3s; 
}

/* --- SECTION HEADERS --- */
.section-container { margin-bottom: 5rem; }
.section-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.section-title { font-size: 1.8rem; font-weight: 700; margin: 0; color: white; }
.see-more-link {
  color: var(--c-sunset-pink); font-size: 0.95rem;
  display: flex; align-items: center; gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(255,255,255,0.03);
  transition: all 0.3s;
}
.see-more-link:hover {
  background: rgba(255,255,255,0.1);
  color: var(--c-sunset-orange);
  transform: translateX(5px);
}

/* --- TOGGLE BUTTON STYLE (Ditambah) --- */
.toggle-view-btn {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #aaa;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}
.toggle-view-btn:hover {
  background: rgba(255,255,255,0.1);
  color: white;
}

/* GRIDS */
.trip-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 30px; }

/* UPDATE: COMPACT GRID (2 Card Sebaris) */
.trip-grid-compact {
  display: grid; 
  /* 2 Column untuk skrin sederhana ke atas */
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); 
  gap: 20px;
}

.forum-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 30px; }
.loading-area { text-align: center; padding: 3rem; color: var(--text-secondary); }

.spinner {
  width: 40px; height: 40px; margin: 0 auto 15px;
  border: 3px solid rgba(255,255,255,0.1); 
  border-top-color: var(--c-sunset-purple);
  border-radius: 50%; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.empty-text { text-align: center; color: var(--text-secondary); padding: 3rem; font-style: italic; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .hero-title { font-size: 2.2rem; }
  .search-wrapper-floating { margin: 0 10px; }
  .search-box { padding-left: 15px; }
  .btn-search-sunset { padding: 10px 20px; font-size: 0.9rem; }
  
  .banner-grid-section { grid-template-columns: 1fr; height: auto; gap: 20px; }
  .banner-large-slider { height: 280px; }
  .banner-stack { display: none; }
  
  .category-list { gap: 15px; justify-content: flex-start; overflow-x: auto; padding-bottom: 20px; padding-left: 5px; scrollbar-width: none; }
  .category-list::-webkit-scrollbar { display: none; }
  .cat-item { min-width: 80px; }
  
  .trip-grid { grid-template-columns: repeat(1, 1fr); gap: 20px; }
  .trip-grid-compact { grid-template-columns: 1fr; } /* Mobile jadi 1 column */
  .forum-grid { grid-template-columns: 1fr; }
}
</style>