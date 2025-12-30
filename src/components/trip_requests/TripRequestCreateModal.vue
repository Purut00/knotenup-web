<template>
  <div v-if="visible" class="fixed inset-0 bg-black/80 z-[9999] flex justify-center items-center p-4 backdrop-blur-[5px]" @click.self="close">
      <div class="bg-slate-800/95 border border-white/10 rounded-2xl p-8 w-full max-w-[500px] shadow-2xl text-white flex flex-col animate-fade-in-up">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-[1.3rem] m-0 text-white">📋 Cipta Permintaan</h3>
          <button class="bg-transparent border-none text-slate-400 text-2xl cursor-pointer hover:text-white" @click="close">✖</button>
        </div>
        
        <div class="max-h-[60vh] overflow-y-auto pr-[5px] custom-scrollbar">
          
          <div class="mb-4">
            <label class="block mb-[5px] text-[0.9rem] text-slate-300">Jenis Aktiviti</label>
            <div class="relative w-full">
                <select v-model="form.category" class="w-full p-[10px] rounded-lg border border-white/10 bg-black/30 text-white outline-none text-[0.95rem] appearance-none focus:border-[#6c63ff] [&>option]:bg-slate-800 [&>optgroup]:bg-slate-800">
                    <option value="" disabled>Sila Pilih Kategori</option>
                    <optgroup v-for="(group, gIndex) in ACTIVITY_CATEGORIES" :key="gIndex" :label="group.group">
                        <option v-for="(item, iIndex) in group.items" :key="iIndex" :value="item">
                            {{ item }}
                        </option>
                    </optgroup>
                </select>
                <i class="fas fa-chevron-down absolute right-[10px] top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
            </div>
          </div>

          <div class="mb-4">
            <label class="block mb-[5px] text-[0.9rem] text-slate-300">Destinasi (Tempat Spesifik)</label>
            <input type="text" v-model="form.destination" class="w-full p-[10px] rounded-lg border border-white/10 bg-black/30 text-white outline-none text-[0.95rem] appearance-none focus:border-[#6c63ff]" placeholder="Cth: Pulau Perhentian Kecil" />
          </div>

          <div class="grid grid-cols-2 gap-[15px]">
            <div class="mb-4">
              <label class="block mb-[5px] text-[0.9rem] text-slate-300">Negeri</label>
              <div class="relative w-full">
                  <select v-model="form.location" class="w-full p-[10px] rounded-lg border border-white/10 bg-black/30 text-white outline-none text-[0.95rem] appearance-none focus:border-[#6c63ff] [&>option]:bg-slate-800">
                      <option v-for="s in MALAYSIA_STATES" :key="s" :value="s">{{ s }}</option>
                  </select>
                  <i class="fas fa-chevron-down absolute right-[10px] top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </div>
            <div class="mb-4">
              <label class="block mb-[5px] text-[0.9rem] text-slate-300">Tarikh</label>
              <input type="date" v-model="form.date" class="w-full p-[10px] rounded-lg border border-white/10 bg-black/30 text-white outline-none text-[0.95rem] appearance-none focus:border-[#6c63ff]" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-[15px]">
            <div class="mb-4">
              <label class="block mb-[5px] text-[0.9rem] text-slate-300">Bajet (RM)</label>
              <input type="number" v-model="form.budget" class="w-full p-[10px] rounded-lg border border-white/10 bg-black/30 text-white outline-none text-[0.95rem] appearance-none focus:border-[#6c63ff]" placeholder="300" />
            </div>
            <div class="mb-4">
              <label class="block mb-[5px] text-[0.9rem] text-slate-300">Pax</label>
              <input type="number" v-model="form.pax" class="w-full p-[10px] rounded-lg border border-white/10 bg-black/30 text-white outline-none text-[0.95rem] appearance-none focus:border-[#6c63ff]" placeholder="5" />
            </div>
          </div>

          <div class="mb-4">
            <label class="block mb-[5px] text-[0.9rem] text-slate-300">Nota Tambahan</label>
            <textarea v-model="form.note" class="w-full p-[10px] rounded-lg border border-white/10 bg-black/30 text-white outline-none text-[0.95rem] appearance-none focus:border-[#6c63ff]" rows="3" placeholder="Ceritakan detail..."></textarea>
          </div>

          <div class="mb-4 bg-emerald-500/10 p-[10px] rounded-lg border border-emerald-500/30">
             <label class="block mb-[5px] text-[0.9rem] text-emerald-400 font-bold"><i class="fab fa-whatsapp"></i> WhatsApp Contact (Optional)</label>
             <input type="text" v-model="form.whatsapp" class="w-full p-[10px] rounded-lg border border-white/10 bg-black/30 text-white outline-none text-[0.95rem] appearance-none focus:border-[#6c63ff]" placeholder="e.g. 0123456789" />
             <small class="block mt-[5px] text-slate-400 text-xs">
                Jika kosong, organizer akan hubungi anda melalui sistem chat atau email.
             </small>
          </div>
        </div>

        <div>
          <button class="mt-[10px] p-[12px] border-none rounded-lg w-full bg-gradient-to-br from-[#6c63ff] to-[#5b54e0] text-white font-bold cursor-pointer hover:opacity-90" @click="submit" :disabled="submitting">
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
