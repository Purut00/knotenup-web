<template>
  <div class="space-y-6">
      
      <!-- Action Card -->
      <div class="bg-[#0f172a]/75 border border-white/10 rounded-[20px] backdrop-blur-[10px] shadow-[0_10px_30px_rgba(0,0,0,0.4)] p-4">
            <button 
              class="w-full py-3 rounded-lg font-bold transition text-sm flex items-center justify-center gap-2 mb-2 shadow-lg"
              :class="suggestions.length > 0 ? 'bg-gray-700 text-gray-400 cursor-not-allowed border border-white/5' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90'"
              :disabled="suggestions.length > 0"
              @click="showSuggestionModal = true"
            >
              <span v-if="suggestions.length > 0"><i class="fas fa-lock mr-2"></i> Edit Dibekukan</span>
              <span v-else>✏️ Cadang Perubahan Info</span>
            </button>
            
            <div v-if="suggestions.length > 0" class="text-[11px] text-orange-300 text-center mb-3 bg-orange-500/10 p-2 rounded border border-orange-500/20">
              <i class="fas fa-info-circle mr-1"></i> Sedang dalam proses undian. Sila tunggu keputusan sebelum menghantar cadangan baru.
            </div>
            
            <div v-if="isAdmin || isOwner">
                <button 
                  class="w-full py-2 rounded-lg text-sm flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 transition"
                  @click="router.push('/spots/edit/' + spotId)"
                >
                  ⚙️ Edit Penuh (Admin/Owner)
                </button>
            </div>
      </div>

      <!-- Pending Suggestions List -->
      <div v-if="suggestions.length > 0" class="bg-[#0f172a]/75 border border-white/10 rounded-[20px] backdrop-blur-[10px] shadow-[0_10px_30px_rgba(0,0,0,0.4)] p-5 border-l-4 border-l-yellow-500 relative overflow-hidden">
          <div class="absolute top-0 right-0 p-2 opacity-10"><i class="fas fa-hard-hat text-6xl text-yellow-500"></i></div>
          <h4 class="font-bold text-yellow-500 mb-4 flex items-center gap-2">🚧 Semakan Komuniti</h4>
          
          <div v-for="sugg in suggestions" :key="sugg.id" class="bg-black/30 rounded-lg p-3 mb-3 border border-white/5">
              <p class="text-xs text-gray-400 mb-2">{{ t('spotDetail.suggestedBy') || 'Dicadang oleh' }}: <strong class="text-gray-300">{{ sugg.suggestedBy || 'Pengguna' }}</strong></p>
              <p class="text-xs text-blue-300 mb-2">Ubah: {{ translateField(sugg.field) }}</p>
              
              <div class="h-2 bg-gray-700 rounded-full overflow-hidden flex mb-2 relative">
                  <div class="bg-green-500 h-full transition-all duration-500" :style="{ width: Math.min((sugg.votes / 5) * 100, 100) + '%' }"></div>
                  <div class="bg-red-500 h-full transition-all duration-500" :style="{ width: Math.min(((sugg.rejectVotes || 0) / 5) * 100, 100) + '%' }"></div>
                  <div class="absolute top-0 right-0 h-full w-px bg-white/30" title="Target 5 Undi"></div>
              </div>
              <div class="flex justify-between items-center text-[10px] text-gray-400 mb-3">
                  <span class="text-green-400">Setuju: {{ sugg.votes || 0 }}/5</span>
                  <span class="text-red-400">Tolak: {{ sugg.rejectVotes || 0 }}/5</span>
              </div>
              
              <button @click="openCheckModal(sugg)" class="w-full py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs text-white transition border border-white/10">
                  🔍 Semak & Undi
              </button>

              <div v-if="isAdmin" class="flex gap-2 mt-2 pt-2 border-t border-white/5">
                  <button class="flex-1 py-1 bg-green-900/50 hover:bg-green-800 text-[10px] text-green-300 border border-green-500/30 rounded" @click="finalizeUpdate(sugg, true)">⚡ Force Accept</button>
                  <button class="flex-1 py-1 bg-red-900/50 hover:bg-red-800 text-[10px] text-red-300 border border-red-500/30 rounded" @click="adminReject(sugg)">✖ Force Reject</button>
              </div>
          </div>
      </div>

      <!-- Suggestion Modal -->
      <div v-if="showSuggestionModal" class="fixed inset-0 bg-black/80 z-[2000] flex items-center justify-center backdrop-blur-[5px] p-4">
         <div class="bg-[#0f172a]/95 p-8 rounded-[20px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto w-full max-w-lg text-white">
           <h3 class="text-xl font-bold text-white mb-4">✏️ Cadang Perubahan</h3>
           <p class="text-sm text-gray-400 mb-4">Perubahan ini akan dihantar kepada komuniti untuk undian (5 undi diperlukan).</p>
           
           <label class="block text-gray-300 text-sm mb-2 font-bold">Bahagian:</label>
           <select v-model="suggForm.field" class="w-full p-3 rounded-[10px] border border-white/10 bg-black/40 text-white outline-none transition duration-300 mb-4 [&>option]:bg-[#1a202c]">
               <option value="description">Deskripsi</option>
               <option value="difficulty">Kesukaran</option>
               <option value="duration">Masa / Durasi</option>
               <option value="distance">Jarak</option>
               <option value="permit">Permit</option>
               <option value="via">Laluan / Via</option>
           </select>

           <label class="block text-gray-300 text-sm mb-2 font-bold">Maklumat Baru:</label>
           <textarea v-model="suggForm.newValue" rows="4" class="w-full p-3 rounded-[10px] border border-white/10 bg-black/40 text-white outline-none transition duration-300 mb-6" placeholder="Tulis maklumat yang betul di sini..."></textarea>

           <div class="flex gap-3">
               <button class="flex-1 bg-white/5 text-slate-300 px-4 py-2 rounded-lg text-sm cursor-pointer transition duration-200 border border-white/10 hover:bg-white/10" @click="showSuggestionModal = false">Batal</button>
               <button class="flex-1 bg-gradient-to-br from-[#6c63ff] to-[#5b54e0] text-white px-6 py-[10px] border-none rounded-lg font-semibold cursor-pointer transition duration-300 hover:brightness-110" @click="submitSuggestion">Hantar</button>
           </div>
         </div>
      </div>

      <!-- Diff / Voting Modal -->
      <div v-if="showDiffModal && selectedSugg" class="fixed inset-0 bg-black/80 z-[2000] flex items-center justify-center backdrop-blur-[5px] p-4">
         <div class="bg-[#0f172a]/95 p-8 rounded-[20px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto w-full max-w-2xl text-white">
           <div class="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
               <div>
                   <h3 class="text-xl font-bold text-white">🔍 Semakan Komuniti</h3>
                   <p class="text-sm text-gray-400 mt-1">Perubahan dicadangkan oleh <strong class="text-purple-400">{{ selectedSugg.suggestedBy }}</strong></p>
               </div>
               <button class="text-gray-400 hover:text-white" @click="showDiffModal = false">✖</button>
           </div>
           
           <div class="overflow-x-auto mb-6 rounded-lg border border-white/10">
              <table class="w-full text-sm text-left">
                 <thead class="bg-black/30 text-gray-400">
                    <tr>
                      <th class="p-3 w-1/4">Info</th>
                      <th class="p-3 w-1/3">Asal</th>
                      <th class="p-3 w-1/3">Cadangan Baru</th>
                    </tr>
                 </thead>
                 <tbody class="text-gray-300">
                    <tr>
                       <td class="p-3 font-semibold border-b border-white/5">{{ translateField(selectedSugg.field) }}</td>
                       <td class="p-3 text-red-300 line-through opacity-70 bg-red-900/20 border-b border-white/5">
                          {{ selectedSugg.oldValue || '-' }}
                       </td>
                       <td class="p-3 bg-green-900/20 text-green-300 font-bold border-b border-white/5">
                          {{ selectedSugg.newValue || '-' }}
                       </td>
                    </tr>
                 </tbody>
              </table>
           </div>

           <div class="flex justify-between items-center gap-4 pt-2">
              <div class="text-xs text-gray-500">
                  Status Undian: <span class="text-green-400">{{ selectedSugg.votes }}/5 Setuju</span> • <span class="text-red-400">{{ selectedSugg.rejectVotes }}/5 Tolak</span>
              </div>
              <div class="flex gap-3">
                 <button class="px-5 py-2 bg-red-900/40 hover:bg-red-800 text-red-300 border border-red-500/30 rounded-lg font-bold transition flex items-center gap-2" @click="confirmVote(selectedSugg, 'reject')">
                   ❌ Tolak
                 </button>
                 <button class="px-5 py-2 bg-green-900/40 hover:bg-green-800 text-green-300 border border-green-500/30 rounded-lg font-bold transition flex items-center gap-2" @click="confirmVote(selectedSugg, 'approve')">
                   ✅ Setuju
                 </button>
              </div>
           </div>
         </div>
      </div>
      
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { auth, db } from '../../firebaseConfig';
import { doc, collection, addDoc, query, onSnapshot, serverTimestamp, deleteDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore'; 
import { checkRateLimit } from '../../utils/rateLimiter';

const props = defineProps<{
  spotId: string;
  spot: any;
  isAdmin: boolean;
  isOwner: boolean;
}>();

const { t } = useI18n();
const router = useRouter();

const suggestions = ref<any[]>([]);
const showSuggestionModal = ref(false);
const showDiffModal = ref(false);
const selectedSugg = ref<any>(null);
const suggForm = reactive({ field: 'description', newValue: '' });

let unsubscribe: any = null;

onMounted(() => {
  unsubscribe = onSnapshot(query(collection(db, "spots", props.spotId, "suggestions")), (snap) => { 
      suggestions.value = snap.docs.map(d => ({ id: d.id, ...d.data() })); 
  });
});

onUnmounted(() => { if(unsubscribe) unsubscribe(); });

const translateField = (field: string) => {
    const map: any = { 
        description: 'Deskripsi', difficulty: 'Kesukaran', 
        duration: 'Masa', distance: 'Jarak', 
        permit: 'Permit', via: 'Laluan / Via'
    };
    return map[field] || field;
};

const openCheckModal = (sugg: any) => { selectedSugg.value = sugg; showDiffModal.value = true; };

const submitSuggestion = async () => {
    if (!auth.currentUser) return alert(t('common.pleaseLogin'));
    if (!suggForm.newValue) return alert("Sila isi maklumat baru.");

    const limitCheck = checkRateLimit('submit_suggestion');
    if (!limitCheck.allowed) return alert(limitCheck.message);

    try {
        await addDoc(collection(db, "spots", props.spotId, "suggestions"), {
            field: suggForm.field,
            oldValue: props.spot[suggForm.field] || '(Tiada Maklumat)',
            newValue: suggForm.newValue,
            suggestedBy: auth.currentUser.displayName || 'Pengguna Komuniti',
            suggestedById: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            votes: 0,
            rejectVotes: 0,
            votedUsers: [],
            verifiedUsers: []
        });
        showSuggestionModal.value = false;
        suggForm.newValue = '';
        alert("Cadangan dihantar! Menunggu undian komuniti.");
    } catch (e) { console.error(e); alert("Gagal hantar cadangan."); }
};

const finalizeUpdate = async (sugg: any, forceAdmin = false) => {
   const editorName = forceAdmin ? ((sugg.suggestedBy || 'Admin') + " (Admin Force)") : (sugg.suggestedBy || 'Komuniti');
   
   await updateDoc(doc(db, "spots", props.spotId), { 
       [sugg.field]: sugg.newValue,
       lastEditedBy: editorName, 
       lastEditedAt: serverTimestamp() 
   });
   
   await addDoc(collection(db, "spots", props.spotId, "history"), { 
       editorName: editorName, 
       editorId: sugg.suggestedById || 'system', 
       timestamp: serverTimestamp(), 
       type: 'update',
       field: sugg.field
   });
   
   await deleteDoc(doc(db, "spots", props.spotId, "suggestions", sugg.id));
   alert(forceAdmin ? "Kemaskini dipaksa oleh Admin." : "Tahniah! Cadangan diluluskan komuniti."); 
   showDiffModal.value = false;
   // Note: Parent component listens to Spot doc changes so it should auto-update.
};

const rejectSuggestion = async (suggId: string) => { 
    await deleteDoc(doc(db, "spots", props.spotId, "suggestions", suggId)); 
    alert("Cadangan ditolak oleh komuniti."); 
    showDiffModal.value = false; 
};

const confirmVote = async (sugg: any, voteType: 'approve' | 'reject') => {
  if (!auth.currentUser) return alert(t('common.pleaseLogin'));
  
  const hasVoted = (sugg.votedUsers && sugg.votedUsers.includes(auth.currentUser.uid));
  if (hasVoted) return alert("Anda sudah mengundi cadangan ini.");
  
  const suggRef = doc(db, "spots", props.spotId, "suggestions", sugg.id);
  const VOTE_THRESHOLD = 5;

  if (voteType === 'approve') {
      const newVotes = (sugg.votes || 0) + 1;
      if (newVotes >= VOTE_THRESHOLD) { 
          await finalizeUpdate(sugg, false); 
      } else { 
          await updateDoc(suggRef, { votes: increment(1), votedUsers: arrayUnion(auth.currentUser.uid) }); 
          alert("Undian 'Setuju' diterima."); 
          showDiffModal.value = false; 
      }
  } else {
      const newRejectVotes = (sugg.rejectVotes || 0) + 1;
      if (newRejectVotes >= VOTE_THRESHOLD) { 
          await rejectSuggestion(sugg.id); 
      } else { 
          await updateDoc(suggRef, { rejectVotes: increment(1), votedUsers: arrayUnion(auth.currentUser.uid) }); 
          alert("Undian 'Tolak' diterima."); 
          showDiffModal.value = false; 
      }
  }
};

const adminReject = async (sugg: any) => { 
    if(!confirm("Tolak cadangan ini secara paksa?")) return; 
    await deleteDoc(doc(db, "spots", props.spotId, "suggestions", sugg.id)); 
    alert("Cadangan ditolak oleh Admin."); 
};
</script>
