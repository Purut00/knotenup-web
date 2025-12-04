<template>
  <div class="forum-page">
    
    <!-- 1. HERO SECTION (Tema Seragam dengan Trip/Home) -->
    <div class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content container">
        <h1>Forum Komuniti & Diskusi</h1>
        <p>Berhubung, berkongsi pengalaman, dan merancang aktiviti bersama rakan sealiran.</p>
      </div>
    </div>

    <!-- 2. SEARCH STRIP (Sticky) -->
    <div class="search-strip-container">
      <div class="container search-container-inner">
        <div class="search-input-wrapper">
           <span class="search-icon">🔍</span>
           <input 
             type="text" 
             v-model="searchQuery"
             :placeholder="t('forum.searchPlaceholder')" 
           />
           <button class="btn-search-strip">
             {{ t('common.search') }}
           </button>
        </div>
      </div>
    </div>

    <!-- 3. FORUM CONTENT -->
    <div class="forum-container container">
      
      <!-- LEFT COLUMN: FEED -->
      <div class="feed-column">
        
        <!-- Filter Tabs -->
        <div class="feed-header">
          <div class="left-tabs">
            <button class="filter-tab" :class="{ active: filterSort === 'new' }" @click="filterSort = 'new'">
              🆕 {{ t('forum.filterNew') }}
            </button>
            <button class="filter-tab" :class="{ active: filterSort === 'hot' }" @click="filterSort = 'hot'">
              🔥 {{ t('forum.filterHot') }}
            </button>
          </div>
          
          <div v-if="selectedCategory" class="active-filter-badge">
            📂 {{ selectedCategory }} 
            <button @click="selectedCategory = ''" class="btn-clear-filter">✕</button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>{{ t('common.loading') }}</p>
        </div>

        <!-- Post List -->
        <div v-else-if="filteredPosts.length > 0" class="post-list">
          <ForumPostCard v-for="post in filteredPosts" :key="post.id" :post="post" />
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>{{ t('forum.postNotFound') }}</h3>
          <p>Jadilah yang pertama memulakan topik ini!</p>
          <button @click="$router.push('/forum/create')" class="btn-create-main">{{ t('forum.createPost') }}</button>
        </div>
        
      </div>

      <!-- RIGHT COLUMN: SIDEBAR -->
      <div class="sidebar-column">
        
        <!-- Intro Widget -->
        <div class="sidebar-widget intro-widget">
          <div class="widget-header">
            <h3>{{ t('forum.sidebarAbout') }}</h3>
          </div>
          <p>{{ t('forum.headerSub') }}</p>
          <div class="stats-row">
             <div class="stat-item">
               <span class="stat-value">{{ posts.length }}</span>
               <span class="stat-label">Topik</span>
             </div>
             <div class="stat-item">
               <span class="stat-value">Active</span>
               <span class="stat-label">Komuniti</span>
             </div>
          </div>
          <button class="btn-create-post-sidebar" @click="$router.push('/forum/create')">
            ✍️ {{ t('forum.createPost') }}
          </button>
        </div>

        <!-- Topics Widget -->
        <div class="sidebar-widget topics-widget">
          <div class="widget-header">
            <h3>{{ t('forum.sidebarTopic') }}</h3>
          </div>
          <ul class="topic-list">
            <li @click="selectedCategory = ''" :class="{ active: selectedCategory === '' }">
              <span>🌐 {{ t('directory.catAll') }}</span>
              <span class="arrow">›</span>
            </li>
            <li v-for="cat in popularCats" :key="cat" @click="selectedCategory = cat" :class="{ active: selectedCategory === cat }">
              <span>{{ cat }}</span>
              <span class="arrow">›</span>
            </li>
          </ul>
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
  } else {
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
  } finally { 
    loading.value = false; 
  }
});
</script>

<style scoped>
.forum-page { 
  background-color: #f8f9fa; 
  min-height: 100vh; 
  font-family: 'Inter', sans-serif;
}

.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }

/* --- 1. HERO SECTION --- */
.hero-section {
  position: relative;
  height: 300px;
  background-image: url('https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'); /* Gambar Hiking/Community */
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  margin-bottom: 0;
}

