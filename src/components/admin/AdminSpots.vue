<template>
  <div class="admin-tab-content fade-in">
     <div class="tab-header">
        <h3>Pengurusan Spot</h3>
        <div class="actions">
            <input type="text" v-model="searchQuery" placeholder="Cari nama..." class="search-box" @keyup.enter="performSearch"/>
            <button class="btn-search" @click="performSearch">Cari</button>
        </div>
     </div>

     <div v-if="loading" class="text-center py-4">Loading spots...</div>
     
     <div v-else class="data-list custom-scrollbar">
        <div v-for="spot in spots" :key="spot.id" class="data-item" :class="{ 'frozen-item': spot.isFrozen }">
           <div class="item-main">
              <a :href="`/spots/${spot.id}`" target="_blank" class="item-title">
                  {{ spot.name }} 
                  <span v-if="spot.isFrozen" class="frozen-badge">❄️ FROZEN</span>
              </a>
              <div class="item-meta">By: {{ spot.contributorName }} • {{ formatDate(spot.createdAt) }}</div>
           </div>
           <div class="item-actions">
              <button class="btn-report" @click="$emit('view-reports', spot.id)">🚨 Reports</button>
              
              <button class="btn-action" :class="spot.isFrozen ? 'btn-unfreeze' : 'btn-freeze'" @click="toggleFreeze(spot)">
                  {{ spot.isFrozen ? 'Unfreeze' : 'Freeze' }}
              </button>
              <button class="btn-del" @click="deleteItem(spot.id)">🗑️</button>
           </div>
        </div>
        
        <div v-if="hasMore" class="text-center mt-4">
            <button class="btn-load-more" @click="loadMore">Load More</button>
        </div>
     </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebaseConfig';
import { collection, query, orderBy, limit, getDocs, startAfter, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';

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
        
        // Handling search would require indexed query or 3rd party search. 
        // We stick to simple pagination by date for now to ensure performance.
        if (isLoadMore && lastDoc.value) {
            q = query(coll, orderBy("createdAt", "desc"), startAfter(lastDoc.value), limit(PAGE_SIZE));
        } else {
            q = query(coll, orderBy("createdAt", "desc"), limit(PAGE_SIZE));
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

<style scoped>
.tab-header { display: flex; justify-content: space-between; margin-bottom: 1rem; align-items: center; }
.actions { display: flex; gap: 5px; }
.search-box { padding: 8px; border-radius: 5px; border: none; background: #34495e; color: white; }
.btn-search { background: #3498db; color: white; border: none; padding: 0 15px; border-radius: 5px; cursor: pointer; }

.data-list { display: flex; flex-direction: column; gap: 10px; max-height: 70vh; overflow-y: auto; }
.data-item { background: #2c3e50; padding: 1rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid #f1c40f; } /* Yellow for spots */
.data-item.frozen-item { border-left-color: #3498db; opacity: 0.7; }
.item-title { color: white; font-weight: bold; text-decoration: none; }
.item-meta { color: #95a5a6; font-size: 0.8rem; }
.item-actions { display: flex; gap: 5px; }
.btn-del, .btn-freeze, .btn-unfreeze, .btn-report { padding: 5px 10px; border-radius: 5px; border: none; cursor: pointer; color: white; font-size: 0.8rem; }
.btn-del { background: #e74c3c; } .btn-freeze { background: #3498db; } .btn-unfreeze { background: #f39c12; } .btn-report { background: #e74c3c; }
.btn-load-more { background: #34495e; color: white; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; }
.frozen-badge { font-size: 0.7rem; background: #3498db; padding: 2px 4px; border-radius: 4px; margin-left: 5px; }
</style>
