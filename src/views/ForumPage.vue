<template>
  <div class="forum-page">
    
    <div class="forum-banner">
      <div class="banner-content">
        <h1>{{ t('forum.headerTitle') }}</h1>
        <p>{{ t('forum.headerSub') }}</p>
        <div class="search-wrapper">
          <SearchBar 
            :placeholder="t('forum.searchPlaceholder')" 
            searchScope="Forum"
            @handle-search="handleSearch"
          />
        </div>
      </div>
    </div>

    <div class="forum-container">
      
      <div class="feed-column">
        
        <div class="feed-filter">
          <div class="left-tabs">
            <button class="filter-tab active">🔥 {{ t('forum.filterHot') }}</button>
            <button class="filter-tab">🆕 {{ t('forum.filterNew') }}</button>
          </div>
          
          <div v-if="selectedCategory" class="active-filter-badge">
            Menapis: <strong>{{ selectedCategory }}</strong>
            <button @click="selectedCategory = ''" class="btn-clear">✖</button>
          </div>
        </div>

        <div v-if="loading" style="text-align: center; padding: 3rem;">
          <p>⏳ {{ t('common.loading') }}</p>
        </div>

        <div v-else-if="filteredPosts.length > 0">
          <ForumPostCard 
            v-for="post in filteredPosts" 
            :key="post.id" 
            :post="post" 
          />
        </div>

        <div v-else class="empty-state">
          <p>Tiada perbincangan ditemui.</p>
          <button v-if="selectedCategory" @click="selectedCategory = ''">Lihat Semua Topik</button>
          <button v-else @click="$router.push('/forum/create')">Mulakan Topik Baru</button>
        </div>
        
      </div>

      <div class="sidebar-column">
        
        <div class="sidebar-widget">
          <div class="widget-header">
            <h3>{{ t('forum.sidebarAbout') }}</h3>
          </div>
          <div class="widget-body">
            <p>Selamat datang ke forum rasmi KnotenUp.</p>
            <div class="stats">
              <div class="stat-item"><strong>1.2k</strong><span>Ahli</span></div>
              <div class="stat-item"><strong>{{ posts.length }}</strong><span>Topik</span></div>
            </div>
            <button class="btn-create-post" @click="$router.push('/forum/create')">
              ✍️ {{ t('forum.createPost') }}
            </button>
          </div>
        </div>

        <div class="sidebar-widget">
          <div class="widget-header">
            <h3>{{ t('forum.sidebarTopic') }}</h3>
          </div>
          <div class="widget-body">
            <div class="category-select-container">
              <label>Pilih Topik:</label>
              <select v-model="selectedCategory" class="full-width-select">
                <option value="">🌐 Semua Topik</option>
                <optgroup v-for="group in ACTIVITY_CATEGORIES" :key="group.group" :label="group.group">
                  <option v-for="item in group.items" :key="item" :value="item">
                    {{ item }}
                  </option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchBar from '../components/common/SearchBar.vue';
import ForumPostCard from '../components/forum/ForumPostCard.vue';
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ACTIVITY_CATEGORIES } from '../constants/data';

// Firebase Imports
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const { t } = useI18n();
const handleSearch = (q: string) => { alert(`Mencari: ${q}`); };
const selectedCategory = ref('');
const posts = ref<any[]>([]);
const loading = ref(true);

// Helper: Kira masa lalu (Time Ago)
const getTimeAgo = (timestamp: any) => {
  if (!timestamp) return 'Baru saja';
  const date = timestamp.toDate(); // Tukar Firebase Timestamp ke JS Date
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds} saat lepas`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minit lepas`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lepas`;
  const days = Math.floor(hours / 24);
  return `${days} hari lepas`;
};

// Load Data dari Firebase
onMounted(async () => {
  try {
    const q = query(collection(db, "forum_posts"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const fetchedPosts: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      fetchedPosts.push({
        id: doc.id,
        ...data,
        excerpt: data.content, // Guna content sebagai excerpt
        timeAgo: getTimeAgo(data.createdAt) // Proses tarikh di sini
      });
    });
    
    posts.value = fetchedPosts;
  } catch (error) {
    console.error("Error loading forum:", error);
  } finally {
    loading.value = false;
  }
});

const filteredPosts = computed(() => {
  if (!selectedCategory.value) return posts.value;
  return posts.value.filter(post => post.category === selectedCategory.value);
});
</script>

<style scoped>
/* CSS KEKAL SAMA */
.forum-page { background-color: #dae0e6; min-height: 100vh; }
.forum-banner { background-color: #2c3e50; color: white; padding: 2rem 1rem; margin-bottom: 1.5rem; text-align: center; }
.banner-content h1 { font-size: 1.8rem; margin-bottom: 0.5rem; }
.search-wrapper { margin-top: 1.5rem; display: flex; justify-content: center; }
.forum-container { max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: 1fr 300px; gap: 1.5rem; padding: 0 1rem 2rem 1rem; }
@media (max-width: 768px) { .forum-container { grid-template-columns: 1fr; } .sidebar-column { order: -1; margin-bottom: 1rem; } }
.feed-filter { background: white; padding: 0.8rem; border-radius: 8px; border: 1px solid #ccc; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
.left-tabs { display: flex; gap: 10px; }
.filter-tab { background: none; border: none; font-weight: bold; color: #878a8c; cursor: pointer; padding: 5px 10px; border-radius: 20px; }
.filter-tab.active { background-color: #f6f7f8; color: #0079d3; }
.active-filter-badge { background-color: #e1f5fe; color: #0288d1; padding: 5px 10px; border-radius: 20px; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; }
.btn-clear { background: none; border: none; color: #0288d1; cursor: pointer; font-weight: bold; }
.empty-state { background: white; text-align: center; padding: 3rem; border-radius: 8px; border: 1px solid #ccc; }
.empty-state button { margin-top: 1rem; padding: 0.5rem 1rem; background-color: #0079d3; color: white; border: none; border-radius: 4px; cursor: pointer; }
.load-more { text-align: center; margin-top: 1rem; }
.load-more button { background-color: #0079d3; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 20px; cursor: pointer; }
.sidebar-widget { background: white; border-radius: 8px; border: 1px solid #ccc; margin-bottom: 1rem; overflow: hidden; }
.widget-header { background-color: #0079d3; color: white; padding: 0.8rem 1rem; }
.widget-header h3 { margin: 0; font-size: 1rem; }
.widget-body { padding: 1rem; }
.widget-body p { font-size: 0.9rem; color: #333; margin-bottom: 1rem; }
.stats { display: flex; justify-content: space-around; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 1rem; }
.stat-item { display: flex; flex-direction: column; align-items: center; }
.stat-item strong { font-size: 1.1rem; }
.stat-item span { font-size: 0.8rem; color: #666; }
.btn-create-post { width: 100%; padding: 0.6rem; background-color: #2c3e50; color: white; border: none; border-radius: 20px; font-weight: bold; cursor: pointer; }
.category-select-container label { display: block; font-size: 0.85rem; font-weight: bold; margin-bottom: 5px; color: #555; }
.full-width-select { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; background-color: #f9f9f9; margin-bottom: 1rem; }
</style>