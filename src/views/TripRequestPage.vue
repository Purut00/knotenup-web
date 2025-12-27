<template>
  <div class="request-page">
    
    <div class="contour-lines"></div>
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <div class="container main-content" style="padding-top: 100px; padding-bottom: 3rem;">
      
      <div class="header-section mb-8 relative z-10 flex flex-col md:flex-row justify-between items-end gap-4">
        <div class="text-center md:text-left">
          <h1 class="text-3xl font-bold text-white mb-2">{{ t('request.title') || 'Permintaan Trip' }}</h1>
          <p class="text-gray-400 max-w-lg">
            {{ t('request.sub') || 'Tak jumpa trip yang sesuai? Minta organizer buatkan untuk anda!' }}
          </p>
        </div>
        
        <button class="btn-create-request" @click="showCreateModal = true">
          <span class="btn-content">
            <i class="fas fa-plus-circle text-xl"></i>
            <span class="text-sm font-bold ml-2 uppercase tracking-wide">{{ t('request.createBtn') || 'Buat Request' }}</span>
          </span>
          <div class="btn-glow"></div>
        </button>
      </div>

      <div class="filter-section mb-8 relative z-10">
        <div class="filter-container">
          
          <div class="search-row">
            <div class="search-wrapper-full">
               <i class="fas fa-search search-icon"></i>
               <input 
                 type="text" 
                 v-model="searchQuery"
                 class="search-input-full"
                 placeholder="Cari destinasi atau aktiviti..." 
               />
               <button class="btn-search-main">Cari</button>
            </div>
          </div>

          <div class="filters-row mt-4">
             
             <div class="select-wrapper">
                <i class="fas fa-layer-group select-icon text-purple-400"></i>
                <select v-model="filterCategory" class="custom-select">
                  <option value="">Semua Kategori</option>
                  <optgroup v-for="(group, gIndex) in ACTIVITY_CATEGORIES" :key="gIndex" :label="group.group">
                    <option v-for="(item, iIndex) in group.items" :key="iIndex" :value="item">
                      {{ item }}
                    </option>
                  </optgroup>
                </select>
             </div>

             <div class="select-wrapper">
                <i class="fas fa-map-marker-alt select-icon text-red-400"></i>
                <select v-model="filterState" class="custom-select">
                  <option value="">Semua Negeri</option>
                  <option v-for="state in MALAYSIA_STATES" :key="state" :value="state">{{ state }}</option>
                </select>
             </div>

             <div class="flex gap-2 shrink-0">
                <button 
                    v-if="searchQuery || filterCategory || filterState" 
                    class="btn-icon-glass" 
                    @click="resetFilters"
                    title="Reset Filter"
                >
                <i class="fas fa-undo"></i>
                </button>

                <!-- MIGRATION UTIL -->
                <button @click="handleFixData" class="btn-icon-glass" title="Fix Data Lama">
                <i class="fas fa-tools"></i>
                </button>
             </div>
          </div>
        </div>
      </div>

      <div class="content-area relative z-10">
        
        <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-gray-400">
          <div class="spinner mb-4"></div>
          <p>{{ t('common.loading') }}...</p>
        </div>
        
        <div v-else-if="filteredRequests.length === 0" class="empty-state glass-panel">
          <i class="fas fa-paper-plane text-4xl mb-4 opacity-30 text-gray-400"></i>
          <h3 class="text-lg font-bold text-gray-300">Tiada Permintaan Aktif</h3>
          <p class="text-gray-500 text-sm">Jadilah yang pertama meminta trip idaman!</p>
          <button @click="resetFilters" class="text-purple-400 underline mt-2">Reset Filter</button>
        </div>

        <div v-else class="request-grid">
          <div 
            v-for="req in filteredRequests" 
            :key="req.id" 
            class="request-card glass-card"
          >
            <div class="category-badge">
               {{ req.category || 'Umum' }}
            </div>

            <button v-if="isOwner(req.userId)" class="btn-delete-card" @click="handleDelete(req.id)">
               <i class="fas fa-trash"></i>
            </button>

            <div class="card-body">
              
              <div class="user-row mb-3">
                 <AuthorBadge 
                    :userId="req.userId" 
                    :fallbackName="req.userName" 
                    :fallbackAvatar="req.userAvatar"
                 >
                    <template #subtext>
                       <span class="time-ago">{{ req.dateString || 'Baru saja' }}</span>
                    </template>
                 </AuthorBadge>
              </div>

              <h3 class="req-title mb-2">Ke: {{ req.destination }}</h3>
              
              <div class="info-grid mb-3">
                 <div class="info-item">
                    <i class="fas fa-map-marker-alt text-red-400 w-5"></i> 
                    <span class="truncate">{{ req.location }}</span>
                 </div>
                 <div class="info-item">
                    <i class="fas fa-users text-blue-400 w-5"></i> 
                    <span>{{ req.pax }} Pax</span>
                 </div>
                 <div class="info-item">
                    <i class="fas fa-calendar-alt text-orange-400 w-5"></i> 
                    <span>{{ req.dateString }}</span>
                 </div>
                 <div class="info-item">
                    <i class="fas fa-wallet text-green-400 w-5"></i> 
                    <span class="text-green-300 font-bold">RM {{ req.budget }}</span>
                 </div>
              </div>

              <p class="req-desc line-clamp-2">"{{ req.note }}"</p>
            </div>

            <div class="card-footer">
               <button v-if="isOwner(req.userId)" 
                  class="btn-action btn-owner" 
                  :class="{'has-offers': req.offeredBy && req.offeredBy.length > 0}"
                  :disabled="!req.offeredBy || req.offeredBy.length === 0"
                  @click="openViewOffers(req)"
               >
                  <span v-if="req.offeredBy && req.offeredBy.length > 0">
                      📨 Lihat {{ req.offeredBy.length }} Tawaran
                  </span>
                  <span v-else>
                      👤 Menunggu Tawaran...
                  </span>
               </button>

               <button v-else 
                  class="btn-action" 
                  :class="{ 
                    'btn-sent': hasOffered(req), 
                    'btn-purple': isCurrentUserOrganizer && !hasOffered(req),
                    'btn-disabled': !isCurrentUserOrganizer 
                  }"
                  :disabled="hasOffered(req) || !isCurrentUserOrganizer" 
                  @click="openOfferModal(req)"
               >
                  <span v-if="hasOffered(req)">✅ Tawaran Dihantar</span>
                  <span v-else-if="!isCurrentUserOrganizer">🔒 Organizer Sahaja</span>
                  <span v-else>🙋‍♂️ Accept Job</span>
               </button>
            </div>

          </div>
        </div>

      </div>
    </div>

    <!-- MODALS -->
    <TripRequestCreateModal 
      v-model:visible="showCreateModal" 
      @created="fetchRequests" 
    />

    <TripRequestOfferModal 
      v-model:visible="showOfferModal" 
      :request="selectedRequest" 
      @offered="handleOffered" 
    />

    <TripRequestViewOffersModal 
      v-model:visible="showViewOffersModal" 
      :request="selectedRequest" 
      @accepted="fetchRequests" 
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore'; 
import { onAuthStateChanged } from 'firebase/auth';
import { ACTIVITY_CATEGORIES, MALAYSIA_STATES } from '../constants/data'; 
import { useTripRequests } from '../composables/useTripRequests';
import { fixOldDataMessages } from '../utils/migrations';
import TripRequestCreateModal from '../components/trip_requests/TripRequestCreateModal.vue';
import TripRequestOfferModal from '../components/trip_requests/TripRequestOfferModal.vue';
import TripRequestViewOffersModal from '../components/trip_requests/TripRequestViewOffersModal.vue';
import AuthorBadge from '../components/common/AuthorBadge.vue';

