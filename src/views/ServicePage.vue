<template>
  <div class="service-page min-h-screen bg-slate-900 text-white relative overflow-x-hidden">
    
    <div class="contour-lines"></div>
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <div class="container mx-auto px-6 pt-24 pb-12 relative z-10 max-w-7xl">
      
      <div class="mb-10 text-center md:text-left animate-fade-in-up">
        <h1 class="text-4xl font-extrabold text-white mb-2">{{ t('directory.title') || 'Direktori Servis' }}</h1>
        <p class="text-gray-400 text-lg">Cari penginapan, guide, sewaan khemah & transport untuk trip anda.</p>
        
        <button 
          v-if="userRole === 'organizer'" 
          class="mt-4 inline-flex items-center px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold shadow-lg hover:-translate-y-1 transition transform"
          @click="$router.push('/create-service')"
        >
          <i class="fas fa-bullhorn mr-2"></i> {{ t('directory.advertiseBtn') || 'Iklankan Servis' }}
        </button>
      </div>

      <div class="filter-section mb-8 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md animate-fade-in-up" style="animation-delay: 0.1s;">
        <div class="flex flex-col gap-4">
          
          <div class="relative w-full">
             <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
             <input 
               type="text" 
               v-model="filters.searchQuery"
               class="w-full pl-12 pr-28 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:border-purple-500 focus:bg-black/30 outline-none transition"
               :placeholder="t('common.searchPlaceholder') || 'Cari servis, lokasi, atau nama...'" 
             />
             <button class="absolute right-2 top-2 bottom-2 bg-purple-600 hover:bg-purple-500 text-white px-5 rounded-lg font-semibold transition">
               Cari
             </button>
          </div>

          <div class="flex flex-wrap gap-3 items-center">
             
             <div class="relative flex-1 min-w-[160px]">
                <i class="fas fa-map-marker-alt absolute left-3 top-1/2 -translate-y-1/2 text-red-400 pointer-events-none"></i>
                <select v-model="filters.state" class="custom-select pl-10">
                  <option value="">{{ t('directory.allStates') || 'Semua Negeri' }}</option>
                  <option v-for="state in MALAYSIA_STATES" :key="state" :value="state">{{ state }}</option>
                </select>
             </div>

             <div class="relative flex-1 min-w-[160px]">
                <i class="fas fa-layer-group absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none"></i>
                <select v-model="filters.category" class="custom-select pl-10">
                  <option value="Semua">Semua Kategori</option>
                  <option v-for="cat in SERVICE_CATEGORIES" :key="cat.name" :value="cat.name">
                    {{ cat.name }}
                  </option>
                </select>
             </div>

             <button 
                v-if="hasActiveFilters" 
                class="w-12 h-12 flex items-center justify-center rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500/30 transition shadow-lg" 
                @click="resetFilters"
                title="Reset Filter"
             >
               <i class="fas fa-undo"></i>
             </button>
          </div>
        </div>
      </div>

      <div class="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide z-10 relative">
          <button 
            class="cat-pill whitespace-nowrap px-5 py-2 rounded-full border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition flex items-center gap-2"
            :class="{ 'active-pill': filters.category === 'Semua' }"
            @click="filters.category = 'Semua'"
          >
            <i class="fas fa-globe"></i> Semua
          </button>
          <button 
            v-for="cat in SERVICE_CATEGORIES" 
            :key="cat.name"
            class="cat-pill whitespace-nowrap px-5 py-2 rounded-full border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition flex items-center gap-2"
            :class="{ 'active-pill': filters.category === cat.name }"
            @click="filters.category = cat.name"
          >
            <i :class="cat.icon"></i>
            {{ cat.name }}
          </button>
      </div>

      <div class="relative z-10">
        
        <div v-if="loading" class="flex flex-col items-center justify-center py-24 text-gray-400">
          <div class="spinner w-10 h-10 border-4 border-white/10 border-t-purple-500 rounded-full animate-spin mb-4"></div>
          <p>{{ t('common.loading') }}</p>
        </div>
        
        <div v-else-if="filteredServices.length === 0" class="flex flex-col items-center justify-center py-24 text-gray-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
          <i class="fas fa-folder-open text-5xl mb-4 opacity-30"></i>
          <h3 class="text-xl font-bold text-gray-300">{{ t('directory.empty') || 'Tiada Servis Dijumpai' }}</h3>
          <p class="mt-2 text-sm">Cuba ubah filter lokasi atau kategori anda.</p>
          <button @click="resetFilters" class="text-orange-400 hover:text-orange-300 underline mt-3 font-medium">Reset Filter</button>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div 
            v-for="service in filteredServices" 
            :key="service.id" 
            class="glass-card group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-2xl transition duration-300 flex flex-col cursor-pointer"
            :class="{ 'opacity-70 grayscale': isExpired(service) }"
            @click="$router.push(`/service/${service.id}`)"
          >
            <div v-if="isExpired(service)" class="absolute top-0 right-0 z-20 p-2">
              <span class="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-md">TAMAT TEMPOH</span>
            </div>

            <div class="h-48 bg-cover bg-center relative" :style="{ backgroundImage: `url(${service.image || 'https://via.placeholder.com/300'})` }">
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
              
              <span class="absolute top-3 left-3 bg-purple-600/90 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                 <i :class="getCategoryIcon(service.category)" class="mr-1"></i> {{ service.category }}
              </span>
              <span class="absolute bottom-3 right-3 bg-orange-600/90 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm" v-if="service.state">
                {{ service.state }}
              </span>
            </div>
            
            <div class="p-5 flex flex-col flex-1">
              <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-bold text-white leading-tight flex-1 line-clamp-2">{{ service.name }}</h3>
                
                <div v-if="auth.currentUser && auth.currentUser.uid === service.ownerId" class="flex gap-2 ml-2">
                  <button @click.stop="renewService(service)" class="text-green-400 hover:text-white bg-green-500/20 hover:bg-green-500 p-2 rounded-lg transition" title="Renew">
                    <i class="fas fa-sync-alt"></i>
                  </button>
                  <button @click.stop="deleteService(service.id)" class="text-red-400 hover:text-white bg-red-500/20 hover:bg-red-500 p-2 rounded-lg transition" title="Delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              <p class="text-slate-400 text-sm mb-3 flex items-center">
                <i class="fas fa-map-pin text-red-400 mr-2"></i> <span class="truncate">{{ service.location }}</span>
              </p>
              
              <div class="text-yellow-400 font-extrabold text-lg mb-4">
                <span v-if="service.details?.priceDisplay">{{ service.details.priceDisplay }}</span>
                <span v-else>
                  RM {{ service.details?.price }} 
                  <small class="text-xs font-normal text-gray-400 ml-1">{{ service.details?.priceType ? '/' + service.details.priceType : '' }}</small>
                </span>
              </div>

              <div class="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                 <div class="flex items-center gap-2 text-slate-300 text-xs cursor-pointer hover:text-purple-400 transition" @click.stop="goToProfile(service.ownerId)">
                   <img :src="service.ownerAvatar || 'https://i.pravatar.cc/150'" class="w-7 h-7 rounded-full border border-white/20"/>
                   <span class="truncate max-w-[100px]">{{ service.ownerName }}</span>
                 </div>
                 
                 <a 
                   :href="`https://wa.me/60${service.whatsapp}`" 
                   target="_blank" 
                   class="bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-green-500/30 transition flex items-center gap-1.5"
                   v-if="!isExpired(service)" 
                   @click.stop
                 >
                   <i class="fab fa-whatsapp text-sm"></i> Wasap
                 </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc, Timestamp, getDoc } from 'firebase/firestore';

