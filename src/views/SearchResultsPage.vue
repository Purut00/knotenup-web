<template>
  <div class="search-page">
    <div class="search-header">
      <h1>Keputusan Carian: "{{ searchQuery }}"</h1>
      <p v-if="!loading">Ditemui {{ filteredTrips.length }} trip dan {{ filteredPosts.length }} perbincangan.</p>
    </div>

    <div class="search-bar-container">
      <input 
        v-model="searchInput" 
        @keyup.enter="updateSearch"
        placeholder="Cari kata kunci lain..." 
      />
      <button @click="updateSearch">🔍</button>
    </div>

    <div class="results-container">
      
      <div v-if="loading" class="loading-box">⏳ {{ t('common.loading') }}</div>

      <div v-else>
        
        <section class="result-section">
          <h3>🏔️ Trips ({{ filteredTrips.length }})</h3>
          
          <div v-if="filteredTrips.length > 0" class="trip-grid">
            <TripCard v-for="trip in filteredTrips" :key="trip.id" :trip="trip" />
          </div>
          
          <p v-else class="empty-text">Tiada trip dijumpai dengan kata kunci ini.</p>
        </section>

        <hr class="divider" />

        <section class="result-section">
          <h3>💬 Forum ({{ filteredPosts.length }})</h3>
          
          <div v-if="filteredPosts.length > 0" class="forum-list">
            <div 
              v-for="post in filteredPosts" 
              :key="post.id" 
              class="forum-item"
              @click="$router.push('/forum/' + post.id)"
            >
              <h4>{{ post.title }}</h4>
              <p class="snippet">{{ post.content }}</p>
            </div>
          </div>

          <p v-else class="empty-text">Tiada topik forum dijumpai.</p>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import TripCard from '../components/trip/TripCard.vue';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const searchQuery = ref('');
const searchInput = ref('');
const loading = ref(true);

const allTrips = ref<any[]>([]);
const allPosts = ref<any[]>([]);
const filteredTrips = ref<any[]>([]);
const filteredPosts = ref<any[]>([]);

// Fetch SEMUA data sekali gus (Untuk MVP ini ok, kalau data besar nanti guna Algolia)
const fetchData = async () => {
  loading.value = true;
  try {
    // 1. Get Trips
    const tripSnap = await getDocs(query(collection(db, "trips"), orderBy("createdAt", "desc")));
    allTrips.value = tripSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Get Forum
    const postSnap = await getDocs(query(collection(db, "forum_posts"), orderBy("createdAt", "desc")));
    allPosts.value = postSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Jalankan filter pertama kali
    performFilter();
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

// Logic Filter (Search dalam Title & Description/Content)
const performFilter = () => {
  const keyword = searchQuery.value.toLowerCase();

  filteredTrips.value = allTrips.value.filter(t => 
    t.title.toLowerCase().includes(keyword) || 
    t.location.toLowerCase().includes(keyword)
  );

  filteredPosts.value = allPosts.value.filter(p => 
    p.title.toLowerCase().includes(keyword) || 
    p.content.toLowerCase().includes(keyword)
  );
};

// Update URL bila user search benda baru
const updateSearch = () => {
  if (searchInput.value) {
    router.push({ name: 'search', query: { q: searchInput.value } });
  }
};

// Dengar perubahan pada URL (contoh: user tekan back button)
watch(() => route.query.q, (newQ) => {
  searchQuery.value = newQ as string || '';
  searchInput.value = searchQuery.value;
  performFilter();
});

onMounted(() => {
  searchQuery.value = route.query.q as string || '';
  searchInput.value = searchQuery.value;
  fetchData();
});
</script>

<style scoped>
.search-page { background: #f4f6f8; min-height: 100vh; padding: 2rem; }
.search-header { text-align: center; margin-bottom: 2rem; }
.search-header h1 { color: #2c3e50; margin-bottom: 0.5rem; }

.search-bar-container { max-width: 600px; margin: 0 auto 3rem; display: flex; gap: 10px; }
.search-bar-container input { flex: 1; padding: 1rem; border: 1px solid #ddd; border-radius: 50px; outline: none; }
.search-bar-container button { background: #2c3e50; color: white; border: none; width: 50px; border-radius: 50%; cursor: pointer; }

.results-container { max-width: 1200px; margin: 0 auto; }
.result-section { margin-bottom: 3rem; }
.result-section h3 { font-size: 1.5rem; color: #e67e22; margin-bottom: 1.5rem; border-left: 5px solid #2c3e50; padding-left: 1rem; }

.trip-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }

.forum-list { display: flex; flex-direction: column; gap: 1rem; }
.forum-item { background: white; padding: 1.5rem; border-radius: 8px; cursor: pointer; transition: transform 0.2s; border: 1px solid #eee; }
.forum-item:hover { transform: translateX(5px); border-left: 5px solid #e67e22; }
.forum-item h4 { margin: 0 0 0.5rem 0; color: #2c3e50; }
.snippet { color: #666; font-size: 0.9rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.divider { border: 0; border-top: 1px solid #ddd; margin: 3rem 0; }
.empty-text { color: #999; font-style: italic; }
.loading-box { text-align: center; font-size: 1.5rem; margin-top: 3rem; }
</style>