const { t } = useI18n();
const { requests, loading, fetchRequests, deleteRequest, hasOffered, isOwner } = useTripRequests();

const showCreateModal = ref(false);
const showOfferModal = ref(false);
const showViewOffersModal = ref(false);
const isCurrentUserOrganizer = ref(false);
const selectedRequest = ref<any>(null);

const searchQuery = ref('');
const filterCategory = ref('');
const filterState = ref(''); 

const handleDelete = async (id: string) => {
    if(confirm(t('common.confirmDelete'))) {
        await deleteRequest(id);
    }
};

const handleFixData = async () => {
    await fixOldDataMessages();
    fetchRequests();
};

const openOfferModal = (req: any) => {
    selectedRequest.value = req;
    showOfferModal.value = true;
};

const openViewOffers = (req: any) => {
    selectedRequest.value = req;
    showViewOffersModal.value = true;
};

const handleOffered = () => {
    // Optionally trigger refresh or local update
    fetchRequests(); 
};

const resetFilters = () => {
    searchQuery.value = '';
    filterCategory.value = '';
    filterState.value = '';
};

const filteredRequests = computed(() => {
  return requests.value.filter(req => {
    const matchSearch = searchQuery.value ? (
        (req.destination && req.destination.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
        (req.note && req.note.toLowerCase().includes(searchQuery.value.toLowerCase()))
    ) : true;
    const matchCat = filterCategory.value ? req.category === filterCategory.value : true;
    const matchState = filterState.value ? req.location === filterState.value : true;
    return matchSearch && matchCat && matchState;
  });
});

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === 'organizer') {
            isCurrentUserOrganizer.value = true;
        }
        fetchRequests();
    } else {
        isCurrentUserOrganizer.value = false;
        fetchRequests();
    }
  });
});
</script>

