<template>
  <div class="trip-card" @click="goToDetail">
    
    <div class="status-badge" :class="trip.status">
      {{ trip.status === 'open' ? t('trip.open') : t('trip.full') }}
    </div>

    <div class="card-image" :style="{ backgroundImage: `url(${trip.image})` }">
      <div class="overlay"></div>
      <div class="level-badge">{{ trip.difficulty }}</div>
    </div>

    <div class="card-content">
      <div class="header-row">
        <span class="category">{{ trip.category }}</span>
        <div class="rating">⭐ {{ trip.rating || '5.0' }}</div>
      </div>

      <h3>{{ trip.title }}</h3>

      <div class="info-row">
        <span>📅 {{ trip.date }}</span>
        <span>⏱️ {{ trip.duration }}</span>
      </div>

      <div class="progress-section">
        <div class="progress-label">
          <span>Slot: {{ trip.currentSlots }}/{{ trip.maxSlots }}</span>
          <span class="spots-left" v-if="trip.maxSlots - trip.currentSlots <= 5">
             🔥 {{ t('trip.slotsLeft', { count: trip.maxSlots - trip.currentSlots }) }}
          </span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: (trip.currentSlots / trip.maxSlots) * 100 + '%' }"></div>
        </div>
      </div>

      <div class="card-footer">
        <div class="organizer">
          <img :src="trip.organizerImage || 'https://i.pravatar.cc/150?img=3'" alt="Org" />
          <span>{{ trip.organizerName }}</span>
        </div>
        <div class="price-action">
          <span class="price">RM {{ trip.price }}</span>
        </div>
      </div>
      
      </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const props = defineProps<{ trip: any }>();
const { t } = useI18n();
const router = useRouter();

// Fungsi bawa ke page detail
const goToDetail = () => {
  router.push(`/trips/${props.trip.id}`);
};
</script>

<style scoped>
.trip-card { 
  background: white; 
  border-radius: 8px; /* Kurangkan radius sikit biar tajam */
  overflow: hidden; 
  box-shadow: 0 2px 8px rgba(0,0,0,0.08); 
  border: 1px solid #eee; 
  position: relative; 
  transition: transform 0.2s, box-shadow 0.2s; 
  display: flex; 
  flex-direction: column;
  cursor: pointer; /* PENTING: Tunjuk ni boleh klik */
}

.trip-card:hover { 
  transform: translateY(-3px); 
  box-shadow: 0 5px 15px rgba(0,0,0,0.1); 
  border-color: #27ae60; /* Highlight hijau sikit bila hover */
}

.status-badge { position: absolute; top: 10px; left: 10px; z-index: 10; padding: 2px 8px; border-radius: 4px; font-size: 0.65rem; font-weight: bold; text-transform: uppercase; color: white; }
.status-badge.open { background-color: #2ecc71; }
.status-badge.full { background-color: #e74c3c; }

.card-image { height: 160px; background-size: cover; background-position: center; position: relative; }
.level-badge { position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.7); color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; }

.card-content { padding: 0.8rem; display: flex; flex-direction: column; gap: 0.5rem; flex-grow: 1; }

.header-row { display: flex; justify-content: space-between; font-size: 0.75rem; }
.category { color: #27ae60; font-weight: bold; text-transform: uppercase; font-size: 0.7rem; }
.rating { color: #f1c40f; font-weight: bold; }

h3 { margin: 0; font-size: 1rem; color: #2c3e50; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.info-row { display: flex; gap: 1rem; font-size: 0.8rem; color: #7f8c8d; }

.progress-section { margin-top: auto; }
.progress-label { display: flex; justify-content: space-between; font-size: 0.7rem; margin-bottom: 3px; color: #999; }
.spots-left { color: #e67e22; font-weight: bold; }
.progress-bar { height: 4px; background-color: #ecf0f1; border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background-color: #27ae60; border-radius: 2px; }

.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #f5f5f5; }
.organizer { display: flex; align-items: center; gap: 5px; font-size: 0.75rem; color: #555; }
.organizer img { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; }
.price { font-weight: 800; font-size: 1rem; color: #2c3e50; }
</style>