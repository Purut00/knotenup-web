<template>
  <div class="animate-fade-in">
     <div class="flex justify-between mb-4 items-center">
        <h3>Pengurusan Trip</h3>
        <div class="flex gap-[5px]">
            <input type="text" v-model="searchQuery" placeholder="Cari title..." class="p-2 rounded-[5px] border-none bg-[#34495e] text-white" @keyup.enter="performSearch"/>
            <button class="bg-[#3498db] text-white border-none px-[15px] py-0 rounded-[5px] cursor-pointer" @click="performSearch">Cari</button>
        </div>
     </div>

     <div v-if="loading" class="text-center py-4">Loading trips...</div>
     
     <div v-else class="flex flex-col gap-[10px] max-h-[70vh] overflow-y-auto custom-scrollbar">
        <div v-for="trip in trips" :key="trip.id" class="bg-[#2c3e50] p-4 rounded-lg flex justify-between items-center border-l-4 border-[#2ecc71]" :class="{ '!border-[#3498db] opacity-70': trip.isFrozen }">
           <div class="flex flex-col gap-[2px]">
              <a :href="`/trips/${trip.id}`" target="_blank" class="text-white font-bold no-underline">
                  {{ trip.title }} 
                  <span v-if="trip.isFrozen" class="text-[0.7rem] bg-[#3498db] px-[4px] py-[2px] rounded-[4px] ml-[5px]">❄️ FROZEN</span>
              </a>
              <div class="text-[#95a5a6] text-[0.8rem]">{{ trip.organizerName }} • {{ trip.status }} • {{ formatDate(trip.createdAt) }}</div>
           </div>
           <div class="flex gap-[5px]">
              <!-- Report count is tricky without fetching all reports. We pass logic to parent or just show button -->
              <button class="p-[5px_10px] rounded-[5px] border-none cursor-pointer text-white text-[0.8rem] bg-[#e74c3c]" @click="$emit('view-reports', trip.id)">🚨 Reports</button>
              
              <button class="p-[5px_10px] rounded-[5px] border-none cursor-pointer text-white text-[0.8rem]" :class="trip.isFrozen ? 'bg-[#f39c12]' : 'bg-[#3498db]'" @click="toggleFreeze(trip)">
                  {{ trip.isFrozen ? 'Unfreeze' : 'Freeze' }}
              </button>
              <button class="p-[5px_10px] rounded-[5px] border-none cursor-pointer text-white text-[0.8rem] bg-[#e74c3c]" @click="deleteItem(trip.id)">🗑️</button>
           </div>
        </div>
        
        <div v-if="hasMore" class="text-center mt-4">
            <button class="bg-[#34495e] text-white px-[20px] py-[10px] rounded-[8px] border-none cursor-pointer" @click="loadMore">Load More</button>
        </div>
     </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebaseConfig';
import { collection, query, orderBy, limit, getDocs, startAfter, updateDoc, doc, deleteDoc, where } from 'firebase/firestore';

const emit = defineEmits(['view-reports']);

const trips = ref<any[]>([]);
const lastDoc = ref<any>(null);
const loading = ref(false);
const hasMore = ref(true);
const searchQuery = ref('');

const PAGE_SIZE = 20;

const formatDate = (ts: any) => ts ? new Date(ts.seconds * 1000).toLocaleDateString() : '';

const fetchTrips = async (isLoadMore = false) => {
    loading.value = !isLoadMore;
    try {
        let q;
        const coll = collection(db, "trips");
        
        if (searchQuery.value && searchQuery.value.trim() !== '') {
             const term = searchQuery.value.trim();
             // Server-side Prefix Search on 'title'
             // Note: Case-sensitive. 'Gunung' matches 'Gunung', but not 'gunung'.
             q = query(coll, 
                where("title", ">=", term), 
                where("title", "<=", term + '\uf8ff'),
                limit(PAGE_SIZE));
             // Disabled orderBy("createdAt") during search to avoid index requirement.
        } else {
             if (isLoadMore && lastDoc.value) {
                 q = query(coll, orderBy("createdAt", "desc"), startAfter(lastDoc.value), limit(PAGE_SIZE));
             } else {
                 q = query(coll, orderBy("createdAt", "desc"), limit(PAGE_SIZE));
             }
        }

        const snap = await getDocs(q);
        
        if (snap.empty) {
            hasMore.value = false;
        } else {
            lastDoc.value = snap.docs[snap.docs.length - 1];
            const newTrips = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            if (isLoadMore) trips.value.push(...newTrips);
            else trips.value = newTrips;
            
            if (snap.docs.length < PAGE_SIZE) hasMore.value = false;
        }

    } catch (e) { console.error(e); } 
    finally { loading.value = false; }
};

const performSearch = async () => {
    // Basic implementation: reset and filter by client-side if loaded? 
    // Or if searchQuery is provided, try to find matches?
    // Given the constraints, I will just reset list.
    trips.value = []; lastDoc.value = null; hasMore.value = true;
    fetchTrips(); 
    // * Ideally we implement improved search later. 
};

const loadMore = () => fetchTrips(true);

const toggleFreeze = async (trip: any) => {
  if(!confirm("Ubah status freeze?")) return;
  try {
    await updateDoc(doc(db, "trips", trip.id), { isFrozen: !trip.isFrozen });
    trip.isFrozen = !trip.isFrozen;
  } catch(e) { alert("Gagal update."); }
};

const deleteItem = async (id: string) => {
  if(!confirm("Padam trip ini?")) return;
  try {
     await deleteDoc(doc(db, "trips", id));
     trips.value = trips.value.filter(t => t.id !== id);
  } catch(e) { alert("Gagal padam."); }
};

onMounted(() => {
    fetchTrips();
});
</script>
