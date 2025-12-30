<template>
  <div class="min-h-screen bg-slate-900 relative overflow-x-hidden text-white">
    
    <div class="absolute inset-0 z-0 opacity-[0.08] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' viewBox=\'0 0 1000 1000\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400\' stroke=\'white\' fill=\'none\' stroke-width=\'2\' opacity=\'0.5\'/%3E%3C/svg%3E')] bg-cover"></div>
    <div class="absolute top-0 left-0 w-[50vw] h-[50vw] bg-[#6c63ff] blur-[150px] opacity-15 pointer-events-none rounded-full"></div>
    <div class="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-[#ff8c42] blur-[150px] opacity-10 pointer-events-none rounded-full"></div>

    <div class="container mx-auto px-6 pt-[100px] pb-12 relative z-10 max-w-[1200px]">
      
      <div class="mb-8 relative z-10 flex flex-col md:flex-row justify-between items-end gap-4 max-md:items-center max-md:text-center">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">{{ t('request.title') || 'Permintaan Trip' }}</h1>
          <p class="text-gray-400 max-w-lg">
            {{ t('request.sub') || 'Tak jumpa trip yang sesuai? Minta organizer buatkan untuk anda!' }}
          </p>
        </div>
        
        <button class="relative bg-transparent border-none p-0 cursor-pointer flex items-center group" @click="showCreateModal = true">
          <span class="relative z-[2] flex items-center bg-gradient-to-br from-[#6c63ff] to-[#5b54e0] text-white py-3 px-6 rounded-full shadow-[0_4px_15px_rgba(108,99,255,0.4)] transition duration-200 group-hover:-translate-y-0.5 group-hover:bg-gradient-to-br group-hover:from-[#5b54e0] group-hover:to-[#4c46c0]">
            <i class="fas fa-plus-circle text-xl"></i>
            <span class="text-sm font-bold ml-2 uppercase tracking-wide">{{ t('request.createBtn') || 'Buat Request' }}</span>
          </span>
          <div class="absolute inset-0 bg-[#6c63ff] blur-[15px] opacity-50 z-[1] transition duration-300 group-hover:opacity-80"></div>
        </button>
      </div>

      <div class="mb-8 relative z-10">
        <div class="flex flex-col gap-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          
          <div class="w-full">
            <div class="relative flex w-full items-center">
               <i class="fas fa-search absolute left-4 text-slate-400 text-lg"></i>
               <input 
                 type="text" 
                 v-model="searchQuery"
                 class="w-full py-2.5 pr-11 rounded-xl border border-white/10 bg-black/20 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-black/40 pl-[44px]"
                 placeholder="Cari destinasi atau aktiviti..." 
               />
               <button class="absolute right-1 top-1 bottom-1 bg-[#6c63ff] text-white border-none py-0 px-5 rounded-lg font-semibold cursor-pointer transition duration-300 hover:bg-[#5b54e0]">Cari</button>
            </div>
          </div>

          <div class="flex gap-3 flex-wrap items-center mt-1">
             
             <div class="relative flex-1 min-w-[160px]">
                <i class="fas fa-layer-group absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-purple-400"></i>
                <select v-model="filterCategory" class="w-full py-2.5 pl-9 pr-9 rounded-xl border border-white/10 bg-black/20 text-slate-200 outline-none cursor-pointer transition duration-300 appearance-none hover:bg-black/30 focus:border-[#6c63ff]">
                  <option value="" class="bg-[#1e293b] text-white">Semua Kategori</option>
                  <optgroup v-for="(group, gIndex) in ACTIVITY_CATEGORIES" :key="gIndex" :label="group.group" class="bg-[#1e293b] text-white">
                    <option v-for="(item, iIndex) in group.items" :key="iIndex" :value="item" class="bg-[#1e293b] text-white">
                      {{ item }}
                    </option>
                  </optgroup>
                </select>
                <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[0.7rem] text-slate-400 pointer-events-none">▼</span>
             </div>

             <div class="relative flex-1 min-w-[160px]">
                <i class="fas fa-map-marker-alt absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-red-400"></i>
                <select v-model="filterState" class="w-full py-2.5 pl-9 pr-9 rounded-xl border border-white/10 bg-black/20 text-slate-200 outline-none cursor-pointer transition duration-300 appearance-none hover:bg-black/30 focus:border-[#6c63ff]">
                  <option value="" class="bg-[#1e293b] text-white">Semua Negeri</option>
                  <option v-for="state in MALAYSIA_STATES" :key="state" :value="state" class="bg-[#1e293b] text-white">{{ state }}</option>
                </select>
                <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[0.7rem] text-slate-400 pointer-events-none">▼</span>
             </div>

             <div class="flex gap-2 shrink-0">
                <button 
                    v-if="searchQuery || filterCategory || filterState" 
                    class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-[#ccc] border-none cursor-pointer hover:bg-white/20 hover:text-white" 
                    @click="resetFilters"
                    title="Reset Filter"
                >
                <i class="fas fa-undo"></i>
                </button>

                <!-- MIGRATION UTIL -->
                <button @click="handleFixData" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-[#ccc] border-none cursor-pointer hover:bg-white/20 hover:text-white" title="Fix Data Lama">
                <i class="fas fa-tools"></i>
                </button>
             </div>
          </div>
        </div>
      </div>

      <div class="relative z-10">
        
        <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-gray-400">
          <div class="w-10 h-10 border-[3px] border-white/10 border-t-[#6c63ff] rounded-full animate-spin mb-4"></div>
          <p>{{ t('common.loading') }}...</p>
        </div>
        
        <div v-else-if="filteredRequests.length === 0" class="text-center p-12 flex flex-col items-center bg-white/5 rounded-[20px] border border-dashed border-white/20">
          <i class="fas fa-paper-plane text-4xl mb-4 opacity-30 text-gray-400"></i>
          <h3 class="text-lg font-bold text-gray-300">Tiada Permintaan Aktif</h3>
          <p class="text-gray-500 text-sm">Jadilah yang pertama meminta trip idaman!</p>
          <button @click="resetFilters" class="text-purple-400 underline mt-2 bg-transparent border-none cursor-pointer">Reset Filter</button>
        </div>

        <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
          <div 
            v-for="req in filteredRequests" 
            :key="req.id" 
            class="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col transition duration-300 relative min-h-[280px] h-full hover:-translate-y-1.5 hover:bg-white/10 hover:border-[#6c63ff] hover:shadow-[0_10px_30px_rgba(108,99,255,0.15)]"
          >
            <div class="absolute top-3 left-3 text-[0.65rem] bg-[#6c63ff]/20 text-[#a78bfa] py-[3px] px-[10px] rounded-[20px] font-bold uppercase">
               {{ req.category || 'Umum' }}
            </div>

            <button v-if="isOwner(req.userId)" class="absolute top-3 right-3 w-6 h-6 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center cursor-pointer border-none z-[2] hover:bg-red-500/40" @click="handleDelete(req.id)">
               <i class="fas fa-trash"></i>
            </button>

            <div class="p-5 flex-1 flex flex-col pt-12">
              
              <div class="flex items-center gap-2.5 mb-3">
                 <AuthorBadge 
                    :userId="req.userId" 
                    :fallbackName="req.userName" 
                    :fallbackAvatar="req.userAvatar"
                 >
                    <template #subtext>
                       <span class="text-[0.7rem] text-slate-400">{{ req.dateString || 'Baru saja' }}</span>
                    </template>
                 </AuthorBadge>
              </div>

              <h3 class="text-[1.1rem] text-white font-bold leading-snug mb-2">Ke: {{ req.destination }}</h3>
              
              <div class="grid grid-cols-2 gap-2 text-[0.85rem] text-slate-300 mb-3">
                 <div class="flex items-center overflow-hidden whitespace-nowrap">
                    <i class="fas fa-map-marker-alt text-red-400 w-5"></i> 
                    <span class="truncate">{{ req.location }}</span>
                 </div>
                 <div class="flex items-center overflow-hidden whitespace-nowrap">
                    <i class="fas fa-users text-blue-400 w-5"></i> 
                    <span>{{ req.pax }} Pax</span>
                 </div>
                 <div class="flex items-center overflow-hidden whitespace-nowrap">
                    <i class="fas fa-calendar-alt text-orange-400 w-5"></i> 
                    <span>{{ req.dateString }}</span>
                 </div>
                 <div class="flex items-center overflow-hidden whitespace-nowrap">
                    <i class="fas fa-wallet text-green-400 w-5"></i> 
                    <span class="text-green-300 font-bold">RM {{ req.budget }}</span>
                 </div>
              </div>

              <p class="text-[0.85rem] text-slate-400 leading-normal italic line-clamp-2">"{{ req.note }}"</p>
            </div>

            <div class="p-4 border-t border-white/5 text-center mt-auto">
               <button v-if="isOwner(req.userId)" 
                  class="w-full p-2 rounded-lg font-semibold text-[0.9rem] border border-white/10 cursor-pointer transition duration-200 bg-white/10 text-[#ccc]"
                  :class="{'bg-[#e67e22] text-white border-none animate-pulse': req.offeredBy && req.offeredBy.length > 0}"
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
                  class="w-full p-2 rounded-lg font-semibold text-[0.9rem] border-none cursor-pointer transition duration-200" 
                  :class="{ 
                    'bg-emerald-500 text-white': hasOffered(req), 
                    'bg-[#6c63ff] text-white hover:bg-[#5b54e0]': isCurrentUserOrganizer && !hasOffered(req),
                    'bg-white/5 text-[#666] cursor-not-allowed': !isCurrentUserOrganizer 
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