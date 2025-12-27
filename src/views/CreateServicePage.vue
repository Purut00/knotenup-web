<template>
  <div class="min-h-screen bg-slate-900 relative overflow-x-hidden text-white">
    
    <!-- Background Decor -->
    <div class="absolute inset-0 z-0 opacity-10 pointer-events-none" style="background-image: url('data:image/svg+xml,...')"></div>
    <div class="absolute top-0 left-0 w-3/4 h-3/4 bg-purple-600/20 blur-[150px] rounded-full pointer-events-none"></div>
    <div class="absolute bottom-0 right-0 w-3/4 h-3/4 bg-orange-500/10 blur-[150px] rounded-full pointer-events-none"></div>

    <div class="container mx-auto px-6 pt-36 pb-20 relative z-10 max-w-4xl">
      
      <div class="text-center mb-10">
        <h1 class="text-4xl md:text-5xl font-bold mb-3">{{ t('createService.heroTitle') || 'Daftar Servis Baru' }}</h1>
        <p class="text-slate-400">{{ t('createService.heroSub') || 'Iklankan perkhidmatan anda kepada komuniti outdoor.' }}</p>
      </div>

      <!-- STEPPER -->
      <div class="flex items-center justify-center mb-10 relative z-10 hidden md:flex">
         <!-- Step 1 -->
         <div class="flex flex-col items-center gap-2 transition-opacity duration-300" :class="{ 'opacity-100': currentStep >= 1, 'opacity-50': currentStep < 1 }">
            <div class="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold bg-slate-900 transition-colors"
                 :class="currentStep > 1 ? 'border-purple-500 bg-purple-500 text-white' : 'border-purple-500 text-purple-500'">1</div>
            <span class="text-xs font-bold uppercase tracking-wider">{{ t('createService.stepLabels.basic') }}</span>
         </div>
         <div class="w-16 h-0.5 mx-4 bg-white/10"></div>
         <!-- Step 2 -->
         <div class="flex flex-col items-center gap-2 transition-opacity duration-300" :class="{ 'opacity-100': currentStep >= 2, 'opacity-50': currentStep < 2 }">
            <div class="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold bg-slate-900 transition-colors"
                 :class="currentStep > 2 ? 'border-purple-500 bg-purple-500 text-white' : (currentStep === 2 ? 'border-orange-500 text-orange-500' : 'border-purple-500 text-purple-500')">2</div>
            <span class="text-xs font-bold uppercase tracking-wider">{{ t('createService.stepLabels.details') }}</span>
         </div>
         <div class="w-16 h-0.5 mx-4 bg-white/10"></div>
         <!-- Step 3 -->
         <div class="flex flex-col items-center gap-2 transition-opacity duration-300" :class="{ 'opacity-100': currentStep >= 3, 'opacity-50': currentStep < 3 }">
            <div class="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold bg-slate-900 transition-colors"
                 :class="currentStep === 3 ? 'border-orange-500 text-orange-500' : 'border-purple-500 text-purple-500'">3</div>
            <span class="text-xs font-bold uppercase tracking-wider">{{ t('createService.stepLabels.gallery') }}</span>
         </div>
      </div>

      <div class="bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 fade-up">
        
        <!-- STEP 1 -->
        <div v-if="currentStep === 1">
          <h2 class="text-2xl font-bold mb-6 border-b border-white/10 pb-4">{{ t('createService.section1Header') }}</h2>
          
          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createService.nameLabel') || 'Nama Servis / Tempat' }}</label>
            <input type="text" v-model="form.name" class="glass-input" :placeholder="t('createService.namePlaceholder')" />
          </div>

          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createService.catLabel') }}</label>
            <div class="relative">
                <select v-model="form.category" class="glass-input appearance-none">
                  <option disabled value="">{{ t('common.select') }}</option>
                  <option value="Campsite">⛺ {{ t('services.campsite') || 'Campsite' }}</option>
                  <option value="Chalet">🏡 {{ t('services.chalet') || 'Chalet / Homestay' }}</option>
                  <option value="Guide">🧗 {{ t('services.guide') || 'Guide / Malim' }}</option>
                  <option value="Transport">🚙 {{ t('services.transport') || 'Transport' }}</option>
                  <option value="Rental">🎒 {{ t('services.equipment') || 'Sewaan Barang' }}</option>
                  <option value="Event">🚩 {{ t('services.event') || 'Event / Trip' }}</option>
                </select>
                <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createSpot.stateLabel') }}</label>
              <div class="relative">
                  <select v-model="form.state" class="glass-input appearance-none">
                    <option disabled value="">{{ t('createSpot.options.selectState') }}</option>
                    <option v-for="state in MALAYSIA_STATES" :key="state" :value="state">{{ t('states.' + state) || state }}</option>
                  </select>
                  <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createService.locLabel') }}</label>
              <input type="text" v-model="form.location" class="glass-input" :placeholder="t('createService.locPlaceholder')" />
            </div>
          </div>
        </div>

        <!-- STEP 2 -->
        <div v-if="currentStep === 2">
          <h2 class="text-2xl font-bold mb-6 border-b border-white/10 pb-4">{{ t('createService.section2Header', { category: form.category || 'Servis' }) }}</h2>

          <!-- Dynamic: Campsite/Chalet -->
          <div v-if="['Campsite', 'Chalet', 'Event'].includes(form.category)">
             <div class="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createService.checkIn') }}</label>
                  <input type="time" v-model="form.checkIn" class="glass-input" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createService.checkOut') }}</label>
                  <input type="time" v-model="form.checkOut" class="glass-input" />
                </div>
             </div>
             
             <div class="mb-6">
               <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createService.facilitiesLabel') }}</label>
               <div class="flex flex-wrap gap-2">
                 <div v-for="fac in FACILITY_OPTIONS" :key="fac" 
                      class="px-4 py-2 rounded-full border border-white/10 bg-white/5 cursor-pointer text-sm text-slate-300 hover:bg-white/10 transition-all select-none"
                      :class="{ 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20': form.facilities.includes(fac) }"
                      @click="toggleFacility(fac)">
                   {{ fac }}
                 </div>
               </div>
             </div>
          </div>

          <!-- Dynamic: Guide -->
          <div v-if="form.category === 'Guide'">
             <div class="grid grid-cols-2 gap-6 mb-6">
                <div>
                   <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createService.priceType') }}</label>
                   <select v-model="form.priceType" class="glass-input appearance-none">
                     <option value="pax">{{ t('createService.options.pax') }}</option>
                     <option value="group">{{ t('createService.options.group') }}</option>
                     <option value="day">{{ t('createService.options.day') }}</option>
                   </select>
                </div>
                <div>
                   <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createService.rateLabel') }}</label>
                   <input type="number" v-model="form.price" class="glass-input" placeholder="0" />
                </div>
             </div>
             <div class="mb-6">
                <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createService.guideRatio') }}</label>
                <input type="text" v-model="form.guideRatio" class="glass-input" :placeholder="t('createService.ratioPlaceholder')" />
             </div>
             <div class="mb-6">
                <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createService.certification') }}</label>
                <input type="text" v-model="form.certification" class="glass-input" :placeholder="t('createService.certPlaceholder')" />
             </div>
          </div>

          <!-- Dynamic: Transport -->
          <div v-if="form.category === 'Transport'">
             <div class="mb-6">
               <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createService.vehicleType') }}</label>
               <input type="text" v-model="form.vehicleType" class="glass-input" :placeholder="t('createService.vehiclePlaceholder')" />
             </div>
             <div class="mb-6">
               <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createService.coverageArea') }}</label>
               <textarea v-model="form.coverageArea" rows="2" class="glass-input"></textarea>
             </div>
             <div class="mb-6">
               <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createService.maxPax') }}</label>
               <input type="number" v-model="form.maxPax" class="glass-input" />
             </div>
          </div>

          <!-- Rental -->
           <div v-if="form.category === 'Rental'">
             <div class="mb-6">
               <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createService.equipmentList') }}</label>
               <textarea v-model="form.equipmentList" rows="5" class="glass-input"></textarea>
             </div>
             <div class="mb-6">
               <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createService.pickupLocation') }}</label>
               <input type="text" v-model="form.pickupLocation" class="glass-input" />
             </div>
          </div>

          <!-- General Price Field -->
          <div v-if="!['Guide', 'Rental'].includes(form.category)" class="mb-6">
             <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createService.priceDisplayLabel') }}</label>
             <input type="text" v-model="form.priceDisplay" class="glass-input" :placeholder="t('createService.pricePlaceholder')" />
          </div>
        </div>

        <!-- STEP 3 -->
        <div v-if="currentStep === 3">
          <h2 class="text-2xl font-bold mb-6 border-b border-white/10 pb-4">{{ t('createService.section3Header') }}</h2>
          
          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createService.imagesCount', { count: rawFiles.length }) }}</label>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
               <div class="h-24 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 hover:border-purple-500 transition-all text-slate-400" @click="triggerMultiUpload" v-if="rawFiles.length < 10">
                 <i class="fas fa-plus text-xl mb-1 text-purple-400"></i>
                 <span class="text-xs">{{ t('createService.addBtn') }}</span>
               </div>
               <input type="file" ref="multiFileInput" multiple accept="image/*" @change="handleMultiUpload" hidden />

               <div v-for="(img, index) in previewImages" :key="index" class="relative h-24 rounded-xl overflow-hidden border border-white/10 group">
                 <img :src="img" class="w-full h-full object-cover" />
                 <button class="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors" @click="removeImage(index)">×</button>
               </div>
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createService.fullDescLabel') }}</label>
            <textarea v-model="form.description" rows="5" class="glass-input" :placeholder="t('createService.fullDescPlaceholder')"></textarea>
          </div>

          <div class="mb-6 bg-green-500/5 p-4 rounded-xl border border-green-500/20">
             <label class="block text-sm font-semibold text-green-400 mb-2">
               <i class="fab fa-whatsapp text-lg mr-2"></i> {{ t('createService.whatsappLabel') || 'WhatsApp Contact' }} (Optional)
             </label>
             <input type="text" v-model="form.whatsapp" class="glass-input" placeholder="e.g. 60123456789" />
             <p class="text-xs text-slate-400 mt-2">
               {{ t('createService.whatsappHint') || 'Jika kosong, kami akan guna nombor WhatsApp di profile anda. Jika tiada, kami akan guna email.' }}
             </p>
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
           <button v-if="currentStep === 3" @click="submitService" class="bg-gradient-to-br from-orange-500 to-red-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-500/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed" :disabled="isUploading || isCreating">
             {{ (isUploading || isCreating) ? t('common.processing') : t('createService.submitBtn') }}
           </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { auth } from '../firebaseConfig';
