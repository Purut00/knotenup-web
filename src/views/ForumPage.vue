<template>
  <div class="forum-page">
    
    <div class="forum-header-strip">
      <div class="container header-flex">
        <div class="title-area">
          <h1>{{ t('forum.headerTitle') }}</h1>
          <p>{{ t('forum.headerSub') }}</p>
        </div>
        
        <div class="forum-search-wrapper">
          <input type="text" :placeholder="t('forum.searchPlaceholder')" v-model="searchQuery" @keyup.enter="handleSearch" />
          <button @click="handleSearch">{{ t('common.search') }}</button>
        </div>
      </div>
    </div>

    <div class="forum-container container">
      <div class="feed-column">
        
        <div class="feed-filter">
          <button class="filter-tab" :class="{ active: filterSort === 'hot' }" @click="filterSort = 'hot'">🔥 {{ t('forum.filterHot') }}</button>
          <button class="filter-tab" :class="{ active: filterSort === 'new' }" @click="filterSort = 'new'">🆕 {{ t('forum.filterNew') }}</button>
          
          <div v-if="selectedCategory" class="active-tag">
            {{ selectedCategory }} <span @click="selectedCategory = ''">✖</span>
          </div>
        </div>

        <div v-if="loading" class="loading-box">⏳ {{ t('common.loading') }}</div>

        <div v-else-if="filteredPosts.length > 0" class="post-list">
          <ForumPostCard v-for="post in filteredPosts" :key="post.id" :post="post" />
        </div>

        <div v-else class="empty-box">
          <p>Tiada perbincangan.</p>
          <button @click="$router.push('/forum/create')" class="btn-create-main">Mulakan Topik Baru</button>
        </div>
        
      </div>

      <div class="sidebar-column">
        
        <div class="sidebar-widget intro-widget">
          <h3>{{ t('forum.sidebarAbout') }}</h3>
          <p>Sertai komuniti outdoor terbesar.</p>
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
            <li @click="selectedCategory = ''" :class="{ active: selectedCategory === '' }">🌐 Semua</li>
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
const filterSort = ref('new');
const posts = ref<any[]>([]);
const loading = ref(true);

const popularCats = ['Hiking', 'Camping', 'Diving', 'Cycling', 'Climbing'];

const handleSearch = () => { alert(`Mencari: ${searchQuery.value}`); };

// Helpers
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
  let result = posts.value;
  if (selectedCategory.value) {
    result = result.filter(p => p.category === selectedCategory.value);
  }
  if (searchQuery.value) {
    result = result.filter(p => p.title.toLowerCase().includes(searchQuery.value.toLowerCase()));
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

/* HEADER STRIP (Theme Hijau) */
.forum-header-strip { background: white; border-bottom: 1px solid #eee; padding: 1.5rem 0; margin-bottom: 1.5rem; }
.header-flex { display: flex; justify-content: space-between; align-items: center; }
.title-area h1 { margin: 0; font-size: 1.5rem; color: #27ae60; font-weight: 800; }
.title-area p { margin: 5px 0 0; color: #777; font-size: 0.9rem; }

.forum-search-wrapper { display: flex; width: 400px; border: 2px solid #27ae60; border-radius: 4px; overflow: hidden; }
.forum-search-wrapper input { flex: 1; border: none; padding: 0.6rem; outline: none; }
.forum-search-wrapper button { background: #27ae60; color: white; border: none; padding: 0 1.5rem; font-weight: bold; cursor: pointer; }

/* LAYOUT */
.forum-container { display: grid; grid-template-columns: 1fr 300px; gap: 1.5rem; padding-bottom: 2rem; }

/* FEED */
.feed-filter { background: white; padding: 0.8rem; border-radius: 4px; border: 1px solid #eee; margin-bottom: 1rem; display: flex; align-items: center; gap: 10px; }
.filter-tab { background: none; border: none; font-weight: bold; color: #888; cursor: pointer; padding: 5px 12px; border-radius: 20px; transition: all 0.2s; }
.filter-tab:hover, .filter-tab.active { background: #f0f9f4; color: #27ae60; }
.active-tag { background: #27ae60; color: white; padding: 3px 10px; border-radius: 15px; font-size: 0.8rem; cursor: pointer; }

.post-list { display: flex; flex-direction: column; gap: 10px; }
.loading-box, .empty-box { text-align: center; padding: 3rem; background: white; color: #999; }
.btn-create-main { margin-top: 1rem; background: #27ae60; color: white; padding: 0.6rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; }

/* SIDEBAR */
.sidebar-column { display: flex; flex-direction: column; gap: 1rem; }
.sidebar-widget { background: white; border-radius: 4px; border: 1px solid #eee; padding: 1.2rem; }
.sidebar-widget h3 { margin-top: 0; font-size: 1rem; color: #2c3e50; border-bottom: 2px solid #f5f5f5; padding-bottom: 10px; margin-bottom: 1rem; }

.intro-widget { text-align: center; }
.stats-grid { display: flex; justify-content: space-around; margin: 1rem 0; background: #f9f9f9; padding: 10px; border-radius: 4px; }
.stat strong { display: block; font-size: 1.2rem; color: #e67e22; }

.btn-create-post { width: 100%; background: #e67e22; color: white; border: none; padding: 0.8rem; border-radius: 4px; font-weight: bold; cursor: pointer; }
.btn-create-post:hover { background: #d35400; }

.topic-list { list-style: none; padding: 0; margin: 0; }
.topic-list li { padding: 8px 0; border-bottom: 1px dashed #eee; cursor: pointer; color: #555; transition: color 0.2s; }
.topic-list li:hover, .topic-list li.active { color: #27ae60; font-weight: bold; padding-left: 5px; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .forum-container { grid-template-columns: 1fr; }
  .sidebar-column { order: -1; }
  .header-flex { flex-direction: column; gap: 1rem; text-align: center; }
  .forum-search-wrapper { width: 100%; }
}
</style>