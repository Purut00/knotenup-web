<template>
  <!-- UPDATE: Tambah class 'compact' jika isCompact = true -->
  <div class="trip-card glass-card" :class="{ 'compact': isCompact }" @click="goToDetail">
    
    <!-- Status Badge (Sembunyi bila compact supaya tak serabut atas gambar kecil) -->
    <div v-if="!isCompact" class="status-badge" :class="trip.status">
      {{ trip.status === 'open' ? t('trip.open') || 'OPEN' : t('trip.full') || 'FULL' }}
    </div>

    <!-- Image Section: KIRI bila compact -->
    <div class="card-image" :style="{ backgroundImage: `url(${trip.image})` }">
      <div class="overlay-gradient"></div>
      
      <!-- Sembunyi badge level & wishlist button bila compact -->
      <div v-if="!isCompact" class="level-badge">
        <i class="fas fa-mountain"></i> {{ translateLevel(trip.difficulty) }}
      </div>
      <button v-if="!isCompact" class="wishlist-btn"><i class="far fa-heart"></i></button>
    </div>

    <!-- Content Section: KANAN bila compact -->
    <div class="card-content">
      <div class="header-row">
        <!-- Category -->
        <span class="category">{{ translateCategory(trip.category) }}</span>
        <!-- Rating: Sembunyi dalam compact jika nak jimat ruang tajuk, tapi saya kekalkan dulu -->
        <div class="rating" v-if="!isCompact">
          <i class="fas fa-star text-yellow-400"></i> {{ trip.rating || '5.0' }}
        </div>
      </div>

      <!-- TAJUK: Diberi lebih ruang dalam CSS compact -->
      <h3>{{ trip.title }}</h3>

      <div class="info-row">
        <!-- Date -->
        <div class="info-item">
            <i class="far fa-calendar-alt icon-theme"></i>
            <span>{{ formattedDate }}</span>
        </div>
        <!-- Duration: KEKAL ADA (Updated) -->
        <div class="info-item">
            <i class="far fa-clock icon-theme"></i>
            <span>{{ trip.duration }}</span>
        </div>
      </div>

      <!-- Progress Section (Bar): Sembunyi bila compact -->
      <div v-if="!isCompact" class="progress-section">
        <div class="progress-label">
          <span>Slot: {{ trip.currentSlots }}/{{ trip.maxSlots }}</span>
          <span class="spots-left" v-if="trip.maxSlots - trip.currentSlots <= 5">
              🔥 {{ t('trip.slotsLeft', { count: trip.maxSlots - trip.currentSlots }) || (trip.maxSlots - trip.currentSlots) + ' left!' }}
          </span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: (trip.currentSlots / trip.maxSlots) * 100 + '%' }"></div>
        </div>
      </div>

      <div class="card-footer">
        <!-- Organizer: Sembunyi bila compact -->
        <div v-if="!isCompact" class="organizer">
          <img :src="trip.organizerImage || 'https://i.pravatar.cc/150?img=3'" alt="Org" />
          <span class="org-name">{{ trip.organizerName }}</span>
        </div>
        
        <!-- Price: Sentiasa tunjuk -->
        <div class="price-action" :class="{ 'compact-price': isCompact }">
          <span class="price-currency">RM</span>
          <span class="price-value">{{ trip.price }}</span>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

// UPDATE: Terima prop 'isCompact'
const props = defineProps<{ 
  trip: any;
  isCompact?: boolean;
}>();

const { t, locale } = useI18n(); 
const router = useRouter();

// 🔥 FORMAT DATE REAKTIF 🔥
const formattedDate = computed(() => {
  if (!props.trip.startDate) return '';
  const date = new Date(props.trip.startDate);
  return date.toLocaleDateString(locale.value, { day: 'numeric', month: 'short' });
});

// Helper Translate
const translateCategory = (cat: string) => {
  if (!cat) return '';
  return t(`activities.${cat.toLowerCase()}`) || cat; 
};

const translateLevel = (level: string) => {
  if (!level) return '';
  return t(`levels.${level.toLowerCase()}`) || level;
};

const goToDetail = () => {
  router.push(`/trips/${props.trip.id}`);
};
</script>

<style scoped>
/* --- GLASS CARD CONTAINER (WHITE GLASS) --- */
.trip-card { 
  /* White Glass Effect */
  background: rgba(255, 255, 255, 0.85); /* Putih lutsinar */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6); /* Border putih halus */
  
  border-radius: 16px; 
  overflow: hidden; 
  position: relative; 
  transition: all 0.3s ease; 
  display: flex; 
  flex-direction: column;
  cursor: pointer;
  color: #334155; /* Teks gelap (Slate) supaya boleh baca atas putih */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); /* Shadow lembut */
}

.trip-card:hover { 
  transform: translateY(-5px); 
  box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.15);
  border-color: #6c63ff; /* Purple border bila hover */
}

/* IMAGE SECTION */
.card-image { 
  height: 180px; 
  background-size: cover; 
  background-position: center; 
  position: relative; 
}
.overlay-gradient {
  position: absolute; inset: 0;
  /* Gradient hitam sikit di bawah gambar supaya tulisan badge nampak */
  background: linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0, 0, 0, 0.6) 100%);
}

/* BADGES - Font weight dikurangkan */
.status-badge { 
  position: absolute; top: 12px; left: 12px; z-index: 10; 
  padding: 4px 10px; border-radius: 20px; 
  font-size: 0.7rem; 
  font-weight: 500; /* Buang Bold (Normal/Medium) */
  text-transform: uppercase; letter-spacing: 0.5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}
