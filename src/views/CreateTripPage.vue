<template>
  <div class="min-h-screen bg-slate-900 relative overflow-x-hidden text-white">
    
    <div class="absolute inset-0 z-0 opacity-10 pointer-events-none" style="background-image: url('data:image/svg+xml,...')"></div>
    <div class="absolute top-0 left-0 w-3/4 h-3/4 bg-purple-600/20 blur-[150px] rounded-full pointer-events-none"></div>
    <div class="absolute bottom-0 right-0 w-3/4 h-3/4 bg-orange-500/10 blur-[150px] rounded-full pointer-events-none"></div>

    <div class="container mx-auto px-6 pt-36 pb-20 relative z-10 max-w-4xl">
      
      <div class="text-center mb-10">
        <h1 class="text-4xl md:text-5xl font-bold mb-3">{{ t('createTrip.heroTitle') }}</h1>
        <p class="text-slate-400">"{{ t('createTrip.heroSub') }}"</p>
      </div>

      <!-- STEPPER -->
      <div class="hidden md:flex items-center justify-center mb-10 relative z-10">
        <div class="flex flex-col items-center gap-2 transition-opacity duration-300" :class="{ 'opacity-100': currentStep >= 1, 'opacity-50': currentStep < 1 }">
          <div class="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold bg-slate-900 transition-colors"
               :class="currentStep > 1 ? 'border-purple-500 bg-purple-500 text-white' : (currentStep === 1 ? 'border-orange-500 text-orange-500' : 'border-purple-500 text-purple-500')">1</div>
          <span class="text-xs font-bold uppercase tracking-wider">{{ t('createTrip.step1') }}</span>
        </div>
        <div class="w-16 h-0.5 mx-4 transition-all duration-300" :class="currentStep > 1 ? 'bg-gradient-to-r from-purple-500 to-orange-500' : 'bg-white/10'"></div>
        
        <div class="flex flex-col items-center gap-2 transition-opacity duration-300" :class="{ 'opacity-100': currentStep >= 2, 'opacity-50': currentStep < 2 }">
          <div class="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold bg-slate-900 transition-colors"
               :class="currentStep > 2 ? 'border-purple-500 bg-purple-500 text-white' : (currentStep === 2 ? 'border-orange-500 text-orange-500' : 'border-purple-500 text-purple-500')">2</div>
          <span class="text-xs font-bold uppercase tracking-wider">{{ t('createTrip.step2') }}</span>
        </div>
        <div class="w-16 h-0.5 mx-4 transition-all duration-300" :class="currentStep > 2 ? 'bg-gradient-to-r from-purple-500 to-orange-500' : 'bg-white/10'"></div>

        <div class="flex flex-col items-center gap-2 transition-opacity duration-300" :class="{ 'opacity-100': currentStep >= 3, 'opacity-50': currentStep < 3 }">
          <div class="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold bg-slate-900 transition-colors"
               :class="currentStep === 3 ? 'border-orange-500 text-orange-500' : 'border-purple-500 text-purple-500'">3</div>
          <span class="text-xs font-bold uppercase tracking-wider">{{ t('createTrip.step3') }}</span>
        </div>
      </div>

      <div class="bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 fade-up">
        
        <!-- STEP 1 -->
        <div v-if="currentStep === 1">
          <h2 class="text-2xl font-bold mb-6 border-b border-white/10 pb-4">{{ t('createTrip.section1Title') }}</h2>
          
          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.tripTitle') }}</label>
            <input type="text" v-model="form.title" class="glass-input" 
                   :placeholder="t('createTrip.placeholderTitle')" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.category') }}</label>
              <div class="relative">
                  <select v-model="form.category" class="glass-input appearance-none">
                    <option disabled value="">{{ t('common.select') }}</option>
                    <optgroup v-for="group in ACTIVITY_CATEGORIES" :key="group.group" :label="group.group">
                      <option v-for="item in group.items" :key="item" :value="item">{{ item }}</option>
                    </optgroup>
                  </select>
                  <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.level') }}</label>
              <div class="relative">
                  <select v-model="form.difficulty" class="glass-input appearance-none">
                    <option value="Easy">{{ t('createTrip.options.easy') }}</option>
                    <option value="Moderate">{{ t('createTrip.options.moderate') }}</option>
                    <option value="Hard">{{ t('createTrip.options.hard') }}</option>
                  </select>
                  <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.locationType') || 'Lokasi' }}</label>
            <div class="flex gap-4">
               <label class="cursor-pointer px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2"
                      :class="{ 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20': locationType === 'malaysia' }">
                 <input type="radio" v-model="locationType" value="malaysia" hidden>
                 <span>{{ t('createTrip.inMalaysia') }}</span>
               </label>
               <label class="cursor-pointer px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2"
                      :class="{ 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20': locationType === 'overseas' }">
                 <input type="radio" v-model="locationType" value="overseas" hidden>
                 <span>{{ t('createTrip.overseas') }}</span>
               </label>
            </div>
          </div>

          <div v-if="locationType === 'malaysia'">
            
            <!-- STATE (Auto-filled but changeable) -->
            <div class="mb-4">
               <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.stateRequired') }}</label>
               <div class="relative">
                   <select v-model="form.state" class="glass-input appearance-none">
                     <option disabled value="">{{ t('createSpot.options.selectState') }}</option>
                     <option v-for="state in MALAYSIA_STATES" :key="state" :value="state">{{ t('states.' + state) || state }}</option>
                   </select>
                   <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
               </div>
            </div>

            <!-- SPOT AUTOCOMPLETE -->
            <div class="mb-6">
               <label class="block text-sm font-semibold text-slate-300 mb-2">
                 {{ t('createTrip.specificPlace') }} 
                 <span class="text-xs text-slate-500 font-normal">({{ t('createTrip.searchHint') || 'Cari atau taip nama baru' }})</span>
               </label>
               
               <SpotAutocomplete 
                 v-model="form.placeName" 
                 @select="handleSpotSelect"
               />

               <div v-if="form.spotId" class="mt-2 flex items-center justify-between text-sm bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-2 rounded-lg">
                  <span class="flex items-center gap-2">
                    <i class="fas fa-link"></i> Linked to: <strong>{{ form.spotName }}</strong>
                  </span>
                  <button @click="unlinkSpot" class="text-xs hover:text-white underline">Unlink</button>
               </div>
               
               <p v-else class="text-[10px] text-slate-500 mt-2">
                 <i class="fas fa-info-circle"></i> Jika lokasi tiada dalam senarai, teruskan menaip nama lokasi anda. Link ke spot adalah optional.
               </p>
            </div>

          </div>

          <div v-else class="mb-6">
            <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.fullLocation') }}</label>
            <input type="text" v-model="form.overseasLocation" class="glass-input" :placeholder="t('createTrip.placeholderPlaceOverseas')" />
          </div>
        </div>

        <!-- STEP 2 -->
        <div v-if="currentStep === 2">
          <h2 class="text-2xl font-bold mb-6 border-b border-white/10 pb-4">{{ t('createTrip.section2Title') }}</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.startDate') }}</label>
              <input type="date" v-model="form.startDate" class="glass-input" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.endDate') }}</label>
              <input type="date" v-model="form.endDate" :min="form.startDate" class="glass-input" />
            </div>
          </div>
          
          <div class="inline-block bg-purple-500/20 text-purple-300 px-4 py-1 rounded-full text-sm font-bold mb-6">
            ⏳ {{ t('createTrip.duration') }}: {{ computedDuration }}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.price') }} (RM)</label>
              <input type="number" v-model="form.price" class="glass-input" placeholder="0" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.slots') }}</label>
              <input type="number" v-model="form.maxSlots" class="glass-input" placeholder="20" />
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.groupLink') }}</label>
            <input type="text" v-model="form.groupLink" class="glass-input" :placeholder="t('createTrip.groupLinkPlaceholder')" />
            <span class="text-xs text-slate-500 mt-1 block">{{ t('createTrip.linkPrivacyNote') }}</span>
          </div>

          <div class="mb-6 bg-green-500/5 p-4 rounded-xl border border-green-500/20">
             <label class="block text-sm font-semibold text-green-400 mb-2">
               <i class="fab fa-whatsapp text-lg mr-2"></i> WhatsApp Contact (Optional) via KnoTenUp
             </label>
             <input type="text" v-model="form.whatsapp" class="glass-input" placeholder="e.g. 0123456789" />
             <p class="text-xs text-slate-400 mt-2">
               Jika dibiarkan kosong, kami akan guna nombor WhatsApp di profile anda. Jika tiada, kami akan guna email.
             </p>
          </div>
        </div>

        <!-- STEP 3 -->
        <div v-if="currentStep === 3">
          <h2 class="text-2xl font-bold mb-6 border-b border-white/10 pb-4">{{ t('createTrip.section3Title') }}</h2>

          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-300 mb-2">📸 {{ t('createTrip.tripImages') }}</label>
            <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 h-64">
               <div class="bg-white/5 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 hover:border-purple-500 transition-all bg-cover bg-center"
                    @click="triggerUpload(0)" :style="{ backgroundImage: `url(${previewImages[0]})` }">
                 <div v-if="!previewImages[0]" class="flex flex-col items-center text-slate-400">
                   <i class="fas fa-camera text-3xl mb-2 text-purple-400"></i>
                   <span>{{ t('createTrip.coverPhoto') }}</span>
                 </div>
                 <input type="file" ref="fileInput0" @change="(e) => handleImageSelect(e, 0)" accept="image/*" hidden />
               </div>
               
               <div class="grid grid-cols-2 gap-4">
                 <div v-for="i in 4" :key="i" class="bg-white/5 border border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-500 text-slate-500 text-2xl bg-cover bg-center"
                      @click="triggerUpload(i)" :style="{ backgroundImage: `url(${previewImages[i]})` }">
                   <span v-if="!previewImages[i]">+</span>
                   <input type="file" :ref="'fileInput' + i" @change="(e) => handleImageSelect(e, i)" accept="image/*" hidden />
                 </div>
               </div>
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.desc') }}</label>
            <textarea v-model="form.description" rows="5" class="glass-input" :placeholder="t('createTrip.descPlaceholder')"></textarea>
          </div>

          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-1">⚠️ {{ t('createTrip.mandatory') }}</label>
              <input type="text" v-model="form.mandatory" class="glass-input" :placeholder="t('createTrip.mandatoryPlaceholder')" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-1">💡 {{ t('createTrip.tips') }}</label>
              <input type="text" v-model="form.tips" class="glass-input" :placeholder="t('createTrip.tipsPlaceholder')" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-1">🎒 {{ t('createTrip.recommended') }}</label>
              <input type="text" v-model="form.recommended" class="glass-input" :placeholder="t('createTrip.recommendedPlaceholder')" />
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.includes') }}</label>
            <div class="flex flex-wrap gap-2">
              <div v-for="service in TRIP_SERVICES" :key="service" 
                   class="px-4 py-2 rounded-full border border-white/10 bg-white/5 cursor-pointer text-sm text-slate-300 hover:bg-white/10 transition-all select-none"
                   :class="{ 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20': form.includes.includes(service) }"
                   @click="toggleService(service)">
                {{ t('services.' + service) || service }}
              </div>
            </div>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="flex justify-between items-center mt-10">
           <button v-if="currentStep > 1" @click="prevStep" class="px-6 py-3 rounded-full border border-white/20 text-slate-300 font-bold hover:text-white hover:border-white transition-all">
             <i class="fas fa-arrow-left mr-2"></i> {{ t('common.back') }}
           </button>
           <div v-else></div>

           <button v-if="currentStep < 3" @click="nextStep" class="bg-gradient-to-br from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-purple-600/30 hover:-translate-y-1 transition-all">
             {{ t('common.next') }} <i class="fas fa-arrow-right ml-2"></i>
           </button>
           <button v-if="currentStep === 3" @click="submitForm" class="bg-gradient-to-br from-orange-500 to-red-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-500/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed" :disabled="isUploading || isCreating">
             {{ (isUploading || isCreating) ? t('common.processing') : t('createSpot.submitCreate') }}
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
import { ref, reactive, computed, onMounted, defineAsyncComponent } from 'vue';

