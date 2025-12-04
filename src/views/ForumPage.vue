<template>
  <div class="forum-page">
    
    <!-- GLOW BACKGROUND (Sama macam Trip Page) -->
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <div class="container pt-8 pb-12">

      <!-- HEADER SIMPLE -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Forum Komuniti</h1>
        <p class="text-gray-400">Berhubung dan berkongsi pengalaman dengan rakan sealiran.</p>
      </div>

      <!-- FILTER SECTION (Glass Dark Theme) -->
      <div class="filter-section mb-8">
        <div class="filter-row">
          
          <!-- Search -->
          <div class="search-wrapper">
             <i class="fas fa-search search-icon"></i>
             <input 
               type="text" 
               v-model="searchQuery"
               class="search-input"
               :placeholder="t('forum.searchPlaceholder') || 'Cari topik perbincangan...'" 
             />
          </div>

          <!-- Filters Wrapper -->
          <div class="filters-wrapper">
             
             <!-- Filter: Category (Topik) -->
             <div class="select-wrapper">
                <i class="fas fa-folder select-icon text-purple-400"></i>
                <select v-model="selectedCategory" class="custom-select">
                  <option value="">{{ t('directory.catAll') || 'Semua Topik' }}</option>
                  <option v-for="cat in popularCats" :key="cat" :value="cat">
                    {{ cat }}
                  </option>
                </select>
             </div>

             <!-- Filter: Date/Sort -->
             <div class="select-wrapper">
                <i class="fas fa-sort-amount-down select-icon text-orange-400"></i>
                <select v-model="filterSort" class="custom-select">
                  <option value="new">🆕 Terkini</option>
                  <option value="hot">🔥 Popular</option>
                  <option value="old">📅 Lama</option>
                </select>
             </div>

             <!-- Reset -->
             <button 
                v-if="searchQuery || selectedCategory || filterSort !== 'new'" 
                class="btn-reset" 
                @click="resetFilters"
             >
               <i class="fas fa-undo"></i>
             </button>
          </div>
        </div>
      </div>

      <!-- MAIN LAYOUT GRID -->
      <div class="forum-layout">
        
        <!-- LEFT COLUMN: FEED -->
        <div class="feed-column">
          
          <!-- Loading State -->
          <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-gray-400">
            <div class="spinner mb-4"></div>
            <p>{{ t('common.loading') }}</p>
          </div>

          <!-- Post List -->
          <div v-else-if="filteredPosts.length > 0" class="post-list">
            <ForumPostCard v-for="post in filteredPosts" :key="post.id" :post="post" />
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <i class="far fa-comments text-4xl mb-4 opacity-30"></i>
            <h3 class="text-lg font-bold text-gray-300">{{ t('forum.postNotFound') || 'Tiada Topik Ditemui' }}</h3>
            <p class="text-gray-500 text-sm mb-4">Mulakan perbincangan baru sekarang!</p>
            <button @click="$router.push('/forum/create')" class="btn-create-main">
              {{ t('forum.createPost') || 'Cipta Post Baru' }}
            </button>
          </div>
          
        </div>

        <!-- RIGHT COLUMN: SIDEBAR -->
        <div class="sidebar-column">
          
          <!-- Intro Widget -->
          <div class="sidebar-widget">
            <div class="widget-header">
              <h3>{{ t('forum.sidebarAbout') || 'Tentang Forum' }}</h3>
            </div>
            <p class="text-sm text-gray-400 mb-4 leading-relaxed">
              Ruang untuk komuniti berkongsi tips, itinerari, dan mencari rakan travel.
            </p>
            
            <div class="stats-row">
                <div class="stat-item">
                  <span class="stat-value">{{ posts.length }}</span>
                  <span class="stat-label">Topik</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value text-orange-400">Active</span>
                  <span class="stat-label">Status</span>
                </div>
            </div>

            <button class="btn-create-post-sidebar" @click="$router.push('/forum/create')">
              <i class="fas fa-pen mr-2"></i> {{ t('forum.createPost') || 'Tulis Topik' }}
            </button>
          </div>

          <!-- Popular Topics Widget -->
          <div class="sidebar-widget">
            <div class="widget-header">
              <h3>{{ t('forum.sidebarTopic') || 'Topik Popular' }}</h3>
            </div>
            <ul class="topic-list">
              <li @click="selectedCategory = ''" :class="{ active: selectedCategory === '' }">
                <span>🌐 Semua</span>
              </li>
              <li v-for="cat in popularCats.slice(0, 5)" :key="cat" @click="selectedCategory = cat" :class="{ active: selectedCategory === cat }">
                <span># {{ cat }}</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import ForumPostCard from '../components/forum/ForumPostCard.vue';
