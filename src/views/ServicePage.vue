<template>
  <div class="service-page">
    
    <!-- BACKGROUND LAYERS -->
    <div class="contour-lines"></div> <!-- Corak Kontur Topo Map Realistik -->
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <div class="container pt-8 pb-12">
      
      <!-- HEADER SIMPLE -->
      <div class="mb-8 relative z-10 text-center md:text-left">
        <h1 class="text-3xl font-bold text-white mb-2">{{ t('directory.title') || 'Direktori Servis' }}</h1>
        <p class="text-gray-400">Cari penginapan, guide, sewaan khemah & transport untuk trip anda.</p>
        
        <!-- Advertise Button (Mobile view maybe?) -->
        <button v-if="userRole === 'organizer'" class="btn-advertise-header" @click="$router.push('/create-service')">
          <i class="fas fa-bullhorn mr-2"></i> {{ t('directory.advertiseBtn') || 'Iklankan Servis' }}
        </button>
      </div>

      <!-- FILTER SECTION (Updated Compact Layout) -->
      <div class="filter-section mb-8 relative z-10">
        <div class="filter-container">
          
          <!-- Row 1: Search Bar Memanjang + Button -->
          <div class="search-row">
            <div class="search-wrapper-full">
               <i class="fas fa-search search-icon"></i>
               <input 
                 type="text" 
                 v-model="searchQuery"
                 class="search-input-full"
                 :placeholder="t('common.searchPlaceholder') || 'Cari servis, lokasi, atau nama...'" 
                 @keyup.enter="() => {}"
               />
               <button class="btn-search-main">
                 Cari
               </button>
            </div>
          </div>

          <!-- Row 2: Filters (Kurangkan margin top jadi mt-3) -->
          <div class="filters-row mt-3">
             
             <!-- Filter: State (Lokasi) -->
             <div class="select-wrapper">
                <i class="fas fa-map-marker-alt select-icon text-red-400"></i>
                <select v-model="selectedState" class="custom-select">
                  <option value="">{{ t('directory.allStates') || 'Semua Negeri' }}</option>
                  <option v-for="state in MALAYSIA_STATES" :key="state" :value="state">{{ state }}</option>
                </select>
             </div>

             <!-- Filter: Category -->
             <div class="select-wrapper">
                <i class="fas fa-layer-group select-icon text-orange-400"></i>
                <select v-model="selectedCat" class="custom-select">
                  <option value="Semua">Semua Kategori</option>
                  <option v-for="cat in categoryIcons" :key="cat.name" :value="cat.name">
                    {{ cat.name }}
                  </option>
                </select>
             </div>

             <!-- Reset -->
             <button 
                v-if="searchQuery || selectedState || selectedCat !== 'Semua'" 
                class="btn-reset" 
                @click="resetFilters"
                title="Reset Filter"
             >
               <i class="fas fa-undo"></i>
             </button>
          </div>
        </div>
      </div>

      <!-- CATEGORY ICONS (Horizontal Scroll - Optional but good for quick access) -->
      <div class="category-scroll-container mb-8 relative z-10">
          <button 
            class="cat-pill" 
            :class="{ 'active': selectedCat === 'Semua' }"
            @click="selectedCat = 'Semua'"
          >
            <i class="fas fa-globe mr-2"></i> Semua
          </button>
          <button 
            v-for="cat in categoryIcons" 
            :key="cat.name"
            class="cat-pill"
            :class="{ 'active': selectedCat === cat.name }"
            @click="selectedCat = cat.name"
          >
            <i :class="cat.icon" class="mr-2"></i>
            {{ cat.name }}
          </button>
      </div>

      <!-- CONTENT AREA -->
      <div class="content-area relative z-10">
        
        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-gray-400">
          <div class="spinner mb-4"></div>
          <p>{{ t('common.loading') }}</p>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="filteredServices.length === 0" class="empty-state glass-panel">
          <i class="fas fa-folder-open text-4xl mb-4 opacity-30 text-gray-400"></i>
          <h3 class="text-lg font-bold text-gray-300">{{ t('directory.empty') || 'Tiada Servis Dijumpai' }}</h3>
          <p class="text-gray-500 text-sm">Cuba ubah filter lokasi atau kategori anda.</p>
          <button @click="resetFilters" class="text-orange-400 underline mt-2 text-sm">Reset Filter</button>
        </div>

        <!-- Grid Content -->
        <div v-else class="service-grid">
          <div 
            v-for="service in filteredServices" 
            :key="service.id" 
            class="service-card glass-card" 
            :class="{ 'expired-card': isExpired(service) }"
            @click="$router.push(`/service/${service.id}`)"
          >
            <!-- Expired Overlay -->
            <div v-if="isExpired(service)" class="expired-overlay">
              <span class="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">TAMAT TEMPOH</span>
            </div>

            <!-- Image -->
            <div class="card-img" :style="{ backgroundImage: `url(${service.image || 'https://via.placeholder.com/300'})` }">
              <div class="overlay-gradient"></div>
              <span class="cat-badge">
                 <i :class="getCategoryIcon(service.category)" class="mr-1"></i> {{ service.category }}
              </span>
              <span class="state-badge" v-if="service.state">{{ service.state }}</span>
            </div>
            
            <!-- Body -->
            <div class="card-body">
              <div class="title-row">
                <h3>{{ service.name }}</h3>
                
                <!-- Owner Actions -->
                <div v-if="auth.currentUser && auth.currentUser.uid === service.ownerId" class="owner-actions">
                  <button @click.stop="renewService(service)" class="btn-action renew" title="Renew">
                    <i class="fas fa-sync-alt"></i>
                  </button>
                  <button @click.stop="deleteService(service.id)" class="btn-action delete" title="Delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              <p class="loc">
                <i class="fas fa-map-pin text-red-400 mr-1"></i> {{ service.location }}
              </p>
              
              <div class="price-tag">
                <span v-if="service.details?.priceDisplay">{{ service.details.priceDisplay }}</span>
                <span v-else>RM {{ service.details?.price }} <small class="text-xs font-normal text-gray-400">{{ service.details?.priceType ? '/' + service.details.priceType : '' }}</small></span>
              </div>

              <div class="card-footer">
                 <div class="owner-info" @click.stop="goToProfile(service.ownerId)">
                   <img :src="service.ownerAvatar || 'https://i.pravatar.cc/150'" class="owner-avatar"/>
                   <span class="owner-name">{{ service.ownerName }}</span>
                 </div>
                 
                 <a 
                   :href="`https://wa.me/60${service.whatsapp}`" 
                   target="_blank" 
                   class="btn-contact" 
                   v-if="!isExpired(service)" 
                   @click.stop
                 >
                   <i class="fab fa-whatsapp"></i> Wasap
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
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc, Timestamp, getDoc } from 'firebase/firestore';
import { MALAYSIA_STATES } from '../constants/data';

