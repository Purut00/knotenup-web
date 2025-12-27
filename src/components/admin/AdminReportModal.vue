<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="glass-modal">
        <div class="modal-header"><h3>Laporan ({{ reporters.length }})</h3><button class="close-btn" @click="close">✖</button></div>
        <div class="modal-body custom-scrollbar">
           <div v-if="loading" class="p-4 text-center">Loading...</div>
           <div v-else-if="reporters.length === 0" class="p-4 text-center">Tiada info pelapor.</div>
           <div v-else v-for="rep in reporters" :key="rep.id" class="reporter-item">
              <strong class="text-blue-400">{{ rep.reporterName }}</strong>: 
              <span class="text-gray-300">"{{ rep.reason }}"</span>
              <div class="text-xs text-gray-500 mt-1">{{ formatDate(rep.createdAt) }}</div>
           </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { db } from '../../firebaseConfig';
import { getDoc, doc } from 'firebase/firestore';

const props = defineProps<{
  visible: boolean;
  reports: any[];
}>();

const emit = defineEmits(['update:visible']);
const reporters = ref<any[]>([]);
const loading = ref(false);

const close = () => emit('update:visible', false);
const formatDate = (ts: any) => ts ? new Date(ts.seconds * 1000).toLocaleDateString() : '';

watch(() => props.visible, async (val) => {
    if (val && props.reports.length > 0) {
        loading.value = true;
        const results = [];
        for (const r of props.reports) {
            let name = 'Unknown';
            if (r.reportedBy) {
                try {
                    const snap = await getDoc(doc(db, "users", r.reportedBy));
                    if (snap.exists()) name = snap.data().name || 'User';
                } catch (e) {}
            }
            results.push({ ...r, reporterName: name });
        }
        reporters.value = results;
        loading.value = false;
    } else {
        reporters.value = [];
    }
});
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; justify-content: center; align-items: center; }
.glass-modal { background: #2c3e50; padding: 20px; border-radius: 12px; width: 90%; max-width: 500px; border: 1px solid #34495e; color: white; }
.modal-header { display: flex; justify-content: space-between; border-bottom: 1px solid #34495e; padding-bottom: 10px; margin-bottom: 10px; align-items: center; }
.modal-header h3 { margin: 0; font-size: 1.2rem; }
.close-btn { background: none; border: none; color: #95a5a6; font-size: 1.2rem; cursor: pointer; }
.reporter-item { padding: 10px; border-bottom: 1px solid #34495e; }
.custom-scrollbar { max-height: 60vh; overflow-y: auto; }
</style>
