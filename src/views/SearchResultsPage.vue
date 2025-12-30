<template>
  <div class="min-h-screen bg-slate-900 relative overflow-x-hidden text-white">
    
    <!-- BACKGROUND LAYERS -->
    <div class="absolute inset-0 z-0 opacity-[0.08] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' viewBox=\'0 0 1000 1000\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400\' stroke=\'white\' fill=\'none\' stroke-width=\'2\' opacity=\'0.5\'/%3E%3C/svg%3E')] bg-cover"></div>
    <div class="absolute top-0 left-0 w-[60vw] h-[60vw] bg-[#6c63ff] blur-[150px] opacity-15 pointer-events-none rounded-full"></div>
    <div class="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-[#ff8c42] blur-[150px] opacity-10 pointer-events-none rounded-full"></div>

    <!-- MAIN CONTAINER -->
    <div class="container mx-auto px-6 pt-[150px] pb-20 relative z-10 max-w-[1200px]">
      
      <!-- SEARCH HEADER -->
      <div class="text-center mb-8 animate-fade-in-up">
        <h1 class="text-3xl md:text-4xl font-bold text-white mb-3">
            🔍 Carian: <span class="text-purple-400">"{{ searchQuery }}"</span>
        </h1>
        <p v-if="!loading" class="text-gray-400 text-sm md:text-base">
            Jumpa <span class="text-white font-bold">{{ totalResults }}</span> keputusan.
        </p>
      </div>

      <!-- SEARCH & FILTER SECTION -->
      <div class="animate-fade-in-up delay-[100ms] max-w-4xl mx-auto mb-12">
        
        <!-- Search Input -->
        <div class="relative w-full mb-4">
            <input 
                v-model="searchInput" 
                @keyup.enter="updateSearch"
                @input="handleInput"
                class="w-full pl-5 pr-[50px] py-[14px] rounded-xl border border-white/15 bg-[#1e293b]/60 text-white outline-none transition duration-300 text-base backdrop-blur-md focus:border-[#6c63ff] focus:bg-[#1e293b]/90 focus:shadow-[0_0_0_3px_rgba(108,99,255,0.2)]"
                placeholder="Cari lokasi, aktiviti, atau topik..." 
            />
            <button @click="updateSearch" class="absolute right-[6px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg border-none bg-[#6c63ff] text-white cursor-pointer transition duration-200 hover:bg-[#5b54e0]">
                <i class="fas fa-search"></i>
            </button>
        </div>

        <!-- Filters Bar -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Filter Lokasi (Imported Data) -->
            <div class="relative">
                <select v-model="filters.location" @change="performFilter" class="w-full pl-[40px] pr-3 py-3 rounded-[10px] appearance-none border border-white/10 bg-[#0f172a]/60 text-white text-[0.9rem] cursor-pointer transition duration-200 hover:bg-[#0f172a]/80 hover:border-white/30 focus:border-[#6c63ff] focus:outline-none">
                    <option value="" class="bg-[#1e293b] text-white">Semua Lokasi</option>
                    <option v-for="state in MALAYSIA_STATES" :key="state" :value="state" class="bg-[#1e293b] text-white">{{ state }}</option>
                </select>
                <i class="fas fa-map-marker-alt absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>

            <!-- Filter Bulan -->
            <div class="relative">
                <select v-model="filters.month" @change="performFilter" class="w-full pl-[40px] pr-3 py-3 rounded-[10px] appearance-none border border-white/10 bg-[#0f172a]/60 text-white text-[0.9rem] cursor-pointer transition duration-200 hover:bg-[#0f172a]/80 hover:border-white/30 focus:border-[#6c63ff] focus:outline-none">
                    <option value="" class="bg-[#1e293b] text-white">Semua Masa</option>
                    <option v-for="(m, i) in MONTHS" :key="i" :value="i + 1" class="bg-[#1e293b] text-white">{{ m }}</option>
                </select>
                <i class="fas fa-calendar-alt absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>

            <!-- Filter Kategori (Grouped Data) -->
            <div class="relative">
                <select v-model="filters.category" @change="performFilter" class="w-full pl-[40px] pr-3 py-3 rounded-[10px] appearance-none border border-white/10 bg-[#0f172a]/60 text-white text-[0.9rem] cursor-pointer transition duration-200 hover:bg-[#0f172a]/80 hover:border-white/30 focus:border-[#6c63ff] focus:outline-none">
                    <option value="" class="bg-[#1e293b] text-white">Semua Kategori</option>
                    <!-- Menggunakan optgroup untuk susunan kategori yang lebih kemas -->
                    <optgroup v-for="group in ACTIVITY_CATEGORIES" :key="group.group" :label="group.group" class="bg-[#0f172a] text-slate-400 font-bold">
                        <option v-for="item in group.items" :key="item" :value="item" class="bg-[#1e293b] text-white font-normal">{{ item }}</option>
                    </optgroup>
                </select>
                <i class="fas fa-filter absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
        </div>
      </div>

      <!-- RESULTS CONTAINER -->
      <div class="animate-fade-in-up delay-[200ms]">
        
        <!-- LOADING -->
        <div v-if="loading" class="text-center py-20">
            <div class="inline-block px-8 py-6 bg-[#1e293b]/70 border border-white/10 rounded-2xl backdrop-blur-xl">
                <i class="fas fa-spinner fa-spin text-3xl text-purple-400 mb-3"></i>
                <p class="text-gray-300">⏳ Sedang mencari...</p>
            </div>
        </div>

        <div v-else>
          
          <!-- 1. TRIPS SECTION -->
          <section v-if="filteredTrips.length > 0" class="mb-12">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    🏔️ Trips <span class="bg-white/10 text-slate-400 text-[0.8rem] px-2 py-[2px] rounded-[10px] ml-[5px]">{{ filteredTrips.length }}</span>
                </h3>
                <router-link to="/trips" class="text-sm text-purple-400 hover:text-white">Lihat Semua</router-link>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <TripCard v-for="trip in filteredTrips" :key="trip.id" :trip="trip" class="text-[0.9rem]" />
            </div>
          </section>

          <!-- 2. SPOTS SECTION -->
          <section v-if="filteredSpots.length > 0" class="mb-12">
            <h3 class="text-xl font-bold text-white flex items-center gap-2 mb-4">
                📍 Spots Menarik <span class="bg-white/10 text-slate-400 text-[0.8rem] px-2 py-[2px] rounded-[10px] ml-[5px]">{{ filteredSpots.length }}</span>
            </h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div 
                    v-for="spot in filteredSpots" 
                    :key="spot.id" 
                    class="bg-[#1e293b]/50 border border-white/5 rounded-xl backdrop-blur-md cursor-pointer transition duration-300 hover:bg-[#1e293b]/80 hover:border-[#6c63ff]/40 hover:-translate-y-[3px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] p-4 flex gap-4 items-center"
                    @click="$router.push('/spots/' + spot.id)"
                >
                    <img :src="spot.images?.[0] || 'https://via.placeholder.com/150'" class="w-16 h-16 rounded-lg object-cover bg-gray-700" />
                    <div>
                        <h4 class="font-bold text-white line-clamp-1">{{ spot.name }}</h4>
                        <p class="text-xs text-gray-400 mb-1"><i class="fas fa-map-pin mr-1"></i> {{ spot.location }}</p>
                        <span class="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded">{{ spot.category }}</span>
                    </div>
                </div>
            </div>
          </section>

          <!-- 3. SERVICES SECTION -->
          <section v-if="filteredServices.length > 0" class="mb-12">
            <h3 class="text-xl font-bold text-white flex items-center gap-2 mb-4">
                🛠️ Servis & Guide <span class="bg-white/10 text-slate-400 text-[0.8rem] px-2 py-[2px] rounded-[10px] ml-[5px]">{{ filteredServices.length }}</span>
            </h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div 
                    v-for="service in filteredServices" 
                    :key="service.id" 
                    class="bg-[#1e293b]/50 border border-white/5 rounded-xl backdrop-blur-md cursor-pointer transition duration-300 hover:bg-[#1e293b]/80 hover:border-[#6c63ff]/40 hover:-translate-y-[3px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] p-4"
                    @click="$router.push('/services/' + service.id)"
                >
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-bold text-white line-clamp-1">{{ service.title }}</h4>
                        <span class="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">{{ service.type }}</span>
                    </div>
                    <p class="text-sm text-gray-400 line-clamp-2 mb-3">{{ service.description }}</p>
                    <div class="flex items-center gap-2 text-xs text-gray-500 border-t border-white/5 pt-2">
                        <img :src="service.providerAvatar || 'https://i.pravatar.cc/150'" class="w-5 h-5 rounded-full" />
                        <span>{{ service.providerName }}</span>
                    </div>
                </div>
            </div>
          </section>

          <!-- 4. FORUM SECTION -->
          <section v-if="filteredPosts.length > 0" class="mb-12">
            <h3 class="text-xl font-bold text-white flex items-center gap-2 mb-4">
                💬 Forum <span class="bg-white/10 text-slate-400 text-[0.8rem] px-2 py-[2px] rounded-[10px] ml-[5px]">{{ filteredPosts.length }}</span>
            </h3>
            
            <div class="space-y-3">
              <div 
                v-for="post in filteredPosts" 
                :key="post.id" 
                class="bg-[#1e293b]/50 border border-white/5 rounded-xl backdrop-blur-md cursor-pointer transition duration-300 hover:bg-[#1e293b]/80 hover:border-[#6c63ff]/40 hover:-translate-y-[3px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] p-4 flex flex-col sm:flex-row gap-4"
                @click="$router.push('/forum/' + post.id)"
              >
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">{{ post.category }}</span>
                        <h4 class="text-base font-bold text-white line-clamp-1">{{ post.title }}</h4>
                    </div>
                    <p class="text-sm text-gray-400 line-clamp-1">{{ post.content }}</p>
                </div>
                <div class="flex items-center gap-4 text-xs text-gray-500 sm:justify-end min-w-[150px]">
                    <span class="flex items-center gap-1"><i class="fas fa-comment"></i> {{ post.commentCount || 0 }}</span>
                    <span class="flex items-center gap-1"><i class="fas fa-clock"></i> {{ formatDate(post.createdAt) }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- EMPTY STATE GLOBAL -->
          <div v-if="totalResults === 0" class="text-center py-16 opacity-50">
             <i class="fas fa-wind text-6xl mb-4 text-gray-600"></i>
             <p class="text-xl text-gray-400">Tiada apa-apa dijumpai...</p>
             <p class="text-sm text-gray-600 mt-2">Cuba ubah kata kunci atau padam filter.</p>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TripCard from '../components/trip/TripCard.vue';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// IMPORT DATA DARI CONSTANTS
import { MALAYSIA_STATES, ACTIVITY_CATEGORIES } from '../constants/data';

// STATIK DATA UNTUK BULAN (Boleh juga letak di constants jika mahu)
const MONTHS = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun", 
  "Julai", "Ogos", "September", "Oktober", "November", "Disember"
];

