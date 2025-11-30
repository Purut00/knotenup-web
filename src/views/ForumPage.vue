<template>
  <div class="forum-page">
    
    <div class="search-strip-container">
      <div class="container">
        <div class="search-row">
          <div class="search-input-wrapper">
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
    </div>

    <div class="forum-container container">
      
      <div class="feed-column">
        
        <div class="feed-filter">
          <div class="left-tabs">
            <button class="filter-tab" :class="{ active: filterSort === 'hot' }" @click="filterSort = 'hot'">🔥 {{ t('forum.filterHot') }}</button>
            <button class="filter-tab" :class="{ active: filterSort === 'new' }" @click="filterSort = 'new'">🆕 {{ t('forum.filterNew') }}</button>
          </div>
          
          <div v-if="selectedCategory" class="active-filter-badge">
            {{ selectedCategory }} <span @click="selectedCategory = ''" style="cursor:pointer; margin-left:5px;">✖</span>
          </div>
        </div>

        <div v-if="loading" class="loading-box">⏳ {{ t('common.loading') }}</div>

        <div v-else-if="filteredPosts.length > 0" class="post-list">
          <ForumPostCard v-for="post in filteredPosts" :key="post.id" :post="post" />
        </div>

        <div v-else class="empty-box">
          <p>{{ t('forum.postNotFound') }}</p>
          <button @click="$router.push('/forum/create')" class="btn-create-main">{{ t('forum.createPost') }}</button>
        </div>
        
      </div>

      <div class="sidebar-column">
        
        <div class="sidebar-widget intro-widget">
          <h3>{{ t('forum.sidebarAbout') }}</h3>
          <p>{{ t('forum.headerSub') }}</p>
          <div class="stats-grid">
             <div class="stat"><strong>{{ posts.length }}</strong> Topik</div>
             <div class="stat"><strong>1.2k</strong> Ahli</div>
          </div>
          <button class="btn-create-post" @click="$router.push('/forum/create')">
            ✍️ {{ t('forum.createPost') }}
          </button>
        </div>

        <div class="sidebar-widget">
          <h3>{{ t('forum.sidebarTopic') }}</h3>
          <ul class="topic-list">
            <li @click="selectedCategory = ''" :class="{ active: selectedCategory === '' }">🌐 {{ t('directory.catAll') }}</li>
            <li v-for="cat in popularCats" :key="cat" @click="selectedCategory = cat" :class="{ active: selectedCategory === cat }">
              {{ cat }}
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
const filterSort = ref('new'); // 'new' atau 'hot'
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

// Filter Logic Yang Lebih Bijak
const filteredPosts = computed(() => {
  let result = [...posts.value]; // Copy array asal

  // 1. Filter Kategori
  if (selectedCategory.value) {
    result = result.filter(p => p.category === selectedCategory.value);
  }

  // 2. Filter Search (Cari Title atau Content)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(p => 
      p.title.toLowerCase().includes(q) || 
      (p.excerpt && p.excerpt.toLowerCase().includes(q))
    );
  }

  // 3. Sorting (Hot vs New)
  if (filterSort.value === 'hot') {
    // Sort ikut undian/vote (banyak ke sikit)
    result.sort((a, b) => (b.votes || 0) - (a.votes || 0));
  } else {
    // Sort ikut tarikh (baru ke lama) - Default Firestore dah sort, tapi kita pastikan lagi
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
  } catch (error) { console.error(error); } 
  finally { loading.value = false; }
});
</script>

