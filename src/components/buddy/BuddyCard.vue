<template>
  <div class="buddy-card glass-card">
    <div class="card-header">
      <div class="host-info">
        <img :src="buddy.hostAvatar || 'https://i.pravatar.cc/150?img=12'" alt="Host" class="avatar" />
        <div>
          <span class="host-label">Host</span>
          <h4 class="host-name">{{ buddy.hostName }}</h4>
        </div>
      </div>
      <div class="date-badge">
        <span class="day">{{ formatDateDay(buddy.date) }}</span>
        <span class="month">{{ formatDateMonth(buddy.date) }}</span>
      </div>
    </div>

    <div class="card-body">
      <h3 class="location-title">{{ buddy.location }}</h3>
      
      <div class="meta-tags">
        <span class="tag time"><i class="far fa-clock"></i> {{ buddy.time }}</span>
        <span class="tag pace" :class="getPaceClass(buddy.pace)">
          <i class="fas fa-running"></i> {{ buddy.pace }}
        </span>
      </div>

      <div class="carpool-status mt-3" v-if="buddy.carpool !== 'Sendiri'">
        <i class="fas fa-car-side"></i> 
        {{ buddy.carpool === 'Driver' ? 'Ada Kosong (Carpool)' : 'Cari Tumpang' }}
      </div>

      <p class="notes" v-if="buddy.notes">"{{ buddy.notes }}"</p>
    </div>

    <div class="card-footer">
      <a :href="buddy.whatsappLink" target="_blank" class="btn-join">
        <i class="fab fa-whatsapp"></i> Join Geng
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  buddy: { type: Object, required: true }
});

// Helper Dates
const formatDateDay = (dateStr: string) => {
  if(!dateStr) return '00';
  return new Date(dateStr).getDate();
};
const formatDateMonth = (dateStr: string) => {
  if(!dateStr) return 'MMM';
  return new Date(dateStr).toLocaleString('default', { month: 'short' });
};

// Helper Style Pace
const getPaceClass = (pace: string) => {
  if (pace.includes('Santai')) return 'pace-easy';
  if (pace.includes('Sederhana')) return 'pace-medium';
  return 'pace-hard';
};
</script>

<style scoped>
.buddy-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex; flex-direction: column;
}
.buddy-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  border-color: rgba(108, 99, 255, 0.4);
}

/* Header */
.card-header {
  padding: 1rem;
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  background: rgba(0,0,0,0.2);
}
.host-info { display: flex; align-items: center; gap: 10px; }
.avatar { width: 40px; height: 40px; border-radius: 50%; border: 2px solid #6c63ff; }
.host-label { font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; }
.host-name { font-size: 0.95rem; color: white; margin: 0; font-weight: 600; }

.date-badge {
  text-align: center; background: rgba(255,255,255,0.1); padding: 5px 10px; border-radius: 8px;
}
.day { display: block; font-size: 1.2rem; font-weight: bold; color: white; line-height: 1; }
.month { font-size: 0.7rem; text-transform: uppercase; color: #cbd5e1; }

/* Body */
.card-body { padding: 1.2rem; flex-grow: 1; }
.location-title { font-size: 1.3rem; color: white; margin-bottom: 0.8rem; font-weight: 700; }

.meta-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.tag { font-size: 0.8rem; padding: 4px 10px; border-radius: 20px; background: rgba(255,255,255,0.1); color: #cbd5e1; display: flex; align-items: center; gap: 6px; }

/* Pace Colors */
.pace-easy { color: #86efac; background: rgba(22, 163, 74, 0.2); }
.pace-medium { color: #fcd34d; background: rgba(217, 119, 6, 0.2); }
.pace-hard { color: #fca5a5; background: rgba(220, 38, 38, 0.2); }

.carpool-status { font-size: 0.85rem; color: #93c5fd; display: flex; align-items: center; gap: 8px; }
.notes { margin-top: 1rem; font-size: 0.9rem; color: #94a3b8; font-style: italic; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* Footer */
.card-footer { padding: 1rem; border-top: 1px solid rgba(255,255,255,0.05); }
.btn-join {
  display: block; width: 100%; text-align: center;
  background: linear-gradient(135deg, #25d366, #128c7e);
  color: white; padding: 10px; border-radius: 50px;
  font-weight: 700; text-decoration: none;
  transition: 0.2s;
}
.btn-join:hover { filter: brightness(1.1); transform: scale(1.02); }
</style>