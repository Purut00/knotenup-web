<template>
  <div class="min-h-screen bg-[#0f172a] relative overflow-x-hidden text-white">
    
    <div class="absolute inset-0 z-0 opacity-[0.08] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' viewBox=\'0 0 1000 1000\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400\' stroke=\'white\' fill=\'none\' stroke-width=\'2\' opacity=\'0.5\'/%3E%3C/svg%3E')] bg-cover"></div>
    <div class="absolute top-0 left-0 w-[60vw] h-[60vw] bg-[#6c63ff] blur-[150px] opacity-15 pointer-events-none rounded-full"></div>
    <div class="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-[#ff8c42] blur-[150px] opacity-10 pointer-events-none rounded-full"></div>

    <div class="container mx-auto px-6 pt-[176px] pb-20 max-w-[800px] relative z-[2]">
      
      <div class="text-center mb-10 relative z-10">
        <h1 class="text-4xl font-bold text-white mb-2">
          {{ isEditMode ? t('createSpot.editTitle') : t('createSpot.title') }}
        </h1>
        <p class="text-gray-400">
          {{ isEditMode ? t('createSpot.editSub') : t('createSpot.sub') }}
        </p>
      </div>

      <div class="flex items-center justify-center mb-8 relative z-10">
        <div class="flex flex-col items-center gap-[5px] opacity-50 transition duration-300 relative z-[2]" :class="{ 'opacity-100': currentStep >= 1 }">
          <div class="w-[40px] h-[40px] rounded-full border-[2px] border-[#6c63ff] text-[#6c63ff] flex items-center justify-center font-bold bg-[#0f172a]" :class="{ 'bg-[#6c63ff] text-white': currentStep > 1, 'border-[#ff8c42] text-[#ff8c42]': currentStep === 1 }">1</div>
          <span class="text-[0.8rem] font-semibold uppercase">{{ t('createSpot.steps.step1') }}</span>
        </div>
        <div class="w-[60px] h-[2px] bg-white/10 mx-[10px] mb-[20px] transition duration-300" :class="{ 'bg-gradient-to-r from-[#6c63ff] to-[#ff8c42]': currentStep > 1 }"></div>
        <div class="flex flex-col items-center gap-[5px] opacity-50 transition duration-300 relative z-[2]" :class="{ 'opacity-100': currentStep >= 2 }">
          <div class="w-[40px] h-[40px] rounded-full border-[2px] border-[#6c63ff] text-[#6c63ff] flex items-center justify-center font-bold bg-[#0f172a]" :class="{ 'bg-[#6c63ff] text-white': currentStep > 2, 'border-[#ff8c42] text-[#ff8c42]': currentStep === 2 }">2</div>
          <span class="text-[0.8rem] font-semibold uppercase">{{ t('createSpot.steps.step2') }}</span>
        </div>
      </div>

      <div class="bg-[#1e293b]/60 border border-white/10 rounded-[20px] p-10 max-sm:p-6 backdrop-blur-[15px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-10 animate-fade-in-up">
        
        <div v-if="currentStep === 1">
          <h2 class="text-2xl text-white mb-6 border-b border-white/10 pb-[10px] font-bold">{{ t('createSpot.section1.title') }}</h2>
          
          <div class="mb-6">
            <label class="block text-[0.9rem] text-[#cbd5e1] mb-2 font-semibold">{{ t('createSpot.nameLabel') }}</label>
            <input 
              type="text" 
              v-model="form.name" 
              class="w-full p-3 rounded-[10px] border border-white/10 bg-slate-900/50 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-slate-900/80"
              :placeholder="t('createSpot.namePlaceholder')" 
              @blur="checkDuplicate"
              :disabled="isEditMode"
            />
             <small v-if="duplicateWarning && !isEditMode" class="text-red-400 font-bold mt-1 block">
                ⚠️ {{ t('createSpot.duplicateWarn') }}
            </small>
          </div>

          <div class="mb-6">
            <label class="block text-[0.9rem] text-[#cbd5e1] mb-2 font-semibold">{{ t('createSpot.viaLabel') }}</label>
            <input type="text" v-model="form.via" class="w-full p-3 rounded-[10px] border border-white/10 bg-slate-900/50 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-slate-900/80" :placeholder="t('createSpot.viaPlaceholder')" />
          </div>

          <div class="mb-6">
             <!-- LOCATION PICKER -->
             <LocationPicker 
                v-if="!loading"
                :initialLat="form.latitude ? parseFloat(form.latitude) : undefined"
                :initialLng="form.longitude ? parseFloat(form.longitude) : undefined"
                @update:lat="(val) => form.latitude = val.toString()"
                @update:lng="(val) => form.longitude = val.toString()"
                @update:state="(val) => { if(!form.state) form.state = val; }"
             />
          </div>

          <div class="grid grid-cols-2 gap-5 max-md:grid-cols-1 max-md:gap-0">
            <div class="mb-6">
              <label class="block text-[0.9rem] text-[#cbd5e1] mb-2 font-semibold">{{ t('createSpot.stateLabel') }}</label>
              <div class="relative">
                  <select v-model="form.state" class="w-full p-3 rounded-[10px] border border-white/10 bg-slate-900/50 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-slate-900/80 appearance-none cursor-pointer">
                    <option disabled value="">{{ t('createSpot.options.selectState') }}</option>
                    <option v-for="state in MALAYSIA_STATES" :key="state" :value="state" class="bg-[#1e293b] text-white p-2.5">{{ t('states.' + state) || state }}</option>
                  </select>
                  <i class="fas fa-chevron-down absolute right-[15px] top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"></i>
              </div>
            </div>
            <div class="mb-6">
              <label class="block text-[0.9rem] text-[#cbd5e1] mb-2 font-semibold">{{ t('createSpot.heightLabel') }}</label>
              <input type="number" v-model="form.height" class="w-full p-3 rounded-[10px] border border-white/10 bg-slate-900/50 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-slate-900/80" :placeholder="t('createSpot.heightPlaceholder')" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-5 max-md:grid-cols-1 max-md:gap-0">
            <div class="mb-6">
              <label class="block text-[0.9rem] text-[#cbd5e1] mb-2 font-semibold">{{ t('createSpot.distanceLabel') }}</label>
              <input type="number" step="0.1" v-model="form.distance" class="w-full p-3 rounded-[10px] border border-white/10 bg-slate-900/50 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-slate-900/80" :placeholder="t('createSpot.distancePlaceholder')" />
            </div>
            <div class="mb-6">
              <label class="block text-[0.9rem] text-[#cbd5e1] mb-2 font-semibold">{{ t('createSpot.durationLabel') }}</label>
              <input type="text" v-model="form.duration" class="w-full p-3 rounded-[10px] border border-white/10 bg-slate-900/50 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-slate-900/80" :placeholder="t('createSpot.durationPlaceholder')" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-5 max-md:grid-cols-1 max-md:gap-0">
            <div class="mb-6">
              <label class="block text-[0.9rem] text-[#cbd5e1] mb-2 font-semibold">{{ t('createSpot.diffLabel') || 'Tahap Kesukaran' }}</label>
              <div class="relative">
                  <select v-model="form.difficulty" class="w-full p-3 rounded-[10px] border border-white/10 bg-slate-900/50 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-slate-900/80 appearance-none cursor-pointer">
                    <option value="Easy" class="bg-[#1e293b] text-white p-2.5">{{ t('levels.easy') }}</option>
                    <option value="Moderate" class="bg-[#1e293b] text-white p-2.5">{{ t('levels.moderate') }}</option>
                    <option value="Hard" class="bg-[#1e293b] text-white p-2.5">{{ t('levels.hard') }}</option>
                    <option value="Extreme" class="bg-[#1e293b] text-white p-2.5">{{ t('levels.extreme') }}</option>
                  </select>
                  <i class="fas fa-chevron-down absolute right-[15px] top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"></i>
              </div>
            </div>
            <div class="mb-6">
              <label class="block text-[0.9rem] text-[#cbd5e1] mb-2 font-semibold">{{ t('createSpot.permitLabel') }}</label>
              <div class="relative">
                  <select v-model="form.permit" class="w-full p-3 rounded-[10px] border border-white/10 bg-slate-900/50 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-slate-900/80 appearance-none cursor-pointer">
                    <option value="Unknown" class="bg-[#1e293b] text-white p-2.5">{{ t('createSpot.options.unknown') }}</option>
                    <option value="No" class="bg-[#1e293b] text-white p-2.5">{{ t('createSpot.options.notRequired') }}</option>
                    <option value="Perlu" class="bg-[#1e293b] text-white p-2.5">{{ t('createSpot.options.required') }}</option>
                  </select>
                  <i class="fas fa-chevron-down absolute right-[15px] top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"></i>
              </div>
            </div>
          </div>

          <div class="mb-6 mt-4">
            <label class="block text-[0.9rem] text-[#cbd5e1] mb-2 font-semibold">{{ t('createSpot.guideLabel') }}</label>
            <div class="flex gap-[10px] flex-wrap">
              <label class="p-[10px_16px] border border-white/10 rounded-lg cursor-pointer transition duration-200 text-[#cbd5e1] bg-white/5 hover:bg-white/10" :class="{ '!bg-[#6c63ff] !text-white !border-[#6c63ff] shadow-[0_4px_10px_rgba(108,99,255,0.3)]': form.guideRequired === 'Unknown' }">
                 <input type="radio" v-model="form.guideRequired" value="Unknown" hidden>
                 <span>{{ t('createSpot.options.unknown') }}</span>
               </label>
               <label class="p-[10px_16px] border border-white/10 rounded-lg cursor-pointer transition duration-200 text-[#cbd5e1] bg-white/5 hover:bg-white/10" :class="{ '!bg-[#6c63ff] !text-white !border-[#6c63ff] shadow-[0_4px_10px_rgba(108,99,255,0.3)]': form.guideRequired === 'No' }">
                 <input type="radio" v-model="form.guideRequired" value="No" hidden>
                 <span>{{ t('createSpot.options.notRequired') }}</span>
               </label>
               <label class="p-[10px_16px] border border-white/10 rounded-lg cursor-pointer transition duration-200 text-[#cbd5e1] bg-white/5 hover:bg-white/10" :class="{ '!bg-[#6c63ff] !text-white !border-[#6c63ff] shadow-[0_4px_10px_rgba(108,99,255,0.3)]': form.guideRequired === 'Optional' }">
                 <input type="radio" v-model="form.guideRequired" value="Optional" hidden>
                 <span>{{ t('createSpot.guideOptions.optional') || 'Optional' }}</span>
               </label>
               <label class="p-[10px_16px] border border-white/10 rounded-lg cursor-pointer transition duration-200 text-[#cbd5e1] bg-white/5 hover:bg-white/10" :class="{ '!bg-[#6c63ff] !text-white !border-[#6c63ff] shadow-[0_4px_10px_rgba(108,99,255,0.3)]': form.guideRequired === 'Yes' }">
                 <input type="radio" v-model="form.guideRequired" value="Yes" hidden>
                 <span>{{ t('createSpot.guideOptions.yes') || 'Mandatory' }}</span>
               </label>
            </div>
          </div>

          <div class="mb-6 mt-4">
            <label class="block text-[0.9rem] text-[#cbd5e1] mb-2 font-semibold">{{ t('createSpot.mapsLinkLabel') }}</label>
            <input type="text" v-model="form.mapsLink" class="w-full p-3 rounded-[10px] border border-white/10 bg-slate-900/50 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-slate-900/80" :placeholder="t('createSpot.mapPlaceholder')" />
          </div>

          <div class="mb-6">
            <label class="block text-[0.9rem] text-[#cbd5e1] mb-2 font-semibold">{{ t('createSpot.gpxLabel') }}</label>
            <div class="border-2 border-dashed border-white/20 rounded-[10px] p-[1.5rem] flex items-center justify-between gap-[1rem] bg-slate-900/20 transition duration-200 hover:border-emerald-500 hover:bg-emerald-500/5">
               <div class="flex flex-col items-start">
                 <i class="fas fa-map-marked-alt text-2xl mb-2 text-green-400"></i>
                 <span v-if="gpxFile" class="text-white font-bold">{{ gpxFile.name }}</span>
                 <span v-else-if="form.gpxUrl" class="text-green-400 font-bold">{{ t('createSpot.gpx.existing') }}</span>
                 <span v-else class="text-gray-400 text-sm">{{ t('createSpot.gpx.prompt') }}</span>
               </div>
               <input type="file" accept=".gpx" @change="handleGpxSelect" class="hidden" ref="gpxInput" />
               <button class="bg-[#34495e] text-white p-[8px_16px] rounded-[6px] border-none cursor-pointer" @click="((gpxInput as any) || {}).click?.()">{{ t('createSpot.chooseFile') }}</button>
            </div>
          </div>
        </div>

        <div v-if="currentStep === 2">
          <h2 class="text-2xl text-white mb-6 border-b border-white/10 pb-[10px] font-bold">{{ t('createSpot.galleryInfoTitle') }}</h2>

          <div class="mb-6">
            <label class="block text-[0.9rem] text-[#cbd5e1] mb-2 font-semibold">📸 {{ t('createSpot.imagesLabelLimit') }}</label>
            <div class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-[15px] mt-2">
               <div class="h-[100px] border-2 border-dashed border-white/20 rounded-[12px] flex flex-col items-center justify-center cursor-pointer text-[#94a3b8] transition duration-200 bg-slate-900/20 hover:border-[#e67e22] hover:text-[#e67e22]" @click="triggerMultiUpload" v-if="previewImages.length < 10">
                 <i class="fas fa-plus text-2xl mb-2 text-purple-400"></i>
                 <span>{{ t('createSpot.addPhoto') }}</span>
               </div>
               <input type="file" ref="multiFileInput" multiple accept="image/*" @change="handleImageSelect" hidden />

               <div v-for="(img, index) in previewImages" :key="index" class="relative h-[100px] rounded-[12px] overflow-hidden border border-white/10">
                 <img :src="img" class="w-full h-full object-cover" />
                 <button class="absolute top-[2px] right-[2px] w-[22px] h-[22px] bg-black/70 text-white border-none rounded-full cursor-pointer flex items-center justify-center text-[14px]" @click="removeImage(index)">×</button>
               </div>
            </div>
          </div>

          <div class="mb-6 mt-6">
              <label class="block text-[0.9rem] text-[#cbd5e1] mb-2 font-semibold">💡 {{ t('createSpot.labels.tips') }}</label>
              <textarea v-model="form.tips" rows="2" class="w-full p-3 rounded-[10px] border border-white/10 bg-slate-900/50 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-slate-900/80" :placeholder="t('createSpot.placeholders.tips')"></textarea>
          </div>

          <div class="mb-6">
              <label class="block text-[0.9rem] text-[#cbd5e1] mb-2 font-semibold">🚗 {{ t('createSpot.labels.parking') }}</label>
              <input type="text" v-model="form.parking" class="w-full p-3 rounded-[10px] border border-white/10 bg-slate-900/50 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-slate-900/80" :placeholder="t('createSpot.placeholders.parking')" />
          </div>

          <div class="mb-6">
              <label class="block text-[0.9rem] text-[#cbd5e1] mb-2 font-semibold">📍 {{ t('createSpot.labels.checkpoint') }}</label>
              <textarea v-model="form.checkpointDetail" rows="3" class="w-full p-3 rounded-[10px] border border-white/10 bg-slate-900/50 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-slate-900/80" :placeholder="t('createSpot.placeholders.checkpoint')"></textarea>
          </div>

          <div class="mb-6">
              <label class="block text-[0.9rem] text-[#cbd5e1] mb-2 font-semibold">📝 {{ t('createSpot.labels.other') }}</label>
              <textarea v-model="form.description" rows="4" class="w-full p-3 rounded-[10px] border border-white/10 bg-slate-900/50 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-slate-900/80" :placeholder="t('createSpot.descPlaceholder')"></textarea>
          </div>
        </div>

        <div class="mt-8 flex justify-between items-center">
           <button v-if="currentStep === 1" class="bg-transparent text-[#94a3b8] border border-white/20 p-[10px_24px] rounded-[50px] font-semibold cursor-pointer transition duration-200 hover:text-white hover:border-white" @click="$router.back()">
             {{ t('common.cancel') }}
           </button>
           <button v-if="currentStep === 2" class="bg-transparent text-[#94a3b8] border border-white/20 p-[10px_24px] rounded-[50px] font-semibold cursor-pointer transition duration-200 hover:text-white hover:border-white" @click="prevStep">
             <i class="fas fa-arrow-left mr-2"></i> {{ t('common.back') }}
           </button>
           
           <div v-if="currentStep === 1" class="flex-grow"></div>

           <button v-if="currentStep === 1" @click="nextStep" class="bg-gradient-to-br from-[#6c63ff] to-[#5b54e0] text-white border-none p-[12px_30px] rounded-[50px] font-bold cursor-pointer shadow-[0_4px_15px_rgba(108,99,255,0.4)] transition duration-200 hover:-translate-y-[2px]">
             {{ t('common.next') }} <i class="fas fa-arrow-right ml-2"></i>
           </button>
           <button v-if="currentStep === 2" @click="submitSpot" class="bg-gradient-to-br from-[#e67e22] to-[#d35400] text-white border-none p-[12px_30px] rounded-[50px] font-bold cursor-pointer shadow-[0_4px_15px_rgba(230,126,34,0.4)] transition duration-200 hover:-translate-y-[2px] disabled:bg-[#555] disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none" :disabled="loading">
             {{ loading ? t('common.uploading') : (isEditMode ? t('createSpot.submitUpdate') : t('createSpot.submitCreate')) }}
           </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { auth, db, storage } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc, GeoPoint, updateDoc } from 'firebase/firestore'; 
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MALAYSIA_STATES } from '../constants/data';
import { isSpam } from '../utils/spamFilter';
import { getEffectiveUserProfile } from '../utils/userProfile';
import LocationPicker from '../components/common/LocationPicker.vue';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const currentStep = ref(1); 
const loading = ref(false);
const duplicateWarning = ref(false);
const isEditMode = ref(false);
const spotId = route.params.id as string; 
const multiFileInput = ref<HTMLInputElement | null>(null);
const gpxInput = ref<HTMLInputElement | null>(null);