// Imports (Types & Constants)
import { MALAYSIA_STATES } from '../constants/data';
import { SERVICE_CATEGORIES } from '../constants/serviceData';
import type { Service } from '../types';

const { t } = useI18n();
const router = useRouter();

// State
const loading = ref(true);
const services = ref<Service[]>([]); // Type Safe!
const userRole = ref('user'); 

// Reactive Filters
const filters = reactive({
  searchQuery: '',
  category: 'Semua',
  state: ''
});

// Helpers
const getCategoryIcon = (catName: string): string => {
    const found = SERVICE_CATEGORIES.find(c => c.name === catName);
    return found ? found.icon : 'fas fa-tag';
};

const isExpired = (service: Service): boolean => {
  if (!service.expiryDate) return false;
  return new Date() > service.expiryDate.toDate();
};

const hasActiveFilters = computed(() => {
  return !!filters.searchQuery || filters.state !== '' || filters.category !== 'Semua';
});

// Filter Logic
const filteredServices = computed(() => {
  return services.value.filter(s => {
    // Category Filter
    const matchCat = filters.category === 'Semua' || 
                     s.category === filters.category || 
                     (s.category && s.category.includes(filters.category));
    
    // State Filter
    const matchState = filters.state === '' || s.state === filters.state;
    
    // Search Filter
    const q = filters.searchQuery.toLowerCase();
    const matchSearch = !filters.searchQuery || 
                        s.name.toLowerCase().includes(q) || 
                        s.location.toLowerCase().includes(q);
    
    // Ownership Logic
    const isMyService = auth.currentUser && auth.currentUser.uid === s.ownerId;
    
    return matchCat && matchState && matchSearch && (!isExpired(s) || isMyService);
  });
});

