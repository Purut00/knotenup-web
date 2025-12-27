<template>
  <div class="admin-tab-content fade-in">
     <div class="tab-header"><h3>Pengurusan Forum</h3></div>
     <div v-if="loading" class="text-center py-4">Loading posts...</div>
     <div v-else class="data-list custom-scrollbar">
        <div v-for="post in posts" :key="post.id" class="data-item" :class="{ 'frozen-item': post.isFrozen }">
           <div class="item-main">
              <a :href="`/forum/${post.id}`" target="_blank" class="item-title">{{ post.title }} <span v-if="post.isFrozen" class="frozen-badge">❄️ FROZEN</span></a>
              <div class="item-meta">{{ formatDate(post.createdAt) }}</div>
           </div>
           <div class="item-actions">
              <button class="btn-report" @click="$emit('view-reports', post.id)">🚨 Reports</button>
              <button class="btn-action" :class="post.isFrozen ? 'btn-unfreeze' : 'btn-freeze'" @click="toggleFreeze(post)">{{ post.isFrozen ? 'Unfreeze' : 'Freeze' }}</button>
              <button class="btn-del" @click="deleteItem(post.id)">🗑️</button>
           </div>
        </div>
        <div v-if="hasMore" class="text-center mt-4"><button class="btn-load-more" @click="loadMore">Load More</button></div>
     </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebaseConfig';
import { collection, query, orderBy, limit, getDocs, startAfter, updateDoc, doc, deleteDoc } from 'firebase/firestore';

const emit = defineEmits(['view-reports']);
const posts = ref<any[]>([]);
const lastDoc = ref<any>(null);
const loading = ref(false);
const hasMore = ref(true);
const PAGE_SIZE = 20;

const formatDate = (ts: any) => ts ? new Date(ts.seconds * 1000).toLocaleDateString() : '';

const fetchPosts = async (isLoadMore = false) => {
    loading.value = !isLoadMore;
    try {
        const coll = collection(db, "forum_posts");
        const q = (isLoadMore && lastDoc.value) 
            ? query(coll, orderBy("createdAt", "desc"), startAfter(lastDoc.value), limit(PAGE_SIZE))
            : query(coll, orderBy("createdAt", "desc"), limit(PAGE_SIZE));

        const snap = await getDocs(q);
        if (snap.empty) { hasMore.value = false; }
        else {
            lastDoc.value = snap.docs[snap.docs.length - 1];
            const newPosts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            if (isLoadMore) posts.value.push(...newPosts); else posts.value = newPosts;
            if (snap.docs.length < PAGE_SIZE) hasMore.value = false;
        }
    } catch (e) { console.error(e); } finally { loading.value = false; }
};
const loadMore = () => fetchPosts(true);
const toggleFreeze = async (item: any) => { if(confirm("Freeze?")) { await updateDoc(doc(db, "forum_posts", item.id), { isFrozen: !item.isFrozen }); item.isFrozen = !item.isFrozen; } };
const deleteItem = async (id: string) => { if(confirm("Delete?")) { await deleteDoc(doc(db, "forum_posts", id)); posts.value = posts.value.filter(i => i.id !== id); } };
onMounted(() => fetchPosts());
</script>
<style scoped>
.btn-load-more { background: #34495e; color: white; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; }
.data-list { display: flex; flex-direction: column; gap: 10px; max-height: 70vh; overflow-y: auto; }
.data-item { background: #2c3e50; padding: 1rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid #9b59b6; }
.item-title { color: white; font-weight: bold; text-decoration: none; }
.item-meta { color: #95a5a6; font-size: 0.8rem; }
.item-actions { display: flex; gap: 5px; }
.btn-del, .btn-freeze, .btn-unfreeze, .btn-report { padding: 5px 10px; border-radius: 5px; border: none; cursor: pointer; color: white; font-size: 0.8rem; }
.btn-del { background: #e74c3c; } .btn-freeze { background: #3498db; } .btn-unfreeze { background: #f39c12; } .btn-report { background: #e74c3c; }
.frozen-badge { font-size: 0.7rem; background: #3498db; padding: 2px 4px; border-radius: 4px; margin-left: 5px; }
</style>
