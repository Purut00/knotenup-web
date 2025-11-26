<template>
  <div class="request-page">
    
    <div class="hero-header">
      <div class="hero-overlay">
        <h1 class="animate-up">{{ t('request.title') }}</h1>
        <p class="animate-up delay-1">{{ t('request.sub') }}</p>
        
        <button class="btn-hero animate-up delay-2" @click="showModal = true">
          ➕ {{ t('request.createBtn') }}
        </button>
      </div>
    </div>

    <div class="content-container">
      
      <div v-if="loading" class="loading-box">
        <div class="spinner"></div>
        <p>{{ t('common.loading') }}</p>
      </div>

      <div v-else class="request-grid">
        
        <div v-if="requests.length === 0" class="empty-state">
          <p>Belum ada permintaan. Jadilah yang pertama!</p>
        </div>

        <div class="req-card" v-for="req in requests" :key="req.id">
          <div class="card-top">
            <div class="user-info">
              <img :src="req.userAvatar || 'https://i.pravatar.cc/150?img=3'" class="avatar">
              <div class="user-meta">
                <span class="name">{{ req.userName }}</span>
                <span class="time">{{ formatDate(req.createdAt) }}</span>
              </div>
            </div>
            <div class="budget-pill">
              RM {{ req.budget }}
            </div>
          </div>
          
          <div class="card-body">
            <h3 class="dest-title">Ke: {{ req.destination }}</h3>
            <div class="info-pills">
              <span>👥 {{ req.pax }} Pax</span>
              <span>📅 {{ req.dateString }}</span>
            </div>
            <p class="note-text">"{{ req.note }}"</p>
          </div>

          <div class="card-footer">
            <button class="btn-offer" @click="handleOffer(req)">
              🤝 {{ t('request.offerBtn') }}
            </button>
          </div>
        </div>

      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modern-modal fade-up">
        <div class="modal-header">
          <h3>{{ t('request.modalTitle') }}</h3>
          <button class="close-btn" @click="showModal = false">✖</button>
        </div>
        
        <div class="modal-body">
          <div class="input-wrap">
            <label>{{ t('createTrip.location') }}</label>
            <input type="text" v-model="newRequest.destination" class="clean-input" placeholder="Cth: Pulau Perhentian" />
          </div>

          <div class="grid-2">
            <div class="input-wrap">
              <label>{{ t('request.budget') }} (RM)</label>
              <input type="number" v-model="newRequest.budget" class="clean-input" placeholder="300" />
            </div>
            <div class="input-wrap">
              <label>{{ t('request.pax') }}</label>
              <input type="number" v-model="newRequest.pax" class="clean-input" placeholder="5" />
            </div>
          </div>

          <div class="input-wrap">
            <label>{{ t('createTrip.startDate') }}</label>
            <input type="date" v-model="newRequest.date" class="clean-input" />
          </div>

          <div class="input-wrap">
            <label>{{ t('request.note') }}</label>
            <textarea v-model="newRequest.note" class="clean-input" rows="3" placeholder="Nak pakej fullboard sekali snorkeling..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-submit" @click="submitRequest" :disabled="submitting">
            {{ submitting ? t('common.loading') : t('common.submit') }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';

const { t } = useI18n();
const showModal = ref(false);
const loading = ref(true);
const submitting = ref(false);
const requests = ref<any[]>([]);

const newRequest = reactive({ destination: '', budget: null, pax: null, date: '', note: '' });

const formatDate = (timestamp: any) => {
  if (!timestamp) return 'Baru saja';
  const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date();
  return date.toLocaleDateString("en-MY", { day: 'numeric', month: 'short' });
};

const fetchRequests = async () => {
  loading.value = true;
  try {
    const q = query(collection(db, "trip_requests"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const fetchedData: any[] = [];
    querySnapshot.forEach((doc) => { fetchedData.push({ id: doc.id, ...doc.data() }); });
    requests.value = fetchedData;
  } catch (e) { console.error(e); } finally { loading.value = false; }
};

onMounted(() => { fetchRequests(); });

const submitRequest = async () => {
  if (!auth.currentUser) return alert("Sila login untuk buat request.");
  if (!newRequest.destination || !newRequest.budget) return alert("Sila isi destinasi dan bajet.");

  submitting.value = true;
  try {
    await addDoc(collection(db, "trip_requests"), {
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'User',
      userAvatar: auth.currentUser.photoURL || '',
      destination: newRequest.destination,
      budget: newRequest.budget,
      pax: newRequest.pax || 1,
      dateString: newRequest.date || 'Tarikh Bebas',
      note: newRequest.note,
      createdAt: serverTimestamp()
    });
    alert("Request berjaya dihantar!");
    showModal.value = false;
    newRequest.destination = ''; newRequest.note = '';
    fetchRequests();
  } catch (e) { alert("Gagal menghantar request."); } finally { submitting.value = false; }
};

const handleOffer = (req: any) => { alert(`Feature coming soon! Offer trip ke ${req.userName}.`); };
</script>

<style scoped>
/* BASE LAYOUT */
.request-page { background-color: #f8f9fa; min-height: 100vh; padding-bottom: 4rem; }

/* --- HERO HEADER FIXED --- */
.hero-header {
  height: 300px;
  background-image: url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000');
  background-size: cover; 
  background-position: center; 
  position: relative;
  
  /* 🔥 FIX UTAMA: Z-INDEX 0 SUPAYA DUDUK BELAKANG NAVBAR 🔥 */
  z-index: 0; 
  
  /* Elak content terkeluar */
  overflow: hidden;
  
  display: flex; align-items: center; justify-content: center; text-align: center;
  margin-bottom: 2rem; 
}

.hero-overlay {
  background: rgba(0,0,0,0.5); padding: 3rem; width: 100%; height: 100%;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
}
.hero-overlay h1 { font-size: 3rem; color: white; margin: 0 0 10px 0; font-weight: 800; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
.hero-overlay p { color: rgba(255,255,255,0.9); font-size: 1.2rem; margin-bottom: 2rem; }

/* 🔥 BUTANG HIJAU 🔥 */
.btn-hero {
  background: #27ae60; /* Hijau Rasmi */
  color: white; border: none; padding: 1rem 2.5rem;
  border-radius: 50px; font-weight: bold; cursor: pointer; font-size: 1rem;
  box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4); transition: transform 0.2s;
}
.btn-hero:hover { transform: translateY(-3px); background: #219150; }

/* CONTENT GRID */
.content-container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; position: relative; z-index: 10; }
.request-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }

/* REQUEST CARD MODERN */
.req-card {
  background: white; border-radius: 16px; overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05); transition: transform 0.2s; border: 1px solid #f0f0f0;
  display: flex; flex-direction: column;
}
.req-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0,0,0,0.1); }

