<template>
  <div class="animate-fade-in">
     <div class="flex justify-between mb-4 items-center">
        <h3>Pengurusan Spot</h3>
        <div class="flex gap-[5px]">
            <input type="text" v-model="searchQuery" placeholder="Cari nama..." class="p-2 rounded-[5px] border-none bg-[#34495e] text-white" @keyup.enter="performSearch"/>
            <button class="bg-[#3498db] text-white border-none px-[15px] py-0 rounded-[5px] cursor-pointer" @click="performSearch">Cari</button>
        </div>
     </div>

     <div v-if="loading" class="text-center py-4">Loading spots...</div>
     
     <div v-else class="flex flex-col gap-[10px] max-h-[70vh] overflow-y-auto custom-scrollbar">
        <div v-for="spot in spots" :key="spot.id" class="bg-[#2c3e50] p-4 rounded-lg flex justify-between items-center border-l-4 border-[#f1c40f]" :class="{ '!border-[#3498db] opacity-70': spot.isFrozen }">
           <div class="flex flex-col gap-[2px]">
              <a :href="`/spots/${spot.id}`" target="_blank" class="text-white font-bold no-underline">
                  {{ spot.name }} 
                  <span v-if="spot.isFrozen" class="text-[0.7rem] bg-[#3498db] px-[4px] py-[2px] rounded-[4px] ml-[5px]">❄️ FROZEN</span>
              </a>
              <div class="text-[#95a5a6] text-[0.8rem]">By: {{ spot.contributorName }} • {{ formatDate(spot.createdAt) }}</div>
           </div>
           <div class="flex gap-[5px]">
              <button class="p-[5px_10px] rounded-[5px] border-none cursor-pointer text-white text-[0.8rem] bg-[#e74c3c]" @click="$emit('view-reports', spot.id)">🚨 Reports</button>
              
              <button class="p-[5px_10px] rounded-[5px] border-none cursor-pointer text-white text-[0.8rem]" :class="spot.isFrozen ? 'bg-[#f39c12]' : 'bg-[#3498db]'" @click="toggleFreeze(spot)">
                  {{ spot.isFrozen ? 'Unfreeze' : 'Freeze' }}
              </button>
              <button class="p-[5px_10px] rounded-[5px] border-none cursor-pointer text-white text-[0.8rem] bg-[#e74c3c]" @click="deleteItem(spot.id)">🗑️</button>
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

const spots = ref<any[]>([]);
const lastDoc = ref<any>(null);
const loading = ref(false);
const hasMore = ref(true);
const searchQuery = ref('');

const PAGE_SIZE = 20;

const formatDate = (ts: any) => ts ? new Date(ts.seconds * 1000).toLocaleDateString() : '';

const fetchSpots = async (isLoadMore = false) => {
    loading.value = !isLoadMore;
    try {
        let q;
        const coll = collection(db, "spots");
        
        if (searchQuery.value && searchQuery.value.trim() !== '') {
            const term = searchQuery.value.trim();
             // Server-side Prefix Search on 'name'
            q = query(coll, 
                where("name", ">=", term), 
                where("name", "<=", term + '\uf8ff'),
                limit(PAGE_SIZE));
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
            const newSpots = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            if (isLoadMore) spots.value.push(...newSpots);
            else spots.value = newSpots;
            
            if (snap.docs.length < PAGE_SIZE) hasMore.value = false;
        }

    } catch (e) { console.error(e); } 
    finally { loading.value = false; }
};

const performSearch = async () => {
    // Reset and reload. Implementing real search would be a separate task.
    spots.value = []; lastDoc.value = null; hasMore.value = true;
    fetchSpots(); 
};

const loadMore = () => fetchSpots(true);

const toggleFreeze = async (spot: any) => {
  if(!confirm("Ubah status freeze?")) return;
  try {
    await updateDoc(doc(db, "spots", spot.id), { isFrozen: !spot.isFrozen });
    spot.isFrozen = !spot.isFrozen;
  } catch(e) { alert("Gagal update."); }
};

const deleteItem = async (id: string) => {
  if(!confirm("Padam spot ini?")) return;
  try {
     await deleteDoc(doc(db, "spots", id));
     spots.value = spots.value.filter(s => s.id !== id);
  } catch(e) { alert("Gagal padam."); }
};

onMounted(() => {
    fetchSpots();
});
</script>
