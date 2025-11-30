<template>
  <div class="spots-page">
    
    <div class="header-strip">
      <div class="container flex-row">
        <div class="title-area">
          <h1>{{ t('spots.title') }}</h1>
          <p>{{ t('spots.sub') }}</p>
        </div>
        <button class="btn-add" @click="$router.push('/create-spot')">➕ {{ t('spots.addBtn') }}</button>
      </div>
    </div>

    <div class="container">
      
      <div class="filter-bar">
        <input 
          type="text" 
          v-model="searchQuery" 
          :placeholder="t('spots.searchPlaceholder')" 
          class="search-input" 
        />
        <select v-model="filterState" class="filter-select">
          <option value="">{{ t('spots.allStates') }}</option>
          <option v-for="s in MALAYSIA_STATES" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <div v-if="loading" class="loading">⏳ {{ t('common.loading') }}</div>
      
      <div v-else class="spot-grid">
        <div v-for="spot in filteredSpots" :key="spot.id" class="spot-card" @click="$router.push('/spots/' + spot.id)">
          <div class="card-img" :style="{ backgroundImage: `url(${spot.image || 'https://via.placeholder.com/300'})` }">
            
            <span class="level-badge" :class="spot.difficulty.toLowerCase()">
               {{ getLevelLabel(spot.difficulty) }}
            </span>

          </div>
          <div class="card-body">
            <h3>{{ spot.name }}</h3>
            <p class="meta">📍 {{ spot.state }} • 🏔️ {{ spot.height }}m</p>
            
            <div class="tags">
              <span v-if="spot.permit === 'No'" class="tag free">{{ t('spots.noPermit') }}</span>
              <span v-else class="tag permit">{{ t('spots.permit') }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!loading && filteredSpots.length === 0" class="empty">
        {{ t('spots.empty') }}
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n'; // 🔥 IMPORT BARU
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { MALAYSIA_STATES } from '../constants/data';

const { t } = useI18n(); // 🔥 INIT I18N
const loading = ref(true);
const spots = ref<any[]>([]);
const searchQuery = ref('');
const filterState = ref('');

// Helper untuk terjemah level (Easy/Moderate/Hard)
const getLevelLabel = (level: string) => {
  if (!level) return '';
  const key = level.toLowerCase();
  // Cuba cari dalam components.easy / components.hard
  // Jika tak jumpa, return original text
  return t(`components.${key}`) !== `components.${key}` ? t(`components.${key}`) : level;
};

const filteredSpots = computed(() => {
  return spots.value.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchState = filterState.value === '' || s.state === filterState.value;
    return matchSearch && matchState;
  });
});

onMounted(async () => {
  try {
    const q = query(collection(db, "spots"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    spots.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
});
</script>

<style scoped>
.spots-page { background: #f4f6f8; min-height: 100vh; padding-bottom: 2rem; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }

.header-strip { background: white; padding: 2rem 0; border-bottom: 1px solid #eee; margin-bottom: 2rem; }
.flex-row { display: flex; justify-content: space-between; align-items: center; }
.title-area h1 { margin: 0; color: #2c3e50; font-size: 1.8rem; }
.title-area p { margin: 5px 0 0; color: #777; }

.btn-add { background: #27ae60; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 50px; font-weight: bold; cursor: pointer; transition: transform 0.2s; }
.btn-add:hover { background: #219150; transform: translateY(-2px); }

.filter-bar { display: flex; gap: 1rem; margin-bottom: 2rem; }
.search-input { flex: 1; padding: 0.8rem; border: 1px solid #ddd; border-radius: 8px; outline: none; font-size: 1rem; }
.filter-select { padding: 0.8rem; border: 1px solid #ddd; border-radius: 8px; outline: none; width: 200px; cursor: pointer; }

.spot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }
.spot-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); cursor: pointer; transition: transform 0.2s; border: 1px solid #eee; }
.spot-card:hover { transform: translateY(-5px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }

.card-img { height: 180px; background-size: cover; background-position: center; position: relative; }
.level-badge { position: absolute; top: 10px; right: 10px; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; color: white; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
.level-badge.easy { background: #2ecc71; }
.level-badge.moderate { background: #f1c40f; color: #333; }
.level-badge.hard { background: #e74c3c; }

.card-body { padding: 1.2rem; }
h3 { margin: 0 0 5px 0; color: #2c3e50; font-size: 1.1rem; line-height: 1.3; }
.meta { font-size: 0.85rem; color: #777; margin-bottom: 12px; display: flex; align-items: center; gap: 5px; }

.tags { display: flex; gap: 5px; }
.tag { font-size: 0.7rem; padding: 3px 8px; border-radius: 4px; font-weight: bold; }
.tag.free { background: #e0f2f1; color: #00695c; }
.tag.permit { background: #ffebee; color: #c62828; }

.loading, .empty { text-align: center; padding: 4rem 0; color: #888; font-style: italic; font-size: 1.1rem; }

@media (max-width: 768px) {
  .flex-row { flex-direction: column; text-align: center; gap: 1rem; }
  .filter-bar { flex-direction: column; }
  .filter-select { width: 100%; }
}
</style>