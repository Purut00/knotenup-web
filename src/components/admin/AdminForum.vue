<template>
  <div class="animate-fade-in">
     <div class="flex justify-between mb-4 items-center"><h3>Pengurusan Forum</h3></div>
     <div v-if="loading" class="text-center py-4">Loading posts...</div>
     <div v-else class="flex flex-col gap-[10px] max-h-[70vh] overflow-y-auto custom-scrollbar">
        <div v-for="post in posts" :key="post.id" class="bg-[#2c3e50] p-4 rounded-lg flex justify-between items-center border-l-4 border-[#9b59b6]" :class="{ '!border-[#3498db] opacity-70': post.isFrozen }">
           <div class="flex flex-col gap-[2px]">
              <a :href="`/forum/${post.id}`" target="_blank" class="text-white font-bold no-underline">{{ post.title }} <span v-if="post.isFrozen" class="text-[0.7rem] bg-[#3498db] px-[4px] py-[2px] rounded-[4px] ml-[5px]">❄️ FROZEN</span></a>
              <div class="text-[#95a5a6] text-[0.8rem]">{{ formatDate(post.createdAt) }}</div>
           </div>
           <div class="flex gap-[5px]">
              <button class="p-[5px_10px] rounded-[5px] border-none cursor-pointer text-white text-[0.8rem] bg-[#e74c3c]" @click="$emit('view-reports', post.id)">🚨 Reports</button>
              <button class="p-[5px_10px] rounded-[5px] border-none cursor-pointer text-white text-[0.8rem]" :class="post.isFrozen ? 'bg-[#f39c12]' : 'bg-[#3498db]'" @click="toggleFreeze(post)">{{ post.isFrozen ? 'Unfreeze' : 'Freeze' }}</button>
              <button class="p-[5px_10px] rounded-[5px] border-none cursor-pointer text-white text-[0.8rem] bg-[#e74c3c]" @click="deleteItem(post.id)">🗑️</button>
           </div>
        </div>
        <div v-if="hasMore" class="text-center mt-4"><button class="bg-[#34495e] text-white px-[20px] py-[10px] rounded-[8px] border-none cursor-pointer" @click="loadMore">Load More</button></div>
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
