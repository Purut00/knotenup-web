<template>
  <div class="service-page">
    
    <!-- 1. HERO SECTION (TEMA SUNSET) -->
    <div class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content container">
        <h1>{{ t('directory.title') }}</h1>
        <p>{{ t('directory.sub') }}</p>
        
        <!-- Advertise Button (White/Glassy to contrast with sunset) -->
        <button v-if="userRole === 'organizer'" class="btn-create-hero" @click="$router.push('/create-service')">
          📢 {{ t('directory.advertiseBtn') }}
        </button>
      </div>
    </div>

    <!-- 2. FLOATING SEARCH BAR (Tema Sunset) -->
    <div class="search-floating-wrapper">
      <div class="container">
        <div class="search-card-pill">
           
           <!-- State Dropdown Segment -->
           <div class="search-segment location-segment">
              <span class="segment-icon">📍</span>
              <div class="segment-content">
                <label>Lokasi</label>
                <select v-model="selectedState" class="search-select">
                   <option value="">{{ t('directory.allStates') }}</option>
                   <option v-for="state in MALAYSIA_STATES" :key="state" :value="state">{{ state }}</option>
                </select>
              </div>
              <span class="chevron-icon">▼</span>
           </div>

           <div class="vertical-divider"></div>

           <!-- Search Input Segment -->
           <div class="search-segment input-segment">
              <span class="segment-icon">🔍</span>
              <div class="segment-content">
                 <label>Carian</label>
                 <input 
                   type="text" 
                   v-model="searchQuery"
                   :placeholder="t('common.search') + '...'" 
                 />
              </div>
           </div>
           
           <!-- Search Button (Gradient Sunset) -->
           <button class="btn-search-circle">
             {{ t('common.search') }}
           </button>
        </div>
      </div>
    </div>

    <div class="container">
      
      <!-- 3. CATEGORY ICONS -->
      <section class="category-section">
        <div class="category-list">
          <div class="cat-item" @click="selectedCat = 'Semua'" :class="{ active: selectedCat === 'Semua' }">
            <span class="cat-emoji">🌐</span>
            <span class="cat-label">{{ t('directory.catAll') }}</span>
          </div>
          <div 
            class="cat-item" 
            v-for="cat in categoryIcons" 
            :key="cat.name" 
            @click="selectedCat = cat.name"
            :class="{ active: selectedCat === cat.name }"
          >
            <span class="cat-emoji">{{ cat.emoji }}</span>
            <span class="cat-label">{{ cat.name }}</span>
          </div>
        </div>
      </section>

      <!-- 4. CONTENT AREA -->
      <div class="content-area">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>{{ t('common.loading') }}</p>
        </div>
        
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
                  <button @click.stop="renewService(service)" class="btn-action">🔄</button>
                  <button @click.stop="deleteService(service.id)" class="btn-action btn-delete">🗑️</button>
                </div>
              </div>

              <p class="loc">📍 {{ service.location }}</p>
              
              <div class="price-tag">
                <span v-if="service.details?.priceDisplay">{{ service.details.priceDisplay }}</span>
                <span v-else>RM {{ service.details?.price }} <small>{{ service.details?.priceType ? '/' + service.details.priceType : '' }}</small></span>
              </div>

              <div class="owner-row" @click.stop="goToProfile(service.ownerId)">
                <img :src="service.ownerAvatar || 'https://i.pravatar.cc/150'" />
                <span class="owner-name">{{ service.ownerName }}</span>
              </div>

              <a :href="`https://wa.me/60${service.whatsapp}`" target="_blank" class="btn-contact" v-if="!isExpired(service)" @click.stop>
                Hubungi
              </a>
            </div>
          </div>
        </div>
        
        <div v-if="!loading && filteredServices.length === 0" class="empty-state">
           <div class="empty-icon">📂</div>
           <h3>{{ t('directory.empty') }}</h3>
           <p>Tiada hasil dijumpai.</p>
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
  return new Date() > service.expiryDate.toDate();
};