const { t } = useI18n();
const router = useRouter();
const loading = ref(true);
const services = ref<any[]>([]);
const selectedCat = ref('Semua');
const selectedState = ref('');
const searchQuery = ref('');
const userRole = ref('user'); 

// Ganti Emoji dengan FontAwesome Icons
const categoryIcons = [
  { name: 'Campsite', icon: 'fas fa-campground' },
  { name: 'Guide', icon: 'fas fa-map-signs' },
  { name: 'Transport', icon: 'fas fa-shuttle-van' },
  { name: 'Rental', icon: 'fas fa-tools' }, // Atau fa-hiking
  { name: 'Chalet', icon: 'fas fa-home' },
  { name: 'Event', icon: 'fas fa-calendar-alt' }
];

const getCategoryIcon = (catName: string) => {
    const found = categoryIcons.find(c => c.name === catName);
    return found ? found.icon : 'fas fa-tag';
};

const isExpired = (service: any) => {
  if (!service.expiryDate) return false;
  return new Date() > service.expiryDate.toDate();
};

const filteredServices = computed(() => {
  return services.value.filter(s => {
    const matchCat = selectedCat.value === 'Semua' || s.category === selectedCat.value || (s.category && s.category.includes(selectedCat.value));
    const matchState = selectedState.value === '' || s.state === selectedState.value;
    const matchSearch = !searchQuery.value || s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || s.location.toLowerCase().includes(searchQuery.value.toLowerCase());
    const isMyService = auth.currentUser && auth.currentUser.uid === s.ownerId;
    return matchCat && matchState && matchSearch && (!isExpired(s) || isMyService);
  });
});

