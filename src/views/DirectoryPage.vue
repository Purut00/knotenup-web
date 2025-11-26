<template>
  <div class="directory-page">
    
    <div class="top-header-strip">
      <div class="container header-flex">
        <div class="title-area">
          <h1>{{ t('directory.title') }}</h1>
          <p>{{ t('directory.sub') }}</p>
        </div>
        
        <button 
          v-if="userRole === 'organizer'" 
          class="btn-create-service" 
          @click="$router.push('/create-service')"
        >
          {{ t('directory.advertiseBtn') }}
        </button>
      </div>
    </div>

    <div class="sticky-search-navbar">
      <div class="container">
        <div class="search-row">
          <div class="search-input-wrapper">
            
            <div class="dropdown-wrapper">
               <select v-model="selectedState" class="search-select">
                  <option value="">{{ t('directory.allStates') }}</option>
                  <option v-for="state in MALAYSIA_STATES" :key="state" :value="state">{{ state }}</option>
               </select>
               <span class="down-arrow">▼</span>
            </div>
            
            <input 
              type="text" 
              v-model="searchQuery"
              :placeholder="t('common.search') + '...'" 
            />

            <button class="btn-search-nav">
              🔍 <span class="btn-text">{{ t('common.search') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <section class="category-section">
        <div class="category-list">
          <div class="cat-item" @click="selectedCat = 'Semua'">
            <div class="cat-circle" :class="{ active: selectedCat === 'Semua' }">🌐</div>
            <span class="cat-label">{{ t('directory.catAll') }}</span>
          </div>
          <div 
            class="cat-item" 
            v-for="cat in categoryIcons" 
            :key="cat.name" 
            @click="selectedCat = cat.name"
          >
            <div class="cat-circle" :class="{ active: selectedCat === cat.name }">{{ cat.emoji }}</div>
            <span class="cat-label">{{ cat.name }}</span>
          </div>
        </div>
      </section>

      <div class="content-area">
        <div v-if="loading" class="loading-box">⏳ {{ t('common.loading') }}</div>
        
        <div v-else class="service-grid">
          
          <div 
            v-for="service in filteredServices" 
            :key="service.id" 
            class="service-card" 
            :class="{ 'expired-card': isExpired(service) }"
            @click="$router.push(`/service/${service.id}`)"
          >
            
            <div v-if="isExpired(service)" class="expired-overlay">⚠️ {{ t('directory.expired') }}</div>

            <div class="card-img" :style="{ backgroundImage: `url(${service.image || 'https://via.placeholder.com/300'})` }">
              <span class="cat-badge">{{ service.category }}</span>
              <span class="state-badge" v-if="service.state">{{ service.state }}</span>
            </div>
            
            <div class="card-body">
              <div class="title-row">
                <h3>{{ service.name }}</h3>
                
                <div v-if="auth.currentUser && auth.currentUser.uid === service.ownerId" class="owner-actions">
                  <button @click.stop="renewService(service)" class="btn-renew" :title="t('directory.renewTooltip')">🔄</button>
                  <button @click.stop="deleteService(service.id)" class="btn-delete" :title="t('directory.deleteTooltip')">🗑️</button>
                </div>
              </div>

              <p class="loc">📍 {{ service.location }}</p>
              
              <p class="price" v-if="service.details && service.details.priceDisplay">
                {{ service.details.priceDisplay }}
              </p>
              <p class="price" v-else-if="service.details && service.details.price">
                RM {{ service.details.price }} {{ service.details.priceType ? '/' + service.details.priceType : '' }}
              </p>

              <p class="desc">{{ service.description }}</p>
              
              <div class="owner-row" @click.stop="goToProfile(service.ownerId)">
                <img :src="service.ownerAvatar || 'https://i.pravatar.cc/150'" />
                <span class="owner-name">{{ service.ownerName }}</span>
              </div>

              <a :href="`https://wa.me/60${service.whatsapp}`" target="_blank" class="btn-contact" v-if="!isExpired(service)" @click.stop>
                📞 {{ t('directory.contactBtn') }}
              </a>
              <button v-else class="btn-contact disabled" disabled>{{ t('directory.inactive') }}</button>
            </div>
          </div>

        </div>
        
        <div v-if="!loading && filteredServices.length === 0" class="empty-box">
          {{ t('directory.empty') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc, Timestamp, getDoc } from 'firebase/firestore';
import { MALAYSIA_STATES } from '../constants/data';

const { t } = useI18n();
const router = useRouter();
const loading = ref(true);
const services = ref<any[]>([]);
const selectedCat = ref('Semua');
const selectedState = ref('');
const searchQuery = ref('');
const userRole = ref('user'); 

const categoryIcons = [
  { name: 'Campsite', emoji: '⛺' },
  { name: 'Guide', emoji: '🧗' },
  { name: 'Transport', emoji: '🚙' },
  { name: 'Rental', emoji: '🎒' },
  { name: 'Chalet', emoji: '🏡' },
  { name: 'Event', emoji: '🚩' }
];

const isExpired = (service: any) => {
  if (!service.expiryDate) return false;
  const now = new Date();
  return now > service.expiryDate.toDate();
};

const filteredServices = computed(() => {
  return services.value.filter(s => {
    // Kategori Logic: Check 'Semua' atau match tepat ATAU support nama lama
    const matchCat = selectedCat.value === 'Semua' || s.category === selectedCat.value || s.category.includes(selectedCat.value);
    
    const matchState = selectedState.value === '' || s.state === selectedState.value;
    const matchSearch = !searchQuery.value || s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || s.location.toLowerCase().includes(searchQuery.value.toLowerCase());

    const isMyService = auth.currentUser && auth.currentUser.uid === s.ownerId;
    const active = !isExpired(s);
    
    return matchCat && matchState && matchSearch && (active || isMyService);
  });
});

const goToProfile = (id: string) => { if (id) router.push(`/user/${id}`); };

const deleteService = async (id: string) => {
  if(confirm("Padam servis ini?")) {
    try { await deleteDoc(doc(db, 'services', id)); services.value = services.value.filter(s => s.id !== id); } catch (e) { alert("Gagal."); }
  }
};

const renewService = async (service: any) => {
  if(confirm("Perbaharui 3 bulan?")) {
    try {
      const newExpiry = new Date(); newExpiry.setDate(newExpiry.getDate() + 90);
      await updateDoc(doc(db, 'services', service.id), { expiryDate: Timestamp.fromDate(newExpiry) });
      service.expiryDate = Timestamp.fromDate(newExpiry); alert("Berjaya renew.");
    } catch (e) { alert("Gagal."); }
  }
};

onMounted(async () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) userRole.value = snap.data().role || 'user';
    } else {
      userRole.value = 'user';
    }
  });

  try {
    const q = query(collection(db, 'services'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    services.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {}
  finally { loading.value = false; }
});
</script>

<style scoped>
.directory-page { background-color: #f5f5f5; min-height: 100vh; padding-bottom: 2rem; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }

/* 1. TOP HEADER */
.top-header-strip { background: #f5f5f5; padding: 2rem 0 1rem 0; }
.header-flex { display: flex; justify-content: space-between; align-items: flex-end; }
.title-area h1 { margin: 0; font-size: 2rem; color: #2c3e50; font-weight: 900; letter-spacing: -1px; }
.title-area p { margin: 5px 0 0; color: #666; font-size: 1rem; }
.btn-create-service { background-color: #e67e22; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 50px; font-weight: bold; cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 10px rgba(230, 126, 34, 0.3); }
.btn-create-service:hover { transform: translateY(-2px); background-color: #d35400; }

/* --- 2. STICKY SEARCH NAVBAR --- */
.sticky-search-navbar { 
  background: rgba(255, 255, 255, 0.95); 
  backdrop-filter: blur(10px);
  padding: 1rem 0; 
  border-bottom: 1px solid #eaeaea; 
  margin-bottom: 1.5rem; 
  position: sticky; 
  top: 0; 
  z-index: 99; 
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.search-row { display: flex; justify-content: center; padding: 0 1rem; }

.search-input-wrapper { 
  display: flex; width: 100%; max-width: 800px; border: 2px solid #27ae60; 
  border-radius: 50px; overflow: hidden; background: white; height: 50px; align-items: center;
}

.dropdown-wrapper { position: relative; border-right: 1px solid #eee; height: 100%; display: flex; align-items: center; background: #fdfdfd; }
.search-select { border: none; background: transparent; padding: 0 2rem 0 1.5rem; font-weight: bold; font-size: 0.9rem; color: #555; cursor: pointer; outline: none; appearance: none; height: 100%; z-index: 2; }
.down-arrow { position: absolute; right: 10px; font-size: 0.7rem; color: #888; pointer-events: none; z-index: 1; }

.search-input-wrapper input { flex: 1; border: none; padding: 0 1.5rem; outline: none; font-size: 1rem; height: 100%; }

.btn-search-nav { 
  background: #27ae60; color: white; border: none; padding: 0 2rem; height: 100%; 
  cursor: pointer; font-size: 1rem; font-weight: bold; display: flex; align-items: center; gap: 5px; transition: background 0.2s;
}
.btn-search-nav:hover { background: #219150; }

/* 3. KATEGORI */
.category-section { margin-bottom: 2rem; }
.category-list { display: flex; justify-content: flex-start; gap: 1.5rem; overflow-x: auto; padding: 10px 5px; scrollbar-width: none; }
.category-list::-webkit-scrollbar { display: none; }
.cat-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; min-width: 80px; transition: transform 0.1s; }
.cat-item:hover { transform: translateY(-3px); }
.cat-circle { width: 50px; height: 50px; border: 1px solid #eee; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 8px; background: #fff; transition: all 0.2s; }
.cat-circle.active { border-color: #27ae60; background: #e8f5e9; }
.cat-label { font-size: 0.75rem; color: #555; text-align: center; }

/* 4. GRID & CARDS */
.service-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }

/* 🔥 CARD STYLE UPDATED: Cursor Pointer 🔥 */
.service-card { 
  background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); 
  border: 1px solid #f0f0f0; display: flex; flex-direction: column; position: relative; 
  transition: transform 0.2s; cursor: pointer; /* Menunjukkan boleh klik */
}
.service-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
.service-card.expired-card { opacity: 0.7; filter: grayscale(100%); }

.expired-overlay { position: absolute; top: 0; left: 0; width: 100%; background: #e74c3c; color: white; text-align: center; font-size: 0.7rem; padding: 3px; z-index: 10; font-weight: bold; }
.card-img { height: 180px; background-size: cover; background-position: center; position: relative; }
.cat-badge { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; }
.state-badge { position: absolute; bottom: 10px; right: 10px; background: #27ae60; color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }

.card-body { padding: 1.2rem; flex-grow: 1; display: flex; flex-direction: column; }
.title-row { display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px; }
.title-row h3 { margin: 0; font-size: 1.1rem; color: #2c3e50; font-weight: 700; line-height: 1.3; flex: 1; }
.owner-actions { display: flex; gap: 5px; z-index: 2; /* Supaya button delete boleh tekan */ }
.btn-delete, .btn-renew { border: 1px solid #ddd; cursor: pointer; border-radius: 4px; padding: 4px 8px; font-size: 0.9rem; background: #fff; z-index: 5; }

.loc { font-size: 0.9rem; color: #777; margin-bottom: 5px; }
.price { font-size: 1.1rem; color: #e67e22; font-weight: 800; margin-bottom: 10px; }
.desc { font-size: 0.9rem; color: #666; line-height: 1.5; flex-grow: 1; margin-bottom: 1.2rem; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; }

.owner-row { display: flex; align-items: center; gap: 10px; margin-top: auto; padding-top: 12px; border-top: 1px solid #f5f5f5; cursor: pointer; z-index: 2; }
.owner-row img { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; }
.owner-name { font-size: 0.85rem; color: #333; font-weight: 600; }

.btn-contact { margin-top: 15px; display: block; text-align: center; background: #25D366; color: white; padding: 10px; border-radius: 8px; text-decoration: none; font-size: 0.95rem; font-weight: bold; transition: background 0.2s; position: relative; z-index: 5; }
.btn-contact:hover { background: #1ebc57; }
.btn-contact.disabled { background: #ccc; cursor: not-allowed; }

.loading-box, .empty-box { text-align: center; padding: 3rem; color: #999; font-style: italic; }

@media (max-width: 768px) { 
  .header-flex { flex-direction: column; text-align: center; gap: 1rem; } 
  .dropdown-wrapper { display: none; } 
  .btn-text { display: none; } 
  .btn-search-nav { padding: 0 1.5rem; }
  .service-grid { grid-template-columns: repeat(auto-fill, minmax(100%, 1fr)); }
}
</style>