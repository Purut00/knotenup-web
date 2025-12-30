<template>
  <Transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click.self="close">
      <div class="bg-slate-800 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative transition-all duration-300 transform scale-100 opacity-100">
        
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-white flex items-center gap-2">
            <i class="fas fa-exclamation-triangle text-red-500"></i>
            Report {{ targetTypeLabel }}
          </h3>
          <button @click="close" class="text-slate-400 hover:text-white transition-colors">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Content -->
        <div class="space-y-4">
          
          <div v-if="targetName" class="bg-white/5 p-3 rounded-lg border border-white/5 text-sm">
            <span class="text-slate-400">Reporting:</span>
            <div class="font-semibold text-white truncate">{{ targetName }}</div>
          </div>

          <div>
             <label class="block text-sm font-semibold text-slate-300 mb-2">Reason (Sebab)</label>
             <div class="space-y-2">
               <template v-for="reason in REASONS" :key="reason.value">
                 <div 
                   class="flex items-center gap-3 p-3 rounded-xl border border-white/10 cursor-pointer transition-all hover:bg-white/5"
                   :class="selectedReason === reason.value ? 'bg-red-500/20 border-red-500' : 'bg-slate-900/50'"
                   @click="selectedReason = reason.value"
                 >
                   <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        :class="selectedReason === reason.value ? 'border-red-500' : 'border-slate-500'">
                      <div v-if="selectedReason === reason.value" class="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                   </div>
                   <span class="text-sm font-medium" :class="selectedReason === reason.value ? 'text-white' : 'text-slate-300'">{{ reason.label }}</span>
                 </div>
               </template>
             </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-300 mb-2">Details (Optional)</label>
            <textarea 
              v-model="details" 
              rows="3" 
              class="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-white focus:border-red-500 outline-none transition-colors placeholder-slate-600"
              placeholder="Tell us more about this issue..."
            ></textarea>
          </div>

        </div>

        <!-- Footer -->
        <div class="mt-6 flex justify-end gap-3">
          <button @click="close" class="px-4 py-2 rounded-lg text-slate-300 hover:text-white font-medium transition-colors">Cancel</button>
          <button 
            @click="submitReport" 
            :disabled="!selectedReason || loading"
            class="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></span>
            {{ loading ? 'Submitting...' : 'Submit Report' }}
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { db, auth } from '../../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const props = defineProps<{
  visible: boolean;
  targetId: string;
  targetType: string; // 'user', 'trip', 'service', 'buddy', 'post'
  targetName?: string;
}>();

const emit = defineEmits(['update:visible']);

const REASONS = [
  { value: 'scammer', label: 'Scammer / Penipuan' },
  { value: 'nsfw', label: 'NSFW / Kandungan Tidak Sopan' },
  { value: 'spam', label: 'Spamming' },
  { value: 'racist', label: 'Racist / Hate Speech' },
  { value: 'illegal', label: 'Illegal Activity' },
  { value: 'other', label: 'Lain-lain / Other' }
];

const selectedReason = ref('');
const details = ref('');
const loading = ref(false);

const targetTypeLabel = computed(() => {
  const map: Record<string, string> = {
    user: 'User',
    trip: 'Trip',
    service: 'Service',
    buddy: 'Buddy Request',
    post: 'Post'
  };
  return map[props.targetType] || 'Item';
});

const close = () => {
  emit('update:visible', false);
  // Reset form after close animation
  setTimeout(() => {
    selectedReason.value = '';
    details.value = '';
    loading.value = false;
  }, 300);
};

const submitReport = async () => {
  if (!auth.currentUser) return alert("Sila login untuk report.");
  if (!selectedReason.value) return;

  loading.value = true;
  try {
    await addDoc(collection(db, 'reports'), {
      targetId: props.targetId,
      targetType: props.targetType,
      targetName: props.targetName || '',
      reason: selectedReason.value,
      details: details.value,
      reportedBy: auth.currentUser.uid,
      reporterName: auth.currentUser.displayName || 'Anonymous',
      createdAt: serverTimestamp(),
      status: 'open'
    });
    alert("Report diterima. Pihak admin akan menyemak laporan anda.");
    close();
  } catch (e) {
    console.error(e);
    alert("Gagal menghantar report. Sila cuba lagi.");
  } finally {
    loading.value = false;
  }
};
</script>