<style scoped>
/* --- BASE THEME (DARK) --- */
.request-page { 
  background-color: #0f172a; 
  min-height: 100vh; position: relative; overflow-x: hidden; color: white;
}

/* GLOWS */
.page-glow-purple {
  position: absolute; top: 0; left: 0; width: 50vw; height: 50vw;
  background: #6c63ff; filter: blur(150px); opacity: 0.15; pointer-events: none; border-radius: 50%;
}
.page-glow-orange {
  position: absolute; bottom: 0; right: 0; width: 50vw; height: 50vw;
  background: #ff8c42; filter: blur(150px); opacity: 0.1; pointer-events: none; border-radius: 50%;
}
.contour-lines {
  position: absolute; inset: 0; z-index: 0; opacity: 0.08;
  background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400' stroke='white' fill='none' stroke-width='2' opacity='0.5'/%3E%3C/svg%3E");
  background-size: cover; pointer-events: none;
}

.container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; position: relative; z-index: 2; }

/* --- HEADER BUTTON (UNGU) --- */
.btn-create-request {
  position: relative; background: transparent; border: none; padding: 0; cursor: pointer; display: flex; align-items: center;
}
.btn-content {
  position: relative; z-index: 2; display: flex; align-items: center;
  background: linear-gradient(135deg, #6c63ff, #5b54e0);
  color: white; padding: 12px 24px; border-radius: 50px;
  box-shadow: 0 4px 15px rgba(108, 99, 255, 0.4); transition: transform 0.2s;
}
.btn-create-request:hover .btn-content { transform: translateY(-2px); background: linear-gradient(135deg, #5b54e0, #4c46c0); }
.btn-glow {
  position: absolute; inset: 0; background: #6c63ff; filter: blur(15px); opacity: 0.5; z-index: 1; transition: opacity 0.3s;
}
.btn-create-request:hover .btn-glow { opacity: 0.8; }

/* --- FILTER SECTION (GLASS DARK) --- */
.filter-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px; padding: 1.5rem; backdrop-filter: blur(10px);
}
.filter-container { display: flex; flex-direction: column; gap: 8px; }

.search-row { width: 100%; }
.search-wrapper-full { position: relative; display: flex; width: 100%; align-items: center; }
.search-input-full {
  width: 100%; padding: 10px 100px 10px 44px;
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.2); color: white; outline: none; transition: 0.3s; font-size: 1rem;
}
.search-input-full:focus { border-color: #6c63ff; background: rgba(0,0,0,0.4); }
.search-icon { position: absolute; left: 16px; color: #94a3b8; font-size: 1.1rem; }
.btn-search-main {
  position: absolute; right: 4px; top: 4px; bottom: 4px;
  background: #6c63ff; color: white; border: none; padding: 0 20px;
  border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.3s;
}
.btn-search-main:hover { background: #5b54e0; }

.filters-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.select-wrapper { position: relative; flex: 1; min-width: 160px; }
.custom-select {
  width: 100%; appearance: none; padding: 10px 36px 10px 38px;
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.2); color: #e2e8f0; outline: none; cursor: pointer; transition: 0.3s;
}
.custom-select:hover { background: rgba(0,0,0,0.3); }
.custom-select:focus { border-color: #6c63ff; }
.select-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.select-wrapper::after {
  content: '▼'; font-size: 0.7rem; color: #94a3b8; position: absolute; right: 14px; top: 50%; transform: translateY(-50%); pointer-events: none;
}

/* FIX: Dark Options */
.custom-select option, .custom-select optgroup {
  background-color: #1e293b; color: white; padding: 10px;
}

.btn-icon-glass {
  width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
  border-radius: 10px; background: rgba(255, 255, 255, 0.1); color: #ccc; border: none; cursor: pointer;
}
.btn-icon-glass:hover { background: rgba(255, 255, 255, 0.2); color: white; }

/* --- REQUEST CARDS --- */
.request-grid {
  display: grid; 
  /* Grid Size = Same as Trip/Spot (minmax 260px) */
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); 
  gap: 24px;
}

.request-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px; overflow: hidden;
  backdrop-filter: blur(10px);
  display: flex; flex-direction: column; transition: 0.3s; position: relative;
  /* Fixed Height not enforced to prevent overflow, but min-height matches trip cards roughly */
  min-height: 280px; 
}
.request-card:hover { 
  transform: translateY(-5px); background: rgba(255, 255, 255, 0.06); border-color: #6c63ff; 
  box-shadow: 0 10px 30px rgba(108, 99, 255, 0.15);
}

/* FIX: Category Badge Left */
.category-badge {
  position: absolute; top: 12px; left: 12px; font-size: 0.65rem; 
  background: rgba(108, 99, 255, 0.2); color: #a78bfa; 
  padding: 3px 10px; border-radius: 20px; font-weight: bold; text-transform: uppercase;
}

/* FIX: Delete Button Right */
.btn-delete-card {
  position: absolute; top: 12px; right: 12px; width: 24px; height: 24px; 
  background: rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 50%; 
  display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; z-index: 2;
}
.btn-delete-card:hover { background: rgba(239, 68, 68, 0.4); }

.card-header {
  padding: 1.2rem; margin-top: 2rem; /* Add margin-top to clear badge */
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.user-row { display: flex; align-items: center; gap: 10px; }
.avatar-sm { width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); object-fit: cover; }
.user-meta { display: flex; flex-direction: column; width: 100%; overflow: hidden; }
.username { font-weight: 600; font-size: 0.9rem; color: white; }
.time-ago { font-size: 0.7rem; color: #94a3b8; }
.budget-pill { font-size: 0.9rem; color: #4ade80; font-weight: 800; background: rgba(74, 222, 128, 0.1); padding: 4px 10px; border-radius: 8px; }

.card-body { padding: 1.2rem; flex: 1; display: flex; flex-direction: column; }
.req-title { font-size: 1.1rem; color: white; font-weight: 700; line-height: 1.3; }

/* Info Grid (Icon + Text) */
.info-grid { 
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.85rem; color: #cbd5e1; 
}
.info-item { display: flex; align-items: center; overflow: hidden; white-space: nowrap; }

.req-desc { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; font-style: italic; }

.card-footer { padding: 1rem; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; margin-top: auto; }
.btn-action {
  width: 100%; padding: 8px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; border: none; cursor: pointer; transition: 0.2s;
}
.btn-purple { background: #6c63ff; color: white; }
.btn-purple:hover { background: #5b54e0; }
.btn-sent { background: #10b981; color: white; }
.btn-owner { background: rgba(255,255,255,0.1); color: #ccc; border: 1px solid rgba(255,255,255,0.1); }
.btn-owner.has-offers { background: #e67e22; color: white; border: none; animation: pulse 2s infinite; }
.btn-disabled { background: rgba(255,255,255,0.05); color: #666; cursor: not-allowed; }

@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.8; } 100% { opacity: 1; } }

.spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #6c63ff; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 3rem; display: flex; flex-direction: column; align-items: center; }
</style>