<template>
  <div class="min-h-screen bg-slate-900 text-white relative overflow-hidden">
    
    <!-- Background Decor -->
    <div class="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-[#6c63ff] blur-[150px] opacity-15 pointer-events-none rounded-full z-0"></div>
    <div class="absolute top-[10%] -right-[10%] w-[40vw] h-[40vw] bg-[#ff8c42] blur-[150px] opacity-10 pointer-events-none rounded-full z-0"></div>

    <div class="container mx-auto px-4 pt-24 pb-12 relative z-10 max-w-6xl">

      <div class="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-6 animate-fade-in-up">
        <div>
          <h1 class="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400">
            Komuniti & Diskusi
          </h1>
          <p class="text-gray-400 text-lg">Ruang untuk berkongsi pengalaman dan pertanyaan.</p>
        </div>

        <div class="flex gap-3 w-full md:w-auto">
          <div class="relative flex-grow md:w-64">
            <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="Cari topik..." 
              class="w-full pl-10 pr-4 py-3 rounded-full bg-white/5 border border-white/10 focus:border-purple-500 focus:bg-black/30 outline-none transition text-white"
            />
          </div>

          <button 
            @click="goToCreatePost"
            class="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-500 hover:to-orange-400 text-white px-6 py-3 rounded-full font-bold shadow-lg transform hover:-translate-y-1 transition flex items-center gap-2 cursor-pointer border-none"
          >
            <i class="fas fa-pen"></i>
            <span class="hidden sm:inline">Tulis Post</span>
          </button>
        </div>
      </div>

      <div class="mb-8 overflow-x-auto pb-2 scrollbar-hide animate-fade-in-up delay-[100ms]">
        <div class="flex gap-3 min-w-max">
          <button 
            class="px-5 py-2.5 rounded-full border border-white/10 transition font-medium flex items-center gap-2 cursor-pointer"
            :class="selectedCategory === '' ? 'bg-purple-600 border-purple-500 text-white shadow-purple-500/30 shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'"
            @click="selectedCategory = ''"
          >
            <i class="fas fa-layer-group"></i> Semua
          </button>
          
          <button 
            v-for="cat in FORUM_CATEGORIES" 
            :key="cat.id"
            class="px-5 py-2.5 rounded-full border border-white/10 transition font-medium flex items-center gap-2 cursor-pointer"
            :class="selectedCategory === cat.id ? 'bg-purple-600 border-purple-500 text-white shadow-purple-500/30 shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'"
            @click="selectedCategory = cat.id"
          >
            <i :class="[cat.icon, selectedCategory === cat.id ? 'text-white' : cat.color]"></i>
            {{ cat.label }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-2 space-y-6">
          
          <div v-if="loading" class="py-12 text-center">
             <div class="w-10 h-10 border-4 border-white/10 border-t-purple-500 rounded-full animate-spin mx-auto mb-3"></div>
             <p class="text-gray-500">Memuatkan diskusi...</p>
          </div>

          <div v-else-if="filteredPosts.length === 0" class="bg-white/5 rounded-2xl p-10 text-center border border-white/10 border-dashed">
            <i class="fas fa-comments text-4xl text-gray-600 mb-4"></i>
            <h3 class="text-xl font-bold text-gray-300">Tiada topik dijumpai</h3>
            <p class="text-gray-500 mt-2">Cuba cari kata kunci lain atau mulakan topik baru.</p>
          </div>

          <div v-else class="space-y-4 animate-fade-in-up delay-[200ms]">
            <ForumPostCard 
              v-for="post in filteredPosts" 
              :key="post.id" 
              :post="post" 
            />
          </div>
        </div>

        <div class="hidden lg:block space-y-6 animate-fade-in-right delay-[300ms]">
          
          <div class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <h3 class="font-bold text-xl mb-4 text-white">Selamat Datang! 👋</h3>
            <p class="text-gray-400 text-sm mb-4 leading-relaxed">
              Ini adalah ruang komuniti KnotEnUp. Sila hormat sesama ahli dan berkongsi info yang bermanfaat.
            </p>
            <div class="grid grid-cols-2 gap-4 text-center">
               <div class="bg-black/20 rounded-xl p-3">
                 <div class="text-2xl font-bold text-purple-400">{{ posts.length }}</div>
                 <div class="text-xs text-gray-500 uppercase tracking-wider">Topik</div>
               </div>
               <div class="bg-black/20 rounded-xl p-3">
                 <div class="text-2xl font-bold text-orange-400">{{ totalComments }}</div>
                 <div class="text-xs text-gray-500 uppercase tracking-wider">Komen</div>
               </div>
            </div>
          </div>

          <div class="bg-white/5 border border-white/10 rounded-2xl p-6">
             <h3 class="font-bold text-lg mb-4 text-white flex items-center gap-2">
               <i class="fas fa-shield-alt text-green-400"></i> Etika Forum
             </h3>
             <ul class="space-y-3 text-sm text-gray-400">
               <li class="flex gap-2"><i class="fas fa-check text-green-500 mt-1"></i> Tiada unsur politik/kaum.</li>
               <li class="flex gap-2"><i class="fas fa-check text-green-500 mt-1"></i> Dilarang spam iklan.</li>
               <li class="flex gap-2"><i class="fas fa-check text-green-500 mt-1"></i> Hormat pendapat orang lain.</li>
             </ul>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'; // Jika perlu i18n
import { db, auth } from '../firebaseConfig';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

// Imports (Types & Constants & Utils)
import ForumPostCard from '../components/forum/ForumPostCard.vue';
import type { ForumPost } from '../types';
import { FORUM_CATEGORIES } from '../constants/forumData';
import { getTimeAgo } from '../utils/dateUtils'; // Pastikan fail ini wujud (seperti refactor sebelum ini)

const router = useRouter();
const { t } = useI18n(); // Guna 't' untuk translate timeAgo

// State
const posts = ref<ForumPost[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref('');

// Computed
const filteredPosts = computed(() => {
  return posts.value.filter(post => {
    const matchSearch = post.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                        post.content.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchCat = selectedCategory.value ? post.category === selectedCategory.value : true;
    return matchSearch && matchCat;
  });
});

const totalComments = computed(() => {
  return posts.value.reduce((acc, curr) => acc + (curr.commentCount || 0), 0);
});

// Actions
const goToCreatePost = () => {
  if (!auth.currentUser) {
    alert("Sila log masuk untuk menulis post.");
    // Boleh tambah modal login di sini nanti
    return;
  }
  router.push('/forum/create');
};

// Fetch Data
onMounted(async () => {
  try {
    const q = query(
      collection(db, "forum_posts"), 
      orderBy("createdAt", "desc"),
      limit(50) // Limit awal untuk performance
    );
    
    const querySnapshot = await getDocs(q);
    
    posts.value = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Guna utiliti untuk format masa
        timeAgo: getTimeAgo(data.createdAt, t) 
      } as ForumPost;
    });

  } catch (error) {
    console.error("Error fetching forum posts:", error);
  } finally {
    loading.value = false;
  }
});
</script>