import { useI18n } from 'vue-i18n';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const { t } = useI18n();
const searchQuery = ref('');
const selectedCategory = ref('');
const filterSort = ref('new'); 
const posts = ref<any[]>([]);
const loading = ref(true);

const popularCats = ['Hiking', 'Camping', 'Diving', 'Cycling', 'Climbing', 'Equipment', 'General'];

const getTimeAgo = (timestamp: any) => {
  if (!timestamp) return 'Baru';
  const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date();
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

const resetFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = '';
  filterSort.value = 'new';
};

// Filter Logic
const filteredPosts = computed(() => {
  let result = [...posts.value]; 

  // 1. Filter Kategori
  if (selectedCategory.value) {
    result = result.filter(p => p.category === selectedCategory.value);
  }

  // 2. Filter Search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(p => 
      p.title.toLowerCase().includes(q) || 
      (p.excerpt && p.excerpt.toLowerCase().includes(q))
    );
  }

  // 3. Sorting
  if (filterSort.value === 'hot') {
    result.sort((a, b) => (b.votes || 0) - (a.votes || 0));
  } else if (filterSort.value === 'old') {
    result.sort((a, b) => {
        const dateA = a.createdAt ? a.createdAt.seconds : 0;
        const dateB = b.createdAt ? b.createdAt.seconds : 0;
        return dateA - dateB;
    });
  } else {
    // Newest default
    result.sort((a, b) => {
        const dateA = a.createdAt ? a.createdAt.seconds : 0;
        const dateB = b.createdAt ? b.createdAt.seconds : 0;
        return dateB - dateA;
    });
  }

  return result;
});

onMounted(async () => {
  try {
    const q = query(collection(db, "forum_posts"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    posts.value = snap.docs.map(doc => ({ 
      id: doc.id, ...doc.data(), 
      excerpt: doc.data().content,
      timeAgo: getTimeAgo(doc.data().createdAt) 
    }));
  } catch (error) { 
    console.error("Error fetching posts:", error); 
    // Mock Data
    posts.value = [
        { id: '1', title: 'Port camping best di Janda Baik?', category: 'Camping', author: 'Ali', timeAgo: '2h', votes: 5, commentCount: 3, content: 'Minta cadangan campsite yang ada sungai dan toilet bersih.' },
        { id: '2', title: 'Kasut hiking untuk beginner', category: 'Equipment', author: 'Siti', timeAgo: '5h', votes: 12, commentCount: 8, content: 'Bajet bawah RM200. Apa brand yang tahan lasak?' }
    ];
  } finally { 
    loading.value = false; 
  }
});
</script>

<style scoped>
/* --- THEME BACKGROUND (DARK SUNSET) --- */
.forum-page { 
  background-color: #0f172a; /* Dark Blue/Black base */
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  color: white;
}
.container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; position: relative; z-index: 2; }

/* GLOW EFFECTS */
.page-glow-purple {
  position: absolute; top: 0; left: 0; width: 50vw; height: 50vw;
  background: #6c63ff; filter: blur(120px); opacity: 0.15; pointer-events: none;
  border-radius: 50%;
}
.page-glow-orange {
  position: absolute; top: 20%; right: 0; width: 40vw; height: 40vw;
  background: #ff8c42; filter: blur(120px); opacity: 0.1; pointer-events: none;
  border-radius: 50%;
}

/* --- FILTER SECTION (Copy Style from Trip Page) --- */
.filter-section {
  background: rgba(255, 255, 255, 0.05); /* Glass Dark */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.2rem;
  backdrop-filter: blur(10px);
}

.filter-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }

/* SEARCH */
.search-wrapper { position: relative; flex-grow: 2; min-width: 250px; }
.search-input {
  width: 100%; padding: 12px 12px 12px 42px;
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.2); color: white;
  outline: none; transition: 0.3s;
}
.search-input:focus { border-color: #6c63ff; background: rgba(0,0,0,0.4); }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }

/* DROPDOWNS */
.filters-wrapper { display: flex; gap: 10px; flex-wrap: wrap; flex-grow: 1; }
.select-wrapper { position: relative; flex: 1; min-width: 140px; }
.custom-select {
  width: 100%; appearance: none;
  padding: 12px 36px 12px 38px;
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
  width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;
  border-radius: 10px; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: none; cursor: pointer;
}
.btn-reset:hover { background: rgba(239, 68, 68, 0.3); }

/* --- MAIN LAYOUT --- */
.forum-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 30px;
}

/* LEFT COLUMN */
.post-list { display: flex; flex-direction: column; gap: 16px; }

/* Loading & Empty */
.spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #6c63ff; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  text-align: center; padding: 3rem;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px; backdrop-filter: blur(10px);
}
.btn-create-main {
  background: #6c63ff; color: white; border: none; padding: 10px 24px; border-radius: 50px; font-weight: 600; cursor: pointer; transition: 0.2s;
}
.btn-create-main:hover { background: #5b54e0; transform: translateY(-2px); }

/* RIGHT SIDEBAR (Dark Glass) */
.sidebar-column { display: flex; flex-direction: column; gap: 1.5rem; }

.sidebar-widget { 
  background: rgba(255, 255, 255, 0.05); /* Dark Glass */
  border-radius: 16px; 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  padding: 1.5rem; 
  backdrop-filter: blur(10px);
}

.widget-header h3 { 
  margin: 0 0 1rem; 
  font-size: 1.1rem; 
  font-weight: 700; 
  color: white;
  border-left: 4px solid #6c63ff; 
  padding-left: 10px; 
}

/* Stats */
.stats-row {
  display: flex; justify-content: space-between;
  background: rgba(0,0,0,0.2);
  border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;
}
.stat-item { text-align: center; flex: 1; }
.stat-value { display: block; font-size: 1.2rem; font-weight: 800; color: #6c63ff; }
.stat-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }

.btn-create-post-sidebar {
  width: 100%;
  background: #6c63ff; color: white; border: none; padding: 0.9rem; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center;
}
.btn-create-post-sidebar:hover { background: #5b54e0; box-shadow: 0 4px 15px rgba(108, 99, 255, 0.3); }

/* Topics List */
.topic-list { list-style: none; padding: 0; margin: 0; }
.topic-list li { 
  padding: 10px 10px; 
  border-bottom: 1px solid rgba(255,255,255,0.05); 
  cursor: pointer; color: #cbd5e1; 
  transition: all 0.2s; font-size: 0.95rem; 
  border-radius: 6px;
}
.topic-list li:hover { background: rgba(255,255,255,0.05); color: #6c63ff; padding-left: 15px; }
.topic-list li.active { background: rgba(108, 99, 255, 0.2); color: #6c63ff; font-weight: 600; padding-left: 15px; }

/* RESPONSIVE */
@media (max-width: 900px) {
  .forum-layout { grid-template-columns: 1fr; }
  .sidebar-column { display: none; } /* Hide sidebar on mobile or move to bottom */
}
</style>