const LiabilityModal = defineAsyncComponent(() => 
  import('../components/common/LiabilityModal.vue')
);
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ACTIVITY_CATEGORIES, TRIP_SERVICES, MALAYSIA_STATES } from '../constants/data';
import { auth } from '../firebaseConfig';
import { isSpam } from '../utils/spamFilter';
import { useStorage } from '../composables/useStorage'; 
import { useTrips } from '../composables/useTrips';
import { getEffectiveUserProfile } from '../utils/userProfile';

const { t } = useI18n(); 
const router = useRouter();
const { uploadMultipleImages, uploading: isUploading } = useStorage();
const { createTrip, loading: isCreating } = useTrips();

const currentStep = ref(1);
const locationType = ref('malaysia');
const showLiabilityModal = ref(false);

const previewImages = ref<string[]>(Array.from({ length: 5 }).map(() => ''));
const rawFiles = ref<(File | null)[]>(Array.from({ length: 5 }).map(() => null));
// const spots = ref<any[]>([]); // Removed: using autocomplete 

const form = reactive({
  title: '', category: '', difficulty: 'Moderate', 
  state: '', placeName: '', overseasLocation: '', 
  spotId: '', spotName: '', 
  startDate: '', endDate: '',   
  price: null, maxSlots: null, groupLink: '', description: '',
  tips: '', mandatory: '', recommended: '', includes: [] as string[],
  whatsapp: ''
});

