<template>
  <div class="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#6c63ff]/40 flex flex-col group p-0 h-full">
    <div class="p-4 flex justify-between items-center border-b border-white/5 bg-black/20 relative">
      <div class="flex items-center gap-[10px]">
        <img :src="buddy.hostAvatar || 'https://i.pravatar.cc/150?img=12'" alt="Host" class="w-10 h-10 rounded-full border-2 border-[#6c63ff]" />
        <div>
          <span class="text-[0.7rem] text-slate-400 uppercase tracking-wider block">Host</span>
          <h4 class="text-[0.95rem] text-white m-0 font-semibold">{{ buddy.hostName }}</h4>
        </div>
      </div>
      <div class="text-center bg-white/10 px-[10px] py-[5px] rounded-lg">
        <span class="block text-[1.2rem] font-bold text-white leading-none">{{ formatDateDay(buddy.date) }}</span>
        <span class="text-[0.7rem] uppercase text-slate-300">{{ formatDateMonth(buddy.date) }}</span>
      </div>

      <!-- Report Icon -->
      <button @click.stop="showReportModal = true" class="absolute top-3 right-10 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
        <i class="fas fa-flag"></i>
      </button>
    </div>

    <div class="p-[1.2rem] flex-grow">
      <h3 class="text-[1.3rem] text-white mb-[0.8rem] font-bold">{{ buddy.location }}</h3>
      
      <div class="flex flex-wrap gap-[8px]">
        <span class="text-[0.8rem] px-[10px] py-[4px] rounded-[20px] bg-white/10 text-slate-300 flex items-center gap-[6px]"><i class="far fa-clock"></i> {{ buddy.time }}</span>
        <span class="text-[0.8rem] px-[10px] py-[4px] rounded-[20px] flex items-center gap-[6px]" :class="getPaceClass(buddy.pace)">
          <i class="fas fa-running"></i> {{ buddy.pace }}
        </span>
      </div>

      <div class="mt-3 text-[0.85rem] text-blue-300 flex items-center gap-[8px]" v-if="buddy.carpool !== 'Sendiri'">
        <i class="fas fa-car-side"></i> 
        {{ buddy.carpool === 'Driver' ? 'Ada Kosong (Carpool)' : 'Cari Tumpang' }}
      </div>

      <p class="mt-4 text-[0.9rem] text-slate-400 italic leading-[1.4] line-clamp-2 overflow-hidden" v-if="buddy.notes">"{{ buddy.notes }}"</p>
    </div>

    <div class="p-4 border-t border-white/5">
      <button 
         @click="openLiabilityModal"
         class="block w-full text-center bg-gradient-to-br from-[#25d366] to-[#128c7e] text-white p-[10px] rounded-[50px] font-bold no-underline transition-all duration-200 hover:brightness-110 hover:scale-[1.02] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
         :disabled="contactInfo.href === '#'"
      >
        <i :class="contactInfo.icon"></i> {{ contactInfo.label }}
      </button>
    </div>

    <ReportModal 
        v-if="buddy"
        v-model:visible="showReportModal" 
        :targetId="buddy.id"
        targetType="buddy"
        :targetName="buddy.location || 'Buddy Request'"
    />

    <LiabilityModal
        v-model:visible="showLiabilityModal"
        context="join"
        @proceed="proceedToJoin"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { getContactLink } from '../../utils/contactHelper';

const ReportModal = defineAsyncComponent(() => 
  import('../common/ReportModal.vue')
);
const LiabilityModal = defineAsyncComponent(() => 
  import('../common/LiabilityModal.vue')
);

const props = defineProps({
  buddy: { type: Object, required: true }
});

const hostProfile = ref<any>(null);
const showReportModal = ref(false);
const showLiabilityModal = ref(false);

const openLiabilityModal = () => { showLiabilityModal.value = true; };
const proceedToJoin = () => {
    if (contactInfo.value?.href) window.open(contactInfo.value.href, '_blank');
};

const contactInfo = computed(() => {
  return getContactLink(props.buddy, hostProfile.value);
});

onMounted(async () => {
  if (props.buddy.hostId) {
    try {
      const snap = await getDoc(doc(db, 'users', props.buddy.hostId));
      if (snap.exists()) hostProfile.value = snap.data();
    } catch (e) {
      // ignore
    }
  }
});

// Helper Dates
const formatDateDay = (dateStr: string) => {
  if(!dateStr) return '00';
  return new Date(dateStr).getDate();
};
const formatDateMonth = (dateStr: string) => {
  if(!dateStr) return 'MMM';
  return new Date(dateStr).toLocaleString('default', { month: 'short' });
};

// Helper Style Pace
const getPaceClass = (pace: string) => {
  if (pace && pace.includes('Santai')) return 'text-green-300 bg-green-600/20';
  if (pace && pace.includes('Sederhana')) return 'text-yellow-300 bg-orange-600/20';
  return 'text-red-300 bg-red-600/20';
};
</script>