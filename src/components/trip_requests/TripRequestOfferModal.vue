<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="glass-modal fade-up">
        <div class="modal-header header-offer">
          <h3>🤝 Hantar Proposal</h3>
          <button class="close-btn" @click="close">✖</button>
        </div>
        
        <div class="modal-body">
          <div class="offer-context p-3 bg-white/5 rounded-lg mb-4 text-sm border border-white/5">
             User: <strong class="text-white">{{ request?.userName }}</strong> <br>
             Destinasi: <strong class="text-white">{{ request?.destination }}</strong>
          </div>

          <div class="form-group mt-4">
            <label>Harga Tawaran (RM)</label>
            <input type="number" v-model="form.price" class="glass-input" placeholder="0" />
            <small class="text-gray-400">Bajet asal: <span class="text-green-400">RM {{ request?.budget }}</span></small>
          </div>

          <div class="form-group">
            <label>Mesej</label>
            <textarea v-model="form.message" class="glass-input" rows="3" placeholder="Saya boleh bawa trip ini..."></textarea>
          </div>
          
          <div class="form-group">
            <label>WhatsApp (Optional)</label>
            <input type="text" v-model="form.contact" class="glass-input" placeholder="012-3456789" />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-submit-modal btn-green" @click="submit" :disabled="submitting">
            {{ submitting ? 'Menghantar...' : 'Hantar Tawaran' }}
          </button>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { auth, db } from '../../firebaseConfig';
import { collection, addDoc, updateDoc, doc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { getEffectiveUserProfile } from '../../utils/userProfile';

const props = defineProps<{
  visible: boolean;
  request: any;
}>();

const emit = defineEmits(['update:visible', 'offered']);

const submitting = ref(false);
const form = reactive({ price: null, message: '', contact: '' });

const close = () => {
  emit('update:visible', false);
};

const submit = async () => {
  if (!auth.currentUser) return alert("Sila login.");
  if (!form.price || !form.message) return alert("Sila isi harga dan mesej.");

  submitting.value = true;
  try {
    const reqId = props.request.id;
    // 0. Get effective profile
    const userProfile = await getEffectiveUserProfile(auth.currentUser);

    // 1. Tambah offer ke subcollection
    await addDoc(collection(db, "trip_requests", reqId, "offers"), {
       offeredPrice: form.price,
       message: form.message,
       contact: form.contact,
       organizerId: auth.currentUser.uid,
       organizerName: userProfile.name,
       organizerAvatar: userProfile.avatar,
       createdAt: serverTimestamp(),
       status: 'pending'
    });

    // 2. Update parent doc untuk flag (cache that this user offered)
    await updateDoc(doc(db, "trip_requests", reqId), {
       offeredBy: arrayUnion(auth.currentUser.uid)
    });

    Object.assign(form, { price: null, message: '', contact: '' });
    emit('offered', reqId);
    close();
    alert("Tawaran berjaya dihantar!");
  } catch (e) {
    console.error(e);
    alert("Gagal menghantar tawaran.");
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
.glass-input {
  width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.3); color: white; outline: none; font-size: 0.95rem; appearance: none;
}
.glass-input:focus { border-color: #6c63ff; }
.btn-submit-modal {
  margin-top: 10px; padding: 12px; border: none; border-radius: 8px; width: 100%;
  background: linear-gradient(135deg, #10b981, #059669); color: white; font-weight: bold; cursor: pointer;
}
.btn-submit-modal:hover { opacity: 0.9; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 5px; font-size: 0.9rem; color: #cbd5e1; }
.header-offer h3 { color: #10b981; }
.fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
</style>