import { MALAYSIA_STATES } from '../constants/data';
import { useServices } from '../composables/useServices'; 
import { useStorage } from '../composables/useStorage'; 
import { getEffectiveUserProfile } from '../utils/userProfile'; 

const { t } = useI18n();
const router = useRouter();
const { createService, loading: isCreating } = useServices();
const { uploadMultipleImages, uploading: isUploading } = useStorage();

const currentStep = ref(1);
const multiFileInput = ref<HTMLInputElement | null>(null);
const FACILITY_OPTIONS = ["Toilet", "Shower", "Surau", "Plug Point", "Sink/Dapur", "Parking", "BBQ Pit", "Sungai/Air Terjun", "Line Telco Ada", "Campfire Boleh"];

const form = reactive({
  name: '', category: '', state: '', location: '',
  checkIn: '', checkOut: '', facilities: [] as string[],
  priceType: 'pax', price: null, guideRatio: '', certification: '',
  vehicleType: '', coverageArea: '', maxPax: null,
  equipmentList: '', pickupLocation: '',
  priceDisplay: '', 
  description: '', whatsapp: '', images: [] as string[]
});

const previewImages = ref<string[]>([]);
const rawFiles = ref<File[]>([]);

const triggerMultiUpload = () => { multiFileInput.value?.click(); };

const handleMultiUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const files = Array.from(target.files);
    const slots = 10 - rawFiles.value.length;
    files.slice(0, slots).forEach(file => {
       if (file.size > 5*1024*1024) return alert("Fail terlalu besar (>5MB)");
       rawFiles.value.push(file);
       const r = new FileReader();
       r.onload = (e) => { if (e.target?.result) previewImages.value.push(e.target.result as string); };
       r.readAsDataURL(file);
    });
    target.value = '';
  }
};

const removeImage = (index: number) => { previewImages.value.splice(index, 1); rawFiles.value.splice(index, 1); };
const toggleFacility = (fac: string) => { 
  if(form.facilities.includes(fac)) form.facilities = form.facilities.filter(f => f !== fac);
  else form.facilities.push(fac);
};
const nextStep = () => {
  if (currentStep.value === 1 && (!form.name || !form.category || !form.state)) return alert(t('createService.errorBasic'));
  if (currentStep.value < 3) currentStep.value++;
};
const prevStep = () => { if (currentStep.value > 1) currentStep.value--; };

const submitService = async () => {
  if (!auth.currentUser) return alert(t('auth.loginRequired'));
  if (rawFiles.value.length === 0) return alert(t('createService.errorImage'));

  try {
    const uploadedUrls = await uploadMultipleImages(rawFiles.value, `uploads/${auth.currentUser.uid}/services/${Date.now()}`);
    
    // Get effective profile
    const userProfile = await getEffectiveUserProfile(auth.currentUser);

    await createService({
      ownerId: auth.currentUser.uid,
      ownerName: userProfile.name,
      ownerAvatar: userProfile.avatar,
      expiryDate: null, 
      name: form.name,
      category: form.category,
      state: form.state,
      location: form.location,
      description: form.description,
      whatsapp: form.whatsapp,
      images: uploadedUrls,
      image: uploadedUrls[0],
      details: {
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        facilities: form.facilities,
        priceType: form.priceType,
        price: form.price,
        priceDisplay: form.priceDisplay,
        guideRatio: form.guideRatio,
        certification: form.certification,
        vehicleType: form.vehicleType,
        coverageArea: form.coverageArea,
        maxPax: form.maxPax,
        equipmentList: form.equipmentList,
        pickupLocation: form.pickupLocation
      }
    });

    alert(t('createService.successMsg'));
    router.push('/service');

  } catch (e) {
    console.error(e);
    alert(t('common.error'));
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
.glass-input option {
  @apply bg-slate-800 text-white;
}
.fade-up { animation: fadeUp 0.6s ease-out; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>