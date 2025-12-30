<template>
  <div v-if="visible" class="fixed inset-0 bg-black/80 z-[2000] flex justify-center items-center" @click.self="close">
      <div class="bg-[#2c3e50] p-5 rounded-xl w-[90%] max-w-[500px] border border-[#34495e] text-white">
        <div class="flex justify-between border-b border-[#34495e] pb-[10px] mb-[10px] items-center"><h3>Laporan ({{ reporters.length }})</h3><button class="bg-transparent border-none text-[#95a5a6] text-[1.2rem] cursor-pointer" @click="close">✖</button></div>
        <div class="max-h-[60vh] overflow-y-auto custom-scrollbar">
           <div v-if="loading" class="p-4 text-center">Loading...</div>
           <div v-else-if="reporters.length === 0" class="p-4 text-center">Tiada info pelapor.</div>
           <div v-else v-for="rep in reporters" :key="rep.id" class="p-[10px] border-b border-[#34495e]">
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