const resetFilters = () => {
    selectedCat.value = 'Semua';
    selectedState.value = '';
    searchQuery.value = '';
};

const goToProfile = (id: string) => { if (id) router.push(`/user/${id}`); };

const deleteService = async (id: string) => {
  if(confirm("Padam servis ini?")) {
    try { await deleteDoc(doc(db, 'services', id)); services.value = services.value.filter(s => s.id !== id); } catch (e) { alert("Gagal."); }
  }
};

const renewService = async (service: any) => {
  if(confirm("Perbaharui 3 bulan?")) {
    try {
      const newExpiry = new Date(); newExpiry.setDate(newExpiry.getDate() + 90);
      await updateDoc(doc(db, 'services', service.id), { expiryDate: Timestamp.fromDate(newExpiry) });
      service.expiryDate = Timestamp.fromDate(newExpiry); alert("Berjaya renew.");
    } catch (e) { alert("Gagal."); }
  }
};

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
    services.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {} finally { loading.value = false; }
});
</script>

<style scoped>
/* --- THEME BACKGROUND (DARK SUNSET + CONTOUR) --- */
.service-page { 
  background-color: #0f172a; /* Dark Blue/Black base */
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  color: white;
}
.container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; position: relative; z-index: 2; }

/* GLOW EFFECTS */
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

/* REALISTIC CONTOUR LINES PATTERN (Topo Map) */
.contour-lines {
  position: absolute; inset: 0; z-index: 0; opacity: 0.08;
  /* Complex SVG Pattern mimicking Topo Maps */
  background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400 M0,700 Q250,500 500,700 T1000,700 M0,300 Q250,100 500,300 T1000,300' stroke='white' fill='none' stroke-width='2' opacity='0.5'/%3E%3Cpath d='M500,0 Q600,250 500,500 T500,1000 M600,0 Q700,250 600,500 T600,1000 M400,0 Q500,250 400,500 T400,1000' stroke='white' fill='none' stroke-width='1.5' opacity='0.5'/%3E%3C/svg%3E");
  background-size: cover;
  pointer-events: none;
}

