<template>
  <div class="directory-page">
    <div class="header-section">
      <h1>{{ t('directory.title') }}</h1>
      <p>{{ t('directory.sub') }}</p>
      
      <button class="btn-create-service" @click="$router.push('/create-service')">
        {{ t('directory.advertiseBtn') }}
      </button>

      <div class="filter-container">
        <div class="state-select-wrapper">
          <select v-model="selectedState" class="state-select">
            <option value="">{{ t('directory.allStates') }}</option>
            <option v-for="state in MALAYSIA_STATES" :key="state" :value="state">{{ state }}</option>
          </select>
        </div>
        <div class="category-pills">
          <button :class="{ active: selectedCat === 'Semua' }" @click="selectedCat = 'Semua'">
            {{ t('directory.catAll') }}
          </button>
          
          <button 
            v-for="cat in categories.filter(c => c !== 'Semua')" :key="cat"
            :class="{ active: selectedCat === cat }"
            @click="selectedCat = cat"
          >
            {{ cat }}
          </button>
        </div>
      </div>
    </div>

    <div class="service-grid">
      <div v-if="loading" style="text-align: center; width: 100%;">⏳ {{ t('common.loading') }}</div>
      
      <div v-else v-for="service in filteredServices" :key="service.id" class="service-card" :class="{ 'expired-card': isExpired(service) }">
        
        <div v-if="isExpired(service)" class="expired-overlay">
          ⚠️ {{ t('directory.expired') }}
        </div>

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
    
    <div v-if="!loading && filteredServices.length === 0" class="empty">
      {{ t('directory.empty') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'; // Import
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { MALAYSIA_STATES } from '../constants/data';

const { t } = useI18n(); // Activate
const router = useRouter();
const loading = ref(true);
const services = ref<any[]>([]);
const selectedCat = ref('Semua');
const selectedState = ref('');

const categories = ['Semua', 'Campsite (Tapak Khemah)', 'Guide / Malim Gunung', 'Boathouse / Pengangkutan', 'Equipment Rental (Sewaan)', 'Chalet / Homestay'];

const isExpired = (service: any) => {
  if (!service.expiryDate) return false;
  const now = new Date();
  const expiry = service.expiryDate.toDate();
  return now > expiry;
};

const formatDate = (timestamp: any) => {
  if(!timestamp) return '-';
  return timestamp.toDate().toLocaleDateString('en-MY');
};

const filteredServices = computed(() => {
  return services.value.filter(s => {
    const matchCat = selectedCat.value === 'Semua' || s.category === selectedCat.value;
    const matchState = selectedState.value === '' || s.state === selectedState.value;
    const isMyService = auth.currentUser && auth.currentUser.uid === s.ownerId;
    const active = !isExpired(s);
    return matchCat && matchState && (active || isMyService);
  });
});

const goToProfile = (id: string) => { if (id) router.push(`/user/${id}`); };

const deleteService = async (id: string) => {
  if(confirm("Adakah anda pasti ingin memadam servis ini selama-lamanya?")) {
    try {
      await deleteDoc(doc(db, 'services', id));
      services.value = services.value.filter(s => s.id !== id);
      alert("Servis dipadam.");
    } catch (e) { alert("Gagal memadam."); }
  }
};

const renewService = async (service: any) => {
  if(confirm("Perbaharui servis ini selama 3 bulan lagi?")) {
    try {
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 90);
      await updateDoc(doc(db, 'services', service.id), { expiryDate: Timestamp.fromDate(newExpiry) });
      service.expiryDate = Timestamp.fromDate(newExpiry);
      alert("Servis berjaya diperbaharui.");
    } catch (e) { alert("Gagal renew."); }
  }
};

onMounted(async () => {
  try {
    const q = query(collection(db, 'services'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    services.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
});
</script>

<style scoped>
/* CSS KEKAL SAMA (Tiada perubahan perlu) */
.directory-page { background: #f4f6f8; min-height: 100vh; padding: 2rem; }
.header-section { text-align: center; margin-bottom: 2rem; }
.header-section h1 { color: #2c3e50; margin-bottom: 0.5rem; }
.btn-create-service { margin-top: 1rem; background-color: #e67e22; color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 50px; font-weight: bold; cursor: pointer; transition: transform 0.2s; }
.btn-create-service:hover { transform: translateY(-2px); background-color: #d35400; }
.filter-container { margin-top: 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.state-select { padding: 0.5rem 1rem; border-radius: 50px; border: 1px solid #27ae60; font-size: 1rem; outline: none; color: #2c3e50; background: white; min-width: 200px; text-align: center; font-weight: bold; }
.category-pills { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
.category-pills button { background: white; border: 1px solid #ddd; padding: 0.5rem 1rem; border-radius: 20px; cursor: pointer; font-size: 0.9rem; color: #555; transition: all 0.2s; }
.category-pills button.active { background: #27ae60; color: white; border-color: #27ae60; }
.service-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; max-width: 1200px; margin: 0 auto; }
.service-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #eee; display: flex; flex-direction: column; position: relative; }
.service-card.expired-card { opacity: 0.7; border: 2px solid #e74c3c; }
.expired-overlay { position: absolute; top: 0; left: 0; width: 100%; background: #e74c3c; color: white; text-align: center; font-weight: bold; font-size: 0.8rem; padding: 5px; z-index: 10; }
.card-img { height: 180px; background-size: cover; background-position: center; position: relative; }
.cat-badge { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.7rem; }
.state-badge { position: absolute; bottom: 10px; right: 10px; background: #27ae60; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; }
.card-body { padding: 1.2rem; flex-grow: 1; display: flex; flex-direction: column; }
.title-row { display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px; }
.title-row h3 { margin: 0; font-size: 1.1rem; color: #2c3e50; flex: 1; }
.owner-actions { display: flex; gap: 5px; }
.btn-delete { background: #fee; border: 1px solid #e74c3c; cursor: pointer; border-radius: 4px; padding: 2px 6px; }
.btn-renew { background: #e8f5e9; border: 1px solid #27ae60; cursor: pointer; border-radius: 4px; padding: 2px 6px; }
.loc { color: #777; font-size: 0.9rem; margin-bottom: 5px; }
.price { color: #e67e22; font-weight: bold; font-size: 1rem; margin-bottom: 10px; }
.desc { font-size: 0.85rem; color: #555; line-height: 1.4; flex-grow: 1; margin-bottom: 1rem; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; line-clamp: 3; overflow: hidden; }
.expiry-date { font-size: 0.75rem; color: #e74c3c; font-weight: bold; margin-bottom: 10px; text-align: right; }
.owner-row { display: flex; align-items: center; gap: 8px; margin-bottom: 1rem; font-size: 0.8rem; color: #666; border-top: 1px solid #f0f0f0; padding-top: 10px; cursor: pointer; transition: background 0.2s; }
.owner-row:hover { background-color: #f9f9f9; border-radius: 4px; }
.owner-row img { width: 24px; height: 24px; border-radius: 50%; }
.owner-name { font-weight: bold; color: #2c3e50; }
.view-profile-text { font-size: 0.7rem; color: #3498db; margin-left: auto; }
.btn-contact { display: block; text-align: center; background: #25D366; color: white; padding: 0.8rem; border-radius: 6px; text-decoration: none; font-weight: bold; transition: background 0.2s; }
.btn-contact:hover { background: #1ebc57; }
.btn-contact.disabled { background: #ccc; cursor: not-allowed; }
.empty { text-align: center; color: #999; font-style: italic; margin-top: 2rem; }
</style>