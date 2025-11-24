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

    <div class="search-strip-container">
      <div class="container">
        <div class="search-row">
          <div class="search-input-wrapper">
            
            <select v-model="selectedState" class="search-select">
              <option value="">{{ t('directory.allStates') }}</option>
              <option v-for="state in MALAYSIA_STATES" :key="state" :value="state">{{ state }}</option>
            </select>
            
            <input 
              type="text" 
              v-model="searchQuery"
              :placeholder="t('common.search') + '...'" 
            />

            <button class="btn-search-strip">
              {{ t('common.search') }}
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
          <div v-for="service in filteredServices" :key="service.id" class="service-card" :class="{ 'expired-card': isExpired(service) }">
            
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
              <p class="price">{{ service.priceRange }}</p>
              <p class="desc">{{ service.description }}</p>
              
              <p v-if="auth.currentUser && auth.currentUser.uid === service.ownerId" class="expiry-date">
                Luput: {{ formatDate(service.expiryDate) }}
              </p>

              <div class="owner-row" @click.stop="goToProfile(service.ownerId)">
                <img :src="service.ownerAvatar || 'https://i.pravatar.cc/150'" />
                <span class="owner-name">{{ service.ownerName }}</span>
                <span class="view-profile-text">({{ t('common.view') }})</span>
              </div>

              <a :href="`https://wa.me/${service.whatsapp}`" target="_blank" class="btn-contact" v-if="!isExpired(service)">
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
  { name: 'Campsite (Tapak Khemah)', emoji: '⛺' },
  { name: 'Guide / Malim Gunung', emoji: '🧗' },
  { name: 'Boathouse / Pengangkutan', emoji: '🚤' },
  { name: 'Equipment Rental (Sewaan)', emoji: '🎒' },
  { name: 'Chalet / Homestay', emoji: '🏡' }
];

const isExpired = (service: any) => {
  if (!service.expiryDate) return false;
  const now = new Date();
  return now > service.expiryDate.toDate();
};

const formatDate = (timestamp: any) => {
  if(!timestamp) return '-';
  return timestamp.toDate().toLocaleDateString('en-MY');
};

