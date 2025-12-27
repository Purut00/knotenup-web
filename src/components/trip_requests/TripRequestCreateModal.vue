<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="glass-modal fade-up">
        <div class="modal-header">
          <h3>📋 Cipta Permintaan</h3>
          <button class="close-btn" @click="close">✖</button>
        </div>
        
        <div class="modal-body custom-scrollbar">
          
          <div class="form-group">
            <label>Jenis Aktiviti</label>
            <div class="select-wrapper-modal">
                <select v-model="form.category" class="glass-input">
                    <option value="" disabled>Sila Pilih Kategori</option>
                    <optgroup v-for="(group, gIndex) in ACTIVITY_CATEGORIES" :key="gIndex" :label="group.group">
                        <option v-for="(item, iIndex) in group.items" :key="iIndex" :value="item">
                            {{ item }}
                        </option>
                    </optgroup>
                </select>
                <i class="fas fa-chevron-down select-arrow"></i>
            </div>
          </div>

          <div class="form-group">
            <label>Destinasi (Tempat Spesifik)</label>
            <input type="text" v-model="form.destination" class="glass-input" placeholder="Cth: Pulau Perhentian Kecil" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Negeri</label>
              <div class="select-wrapper-modal">
                  <select v-model="form.location" class="glass-input">
                      <option v-for="s in MALAYSIA_STATES" :key="s" :value="s">{{ s }}</option>
                  </select>
                  <i class="fas fa-chevron-down select-arrow"></i>
              </div>
            </div>
            <div class="form-group">
              <label>Tarikh</label>
              <input type="date" v-model="form.date" class="glass-input" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Bajet (RM)</label>
              <input type="number" v-model="form.budget" class="glass-input" placeholder="300" />
            </div>
            <div class="form-group">
              <label>Pax</label>
              <input type="number" v-model="form.pax" class="glass-input" placeholder="5" />
            </div>
          </div>

          <div class="form-group">
            <label>Nota Tambahan</label>
            <textarea v-model="form.note" class="glass-input" rows="3" placeholder="Ceritakan detail..."></textarea>
          </div>

          <div class="form-group" style="background: rgba(16, 185, 129, 0.1); padding: 10px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.3);">
             <label style="color: #4ade80; font-weight: bold;"><i class="fab fa-whatsapp"></i> WhatsApp Contact (Optional)</label>
             <input type="text" v-model="form.whatsapp" class="glass-input" placeholder="e.g. 0123456789" />
             <small style="color: #94a3b8; font-size: 0.75rem; display: block; margin-top: 5px;">
                Jika kosong, organizer akan hubungi anda melalui sistem chat atau email.
             </small>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-submit-modal" @click="submit" :disabled="submitting">
            {{ submitting ? 'Menghantar...' : '🚀 Hantar' }}
          </button>
        </div>
      </div>
      
      <LiabilityModal 
        v-model:visible="showLiabilityModal"
        context="create"
        @proceed="confirmSubmit"
      />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineAsyncComponent } from 'vue';

const LiabilityModal = defineAsyncComponent(() => 
  import('../common/LiabilityModal.vue')
);
import { ACTIVITY_CATEGORIES, MALAYSIA_STATES } from '../../constants/data';
import { auth, db } from '../../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits(['update:visible', 'created']);

const submitting = ref(false);
const showLiabilityModal = ref(false);
const form = reactive({ 
  destination: '', location: 'Selangor', budget: null, pax: null, date: '', note: '', category: '', whatsapp: ''
});

const close = () => {
  emit('update:visible', false);
};

const submit = async () => {
  if (!auth.currentUser) return alert("Sila login.");
  if (!form.destination || !form.budget || !form.category) return alert("Sila isi info wajib.");

  // Open Liability Modal
  showLiabilityModal.value = true;
};

const confirmSubmit = async () => {
  submitting.value = true;
  try {
    const docRef = await addDoc(collection(db, "trip_requests"), {
      ...form,
      userId: auth.currentUser!.uid,
      userName: auth.currentUser!.displayName || 'User',
      userAvatar: auth.currentUser!.photoURL || '',
      createdAt: serverTimestamp(),
      status: 'open',
      offeredBy: [] 
    });
    
    // Reset form
    Object.assign(form, { destination: '', location: 'Selangor', budget: null, pax: null, date: '', note: '', category: '', whatsapp: '' });
    
    emit('created', { id: docRef.id, ...form }); // Optional: pass data back
    close();
    alert("Permintaan berjaya dihantar!");
  } catch (e) {
    console.error(e);
    alert("Gagal menghantar permintaan.");
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 9999;
  display: flex; justify-content: center; align-items: center; padding: 1rem; backdrop-filter: blur(5px);
}
.glass-modal {
  background: rgba(30, 41, 59, 0.95); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px; padding: 2rem; width: 100%; max-width: 500px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5); color: white; display: flex; flex-direction: column;
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.modal-header h3 { font-size: 1.3rem; margin: 0; color: white; }
.close-btn { background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; }

/* Modal Dropdown Wrapper */
.select-wrapper-modal { position: relative; width: 100%; }
.select-arrow { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }

.glass-input {
  width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.3); color: white; outline: none; font-size: 0.95rem; appearance: none;
}
.glass-input:focus { border-color: #6c63ff; }
.glass-input option, .glass-input optgroup { background-color: #1e293b; color: white; }

.btn-submit-modal {
  margin-top: 10px; padding: 12px; border: none; border-radius: 8px; width: 100%;
  background: linear-gradient(135deg, #6c63ff, #5b54e0); color: white; font-weight: bold; cursor: pointer;
}
.btn-submit-modal:hover { opacity: 0.9; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 5px; font-size: 0.9rem; color: #cbd5e1; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }

.custom-scrollbar { max-height: 60vh; overflow-y: auto; padding-right: 5px; }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #6c63ff; border-radius: 5px; }
.fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
</style>
