<template>
  <div class="min-h-screen bg-cover bg-fixed bg-center" :style="{ backgroundImage: `url(${bgImage})` }">
    
    <div class="relative text-center pt-24 px-4 pb-12">
      <div class="container mx-auto max-w-6xl relative z-10">
        <!-- Glow Effects -->
        <div class="absolute top-[-50px] left-[20%] w-[300px] h-[300px] bg-[#6c63ff] blur-[80px] -z-10 opacity-40 rounded-full"></div>
        <div class="absolute top-[50px] right-[20%] w-[250px] h-[250px] bg-[#ff8c42] blur-[80px] -z-10 opacity-40 rounded-full"></div>

        <h1 class="animate-fade-in-up text-white font-extrabold text-5xl md:text-6xl mb-5 leading-tight">
          {{ t('home.heroPrefix') }}<br>
          <span class="animate-text-gradient">{{ t('home.heroHighlight') || 'Alam Semulajadi' }}</span>
        </h1>
        <p class="animate-fade-in-up text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light" style="animation-delay: 0.1s;">
          {{ t('home.heroSubtitle') || 'Temui aktiviti luar yang menarik, daripada hiking hingga menyelam.' }}
        </p>

        <div class="animate-float mx-auto max-w-xl relative z-20" style="animation-delay: 0.2s;">
          <div class="absolute -inset-1 bg-gradient-to-r from-purple-600 to-orange-500 rounded-full opacity-30 blur-md transition duration-300"></div>
          <div class="relative flex items-center bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-full p-2 pl-6 shadow-2xl">
             <i class="fas fa-location-dot text-purple-400 mr-4 text-xl"></i>
             <input 
               type="text" 
               v-model="searchQuery"
               class="flex-1 bg-transparent border-none outline-none text-white text-base placeholder-gray-400 focus:ring-0"
               :placeholder="t('home.searchPlaceholder')" 
               @keyup.enter="executeSearch" 
             />
             <button class="bg-gradient-to-r from-purple-600 to-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:-translate-y-0.5 transition shadow-lg" @click="executeSearch">
               {{ t('common.search') }}
             </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto max-w-6xl px-6">
      
      <section class="animate-fade-in-up grid grid-cols-1 md:grid-cols-[2.5fr_1fr] gap-6 h-auto md:h-[420px] mb-16 mt-8" style="animation-delay: 0.3s;">
        <div class="rounded-3xl overflow-hidden shadow-2xl border border-white/5 h-[280px] md:h-full relative">
          <swiper
            :modules="[Autoplay, Pagination]"
            :slides-per-view="1"
            :loop="true"
            :autoplay="{ delay: 5000, disableOnInteraction: false }"
            :pagination="{ clickable: true }"
            class="w-full h-full"
          >
            <swiper-slide v-for="(slide, index) in banners.largeSlides" :key="index">
              <div 
                class="w-full h-full bg-cover bg-center relative cursor-pointer group" 
                :style="{ backgroundImage: `url(${slide.imageUrl})` }"
                @click="goToLink(slide.linkUrl)"
              >
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                <div class="absolute bottom-8 left-8 z-10" v-if="slide.title">
                  <h3 class="text-white text-3xl font-bold drop-shadow-lg group-hover:text-orange-400 transition-colors">{{ t(slide.title) }}</h3>
                </div>
              </div>
            </swiper-slide>
          </swiper>
        </div>
        
        <div class="hidden md:flex flex-col gap-6 h-full">
           <div 
            class="flex-1 rounded-3xl bg-cover bg-center cursor-pointer relative overflow-hidden border border-white/5 hover:-translate-y-1 transition transform duration-300" 
            :style="{ backgroundImage: `url(${banners.small1.imageUrl})` }"
            @click="goToLink(banners.small1.linkUrl)"
          >
            <div class="absolute inset-0 bg-black/20 hover:bg-transparent transition"></div>
          </div>
           <div 
            class="flex-1 rounded-3xl bg-cover bg-center cursor-pointer relative overflow-hidden border border-white/5 hover:-translate-y-1 transition transform duration-300" 
            :style="{ backgroundImage: `url(${banners.small2.imageUrl})` }"
            @click="goToLink(banners.small2.linkUrl)"
          >
            <div class="absolute inset-0 bg-black/20 hover:bg-transparent transition"></div>
          </div>
        </div>
      </section>

      <section class="mb-16">
        <div class="flex gap-6 justify-start md:justify-center overflow-x-auto pb-4 no-scrollbar">
          <div 
            class="flex flex-col items-center cursor-pointer min-w-[80px] group" 
            v-for="item in POPULAR_ACTIVITIES" 
            :key="item.key" 
            @click="filterBy(item.key)"
          >
            <div 
                class="w-[70px] h-[70px] bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-2xl text-slate-400 mb-3 transition-all duration-300 group-hover:bg-[var(--icon-color)] group-hover:text-white group-hover:-translate-y-2 group-hover:shadow-lg group-hover:border-transparent" 
                :style="{ '--icon-color': item.color }"
            >
               <i :class="item.icon"></i>
            </div>
            <span class="text-sm font-medium text-slate-400">{{ t('activities.' + item.key) }}</span>
          </div>
          
          <div class="flex flex-col items-center cursor-pointer min-w-[80px] group" @click="$router.push('/trips')">
            <div class="w-[70px] h-[70px] bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-2xl text-pink-500 mb-3 transition-all duration-300 group-hover:bg-purple-600 group-hover:text-white group-hover:-translate-y-2 group-hover:shadow-lg">
                <i class="fas fa-arrow-right"></i>
            </div>
            <span class="text-sm font-medium text-slate-400">{{ t('home.more') }}</span>
          </div>
        </div>
      </section>

      <section class="mb-20">
        <div class="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
          <div class="flex items-center gap-4">
            <h3 class="text-3xl font-bold text-white"><span class="animate-text-gradient">{{ t('home.popularTripsHeader') }}</span></h3>
            
            <button 
              @click="isCompact = !isCompact"
              class="bg-white/5 border border-white/10 text-gray-400 px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition flex items-center"
              :title="isCompact ? t('common.switchToFull') : t('common.switchToCompact')"
            >
              <i :class="isCompact ? 'fas fa-border-all' : 'fas fa-list-ul'"></i>
              <span class="ml-2 text-xs font-medium hidden sm:inline">{{ isCompact ? t('common.compact') : t('common.full') }}</span>
            </button>
          </div>

          <a href="#" @click.prevent="$router.push('/trips')" class="text-pink-400 hover:text-orange-400 flex items-center gap-2 text-sm bg-white/5 px-4 py-2 rounded-full transition hover:translate-x-1">
            {{ t('home.viewAll') }} <i class="fas fa-chevron-right text-xs"></i>
          </a>
        </div>
        
        <div v-if="loadingTrips" class="py-12 text-center text-gray-500">
            <div class="w-10 h-10 border-4 border-white/10 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <span>{{ t('common.loading') }}</span>
        </div>
        
        <div v-else-if="latestTrips.length > 0" :class="isCompact ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'">
          <TripCard 
            v-for="trip in latestTrips" 
            :key="trip.id" 
            :trip="trip" 
            :is-compact="isCompact"
          />
        </div>
        
        <div v-else class="text-center text-gray-500 py-12 italic">{{ t('home.noTrips') }}</div>
      </section>

      <section class="mb-20">
        <div class="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
          <h3 class="text-3xl font-bold text-white"><span class="animate-text-gradient">{{ t('home.communityDiscuss') }}</span></h3>
          <a href="#" @click.prevent="$router.push('/forum')" class="text-pink-400 hover:text-orange-400 flex items-center gap-2 text-sm bg-white/5 px-4 py-2 rounded-full transition hover:translate-x-1">
            {{ t('home.goToForum') }} <i class="fas fa-chevron-right text-xs"></i>
          </a>
        </div>

        <div v-if="loadingPosts" class="py-12 text-center">
             <div class="w-10 h-10 border-4 border-white/10 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
        </div>
        <div v-else-if="latestPosts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ForumPostCard v-for="post in latestPosts" :key="post.id" :post="post" />
        </div>
        <div v-else class="text-center text-gray-500 py-12 italic">{{ t('home.noPosts') }}</div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// Firebase
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';