import SpotAutocomplete from '../components/common/SpotAutocomplete.vue';

// Cleaned up onMounted - no longer fetching all spots
onMounted(async () => {
  // Optional: Prefetch user profile or similar if needed
});

// Removed filteredSpots specific logic

const handleSpotSelect = (spot: any) => {
  form.spotId = spot.id;
  form.spotName = spot.name;
  form.placeName = spot.name; // Use spot name as the place name
  if (spot.state) form.state = spot.state; // Auto-fill state
};

const unlinkSpot = () => {
  form.spotId = '';
  form.spotName = '';
  // form.placeName remains as typed
};

// Removed old resetSpotSelection and handleSpotChange


const computedDuration = computed(() => {
  if (!form.startDate || !form.endDate) return '-';
  const start = new Date(form.startDate);
  const end = new Date(form.endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);
  if (diffDays < 0) return t('createTrip.dateError'); 
  if (diffDays === 0) return t('createTrip.dayTrip');
  return t('createTrip.durationFormat', { days: diffDays + 1, nights: diffDays });
});

const toggleService = (service: string) => {
  if (form.includes.includes(service)) form.includes = form.includes.filter(i => i !== service);
  else form.includes.push(service);
};

const triggerUpload = (index: number) => {
  const input = document.querySelectorAll('input[type=file]')[index] as HTMLInputElement;
  if(input) input.click();
};