// Actions
const resetFilters = () => {
    filters.category = 'Semua';
    filters.state = '';
    filters.searchQuery = '';
};

const goToProfile = (id: string) => { 
  if (id) router.push(`/user/${id}`); 
};

const deleteService = async (id: string) => {
  if(confirm("Padam servis ini?")) {
    try { 
      await deleteDoc(doc(db, 'services', id)); 
      services.value = services.value.filter(s => s.id !== id); 
    } catch (e) { 
      alert("Gagal memadam servis."); 
    }
  }
};

const renewService = async (service: Service) => {
  if(confirm("Perbaharui 3 bulan?")) {
    try {
      const newExpiry = new Date(); 
      newExpiry.setDate(newExpiry.getDate() + 90);
      
      await updateDoc(doc(db, 'services', service.id), { expiryDate: Timestamp.fromDate(newExpiry) });
      service.expiryDate = Timestamp.fromDate(newExpiry); 
      alert("Berjaya renew.");
    } catch (e) { 
      alert("Gagal renew."); 
    }
  }
};

// Initialization
onMounted(async () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) userRole.value = snap.data().role || 'user';
    } else { userRole.value = 'user'; }
  });
  
  try {
    const q = query(collection(db, 'services'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    services.value = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Service[];
  } catch (e) { 
    console.error("Error loading services", e); 
  } finally { 
    loading.value = false; 
  }
});
</script>

<style scoped>
/* Page Glow Backgrounds - Mengekalkan tema 'Dark Sunset' */
.page-glow-purple {
  position: absolute; top: 0; left: 0; width: 60vw; height: 60vw;
  background: #6c63ff; filter: blur(150px); opacity: 0.15; pointer-events: none;
  border-radius: 50%; z-index: 0;
}
.page-glow-orange {
  position: absolute; bottom: 0; right: 0; width: 50vw; height: 50vw;
  background: #ff8c42; filter: blur(150px); opacity: 0.1; pointer-events: none;
  border-radius: 50%; z-index: 0;
}

/* Realistic Contour Lines Pattern */
.contour-lines {
  position: absolute; inset: 0; z-index: 0; opacity: 0.08;
  background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400 M0,700 Q250,500 500,700 T1000,700 M0,300 Q250,100 500,300 T1000,300' stroke='white' fill='none' stroke-width='2' opacity='0.5'/%3E%3Cpath d='M500,0 Q600,250 500,500 T500,1000 M600,0 Q700,250 600,500 T600,1000 M400,0 Q500,250 400,500 T400,1000' stroke='white' fill='none' stroke-width='1.5' opacity='0.5'/%3E%3C/svg%3E");
  background-size: cover; pointer-events: none;
}

/* Custom Select Styling */
.custom-select {
  width: 100%; appearance: none;
  padding: 12px 36px 12px 38px;
  border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.2); color: #e2e8f0;
  outline: none; cursor: pointer; transition: 0.3s;
}
.custom-select:hover { background: rgba(0,0,0,0.3); }
.custom-select:focus { border-color: #6c63ff; }

/* Custom Arrow for Select */
.select-wrapper::after {
  content: '▼'; font-size: 0.7rem; color: #94a3b8;
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%); pointer-events: none;
}

/* Active Category Pill */
.active-pill {
  background: #e67e22 !important; /* Orange for Services */
  color: white !important; 
  border-color: #e67e22 !important;
  box-shadow: 0 0 15px rgba(230, 126, 34, 0.4);
}

/* Hide Scrollbar */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>