.hero-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6));
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-content h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.hero-content p {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

/* --- 2. SEARCH STRIP (Sticky & Integrated) --- */
.search-strip-container { 
  background: white; 
  padding: 1rem 0; 
  border-bottom: 1px solid #eaeaea; 
  position: sticky; 
  top: 0; 
  z-index: 999; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin-top: -30px; /* Slight overlap effect if desired, or keep flat */
  margin-bottom: 2rem;
}

.search-container-inner {
  display: flex;
  justify-content: center;
}

.search-input-wrapper { 
  display: flex; 
  align-items: center;
  width: 100%; 
  max-width: 700px; 
  background: white;
  border: 1px solid #ddd; 
  border-radius: 50px; 
  padding: 0.3rem 0.5rem 0.3rem 1.2rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.search-input-wrapper:focus-within {
  border-color: #27ae60;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.15);
}

.search-icon { font-size: 1.2rem; color: #999; margin-right: 0.5rem; }

.search-input-wrapper input { 
  flex: 1; 
  border: none; 
  padding: 0.5rem; 
  outline: none; 
  font-size: 1rem; 
  color: #333;
}

.btn-search-strip { 
  background: #27ae60; 
  color: white; 
  border: none; 
  padding: 0.7rem 2rem; 
  border-radius: 30px;
  cursor: pointer; 
  font-weight: 600; 
  transition: background 0.2s;
}
.btn-search-strip:hover { background: #219150; }

/* --- 3. LAYOUT GRID --- */
.forum-container {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 30px;
  padding-bottom: 4rem;
}

/* FEED SECTION */
.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.left-tabs { 
  background: #e9ecef; 
  padding: 4px; 
  border-radius: 8px; 
  display: inline-flex;
}

.filter-tab { 
  background: transparent; 
  border: none; 
  padding: 8px 16px; 
  border-radius: 6px; 
  font-weight: 600; 
  color: #6c757d; 
  cursor: pointer; 
  font-size: 0.9rem;
  transition: all 0.2s;
}

.filter-tab.active { 
  background: white; 
  color: #27ae60; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.active-filter-badge {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-clear-filter {
  background: none;
  border: none;
  color: #2e7d32;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

/* LOADING & EMPTY STATES */
.loading-state, .empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #27ae60;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.empty-icon { font-size: 3rem; margin-bottom: 1rem; }
.empty-state h3 { margin: 0; color: #333; }
.empty-state p { color: #777; margin-bottom: 1.5rem; }

.btn-create-main {
  background: #27ae60;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}
.btn-create-main:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(39, 174, 96, 0.3); }

.post-list { display: flex; flex-direction: column; gap: 15px; }

/* SIDEBAR WIDGETS (Card Style) */
.sidebar-column { display: flex; flex-direction: column; gap: 1.5rem; }

.sidebar-widget { 
  background: white; 
  border-radius: 12px; 
  border: 1px solid #eee; 
  padding: 1.5rem; 
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.widget-header h3 { 
  margin: 0 0 1rem; 
  font-size: 1.1rem; 
  font-weight: 700; 
  color: #2c3e50; 
  border-left: 4px solid #27ae60; 
  padding-left: 10px; 
}

/* Intro Widget */
.intro-widget p { font-size: 0.95rem; color: #666; line-height: 1.5; margin-bottom: 1.5rem; }

.stats-row {
  display: flex;
  justify-content: space-between;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item { text-align: center; flex: 1; }
.stat-value { display: block; font-size: 1.2rem; font-weight: 800; color: #27ae60; }
.stat-label { font-size: 0.8rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }

.btn-create-post-sidebar {
  width: 100%;
  background: #27ae60; /* Green primary theme */
  color: white;
  border: none;
  padding: 0.9rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-create-post-sidebar:hover { background: #219150; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(39, 174, 96, 0.2); }

/* Topics Widget */
.topic-list { list-style: none; padding: 0; margin: 0; }

.topic-list li { 
  padding: 12px 10px; 
  border-bottom: 1px solid #f1f1f1; 
  cursor: pointer; 
  color: #555; 
  transition: all 0.2s; 
  font-size: 0.95rem; 
  display: flex; 
  justify-content: space-between;
  align-items: center;
  border-radius: 6px;
}

.topic-list li:last-child { border-bottom: none; }

.topic-list li:hover { background: #f8f9fa; color: #27ae60; padding-left: 15px; }
.topic-list li.active { background: #e8f5e9; color: #27ae60; font-weight: 600; padding-left: 15px; }
.arrow { color: #ccc; font-size: 1.2rem; line-height: 1; }
.topic-list li:hover .arrow { color: #27ae60; }

/* RESPONSIVE */
@media (max-width: 900px) {
  .forum-container { grid-template-columns: 1fr; padding: 0 1rem; }
  .sidebar-column { display: none; }
  
  .hero-section { height: 200px; }
  .hero-content h1 { font-size: 1.8rem; }
  .search-strip-container { margin-top: 0; }
}
</style>