const previewImages = ref<string[]>([]); 
const newImageFiles = ref<File[]>([]); 
const existingImageUrls = ref<string[]>([]);
const gpxFile = ref<File | null>(null);

const form = reactive({
  name: '', via: '', state: '', height: null, difficulty: 'Moderate',
  permit: 'No', guideRequired: 'No', mapsLink: '', 
  distance: null, duration: '', 
  tips: '', parking: '', checkpointDetail: '', description: '', 
  images: [] as string[], gpxUrl: '',
  latitude: '', 
  longitude: '' 
});

onMounted(async () => {
  if (spotId) {
    isEditMode.value = true;
    loading.value = true;
    try {
      const docSnap = await getDoc(doc(db, 'spots', spotId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        Object.assign(form, data);
        
        if (data.location) {
            form.latitude = data.location.latitude;
            form.longitude = data.location.longitude;
        }

        if (data.image && (!data.images || data.images.length === 0)) form.images = [data.image];
        existingImageUrls.value = [...form.images];
        previewImages.value = [...form.images];
      }
    } catch (e) { console.error(e); }
    finally { loading.value = false; }
  }
});

const nextStep = () => {
  if (!form.name || !form.state) {
    alert(t('createSpot.alerts.fillNameState'));
    return;
  }
  currentStep.value = 2;
  window.scrollTo(0, 0);
};

const prevStep = () => {
  currentStep.value = 1;
  window.scrollTo(0, 0);
};

const triggerMultiUpload = () => { multiFileInput.value?.click(); };

const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const files = Array.from(target.files);
    if (previewImages.value.length + files.length > 10) return alert(t('createSpot.alerts.maxImages'));

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(t('createSpot.alerts.fileTooLarge', { name: file.name }));
        continue;
      }
      newImageFiles.value.push(file);
      const reader = new FileReader();
      reader.onload = (e) => { if(e.target?.result) previewImages.value.push(e.target.result as string); };
      reader.readAsDataURL(file);
    }
    target.value = ''; 
  }
};