const filteredServices = computed(() => {
  return services.value.filter(s => {
    const matchCat = selectedCat.value === 'Semua' || s.category === selectedCat.value || (s.category && s.category.includes(selectedCat.value));
    const matchState = selectedState.value === '' || s.state === selectedState.value;
    const matchSearch = !searchQuery.value || s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || s.location.toLowerCase().includes(searchQuery.value.toLowerCase());
    const isMyService = auth.currentUser && auth.currentUser.uid === s.ownerId;
    return matchCat && matchState && matchSearch && (!isExpired(s) || isMyService);
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
    } else { userRole.value = 'user'; }
  });
  try {
    const q = query(collection(db, 'services'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    services.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {} finally { loading.value = false; }
});
</script>

<style scoped>
.directory-page { background-color: #fcfcfc; min-height: 100vh; font-family: 'Inter', sans-serif; padding-bottom: 3rem; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }

/* --- HERO SECTION (SUNSET THEME) --- */
.hero-section {
  position: relative;
  height: 320px;
  /* Gambar Sunset */
  background-image: url('https://images.unsplash.com/photo-1495570689269-d883668a6810?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
  background-size: cover;
  background-position: center;
  display: flex; align-items: center; justify-content: center; text-align: center; color: white;
}
.hero-overlay { 
  position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
  /* Overlay Gradient Oren-Ungu Gelap */
  background: linear-gradient(to bottom, rgba(230, 126, 34, 0.3), rgba(44, 62, 80, 0.8)); 
}
.hero-content { position: relative; z-index: 1; }
.hero-content h1 { font-size: 2.8rem; font-weight: 800; text-shadow: 0 2px 10px rgba(0,0,0,0.3); margin-bottom: 0.5rem; }
.hero-content p { font-size: 1.2rem; opacity: 0.95; margin-bottom: 1.5rem; }

/* Button Hero: Glassy White/Orange text */
.btn-create-hero { 
  background: rgba(255, 255, 255, 0.9); 
  color: #d35400; /* Dark Orange text */
  border: none; padding: 0.8rem 1.8rem; border-radius: 50px; font-weight: bold; cursor: pointer; transition: transform 0.2s; 
}
.btn-create-hero:hover { transform: translateY(-3px); background: white; color: #e67e22; }

/* --- FLOATING SEARCH BAR --- */
.search-floating-wrapper {
  margin-top: -40px;
  position: sticky; top: 10px; z-index: 999;
  padding-bottom: 1.5rem; pointer-events: none;
}
.search-card-pill {
  pointer-events: auto;
  background: white;
  border-radius: 50px;
  padding: 8px;
  box-shadow: 0 12px 30px rgba(211, 84, 0, 0.15); /* Orange tinted shadow */
  display: flex; align-items: center;
  max-width: 800px; margin: 0 auto;
  border: 1px solid rgba(230, 126, 34, 0.1);
}

/* Segments */
.search-segment { display: flex; align-items: center; padding: 0 15px; position: relative; flex: 1; }
.segment-icon { font-size: 1.2rem; color: #e67e22; margin-right: 12px; } /* Orange Icon */
.segment-content { display: flex; flex-direction: column; width: 100%; }
.segment-content label { font-size: 0.7rem; font-weight: 800; color: #d35400; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px; }

/* Inputs Reset */
.search-select, .input-segment input { 
  border: none; background: transparent; outline: none; 
  font-size: 0.95rem; color: #333; width: 100%; font-weight: 500; padding: 0;
}
.chevron-icon { font-size: 0.7rem; color: #999; margin-left: 5px; }
.vertical-divider { width: 1px; height: 35px; background: #ffe0b2; margin: 0 5px; } /* Light orange divider */

/* Button Search: Gradient Orange */
.btn-search-circle {
  background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
  color: white; border: none;
  border-radius: 50px; padding: 14px 32px;
  font-weight: 700; cursor: pointer; font-size: 1rem;
  margin-left: 10px; transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(230, 126, 34, 0.3);
}
.btn-search-circle:hover { 
  background: linear-gradient(135deg, #d35400 0%, #c0392b 100%);
  transform: translateY(-1px);
}

/* --- ICONS --- */
.category-section { margin-bottom: 2rem; }
.category-list { display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; }
.cat-item { 
  display: flex; flex-direction: column; align-items: center; cursor: pointer; 
  padding: 10px 15px; border-radius: 12px; transition: all 0.2s; 
  background: white; border: 1px solid transparent;
}
.cat-item:hover { transform: translateY(-3px); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.cat-item.active { 
  background: #fff3e0; /* Light Orange BG */
  border-color: #e67e22; 
  box-shadow: 0 4px 10px rgba(230, 126, 34, 0.15); 
}
.cat-emoji { font-size: 1.8rem; margin-bottom: 5px; }
.cat-label { font-size: 0.85rem; color: #555; font-weight: 600; }
.cat-item.active .cat-label { color: #d35400; }

/* --- CARDS --- */
.service-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; }
.service-card { 
  background: white; border-radius: 16px; overflow: hidden; 
  box-shadow: 0 2px 10px rgba(0,0,0,0.03); border: 1px solid #fcfcfc; 
  cursor: pointer; transition: transform 0.2s; display: flex; flex-direction: column; 
}
.service-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.08); }

.card-img { height: 200px; background-size: cover; position: relative; }
.cat-badge { position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.7); color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; backdrop-filter: blur(4px); }
.state-badge { 
  position: absolute; bottom: 12px; right: 12px; 
  background: #e67e22; /* Orange Badge */
  color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; 
}

.card-body { padding: 1.2rem; flex: 1; display: flex; flex-direction: column; }
.title-row { display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px; }
.title-row h3 { margin: 0; font-size: 1.1rem; color: #2c3e50; font-weight: 800; flex: 1; }
.btn-action { background: #f5f5f5; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; margin-left: 5px; padding: 4px; }
.btn-action:hover { background: #eee; }

.loc { color: #7f8c8d; font-size: 0.9rem; margin-bottom: 8px; }
.price-tag { color: #d35400; font-weight: 800; font-size: 1.1rem; margin-bottom: 12px; } /* Darker Orange Price */
.price-tag small { color: #95a5a6; font-weight: normal; font-size: 0.85rem; }

.owner-row { display: flex; align-items: center; gap: 10px; margin-top: auto; padding-top: 12px; border-top: 1px solid #f9f9f9; }
.owner-row img { width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.owner-name { font-size: 0.9rem; font-weight: 600; color: #34495e; }

.btn-contact { 
  margin-top: 15px; 
  background: linear-gradient(135deg, #e67e22 0%, #d35400 100%); /* Orange Gradient */
  color: white; text-align: center; padding: 10px; border-radius: 8px; 
  font-weight: 700; text-decoration: none; transition: opacity 0.2s; display: block; 
}
.btn-contact:hover { opacity: 0.9; }

/* LOADING/EMPTY */
.loading-state, .empty-state { grid-column: 1/-1; text-align: center; padding: 4rem; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #e67e22; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .hero-section { height: 260px; }
  .hero-content h1 { font-size: 2rem; }
  .search-card-pill { flex-direction: column; padding: 15px; border-radius: 20px; gap: 10px; margin: 0 1rem; }
  .vertical-divider { display: none; }
  .search-segment { width: 100%; border-bottom: 1px solid #ffe0b2; padding-bottom: 10px; margin-bottom: 5px; }
  .btn-search-circle { width: 100%; margin: 0; padding: 12px; }
  .service-grid { grid-template-columns: 1fr; }
}
</style>