/* HEADER BUTTON */
.btn-advertise-header {
    display: inline-flex; align-items: center;
    margin-top: 1rem;
    background: linear-gradient(135deg, #e67e22, #d35400);
    color: white; border: none; padding: 8px 20px;
    border-radius: 50px; font-weight: 600; cursor: pointer;
    box-shadow: 0 4px 15px rgba(230, 126, 34, 0.3);
    transition: 0.3s;
}
.btn-advertise-header:hover { transform: translateY(-2px); }

/* --- FILTER SECTION (COMPACT GLASS DARK) --- */
.filter-section {
  background: rgba(255, 255, 255, 0.05); /* Glass Dark */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  /* Reduced Padding for compactness */
  padding: 1rem; 
  backdrop-filter: blur(10px);
}

.filter-container { display: flex; flex-direction: column; gap: 8px; }

/* SEARCH ROW */
.search-row { width: 100%; }
.search-wrapper-full {
  position: relative; display: flex; width: 100%; align-items: center;
}
.search-input-full {
  width: 100%; 
  /* Reduced vertical padding slightly (from 14px to 10px) */
  padding: 10px 100px 10px 44px; 
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.2); color: white;
  outline: none; transition: 0.3s; font-size: 1rem;
}
.search-input-full:focus { border-color: #6c63ff; background: rgba(0,0,0,0.4); }
.search-icon { position: absolute; left: 16px; color: #94a3b8; font-size: 1.1rem; }

.btn-search-main {
  position: absolute; right: 4px; top: 4px; bottom: 4px;
  background: #6c63ff; color: white; border: none;
  padding: 0 20px; border-radius: 8px; font-weight: 600; cursor: pointer;
  transition: 0.3s;
}
.btn-search-main:hover { background: #5b54e0; }

/* FILTERS ROW */
.filters-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }

.select-wrapper { position: relative; flex: 1; min-width: 160px; }
.custom-select {
  width: 100%; appearance: none;
  /* Reduced vertical padding (from 12px to 10px) */
  padding: 10px 36px 10px 38px;
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.2); color: #e2e8f0;
  outline: none; cursor: pointer; transition: 0.3s;
}
.custom-select:hover { background: rgba(0,0,0,0.3); }
.custom-select:focus { border-color: #6c63ff; }
.select-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.select-wrapper::after {
  content: '▼'; font-size: 0.7rem; color: #94a3b8;
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%); pointer-events: none;
}

.btn-reset {
  width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
  border-radius: 10px; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: none; cursor: pointer;
}
.btn-reset:hover { background: rgba(239, 68, 68, 0.3); }

/* CATEGORY SCROLL */
.category-scroll-container {
  display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px;
  scrollbar-width: none;
}
.category-scroll-container::-webkit-scrollbar { display: none; }
.cat-pill {
  display: flex; align-items: center;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 8px 16px; border-radius: 50px;
  color: #94a3b8; cursor: pointer; white-space: nowrap; transition: 0.3s;
}
.cat-pill:hover { background: rgba(255,255,255,0.1); color: white; }
.cat-pill.active {
  background: #e67e22; color: white; border-color: #e67e22; /* Orange for Services */
  box-shadow: 0 0 15px rgba(230, 126, 34, 0.4);
}

/* --- SERVICE CARDS (GLASS DARK) --- */
.service-grid {
  display: grid;
  /* Consistent Grid Size with Trip Page */
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.03); /* Very transparent */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px; overflow: hidden;
  backdrop-filter: blur(10px);
  transition: 0.3s; cursor: pointer;
  display: flex; flex-direction: column;
}
.glass-card:hover { 
    transform: translateY(-5px); 
    background: rgba(255, 255, 255, 0.06);
    border-color: #6c63ff;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.card-img { height: 180px; background-size: cover; position: relative; }
.overlay-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(15, 23, 42, 0.8));
}

.cat-badge {
    position: absolute; top: 10px; left: 10px;
    background: rgba(108, 99, 255, 0.9); color: white;
    padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
}
.state-badge {
    position: absolute; bottom: 10px; right: 10px;
    background: rgba(230, 126, 34, 0.9); color: white;
    padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
}

.card-body { padding: 1.2rem; display: flex; flex-direction: column; flex: 1; }
.title-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.title-row h3 { color: white; font-size: 1.1rem; font-weight: 700; line-height: 1.4; margin: 0; flex: 1; }

.loc { color: #94a3b8; font-size: 0.9rem; margin-bottom: 8px; display: flex; align-items: center; }

.price-tag { color: #facc15; font-size: 1.1rem; font-weight: 800; margin-bottom: 12px; }

.card-footer { 
    margin-top: auto; padding-top: 12px; 
    border-top: 1px solid rgba(255,255,255,0.1); 
    display: flex; justify-content: space-between; align-items: center; 
}
.owner-info { display: flex; align-items: center; gap: 8px; color: #cbd5e1; font-size: 0.85rem; }
.owner-avatar { width: 28px; height: 28px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); }

.btn-contact {
    background: rgba(255,255,255,0.1); color: #2ecc71;
    padding: 6px 12px; border-radius: 8px; font-weight: 600; font-size: 0.85rem;
    text-decoration: none; transition: 0.2s; border: 1px solid rgba(46, 204, 113, 0.3);
}
.btn-contact:hover { background: #2ecc71; color: white; }

/* LOADING/EMPTY */
.spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #6c63ff; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 3rem; display: flex; flex-direction: column; align-items: center; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .search-wrapper-full { flex-direction: column; gap: 10px; }
  .search-input-full { padding-right: 12px; } /* Reset padding if button moves */
  .btn-search-main { position: static; width: 100%; padding: 12px; }
  .filters-row { flex-direction: column; }
  .select-wrapper { width: 100%; }
}
</style>