const removeImage = (index: number) => {
   const removedSrc = previewImages.value[index];
   if (!removedSrc) return;
   previewImages.value.splice(index, 1);
   if (existingImageUrls.value.includes(removedSrc)) {
     existingImageUrls.value = existingImageUrls.value.filter(url => url !== removedSrc);
   } else {
     const offset = existingImageUrls.value.length;
     const fileIndex = index - offset;
     if (fileIndex >= 0) newImageFiles.value.splice(fileIndex, 1);
   }
};

const handleGpxSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) gpxFile.value = target.files[0];
};

const checkDuplicate = async () => {
  if (!form.name || isEditMode.value) return; 
  const q = query(collection(db, 'spots'), where('name_lowercase', '==', form.name.toLowerCase().trim()));
  const snap = await getDocs(q);
  duplicateWarning.value = !snap.empty;
};

const submitSpot = async () => {
  if (!auth.currentUser) return alert(t('auth.loginRequired'));
  if (isSpam(form.name) || isSpam(form.description) || isSpam(form.via)) return alert(t('createSpot.alerts.spam'));

  loading.value = true;
  try {
    const newUploadedUrls: string[] = [];
    for (const file of newImageFiles.value) {
       // [SECURE] Upload ke folder user sendiri
       const fileRef = storageRef(storage, `uploads/${auth.currentUser.uid}/spots/images/${Date.now()}_${file.name}`);
       const snap = await uploadBytes(fileRef, file);
       const url = await getDownloadURL(snap.ref);
       newUploadedUrls.push(url);
    }

    const finalImages = [...existingImageUrls.value, ...newUploadedUrls];

    let gpxDownloadUrl = form.gpxUrl;
    if (gpxFile.value) {
      // [SECURE] Upload ke folder user sendiri
      const gpxRef = storageRef(storage, `uploads/${auth.currentUser.uid}/spots/gpx/${Date.now()}.gpx`);
      const snap = await uploadBytes(gpxRef, gpxFile.value);
      gpxDownloadUrl = await getDownloadURL(snap.ref);
    }

    const lat = parseFloat(form.latitude) || 0;
    const lng = parseFloat(form.longitude) || 0;

    const spotData = {
      ...form, 
      images: finalImages,
      image: finalImages[0] || '',
      gpxUrl: gpxDownloadUrl,
      name_lowercase: form.name.toLowerCase().trim(),
      location: new GeoPoint(lat, lng) 
    };

    if (isEditMode.value) {
      await updateDoc(doc(db, 'spots', spotId), {
         ...spotData,
         lastEditedBy: auth.currentUser.displayName || 'User',
         lastEditedAt: serverTimestamp()
      });
      alert(t('createSpot.alerts.updateSuccess'));
      router.push('/spots/' + spotId);
    } else {
      // Get effective profile
      const userProfile = await getEffectiveUserProfile(auth.currentUser);

      await addDoc(collection(db, 'spots'), {
        ...spotData,
        contributorId: auth.currentUser.uid,
        contributorName: userProfile.name,
        createdAt: serverTimestamp()
      });
      alert(t('createSpot.alerts.createSuccess'));
      router.push('/spots');
    }
  } catch (e) {
    console.error(e);
    alert(t('common.error'));
  } finally {
    loading.value = false;
  }
};
</script>