.status-badge.open { background: #6c63ff; color: white; }
.status-badge.full { background: #ef4444; color: white; }

.level-badge { 
  position: absolute; bottom: 10px; left: 12px; 
  background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  color: #fff; padding: 4px 8px; border-radius: 6px; 
  font-size: 0.75rem; 
  font-weight: 400; /* Buang Bold */
  display: flex; align-items: center; gap: 4px;
}

.wishlist-btn {
  position: absolute; top: 12px; right: 12px;
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.9); /* Butang putih */
  border: none; color: #ff6584; /* Icon pink */
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: 0.2s; cursor: pointer;
}
.wishlist-btn:hover { transform: scale(1.1); background: white; }

/* CONTENT */
.card-content { padding: 1.2rem; display: flex; flex-direction: column; gap: 0.8rem; flex-grow: 1; }

.header-row { display: flex; justify-content: space-between; align-items: center; }
.category { 
  color: #f97316; /* Orange terang sikit */
  font-weight: 500; /* Buang Bold */
  text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.5px;
}
.rating { color: #eab308; font-weight: 500; font-size: 0.85rem; }

h3 { 
  margin: 0; font-size: 1.1rem; 
  font-weight: 500; /* Buang Bold sepenuhnya */
  color: #1e293b; /* Teks Hitam/Gelap */
  line-height: 1.4; 
  display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; 
}

/* INFO ROW */
.info-row { display: flex; gap: 1rem; font-size: 0.85rem; color: #64748b; margin-top: 4px; }
.info-item { display: flex; align-items: center; gap: 6px; }
.icon-theme { color: #6c63ff; } 

/* PROGRESS BAR */
.progress-section { margin-top: auto; padding-top: 10px; }
.progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 6px; color: #64748b; }
.spots-left { color: #ef4444; font-weight: 500; animation: pulse 2s infinite; }
.progress-bar { 
  height: 6px; background-color: #e2e8f0; /* Kelabu cair */
  border-radius: 10px; overflow: hidden; 
}
.progress-fill { 
  height: 100%; 
  background: linear-gradient(90deg, #6c63ff, #ff8c42); 
  border-radius: 10px; 
}

/* FOOTER */
.card-footer { 
  display: flex; justify-content: space-between; align-items: center; 
  margin-top: 0.8rem; padding-top: 0.8rem; 
  border-top: 1px solid #f1f5f9; /* Garis halus cair */
}
.organizer { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: #475569; }
.organizer img { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 1px solid #e2e8f0; }

.price-action { display: flex; align-items: baseline; gap: 2px; }
.price-currency { font-size: 0.7rem; color: #64748b; font-weight: 400; }
.price-value { 
  font-weight: 500; /* Buang Bold */
  font-size: 1.2rem; 
  color: #1e293b; /* Harga gelap */
}

@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }

/* --- UPDATE: STYLE COMPACT MODE --- */
.trip-card.compact {
  flex-direction: row; /* Susun Kiri Kanan */
  height: 130px; /* Tinggi sederhana supaya info tak berhimpit */
  align-items: stretch;
}

/* Gambar belah KIRI */
.trip-card.compact .card-image {
  width: 35%; /* Lebar gambar */
  min-width: 120px;
  max-width: 160px;
  height: 100%;
  border-radius: 0;
}

/* Content belah KANAN */
.trip-card.compact .card-content {
  width: 65%;
  padding: 0.8rem;
  justify-content: space-between; /* Agihkan ruang atas bawah dengan seimbang */
  gap: 0;
}

.trip-card.compact .header-row {
  margin-bottom: 2px;
}

/* TAJUK COMPACT: Lebih ruang, tak terpotong teruk */
.trip-card.compact h3 {
  font-size: 1rem;
  line-height: 1.2;
  -webkit-line-clamp: 2; /* Benarkan 2 baris tajuk */
  line-clamp: 2;
  margin-bottom: 4px;
}

/* Info Row Compact (Date & Duration) */
.trip-card.compact .info-row {
  font-size: 0.75rem;
  margin-top: 0;
  gap: 0.8rem;
}

/* Footer Compact: Harga di hujung kanan */
.trip-card.compact .card-footer {
  border-top: none;
  margin-top: auto;
  padding-top: 0;
  justify-content: flex-end;
}

.trip-card.compact .price-action.compact-price {
  margin-left: auto;
}

/* Responsif Mobile untuk Compact */
@media (max-width: 480px) {
  .trip-card.compact .card-image { width: 30%; min-width: 100px; }
  .trip-card.compact .card-content { width: 70%; padding: 0.6rem; }
  .trip-card.compact h3 { font-size: 0.9rem; }
}
</style>
```

**Ringkasan Perubahan:**
1.  **HomePage.vue**: 
    * Bila klik toggle, layout grid jadi `grid-cols-1 md:grid-cols-2`. Ini akan letak **2 kad dalam 1 baris** (untuk skrin sederhana/besar), bukannya 1 kad panjang yang banyak ruang kosong.
2.  **TripCard.vue**:
    * Mengembalikan `Duration` dalam mode compact.
    * Mengubah CSS `.trip-card.compact` supaya tinggi sikit (`130px`) dan memberi ruang kepada tajuk untuk menjadi 2 baris (`line-clamp: 2`) agar tidak terpotong.
    * Susun atur info lebih kemas dengan Date dan Duration duduk sebelah menyebelah di bawah tajuk.