const filteredServices = computed(() => {
  return services.value.filter(s => {
    const matchCat = selectedCat.value === 'Semua' || s.category === selectedCat.value;
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
.top-header-strip { background: white; padding: 1.5rem 0 0.5rem 0; }
.header-flex { display: flex; justify-content: space-between; align-items: center; }
.title-area h1 { margin: 0; font-size: 1.8rem; color: #2c3e50; font-weight: 800; }
.title-area p { margin: 5px 0 0; color: #777; font-size: 0.9rem; }

.btn-create-service { 
  background-color: #e67e22; color: white; border: none; 
  padding: 0.7rem 1.5rem; border-radius: 4px; 
  font-weight: bold; cursor: pointer; transition: transform 0.2s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.btn-create-service:hover { transform: translateY(-2px); background-color: #d35400; }

/* --- 2. SEARCH STRIP (DIKEMASKINI SAMA SEPERTI HOME) --- */
/* Nota: Padding dan margin diselaraskan mengikut Home */

.search-strip-container { 
  background: white; 
  padding: 0.8rem 0; 
  border-bottom: 1px solid #eaeaea; 
  margin-bottom: 1rem; 
  position: sticky; 
  top: 0; 
  z-index: 99; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}

.search-row { 
  display: flex; 
  justify-content: center; 
  padding: 0 1rem;
}

.search-input-wrapper { 
  display: flex; 
  width: 100%; 
  max-width: 800px; 
  border: 2px solid #27ae60; /* SAMA SEPERTI HOME */
  border-radius: 4px; 
  overflow: hidden; 
  background: white;
}

/* Dropdown Negeri (Disesuaikan agar muat dengan height input Home) */
.search-select {
  border: none;
  border-right: 1px solid #eee;
  padding: 0.5rem 1rem; /* Padding dikurangkan ke 0.5rem (asal 0.8rem) */
  background: #fdfdfd;
  color: #555;
  font-weight: bold;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  max-width: 150px;
  /* Appearance standard */
  appearance: auto; 
}

/* Input Teks */
.search-input-wrapper input { 
  flex: 1; 
  border: none; 
  padding: 0.5rem 1rem; /* DIUBAH: 0.8rem -> 0.5rem (SAMA SEPERTI HOME) */
  outline: none; 
  font-size: 0.9rem; 
}

/* Button Search */
.btn-search-strip { 
  background: #27ae60; 
  color: white; 
  border: none; 
  padding: 0 2rem; /* SAMA SEPERTI HOME */
  cursor: pointer; 
  font-size: 0.95rem; 
  font-weight: bold; 
  white-space: nowrap;
}
.btn-search-strip:hover { background: #219150; }


/* 3. KATEGORI */
.category-section { margin-bottom: 2rem; margin-top: 1rem;}
.category-list { 
  display: flex; justify-content: flex-start; gap: 1.5rem; 
  overflow-x: auto; padding: 10px 5px; scrollbar-width: none; 
}
.category-list::-webkit-scrollbar { display: none; }

.cat-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; min-width: 80px; transition: transform 0.1s; }
.cat-item:hover { transform: translateY(-3px); }
.cat-circle { 
  width: 50px; height: 50px; border: 1px solid #eee; border-radius: 12px; 
  display: flex; align-items: center; justify-content: center; 
  font-size: 1.5rem; margin-bottom: 8px; background: #fff; transition: all 0.2s; 
}
.cat-circle.active { border-color: #27ae60; background: #e8f5e9; }
.cat-label { font-size: 0.75rem; color: #555; text-align: center; line-height: 1.2; max-width: 90px; }


/* 4. GRID & CARDS (KEKAL SAMA) */
.service-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.2rem; }

.service-card { background: white; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #eee; display: flex; flex-direction: column; position: relative; transition: transform 0.2s; }
.service-card:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
.service-card.expired-card { opacity: 0.7; filter: grayscale(100%); }

.expired-overlay { position: absolute; top: 0; left: 0; width: 100%; background: #e74c3c; color: white; text-align: center; font-size: 0.7rem; padding: 3px; z-index: 10; font-weight: bold; }
.card-img { height: 160px; background-size: cover; background-position: center; position: relative; }
.cat-badge { position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.7); color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.65rem; }
.state-badge { position: absolute; bottom: 8px; right: 8px; background: #27ae60; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; }

.card-body { padding: 1rem; flex-grow: 1; display: flex; flex-direction: column; }
.title-row { display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px; }
.title-row h3 { margin: 0; font-size: 1rem; color: #2c3e50; font-weight: 700; line-height: 1.3; flex: 1; }
.owner-actions { display: flex; gap: 5px; }
.btn-delete { background: #fee; border: 1px solid #e74c3c; cursor: pointer; border-radius: 2px; padding: 2px 5px; font-size: 0.8rem; }
.btn-renew { background: #e8f5e9; border: 1px solid #27ae60; cursor: pointer; border-radius: 2px; padding: 2px 5px; font-size: 0.8rem; }

.loc { font-size: 0.85rem; color: #777; margin-bottom: 5px; }
.price { font-size: 1rem; color: #e67e22; font-weight: bold; margin-bottom: 8px; }
.desc { font-size: 0.85rem; color: #555; line-height: 1.4; flex-grow: 1; margin-bottom: 1rem; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; }
.expiry-date { font-size: 0.7rem; color: #e74c3c; font-weight: bold; margin-bottom: 8px; text-align: right; }

.owner-row { display: flex; align-items: center; gap: 8px; margin-top: auto; padding-top: 10px; border-top: 1px dashed #eee; cursor: pointer; }
.owner-row:hover { background-color: #f9f9f9; border-radius: 4px; }
.owner-row img { width: 24px; height: 24px; border-radius: 50%; }
.owner-name { font-size: 0.8rem; color: #333; font-weight: 600; }
.view-profile-text { font-size: 0.65rem; color: #3498db; margin-left: auto; }

.btn-contact { margin-top: 12px; display: block; text-align: center; background: #25D366; color: white; padding: 8px; border-radius: 4px; text-decoration: none; font-size: 0.9rem; font-weight: bold; transition: background 0.2s; }
.btn-contact:hover { background: #1ebc57; }
.btn-contact.disabled { background: #ccc; cursor: not-allowed; }

.loading-box, .empty-box { text-align: center; padding: 3rem; color: #999; font-style: italic; }

@media (max-width: 1024px) { .service-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { 
  .header-flex { flex-direction: column; text-align: center; gap: 1rem; } 
  .search-select { display: none; } /* Hide dropdown on mobile if too small, or adjust width */
  .btn-search-strip { padding: 0 1rem; }
  .service-grid { grid-template-columns: repeat(auto-fill, minmax(100%, 1fr)); }
}
</style>