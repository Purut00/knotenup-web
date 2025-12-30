<template>
  <div v-if="visible" class="fixed inset-0 bg-black/80 z-[9999] flex justify-center items-center p-4 backdrop-blur-[5px]" @click.self="close">
      <div class="bg-slate-800/95 border border-white/10 rounded-2xl p-8 w-full max-w-[500px] shadow-2xl text-white flex flex-col animate-fade-in-up">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-[1.3rem] m-0 text-emerald-500">🤝 Hantar Proposal</h3>
          <button class="bg-transparent border-none text-slate-400 text-2xl cursor-pointer hover:text-white" @click="close">✖</button>
        </div>
        
        <div>
          <div class="p-3 bg-white/5 rounded-lg mb-4 text-sm border border-white/5">
             User: <strong class="text-white">{{ request?.userName }}</strong> <br>
             Destinasi: <strong class="text-white">{{ request?.destination }}</strong>
          </div>

          <div class="mb-4">
            <label class="block mb-[5px] text-[0.9rem] text-slate-300">Harga Tawaran (RM)</label>
            <input type="number" v-model="form.price" class="w-full p-[10px] rounded-lg border border-white/10 bg-black/30 text-white outline-none text-[0.95rem] appearance-none focus:border-[#6c63ff]" placeholder="0" />
            <small class="text-gray-400">Bajet asal: <span class="text-green-400">RM {{ request?.budget }}</span></small>
          </div>

          <div class="mb-4">
            <label class="block mb-[5px] text-[0.9rem] text-slate-300">Mesej</label>
            <textarea v-model="form.message" class="w-full p-[10px] rounded-lg border border-white/10 bg-black/30 text-white outline-none text-[0.95rem] appearance-none focus:border-[#6c63ff]" rows="3" placeholder="Saya boleh bawa trip ini..."></textarea>
          </div>
          
          <div class="mb-4">
            <label class="block mb-[5px] text-[0.9rem] text-slate-300">WhatsApp (Optional)</label>
            <input type="text" v-model="form.contact" class="w-full p-[10px] rounded-lg border border-white/10 bg-black/30 text-white outline-none text-[0.95rem] appearance-none focus:border-[#6c63ff]" placeholder="012-3456789" />
          </div>
        </div>

        <div>
          <button class="mt-[10px] p-[12px] border-none rounded-lg w-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold cursor-pointer hover:opacity-90" @click="submit" :disabled="submitting">
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
