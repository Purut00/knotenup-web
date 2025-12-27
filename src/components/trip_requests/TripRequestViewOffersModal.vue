<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="glass-modal fade-up modal-wide">
        <div class="modal-header header-view">
          <h3>📨 Senarai Tawaran</h3>
          <button class="close-btn" @click="close">✖</button>
        </div>
        
        <div class="modal-body custom-scrollbar">
           <div v-if="loading" class="text-center text-white py-4">Memuatkan...</div>
           <div v-else-if="offers.length === 0" class="text-center text-gray-400 py-4">Tiada tawaran lagi.</div>
           
           <div v-else class="offers-list">
             <div class="offer-card" v-for="offer in offers" :key="offer.id">
                <div class="offer-top">
                   <div class="offer-user" @click="goToProfile(offer.organizerId)">
                      <img :src="offer.organizerAvatar || 'https://i.pravatar.cc/150'" class="avatar-sm">
                      <div>
                          <div class="font-bold text-white">{{ offer.organizerName }}</div>
                          <div class="text-xs text-gray-400">{{ formatDate(offer.createdAt) }}</div>
                      </div>
                   </div>
                   <div class="offer-price-tag">RM {{ offer.offeredPrice }}</div>
                </div>
                <div class="offer-msg">"{{ offer.message }}"</div>
                <div class="offer-actions">
                   <button class="btn-sm-glass" @click="openWhatsapp(offer)">📲 Chat</button>
                   <button class="btn-sm-glass btn-accept" @click="acceptOffer(offer)">✅ Terima</button>
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
.modal-wide { max-width: 600px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.modal-header h3 { font-size: 1.3rem; margin: 0; color: white; }
.close-btn { background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; }

/* Offer List */
.offer-card { background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.05); }
.offer-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.offer-user { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.offer-price-tag { font-weight: bold; color: #4ade80; font-size: 1.1rem; }
.offer-msg { background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; color: #cbd5e1; font-style: italic; font-size: 0.9rem; margin-bottom: 10px; }
.offer-actions { display: flex; gap: 10px; }
.btn-sm-glass { flex: 1; padding: 6px; background: rgba(255,255,255,0.1); border: none; border-radius: 6px; color: white; cursor: pointer; }
.btn-accept { background: #10b981; }

.avatar-sm { width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); object-fit: cover; }
.custom-scrollbar { max-height: 60vh; overflow-y: auto; padding-right: 5px; }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #6c63ff; border-radius: 5px; }
.fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
</style>