.card-top { padding: 1.2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f9f9f9; }
.user-info { display: flex; align-items: center; gap: 10px; }
.avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #eee; }
.user-meta { display: flex; flex-direction: column; }
.name { font-weight: bold; font-size: 0.9rem; color: #2c3e50; }
.time { font-size: 0.75rem; color: #95a5a6; }
.budget-pill { background: #e8f5e9; color: #27ae60; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 0.85rem; }

.card-body { padding: 1.5rem; flex-grow: 1; }
.dest-title { margin: 0 0 10px 0; font-size: 1.3rem; color: #2c3e50; }
.info-pills { display: flex; gap: 10px; margin-bottom: 1rem; }
.info-pills span { background: #f8f9fa; color: #666; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; border: 1px solid #eee; }
.note-text { font-style: italic; color: #7f8c8d; line-height: 1.5; font-size: 0.95rem; }

.card-footer { padding: 1.2rem; background: #fcfcfc; border-top: 1px solid #f0f0f0; }
.btn-offer { width: 100%; padding: 0.8rem; background: #2c3e50; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
.btn-offer:hover { background: #34495e; }

/* LOADING & EMPTY */
.loading-box, .empty-state { text-align: center; padding: 4rem; color: #999; width: 100%; grid-column: 1/-1; }
.spinner { width: 40px; height: 40px; border: 4px solid #eee; border-top: 4px solid #e67e22; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px auto; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ANIMATIONS */
.animate-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(30px); }
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
@keyframes slideUp { to { opacity: 1; transform: translateY(0); } }

/* MODERN MODAL */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: center; z-index: 999; /* Z-Index Tinggi untuk Modal */ }
.modern-modal { background: white; border-radius: 16px; width: 100%; max-width: 500px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
.modal-header { padding: 1.5rem; background: #2c3e50; color: white; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; }
.close-btn { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; }
.modal-body { padding: 2rem; }
.modal-footer { padding: 1.5rem; background: #f9f9f9; text-align: right; }

.input-wrap { margin-bottom: 1rem; }
.input-wrap label { display: block; font-size: 0.85rem; font-weight: bold; color: #555; margin-bottom: 5px; }
.clean-input { width: 100%; padding: 0.8rem; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 1rem; outline: none; transition: border 0.2s; }
.clean-input:focus { border-color: #e67e22; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.btn-submit { background: #e67e22; color: white; border: none; padding: 0.8rem 2rem; border-radius: 50px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
.btn-submit:hover { background: #d35400; }
.btn-submit:disabled { background: #ccc; cursor: not-allowed; }

@media (max-width: 768px) {
  .hero-header { height: 250px; }
  .hero-overlay h1 { font-size: 2rem; }
  .request-grid { grid-template-columns: 1fr; }
}
</style>