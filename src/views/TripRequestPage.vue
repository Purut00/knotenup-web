<template>
  <div class="request-page">
    
    <div class="page-header">
      <h1>{{ t('request.title') }}</h1>
      <p>{{ t('request.sub') }}</p>
      <button class="btn-create-request" @click="showModal = true">
        ➕ {{ t('request.createBtn') }}
      </button>
    </div>

    <div class="request-container">
      
      <div class="request-card" v-for="req in requests" :key="req.id">
        <div class="card-header">
          <div class="user-mini">
            <img :src="req.userAvatar" alt="User">
            <span>{{ req.userName }}</span>
          </div>
          <span class="date-badge">{{ req.date }}</span>
        </div>
        
        <h3>Ke: {{ req.destination }}</h3>
        <p class="note">"{{ req.note }}"</p>
        
        <div class="details-grid">
          <div class="detail-item">
            <span>💰 {{ t('request.budget') }}</span>
            <strong>RM {{ req.budget }}</strong>
          </div>
          <div class="detail-item">
            <span>👥 {{ t('request.pax') }}</span>
            <strong>{{ req.pax }}</strong>
          </div>
        </div>

        <button class="btn-offer">🤝 {{ t('request.offerBtn') }}</button>
      </div>

    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-form">
        <h3>{{ t('request.modalTitle') }}</h3>
        
        <div class="form-group">
          <label>{{ t('createTrip.location') }}</label> <input type="text" v-model="newRequest.destination" placeholder="Cth: Pulau Perhentian" />
        </div>

        <div class="row">
          <div class="form-group half">
            <label>{{ t('request.budget') }} (RM)</label>
            <input type="number" v-model="newRequest.budget" placeholder="300" />
          </div>
          <div class="form-group half">
            <label>{{ t('request.pax') }}</label>
            <input type="number" v-model="newRequest.pax" placeholder="5" />
          </div>
        </div>

        <div class="form-group">
          <label>{{ t('createTrip.startDate') }}</label>
          <input type="date" v-model="newRequest.date" />
        </div>

        <div class="form-group">
          <label>{{ t('request.note') }}</label>
          <textarea v-model="newRequest.note" placeholder="Nak pakej fullboard sekali snorkeling..."></textarea>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="showModal = false">{{ t('common.cancel') }}</button>
          <button class="btn-submit" @click="submitRequest">{{ t('common.submit') }}</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n'; // 1. Import i18n

const { t } = useI18n(); // 2. Activate function t
const showModal = ref(false);

// Data Dummy Requests
const requests = ref([
  {
    id: 1,
    userName: 'Siti Nurhaliza',
    userAvatar: 'https://i.pravatar.cc/150?img=5',
    destination: 'Gunung Datuk',
    date: 'Disember 2025',
    budget: 50,
    pax: 3,
    note: 'Mencari guide yang santai untuk beginner.'
  },
  {
    id: 2,
    userName: 'Ah Chong',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    destination: 'Lombok, Indonesia',
    date: 'Januari 2026',
    budget: 1500,
    pax: 10,
    note: 'Trip company, nak pakej lengkap makan minum.'
  }
]);

const newRequest = reactive({
  destination: '',
  budget: null,
  pax: null,
  date: '',
  note: ''
});

const submitRequest = () => {
  // Add to list (Simulasi)
  requests.value.unshift({
    id: Date.now(),
    userName: 'Anda (User)',
    userAvatar: 'https://i.pravatar.cc/150?img=11',
    destination: newRequest.destination,
    date: newRequest.date || 'Tarikh Bebas',
    budget: newRequest.budget || 0,
    pax: newRequest.pax || 1,
    note: newRequest.note
  });
  
  showModal.value = false;
  alert("Request berjaya dihantar! Organizer akan menghubungi anda.");
};
</script>

<style scoped>
.request-page { background-color: #f4f6f8; min-height: 100vh; padding: 2rem; }

.page-header { text-align: center; margin-bottom: 3rem; }
.page-header h1 { color: #2c3e50; margin-bottom: 0.5rem; }
.page-header p { color: #666; margin-bottom: 1.5rem; }

.btn-create-request {
  background: #e67e22; color: white; border: none; padding: 0.8rem 2rem;
  border-radius: 50px; font-weight: bold; cursor: pointer; font-size: 1rem;
  box-shadow: 0 4px 15px rgba(230, 126, 34, 0.3); transition: transform 0.2s;
}
.btn-create-request:hover { transform: translateY(-3px); background: #d35400; }

/* GRID SYSTEM */
.request-container {
  max-width: 1000px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;
}

.request-card {
  background: white; padding: 1.5rem; border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #eee;
  display: flex; flex-direction: column;
}

.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.user-mini { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: bold; color: #333; }
.user-mini img { width: 30px; height: 30px; border-radius: 50%; }
.date-badge { background: #f0f2f5; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; color: #666; }

h3 { margin: 0 0 0.5rem 0; color: #2c3e50; }
.note { font-style: italic; color: #666; font-size: 0.9rem; flex-grow: 1; margin-bottom: 1rem; }

.details-grid { display: flex; gap: 1rem; background: #f9f9f9; padding: 0.8rem; border-radius: 8px; margin-bottom: 1rem; }
.detail-item { flex: 1; display: flex; flex-direction: column; font-size: 0.85rem; }
.detail-item span { color: #888; font-size: 0.75rem; }

.btn-offer { width: 100%; padding: 0.6rem; background: #2c3e50; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-offer:hover { background: #34495e; }

/* MODAL STYLE */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 100; }
.modal-form { background: white; padding: 2rem; border-radius: 12px; width: 100%; max-width: 500px; }
.modal-form h3 { margin-top: 0; margin-bottom: 1.5rem; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 1rem; }

.form-group { margin-bottom: 1rem; }
label { display: block; font-weight: bold; font-size: 0.9rem; margin-bottom: 5px; }
input, textarea { width: 100%; padding: 0.7rem; border: 1px solid #ccc; border-radius: 6px; }
.row { display: flex; gap: 10px; }
.half { flex: 1; }

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 1.5rem; }
.btn-cancel { background: #eee; color: #333; border: none; padding: 0.7rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-submit { background: #e67e22; color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: bold; }
</style>