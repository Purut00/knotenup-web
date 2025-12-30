<template>
  <div class="min-h-screen bg-slate-900 relative overflow-x-hidden text-white">
    
    <div class="absolute inset-0 z-0 opacity-[0.08] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' viewBox=\'0 0 1000 1000\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400\' stroke=\'white\' fill=\'none\' stroke-width=\'2\' opacity=\'0.5\'/%3E%3C/svg%3E')] bg-cover"></div>
    <div class="absolute top-0 left-0 w-[60vw] h-[60vw] bg-[#6c63ff] blur-[150px] opacity-15 pointer-events-none rounded-full"></div>
    <div class="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-[#ff8c42] blur-[150px] opacity-10 pointer-events-none rounded-full"></div>

    <div class="container mx-auto px-6 pt-32 pb-20 relative z-10 max-w-[800px]">
      
      <div class="text-center mb-10 relative z-10">
        <h1 class="text-4xl font-bold text-white mb-2">{{ t('createBuddy.title') }}</h1>
        <p class="text-gray-400">"{{ t('createBuddy.sub') }}"</p>
      </div>

      <div class="bg-[#1e293b]/60 border border-white/10 rounded-[20px] p-10 backdrop-blur-[15px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-fade-in-up relative z-10 max-w-2xl mx-auto max-sm:p-6">
        
        <h2 class="text-2xl text-white mb-6 border-b border-white/10 pb-2.5 font-bold">{{ t('createBuddy.sectionTitle') }}</h2>
        
        <div class="mb-5">
          <label class="block text-[0.9rem] text-slate-300 mb-2 font-semibold">{{ t('createBuddy.locationLabel') }}</label>
          <input 
            type="text" 
            v-model="form.location" 
            class="w-full p-3 rounded-[10px] border border-white/10 bg-black/30 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-black/50" 
            :placeholder="t('createBuddy.locationPlaceholder')" 
          />
        </div>

        <div class="grid grid-cols-2 gap-5 max-md:grid-cols-1 max-md:gap-0">
          <div class="mb-5">
            <label class="block text-[0.9rem] text-slate-300 mb-2 font-semibold">{{ t('createBuddy.dateLabel') }}</label>
            <input type="date" v-model="form.date" class="w-full p-3 rounded-[10px] border border-white/10 bg-black/30 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-black/50 appearance-none" />
          </div>
          <div class="mb-5">
            <label class="block text-[0.9rem] text-slate-300 mb-2 font-semibold">{{ t('createBuddy.timeLabel') }}</label>
            <input type="time" v-model="form.time" class="w-full p-3 rounded-[10px] border border-white/10 bg-black/30 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-black/50 appearance-none" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-5 mt-4 max-md:grid-cols-1 max-md:gap-0">
          <div class="mb-5">
            <label class="block text-[0.9rem] text-slate-300 mb-2 font-semibold">{{ t('createBuddy.paceLabel') }}</label>
            <div class="relative">
                <select v-model="form.pace" class="w-full p-3 rounded-[10px] border border-white/10 bg-black/30 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-black/50 appearance-none">
                  <option value="relaxed" class="bg-[#1e293b] text-white">{{ t('createBuddy.options.pace.relaxed') }}</option>
                  <option value="moderate" class="bg-[#1e293b] text-white">{{ t('createBuddy.options.pace.moderate') }}</option>
                  <option value="fast" class="bg-[#1e293b] text-white">{{ t('createBuddy.options.pace.fast') }}</option>
                </select>
                <i class="fas fa-chevron-down absolute right-[15px] top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
            </div>
          </div>
          <div class="mb-5">
             <label class="block text-[0.9rem] text-slate-300 mb-2 font-semibold">{{ t('createBuddy.transportLabel') }}</label>
             <div class="relative">
                <select v-model="form.carpool" class="w-full p-3 rounded-[10px] border border-white/10 bg-black/30 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-black/50 appearance-none">
                  <option value="self" class="bg-[#1e293b] text-white">{{ t('createBuddy.options.transport.self') }}</option>
                  <option value="driver" class="bg-[#1e293b] text-white">{{ t('createBuddy.options.transport.driver') }}</option>
                  <option value="passenger" class="bg-[#1e293b] text-white">{{ t('createBuddy.options.transport.passenger') }}</option>
                </select>
                <i class="fas fa-chevron-down absolute right-[15px] top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
            </div>
          </div>
        </div>

        <div class="mb-5 mt-4 bg-green-500/5 p-4 rounded-xl border border-green-500/20">
           <label class="block font-semibold text-green-400 mb-2">
             <i class="fab fa-whatsapp text-lg mr-2"></i> {{ t('createBuddy.whatsappLabel') }} (Optional)
           </label>
           <input 
             type="text" 
             v-model="form.whatsapp" 
             class="w-full p-3 rounded-[10px] border border-white/10 bg-black/30 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-black/50" 
             placeholder="e.g. 0123456789" 
           />
           <small class="text-gray-400 mt-2 block text-xs">
              {{ t('createBuddy.whatsappHint') || 'Jika kosong, kami akan guna nombor profile anda.' }}
           </small>
        </div>

        <div class="mb-5 mt-4">
           <label class="block text-[0.9rem] text-slate-300 mb-2 font-semibold">{{ t('createBuddy.notesLabel') }}</label>
           <textarea v-model="form.notes" rows="3" class="w-full p-3 rounded-[10px] border border-white/10 bg-black/30 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-black/50" :placeholder="t('createBuddy.notesPlaceholder')"></textarea>
        </div>

        <div class="mt-6 p-4 rounded-lg bg-red-900/20 border border-red-500/30">
           <label class="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" v-model="form.declaration" class="mt-1 w-5 h-5 accent-red-500" />
              <span class="text-sm text-gray-300">
                <strong>{{ t('createBuddy.declaration') }}</strong>
              </span>
           </label>
        </div>

        <div class="mt-8 flex justify-end">
           <button @click="submitForm" class="w-full bg-gradient-to-br from-[#e67e22] to-[#d35400] text-white border-none padding-3 rounded-full font-bold cursor-pointer shadow-[0_4px_15px_rgba(230,126,34,0.4)] transition duration-200 py-3 px-[30px] hover:-translate-y-0.5 disabled:bg-[#555] disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none disabled:opacity-70" :disabled="loading || !form.declaration">
             {{ loading ? t('createBuddy.loadingBtn') : t('createBuddy.submitBtn') }}
           </button>
        </div>

      </div>
      
      <LiabilityModal 
        v-model:visible="showLiabilityModal"
        context="create"
        @proceed="confirmSubmit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineAsyncComponent } from 'vue';

