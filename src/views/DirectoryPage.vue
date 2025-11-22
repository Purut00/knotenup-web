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
          <button :class="{ active: selectedCat === 'Semua' }" @click="selectedCat = 'Semua'">{{ t('directory.catAll') }}</button>
          <button v-for="cat in categories.filter(c => c !== 'Semua')" :key="cat" :class="{ active: selectedCat === cat }" @click="selectedCat = cat">{{ cat }}</button>
        </div>
      </div>
    </div>

    <div class="service-grid">
      <div v-if="loading" style="text-align: center; width: 100%;">⏳ {{ t('common.loading') }}</div>
      
      <div v-else v-for="service in filteredServices" :key="service.id" class="service-card" :class="{ 'expired-card': isExpired(service) }">
        
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
    
    <div v-if="!loading && filteredServices.length === 0" class="empty">
      {{ t('directory.empty') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { MALAYSIA_STATES } from '../constants/data';

const { t } = useI18n();
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
  if(confirm("Padam servis ini?")) {
    try {
      await deleteDoc(doc(db, 'services', id));
      services.value = services.value.filter(s => s.id !== id);
    } catch (e) { alert("Gagal memadam."); }
  }
};

const renewService = async (service: any) => {
  if(confirm("Perbaharui 3 bulan?")) {
    try {
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 90);
      await updateDoc(doc(db, 'services', service.id), { expiryDate: Timestamp.fromDate(newExpiry) });
      service.expiryDate = Timestamp.fromDate(newExpiry);
    } catch (e) { alert("Gagal renew."); }
  }
};

onMounted(async () => {
  try {
    const q = query(collection(db, 'services'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    services.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {}
  finally { loading.value = false; }
});
</script>

<style scoped>
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

.service-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; max-width: 1200px; margin: 0 auto; }
.service-card { background: white; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #eee; display: flex; flex-direction: column; position: relative; transition: transform 0.2s; }
.service-card:hover { transform: translateY(-2px); border-color: #27ae60; }
.service-card.expired-card { opacity: 0.7; border: 2px solid #e74c3c; }
.expired-overlay { position: absolute; top: 0; left: 0; width: 100%; background: #e74c3c; color: white; text-align: center; font-size: 0.7rem; padding: 3px; z-index: 10; }

.card-img { height: 150px; background-size: cover; background-position: center; position: relative; }
.cat-badge { position: absolute; top: 5px; left: 5px; background: rgba(0,0,0,0.6); color: white; padding: 2px 6px; border-radius: 2px; font-size: 0.65rem; }
.state-badge { position: absolute; bottom: 5px; right: 5px; background: #27ae60; color: white; padding: 2px 6px; border-radius: 2px; font-size: 0.65rem; font-weight: bold; }

.card-body { padding: 10px; flex-grow: 1; display: flex; flex-direction: column; }
.title-row { display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px; }
.title-row h3 { margin: 0; font-size: 1rem; color: #333; line-height: 1.3; flex: 1; }

/* Owner Action Buttons */
.owner-actions { display: flex; gap: 5px; }
.btn-delete { background: #fee; border: 1px solid #e74c3c; cursor: pointer; border-radius: 2px; padding: 2px 5px; font-size: 0.8rem; }
.btn-renew { background: #e8f5e9; border: 1px solid #27ae60; cursor: pointer; border-radius: 2px; padding: 2px 5px; font-size: 0.8rem; }

.loc { font-size: 0.8rem; color: #999; margin-bottom: 5px; }
.price { font-size: 1rem; color: #e67e22; font-weight: bold; margin-bottom: 5px; }
.desc { font-size: 0.8rem; color: #555; line-height: 1.4; flex-grow: 1; margin-bottom: 1rem; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; }
.expiry-date { font-size: 0.7rem; color: #e74c3c; font-weight: bold; margin-bottom: 5px; text-align: right; }

.owner-row { display: flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 8px; border-top: 1px dashed #eee; cursor: pointer; }
.owner-row img { width: 20px; height: 20px; border-radius: 50%; }
.owner-name { font-size: 0.75rem; color: #555; font-weight: bold; }
.view-profile-text { font-size: 0.65rem; color: #3498db; margin-left: auto; }

.btn-contact { margin-top: 10px; display: block; text-align: center; background: #25D366; color: white; padding: 6px; border-radius: 2px; text-decoration: none; font-size: 0.85rem; font-weight: bold; }
.btn-contact:hover { background: #1ebc57; }
.btn-contact.disabled { background: #ccc; cursor: not-allowed; }
.empty { text-align: center; color: #999; font-style: italic; margin-top: 2rem; }

@media (max-width: 1024px) { .service-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { .service-grid { grid-template-columns: repeat(2, 1fr); } .filter-container { gap: 10px; } }
</style>