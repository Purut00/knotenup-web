<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
       <div class="glass-modal w-full max-w-lg">
         <div class="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
            <h3 class="text-xl font-bold text-white">📜 Sejarah Kemaskini</h3>
            <button class="text-gray-400 hover:text-white text-xl" @click="close">✖</button>
         </div>
         
         <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <div v-if="loading" class="text-center text-gray-500 py-4">Memuatkan...</div>
            
            <div v-else-if="historyLogs.length > 0">
                <div v-for="log in historyLogs" :key="log.id" class="pl-3 border-l-2 border-purple-500 py-1">
                   <div class="flex justify-between items-center text-sm">
                       <strong class="text-purple-300">{{ log.editorName }}</strong>
                       <span class="text-xs text-gray-500">{{ formatDate(log.timestamp) }}</span>
                   </div>
                   <p class="text-xs text-gray-400 mt-1">
                       Mengemaskini <strong>{{ translateField(log.field || 'info') }}</strong>.
                       <span v-if="log.type === 'update'" class="text-green-500 ml-1">(Diluluskan)</span>
                   </p>
                </div>
            </div>

            <p v-else class="text-center text-gray-500 italic py-4">{{ t('spotDetail.noHistory') || 'Tiada sejarah kemaskini.' }}</p>
         </div>
       </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { db } from '../../firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'; 

const props = defineProps<{
  spotId: string;
  visible: boolean;
}>();

const emit = defineEmits(['update:visible', 'close']);

const { t } = useI18n();
const historyLogs = ref<any[]>([]);
const loading = ref(false);
let unsubscribe: any = null;

const fetchHistory = () => {
    loading.value = true;
    const q = query(collection(db, "spots", props.spotId, "history"), orderBy("timestamp", "desc"));
    unsubscribe = onSnapshot(q, (snap) => { 
        historyLogs.value = snap.docs.map(d => ({ id: d.id, ...d.data() })); 
        loading.value = false;
    });
};

const close = () => {
    emit('update:visible', false);
    emit('close');
};

watch(() => props.visible, (val) => {
    if (val && !unsubscribe) {
        fetchHistory();
    }
});

onUnmounted(() => { if (unsubscribe) unsubscribe(); });

const formatDate = (timestamp: any) => { 
    if (!timestamp) return ''; 
    return new Date(timestamp.seconds * 1000).toLocaleDateString("en-MY", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' }); 
};

const translateField = (field: string) => {
    const map: any = { 
        description: 'Deskripsi', difficulty: 'Kesukaran', 
        duration: 'Masa', distance: 'Jarak', 
        permit: 'Permit', via: 'Laluan / Via'
    };
    return map[field] || field;
};
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); padding: 1rem; } 
.glass-modal { 
    background: rgba(15, 23, 42, 0.95); 
    padding: 2rem; border-radius: 20px; 
    border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    max-height: 90vh; overflow-y: auto;
}
</style>