// Components & Assets
import TripCard from '../components/trip/TripCard.vue'; 
import ForumPostCard from '../components/forum/ForumPostCard.vue'; 
import bgImage from '../assets/bg-kp2.png';

// Import Types, Utils, Constants (REFACTORED)
import type { Trip, ForumPost, BannerSlide } from '../types';
import { formatDate, getTimeAgo } from '../utils/dateUtils';
import { POPULAR_ACTIVITIES, DEFAULT_BANNERS } from '../constants/homeData';

const { t, locale } = useI18n();
const router = useRouter();

// State dengan Type Safety
const latestTrips = ref<Trip[]>([]);
const latestPosts = ref<ForumPost[]>([]);
const loadingTrips = ref(true);
const loadingPosts = ref(true);
const searchQuery = ref('');
const isCompact = ref(false);

const banners = reactive({
  largeSlides: [...DEFAULT_BANNERS.large] as BannerSlide[],
  small1: { ...DEFAULT_BANNERS.small1 } as BannerSlide,
  small2: { ...DEFAULT_BANNERS.small2 } as BannerSlide
});

// Navigation Helpers
const executeSearch = () => { if (searchQuery.value.trim()) router.push({ name: 'search', query: { q: searchQuery.value } }); };
const filterBy = (activityKey: string) => { router.push({ path: '/trips', query: { category: activityKey } }); };
const goToLink = (url: string) => { 
  if (!url) return; 
  if (url.startsWith('http')) window.open(url, '_blank'); 
  else router.push(url); 
};

// Data Fetching
onMounted(async () => {
  // 1. Fetch Banners
  try {
    const docSnap = await getDoc(doc(db, "site_settings", "banners"));
    if (docSnap.exists()) { 
      const data = docSnap.data(); 
      if(data.largeSlides?.length) banners.largeSlides = data.largeSlides;
      if(data.small1?.imageUrl) Object.assign(banners.small1, data.small1); 
      if(data.small2?.imageUrl) Object.assign(banners.small2, data.small2); 
    }
  } catch (e) { /* silent fail for banners */ }

  // 2. Fetch Trips
  try {
    const qTrips = query(collection(db, "trips"), orderBy("createdAt", "desc"), limit(8));
    const snapTrips = await getDocs(qTrips);
    latestTrips.value = snapTrips.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data, 
        date: formatDate(data.startDate, locale.value) // Guna utiliti baru
      } as unknown as Trip;
    });
  } catch (e) { console.error("Error fetching trips:", e); } 
  finally { loadingTrips.value = false; }

  // 3. Fetch Posts
  try {
    const qPosts = query(collection(db, "forum_posts"), orderBy("createdAt", "desc"), limit(4));
    const snapPosts = await getDocs(qPosts);
    latestPosts.value = snapPosts.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data, 
        excerpt: data.content, 
        timeAgo: getTimeAgo(data.createdAt, t) // Guna utiliti baru
      } as unknown as ForumPost;
    });
  } catch (e) { console.error("Error fetching posts:", e); } 
  finally { loadingPosts.value = false; }
});
</script>