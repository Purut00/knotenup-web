<template>
  <div class="home">
    <section class="hero">
      <div class="hero-overlay">
        <div class="hero-content">
          <h1>{{ t('home.heroTitle') }}</h1>
          <p>{{ t('home.heroSub') }}</p>
          
          <div style="margin-top: 2rem;">
            <SearchBar 
              :placeholder="t('home.searchPlaceholder')" 
              searchScope="Global"
              @handle-search="handleGlobalSearch"
            />
          </div>

        </div>
      </div>
    </section>

    <section class="section-container">
      <h2>{{ t('home.popularActivities') }}</h2>
      <div class="icon-grid">
        <div class="icon-item" v-for="item in popularActivities" :key="item.name">
          <div class="icon-circle">{{ item.emoji }}</div>
          <span>{{ item.name }}</span>
        </div>
      </div>
    </section>

    <section class="section-container gray-bg">
      <div class="content-wrapper">
        <h2>{{ t('home.latestTrips') }}</h2>
        <div class="trip-grid">
          <div class="card trip-card" v-for="n in 12" :key="'trip-'+n">
            <div class="card-image" :style="{ backgroundImage: `url('https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=400&q=80')` }">
              <div class="img-overlay"></div>
            </div>
            <div class="card-content">
              <span class="tag">Hiking</span>
              <h3>Ekspedisi Gunung Tahan {{ n }}</h3>
              <div class="meta-info">
                <span>📅 12 Dis 2025</span>
                <span>📍 Pahang</span>
              </div>
              <p>Jom sertai kami mendaki gunung tertinggi di Semenanjung.</p>
              <div class="card-footer">
                <span class="price">RM 250/pax</span>
                <button class="btn-small">{{ t('common.view') }}</button>
              </div>
            </div>
          </div>
        </div>
        <div class="center-btn">
          <button class="btn-outline">{{ t('home.viewAllTrips') }}</button>
        </div>
      </div>
    </section>

    <section class="section-container">
      <h2>{{ t('home.communityDiscuss') }}</h2>
      <div class="forum-grid">
        <div class="forum-card" v-for="n in 8" :key="'forum-'+n">
          <div class="forum-content">
            <div class="forum-header">
              <span class="badge">Tips</span>
              <span class="date">2 jam lepas</span>
            </div>
            <h3>Kasut hiking apa paling tahan lasak? #{{ n }}</h3>
            <p>Saya merancang nak beli kasut baru bajet bawah RM300...</p>
            <div class="forum-footer">
              <div class="user-info">
                <div class="avatar"></div>
                <span>Ahmad Albab</span>
              </div>
              <div class="stats">
                <span>💬 24</span>
                <span>❤️ 15</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import SearchBar from '../components/common/SearchBar.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const handleGlobalSearch = (query: string) => {
  console.log("Global Search:", query);
  alert(`Mencari '${query}' di seluruh website...`);
};

const popularActivities = [
  { name: 'Hiking', emoji: '⛰️' },
  { name: 'Camping', emoji: '⛺' },
  { name: 'Kayaking', emoji: '🛶' },
  { name: 'Diving', emoji: '🤿' },
  { name: 'Cycling', emoji: '🚴' },
  { name: 'Climbing', emoji: '🧗' }
];
</script>

<style scoped>
/* ... CSS KEKAL SAMA ... */
.hero { height: 500px; background-image: url('https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1600&q=80'); background-size: cover; background-position: center; position: relative; }
.hero-overlay { background: rgba(0, 0, 0, 0.4); height: 100%; display: flex; align-items: center; justify-content: center; }
.hero-content { text-align: center; color: white; width: 100%; max-width: 800px; padding: 0 1rem; }
.hero-content h1 { font-size: 3rem; font-weight: 900; margin-bottom: 1rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
.section-container { padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; }
.gray-bg { background-color: #f8f9fa; max-width: none; display: flex; justify-content: center; }
.content-wrapper { max-width: 1200px; width: 100%; }
h2 { text-align: center; margin-bottom: 3rem; font-size: 2.2rem; color: #2c3e50; }
.icon-grid { display: flex; justify-content: center; gap: 3rem; flex-wrap: wrap; }
.icon-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s; }
.icon-item:hover { transform: translateY(-5px); }
.icon-circle { width: 80px; height: 80px; background-color: #fff; border: 2px solid #eee; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin-bottom: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: all 0.3s; }
.icon-item:hover .icon-circle { border-color: #e67e22; background-color: #fff8f0; }
.icon-item span { font-weight: 600; color: #555; }
.trip-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
@media (max-width: 900px) { .trip-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .trip-grid { grid-template-columns: 1fr; } }
.card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: transform 0.2s; border: 1px solid #eee; }
.card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.12); }
.card-image { height: 180px; background-color: #ddd; background-size: cover; background-position: center; }
.card-content { padding: 1.5rem; }
.tag { background-color: #fff3cd; color: #856404; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; }
.card-content h3 { margin: 0.8rem 0; font-size: 1.2rem; color: #2c3e50; }
.meta-info { display: flex; gap: 1rem; font-size: 0.85rem; color: #7f8c8d; margin-bottom: 1rem; }
.card-footer { border-top: 1px solid #f1f1f1; padding-top: 1rem; margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; }
.price { font-weight: bold; color: #e67e22; font-size: 1.1rem; }
.btn-small { padding: 0.4rem 1rem; background-color: #2c3e50; color: white; border: none; border-radius: 4px; cursor: pointer; }
.forum-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; }
@media (max-width: 768px) { .forum-grid { grid-template-columns: 1fr; } }
.forum-card { background: white; border: 1px solid #e0e0e0; border-radius: 10px; padding: 1.5rem; transition: border-color 0.2s; }
.forum-card:hover { border-color: #3498db; }
.forum-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
.badge { background-color: #e1f5fe; color: #0288d1; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: bold; }
.date { font-size: 0.8rem; color: #aaa; }
.forum-card h3 { margin-bottom: 0.5rem; color: #333; }
.forum-card p { color: #666; font-size: 0.95rem; line-height: 1.5; }
.forum-footer { margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
.user-info { display: flex; align-items: center; gap: 0.5rem; }
.avatar { width: 30px; height: 30px; background-color: #ccc; border-radius: 50%; }
.stats { font-size: 0.85rem; color: #999; display: flex; gap: 1rem; }
.center-btn { text-align: center; margin-top: 3rem; }
.btn-outline { padding: 0.8rem 2rem; border: 2px solid #2c3e50; background: transparent; color: #2c3e50; font-weight: bold; border-radius: 50px; cursor: pointer; transition: all 0.3s; }
.btn-outline:hover { background: #2c3e50; color: white; }
</style>