<style scoped>
.forum-page { background-color: #f5f5f5; min-height: 100vh; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }

/* --- 1. SEARCH STRIP (DESIGN SERAGAM HOME & DIREKTORI) --- */
.search-strip-container { 
  background: white; 
  padding: 0.8rem 0; 
  border-bottom: 1px solid #eaeaea; 
  margin-bottom: 1.5rem; 
  position: sticky; 
  top: 0; 
  z-index: 999; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}

.search-row { 
  display: flex; 
  justify-content: center; 
  padding: 0 1rem;
}

.search-input-wrapper { 
  display: flex; 
  width: 100%; 
  max-width: 800px; 
  border: 2px solid #27ae60; 
  border-radius: 4px; 
  overflow: hidden; 
  background: white;
}

/* Input Teks (Padding dikemaskan) */
.search-input-wrapper input { 
  flex: 1; 
  border: none; 
  padding: 0.5rem 1rem; 
  outline: none; 
  font-size: 0.9rem; 
}

/* Button Search */
.btn-search-strip { 
  background: #27ae60; 
  color: white; 
  border: none; 
  padding: 0 2rem; 
  cursor: pointer; 
  font-size: 0.95rem; 
  font-weight: bold; 
  white-space: nowrap;
}
.btn-search-strip:hover { background: #219150; }

/* --- 2. LAYOUT FORUM --- */
.forum-container {
  max-width: 1000px; 
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 300px; /* Kiri bebas, Kanan fix 300px */
  gap: 20px;
  padding-bottom: 2rem;
}

/* FEED */
.feed-filter { background: white; padding: 0.8rem; border-radius: 4px; border: 1px solid #eee; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
.left-tabs { display: flex; gap: 5px; }
.filter-tab { background: none; border: none; font-weight: bold; color: #888; cursor: pointer; padding: 5px 15px; border-radius: 20px; transition: all 0.2s; font-size: 0.9rem;}
.filter-tab:hover, .filter-tab.active { background: #e8f5e9; color: #27ae60; }

/* Tag Badge */
.active-filter-badge { background-color: #e3f2fd; color: #1976d2; padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; display: flex; align-items: center; font-weight: bold; border: 1px solid #bbdefb; }

.post-list { display: flex; flex-direction: column; gap: 10px; }
.loading-box, .empty-box { text-align: center; padding: 3rem; background: white; color: #999; border-radius: 4px; border: 1px solid #eee; }
.btn-create-main { margin-top: 1rem; background: #27ae60; color: white; padding: 0.6rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;}

/* SIDEBAR */
.sidebar-column { display: flex; flex-direction: column; gap: 1rem; }
.sidebar-widget { background: white; border-radius: 4px; border: 1px solid #eee; padding: 1.2rem; }
.sidebar-widget h3 { margin-top: 0; font-size: 1rem; color: #2c3e50; border-bottom: 2px solid #f5f5f5; padding-bottom: 10px; margin-bottom: 1rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;}

.intro-widget { text-align: center; }
.intro-widget p { font-size: 0.9rem; color: #666; margin-bottom: 1rem; }

.stats-grid { display: flex; justify-content: space-around; margin: 1rem 0; background: #f9f9f9; padding: 10px; border-radius: 4px; }
.stat strong { display: block; font-size: 1.2rem; color: #e67e22; }
.stat { font-size: 0.8rem; color: #777; }

.btn-create-post { width: 100%; background: #e67e22; color: white; border: none; padding: 0.8rem; border-radius: 4px; font-weight: bold; cursor: pointer; transition: transform 0.1s; }
.btn-create-post:hover { background: #d35400; transform: translateY(-2px); }

.topic-list { list-style: none; padding: 0; margin: 0; }
.topic-list li { padding: 10px 5px; border-bottom: 1px solid #f5f5f5; cursor: pointer; color: #555; transition: all 0.2s; font-size: 0.9rem; display: flex; justify-content: space-between;}
.topic-list li:hover { color: #27ae60; background: #f9f9f9; padding-left: 10px; }
.topic-list li.active { color: #27ae60; font-weight: bold; border-left: 3px solid #27ae60; padding-left: 10px; background: #f0f9f4;}

/* RESPONSIVE */
@media (max-width: 900px) {
  .forum-container { grid-template-columns: 1fr; padding: 0 1rem; }
  .sidebar-column { display: none; } /* Hide sidebar on mobile/tablet */
  .search-input-wrapper { width: 100%; }
}
</style>