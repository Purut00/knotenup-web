<template>
  <div class="trip-card">
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
        <div class="rating">⭐ {{ trip.rating }}</div>
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
          <img :src="trip.organizerImage" alt="Org" />
          <span>{{ trip.organizerName }}</span>
        </div>
        <div class="price-action">
          <span class="price">RM {{ trip.price }}</span>
        </div>
      </div>
      
      <router-link :to="'/trips/' + trip.id" class="btn-join">
       {{ t('components.viewDetails') }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
defineProps<{ trip: any }>();
const { t } = useI18n();
</script>

<style scoped>
/* ... CSS KEKAL SAMA ... */
.trip-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08); border: 1px solid #eee; position: relative; transition: transform 0.2s; display: flex; flex-direction: column; }
.trip-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.12); }
.status-badge { position: absolute; top: 10px; left: 10px; z-index: 10; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase; color: white; }
.status-badge.open { background-color: #2ecc71; }
.status-badge.full { background-color: #e74c3c; }
.card-image { height: 180px; background-size: cover; background-position: center; position: relative; }
.level-badge { position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.7); color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; }
.card-content { padding: 1rem; display: flex; flex-direction: column; gap: 0.8rem; flex-grow: 1; }
.header-row { display: flex; justify-content: space-between; font-size: 0.8rem; }
.category { color: #3498db; font-weight: bold; text-transform: uppercase; }
.rating { color: #f1c40f; }
h3 { margin: 0; font-size: 1.1rem; color: #2c3e50; line-height: 1.3; }
.info-row { display: flex; gap: 1rem; font-size: 0.85rem; color: #7f8c8d; }
.progress-section { margin-top: auto; }
.progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px; color: #555; }
.spots-left { color: #e67e22; font-weight: bold; }
.progress-bar { height: 6px; background-color: #ecf0f1; border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background-color: #3498db; border-radius: 3px; }
.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #f5f5f5; }
.organizer { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: #555; }
.organizer img { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; }
.price { font-weight: 800; font-size: 1.1rem; color: #2c3e50; }
.btn-join { width: 100%; padding: 0.6rem; background-color: #2c3e50; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: background 0.2s; }
.btn-join:hover { background-color: #1a252f; }
.btn-join {
  /* ... css lama ... */
  text-decoration: none; /* Tambah ini sbb router-link jadi tag <a> */
  display: block;        /* Tambah ini */
  text-align: center;    /* Tambah ini */
}
</style>