const LiabilityModal = defineAsyncComponent(() => 
  import('../components/common/LiabilityModal.vue')
);
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { getEffectiveUserProfile } from '../utils/userProfile'; 

const router = useRouter();
const { t } = useI18n();
const loading = ref(false);
const showLiabilityModal = ref(false);

const form = reactive({
  location: '',
  date: '',
  time: '',
  pace: 'relaxed',
  carpool: 'self',
  whatsapp: '',
  notes: '',
  declaration: false
});

const submitForm = async () => {
  if (!auth.currentUser) { alert(t('createBuddy.alerts.login')); return; }
  if (!form.location || !form.date) {
    alert(t('createBuddy.alerts.fillRequired'));
    return;
  }

  // Trigger Modal
  showLiabilityModal.value = true;
};

const confirmSubmit = async () => {
  loading.value = true;

  try {
    const userProfile = await getEffectiveUserProfile(auth.currentUser!);

    await addDoc(collection(db, 'buddies'), {
      ...form,
      hostId: auth.currentUser!.uid,
      hostName: userProfile.name,
      hostAvatar: userProfile.avatar,
      createdAt: serverTimestamp(),
      status: 'active' // active, full, expired
    });

    alert(t('createBuddy.alerts.success'));
    router.push('/forum'); // Atau redirect ke page senarai buddy nanti
  } catch (error) {
    console.error("Error:", error);
    alert(t('createBuddy.alerts.error'));
  } finally {
    loading.value = false;
  }
};
</script>