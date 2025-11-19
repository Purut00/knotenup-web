<template>
  <div class="forum-page">
    
    <div class="forum-banner">
      <div class="banner-content">
        <h1>Pusat Komuniti KnotenUp</h1>
        <p>Bincangkan segalanya tentang aktiviti luar, gear, dan pengalaman.</p>
        
        <div class="search-wrapper">
          <SearchBar 
            placeholder="Cari topik perbincangan..." 
            searchScope="Forum Sahaja"
            @handle-search="handleSearch"
          />
        </div>
      </div>
    </div>

    <div class="forum-container">
      
      <div class="feed-column">
        
        <div class="feed-filter">
          <div class="left-tabs">
            <button class="filter-tab active">🔥 Hangat</button>
            <button class="filter-tab">🆕 Terkini</button>
          </div>
          
          <div v-if="selectedCategory" class="active-filter-badge">
            Menapis: <strong>{{ selectedCategory }}</strong>
            <button @click="selectedCategory = ''" class="btn-clear">✖</button>
          </div>
        </div>

        <div v-if="filteredPosts.length > 0">
          <ForumPostCard 
            v-for="post in filteredPosts" 
            :key="post.id" 
            :post="post" 
          />
        </div>

        <div v-else class="empty-state">
          <p>Tiada perbincangan untuk kategori <strong>{{ selectedCategory }}</strong>.</p>
          <button @click="selectedCategory = ''">Lihat Semua Topik</button>
        </div>
        
        <div v-if="filteredPosts.length > 0" class="load-more">
          <button>Muat Lagi...</button>
        </div>
      </div>

      <div class="sidebar-column">
        
        <div class="sidebar-widget">
          <div class="widget-header">
            <h3>Tentang Komuniti</h3>
          </div>
          <div class="widget-body">
            <p>Selamat datang ke forum rasmi KnotenUp.</p>
            <div class="stats">
              <div class="stat-item"><strong>1.2k</strong><span>Ahli</span></div>
              <div class="stat-item"><strong>150</strong><span>Online</span></div>
            </div>
            <button class="btn-create-post">✍️ Cipta Post Baru</button>
          </div>
        </div>

        <div class="sidebar-widget">
          <div class="widget-header">
            <h3>Saring Ikut Aktiviti</h3>
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
            
            <div class="categories-list">
              <p class="label-small">Paling Popular:</p>
              <a href="#" @click.prevent="selectedCategory = 'Hiking'">⛰️ Hiking</a>
              <a href="#" @click.prevent="selectedCategory = 'Camping'">⛺ Camping</a>
              <a href="#" @click.prevent="selectedCategory = 'Cycling'">🚴 Cycling</a>
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
import { ref, computed } from 'vue';
// Import Data Universal
import { ACTIVITY_CATEGORIES } from '../constants/data';

const handleSearch = (q: string) => {
  alert(`Mencari forum: ${q}`);
};

// State untuk Filter
const selectedCategory = ref('');

// Dummy Data
const posts = ref([
  {
    id: 1,
    title: "Kasut hiking apa paling sesuai untuk Dragon Back?",
    author: "MatGunung88",
    category: "Hiking",
    timeAgo: "2 jam lepas",
    votes: 45,
    commentCount: 12,
    excerpt: "Salam semua, saya plan nak hiking Dragon Back weekend ni. Kasut getah adidas kampung okay tak?",
    image: null
  },
  {
    id: 2,
    title: "Trip Report: Camping di Sungai Chiling (Padu!)",
    author: "SaraCamp",
    category: "Camping",
    timeAgo: "5 jam lepas",
    votes: 120,
    commentCount: 34,
    excerpt: "Air sungai jernih, tapak pun bersih. Cuma hati-hati masa cross sungai...",
    image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=500&q=60"
  },
  {
    id: 3,
    title: "Mana nak cari kedai repair basikal area Shah Alam?",
    author: "CyclingPro",
    category: "Cycling",
    timeAgo: "1 hari lepas",
    votes: 10,
    commentCount: 5,
    excerpt: "Tayar basikal saya bocor tepi jalan, ada rekemen kedai yang buka Ahad?",
    image: null
  },
  {
    id: 4,
    title: "Lesen Diving PADI atau SSI? Mana lagi okay?",
    author: "DiverBaru",
    category: "Scuba Diving", // Kategori lain
    timeAgo: "3 hari lepas",
    votes: 32,
    commentCount: 20,
    excerpt: "Plan nak ambil lesen bulan depan di Tioman. Minta pendapat otai.",
    image: null
  }
]);

// Computed Property: Auto update bila selectedCategory berubah
const filteredPosts = computed(() => {
  if (!selectedCategory.value) {
    return posts.value; // Kalau tak pilih apa-apa, tunjuk semua
  }
  return posts.value.filter(post => post.category === selectedCategory.value);
});
</script>

<style scoped>
.forum-page {
  background-color: #dae0e6;
  min-height: 100vh;
}

.forum-banner {
  background-color: #2c3e50;
  color: white;
  padding: 2rem 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
}
.banner-content h1 { font-size: 1.8rem; margin-bottom: 0.5rem; }
.search-wrapper { margin-top: 1.5rem; display: flex; justify-content: center; }

/* LAYOUT GRID */
.forum-container {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1.5rem;
  padding: 0 1rem 2rem 1rem;
}

@media (max-width: 768px) {
  .forum-container { grid-template-columns: 1fr; }
  .sidebar-column { order: -1; margin-bottom: 1rem; }
}

/* FEED COLUMN */
.feed-filter {
  background: white;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.left-tabs { display: flex; gap: 10px; }

.filter-tab {
  background: none;
  border: none;
  font-weight: bold;
  color: #878a8c;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 20px;
}

.filter-tab.active { background-color: #f6f7f8; color: #0079d3; }

.active-filter-badge {
  background-color: #e1f5fe;
  color: #0288d1;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-clear {
  background: none;
  border: none;
  color: #0288d1;
  cursor: pointer;
  font-weight: bold;
}

.empty-state {
  background: white;
  text-align: center;
  padding: 3rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}
.empty-state button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #0079d3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.load-more { text-align: center; margin-top: 1rem; }
.load-more button {
  background-color: #0079d3;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
}

/* SIDEBAR COLUMN */
.sidebar-widget {
  background: white;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 1rem;
  overflow: hidden;
}

.widget-header {
  background-color: #0079d3;
  color: white;
  padding: 0.8rem 1rem;
}
.widget-header h3 { margin: 0; font-size: 1rem; }

.widget-body { padding: 1rem; }
.widget-body p { font-size: 0.9rem; color: #333; margin-bottom: 1rem; }

.stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.stat-item { display: flex; flex-direction: column; align-items: center; }
.stat-item strong { font-size: 1.1rem; }
.stat-item span { font-size: 0.8rem; color: #666; }

.btn-create-post {
  width: 100%;
  padding: 0.6rem;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
}

/* Category Filter Styles */
.category-select-container label {
  display: block;
  font-size: 0.85rem;
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
}

.full-width-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
  margin-bottom: 1rem;
}

.label-small {
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  font-weight: bold;
}

.categories-list a {
  display: block;
  padding: 0.5rem 0;
  text-decoration: none;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  transition: padding 0.2s;
}
.categories-list a:hover { padding-left: 5px; color: #0079d3; }
</style>