const route = useRoute();
const router = useRouter();

const searchQuery = ref('');
const searchInput = ref('');
const loading = ref(true);

// State Data
const allData = reactive({
    trips: [] as any[],
    spots: [] as any[],
    services: [] as any[],
    posts: [] as any[]
});

// State Filtered
const filteredTrips = ref<any[]>([]);
const filteredSpots = ref<any[]>([]);
const filteredServices = ref<any[]>([]);
const filteredPosts = ref<any[]>([]);

// Filter Inputs
const filters = reactive({
    location: '',
    month: '',
    category: ''
});

const totalResults = computed(() => 
    filteredTrips.value.length + filteredSpots.value.length + 
    filteredServices.value.length + filteredPosts.value.length
);

// Fetch Data Sekaligus
const fetchData = async () => {
  loading.value = true;
  try {
    const [tripSnap, spotSnap, serviceSnap, postSnap] = await Promise.all([
        getDocs(query(collection(db, "trips"), orderBy("createdAt", "desc"))),
        getDocs(query(collection(db, "spots"), orderBy("createdAt", "desc"))),
        getDocs(query(collection(db, "services"), orderBy("createdAt", "desc"))),
        getDocs(query(collection(db, "forum_posts"), orderBy("createdAt", "desc")))
    ]);

    allData.trips = tripSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    allData.spots = spotSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    allData.services = serviceSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    allData.posts = postSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    performFilter();
  } catch (e) {
    console.error("Error fetching search data:", e);
  } finally {
    loading.value = false;
  }
};