const handleImageSelect = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    rawFiles.value[index] = file;
    const reader = new FileReader();
    reader.onload = (e) => { if (e.target?.result) previewImages.value[index] = e.target.result as string; };
    reader.readAsDataURL(file);
  }
};

const nextStep = () => { if (currentStep.value < 3) currentStep.value++; window.scrollTo(0,0); };
const prevStep = () => { if (currentStep.value > 1) currentStep.value--; window.scrollTo(0,0); };

const submitForm = async () => {
  if (!auth.currentUser) return alert(t('auth.loginRequired'));
  if (isSpam(`${form.title} ${form.description}`)) return alert(t('createSpot.alerts.spam'));
  
  // Open Liability Modal instead of direct submit
  showLiabilityModal.value = true;
};

const confirmSubmit = async () => {
  try {
    const uploadedUrls = await uploadMultipleImages(rawFiles.value, `uploads/${auth.currentUser!.uid}/trips/${Date.now()}`);
    const finalLoc = locationType.value === 'malaysia' ? `${form.placeName}, ${form.state}` : form.overseasLocation;
    
    // Get effective profile
    const userProfile = await getEffectiveUserProfile(auth.currentUser!);

    // Create Trip using Composable
    await createTrip({
      ...form,
      location: finalLoc,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      duration: computedDuration.value, 
      images: uploadedUrls, 
      image: uploadedUrls[0] || '',
      price: Number(form.price),
      maxSlots: Number(form.maxSlots),
      currentSlots: 0,
      status: 'open',
      organizerId: auth.currentUser!.uid,
      organizerName: userProfile.name,
      organizerImage: userProfile.avatar,
      spotId: form.spotId || null,
      spotName: form.spotName || null
    });
    
    alert(t('createSpot.alerts.createSuccess'));
    router.push('/trips');

  } catch (error) {
    console.error("Error:", error);
    alert(t('common.failed'));
  }
};
</script>

<style scoped>
.glass-input {
  @apply w-full p-3 rounded-xl border border-white/10 bg-slate-900/50 text-white outline-none transition-all duration-300;
}
.glass-input:focus {
  @apply border-purple-500 bg-slate-900/80;
}
.glass-input option, .glass-input optgroup {
  @apply bg-slate-800 text-white;
}
.fade-up { animation: fadeUp 0.6s ease-out; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>