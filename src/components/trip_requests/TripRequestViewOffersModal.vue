<template>
  <div v-if="visible" class="fixed inset-0 bg-black/80 z-[9999] flex justify-center items-center p-4 backdrop-blur-[5px]" @click.self="close">
      <div class="bg-slate-800/95 border border-white/10 rounded-2xl p-8 w-full max-w-[600px] shadow-2xl text-white flex flex-col animate-fade-in-up">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-[1.3rem] m-0 text-white">📨 Senarai Tawaran</h3>
          <button class="bg-transparent border-none text-slate-400 text-2xl cursor-pointer hover:text-white" @click="close">✖</button>
        </div>
        
        <div class="max-h-[60vh] overflow-y-auto pr-[5px] custom-scrollbar">
           <div v-if="loading" class="text-center text-white py-4">Memuatkan...</div>
           <div v-else-if="offers.length === 0" class="text-center text-gray-400 py-4">Tiada tawaran lagi.</div>
           
           <div v-else>
             <div class="bg-white/5 p-4 rounded-xl mb-[10px] border border-white/5" v-for="offer in offers" :key="offer.id">
                <div class="flex justify-between items-center mb-2">
                   <div class="flex items-center gap-[10px] cursor-pointer" @click="goToProfile(offer.organizerId)">
                      <img :src="offer.organizerAvatar || 'https://i.pravatar.cc/150'" class="w-10 h-10 rounded-full border border-white/20 object-cover">
                      <div>
                          <div class="font-bold text-white">{{ offer.organizerName }}</div>
                          <div class="text-xs text-gray-400">{{ formatDate(offer.createdAt) }}</div>
                      </div>
                   </div>
                   <div class="font-bold text-green-400 text-[1.1rem]">RM {{ offer.offeredPrice }}</div>
                </div>
                <div class="bg-black/20 p-2 rounded-md text-slate-300 italic text-[0.9rem] mb-[10px]">"{{ offer.message }}"</div>
                <div class="flex gap-[10px]">
                   <button class="flex-1 p-[6px] bg-white/10 border-none rounded-md text-white cursor-pointer hover:bg-white/20" @click="openWhatsapp(offer)">📲 Chat</button>
                   <button class="flex-1 p-[6px] border-none rounded-md text-white cursor-pointer bg-emerald-500 hover:bg-emerald-600" @click="acceptOffer(offer)">✅ Terima</button>
                </div>
             </div>
           </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../../firebaseConfig';
import { collection, updateDoc, doc, addDoc, getDocs, serverTimestamp, orderBy, query } from 'firebase/firestore';

const props = defineProps<{
  visible: boolean;
  request: any;
}>();

const emit = defineEmits(['update:visible', 'accepted']);

const router = useRouter();
const offers = ref<any[]>([]);
const loading = ref(false);

const close = () => emit('update:visible', false);

const fetchOffers = async () => {
    if (!props.request?.id) return;
    loading.value = true;
    try {
        const q = query(collection(db, "trip_requests", props.request.id, "offers"), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        offers.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { console.error(e); }
    finally { loading.value = false; }
};

watch(() => props.visible, (val) => {
    if (val) fetchOffers();
});

const formatDate = (timestamp: any) => {
  if (!timestamp) return 'Baru saja';
  const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date();
  return date.toLocaleDateString("en-MY", { day: 'numeric', month: 'short' });
};

const goToProfile = (userId: string) => {
  if(userId) router.push(`/user/${userId}`);
};

const openWhatsapp = (offer: any) => {
  if (!offer.contact) return alert("Tiada nombor telefon.");
  let finalPhone = offer.contact.replace(/\D/g, ''); 
  if (finalPhone.startsWith('01')) finalPhone = '6' + finalPhone;
  const text = `Hai ${offer.organizerName}, saya terima tawaran anda untuk trip ke ${props.request.destination}.`;
  window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`, '_blank');
};

const acceptOffer = async (offer: any) => {
  if(!confirm(`Terima tawaran dari ${offer.organizerName}? Iklan akan ditutup.`)) return;
  const currentUser = auth.currentUser;
  if (!currentUser) return alert("Sila login semula.");

  try {
    const reqRef = doc(db, "trip_requests", props.request.id);
    await updateDoc(reqRef, {
      status: 'accepted',
      acceptedOfferId: offer.id,
      acceptedOrganizerId: offer.organizerId,
      acceptedAt: serverTimestamp()
    });
    
    await addDoc(collection(db, "trips"), {
      title: `Private: ${props.request.destination}`,
      destination: props.request.destination,
      description: `Request User. Note: ${props.request.note}`,
      startDate: props.request.dateString || new Date().toISOString().split('T')[0],
      price: offer.offeredPrice,
      organizerId: offer.organizerId,
      organizerName: offer.organizerName,
      organizerAvatar: offer.organizerAvatar,
      participants: [currentUser.uid], 
      type: 'private',
      status: 'upcoming',
      createdAt: serverTimestamp()
    });

    alert("Deal confirm! Trip dimasukkan ke senarai.");
    emit('accepted');
    close();
  } catch(e) { 
      console.error(e);
      alert("Gagal menerima tawaran."); 
  }
};
</script>