// Logik Filter Utama
const performFilter = () => {
  const keyword = searchQuery.value.toLowerCase();
  const { location, month, category } = filters;

  // Helper untuk check string match
  const matches = (text: string) => text && text.toLowerCase().includes(keyword);
  
  // Helper untuk check date (bulan)
  const matchMonth = (dateString: string) => {
    if (!month) return true;
    if (!dateString) return false;
    const d = new Date(dateString);
    return (d.getMonth() + 1) === parseInt(month);
  };

  // 1. FILTER TRIPS
  filteredTrips.value = allData.trips.filter(t => {
    const textMatch = matches(t.title) || matches(t.location) || matches(t.description);
    const locMatch = !location || (t.location && t.location.includes(location));
    const catMatch = !category || (t.category === category);
    const timeMatch = matchMonth(t.startDate); 
    return textMatch && locMatch && catMatch && timeMatch;
  });

  // 2. FILTER SPOTS
  filteredSpots.value = allData.spots.filter(s => {
    const textMatch = matches(s.name) || matches(s.location) || matches(s.description);
    const locMatch = !location || (s.location && s.location.includes(location));
    const catMatch = !category || (s.category === category);
    return textMatch && locMatch && catMatch;
  });

  // 3. FILTER SERVICES
  filteredServices.value = allData.services.filter(s => {
    const textMatch = matches(s.title) || matches(s.description);
    const locMatch = !location || (s.location && s.location.includes(location));
    const catMatch = !category || (s.type === category); // 'type' = category di sini
    return textMatch && locMatch && catMatch;
  });

  // 4. FILTER FORUM
  filteredPosts.value = allData.posts.filter(p => {
    const textMatch = matches(p.title) || matches(p.content);
    const catMatch = !category || (p.category === category);
    // Forum biasanya tiada lokasi spesifik, jadi kita tak filter lokasi unless ada dalam text
    return textMatch && catMatch;
  });
};

const updateSearch = () => {
  router.push({ name: 'search', query: { q: searchInput.value } });
};

const handleInput = () => {
  searchQuery.value = searchInput.value;
  performFilter();
};

const formatDate = (timestamp: any) => {
  if (!timestamp) return '';
  const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
  return date.toLocaleDateString("ms-MY", { day: 'numeric', month: 'short' });
};

watch(() => route.query.q, (newQ) => {
  searchQuery.value = newQ as string || '';
  searchInput.value = searchQuery.value;
  performFilter();
});

onMounted(() => {
  searchQuery.value = route.query.q as string || '';
  searchInput.value = searchQuery.value;
  fetchData();
});
</script>