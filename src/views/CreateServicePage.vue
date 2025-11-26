<template>
  <div class="create-layout">
    
    <div class="left-panel">
      <div class="overlay-content">
        <h1>{{ t('createService.heroTitle') }}</h1>
        <p>{{ t('createService.heroSub') }}</p>
        
        <div class="steps-vertical">
          <div class="step-item" :class="{ active: currentStep === 1, done: currentStep > 1 }">
            <div class="dot">1</div>
            <span>{{ t('createService.step1') }}</span>
          </div>
          <div class="step-line"></div>
          <div class="step-item" :class="{ active: currentStep === 2, done: currentStep > 2 }">
            <div class="dot">2</div>
            <span>{{ t('createService.step2') }}</span>
          </div>
          <div class="step-line"></div>
          <div class="step-item" :class="{ active: currentStep === 3, done: currentStep > 3 }">
            <div class="dot">3</div>
            <span>{{ t('createService.step3') }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="right-panel">
      <div class="form-wrapper">
        
        <div class="mobile-header">{{ t('createTrip.mobileStep', { step: currentStep }) }}</div>

        <div v-if="currentStep === 1" class="form-section fade-up">
          <h2 class="section-title">{{ t('createService.section1Title') }}</h2>
          <p class="section-subtitle">{{ t('createService.section1Sub') }}</p>

          <div class="input-wrap">
            <label>{{ t('createService.nameLabel') }}</label>
            <input type="text" v-model="form.name" :placeholder="t('createService.namePlaceholder')" class="clean-input large" />
          </div>

          <div class="input-wrap">
            <label>{{ t('createService.catLabel') }}</label>
            <select v-model="form.category" class="clean-input">
              <option disabled value="">{{ t('common.select') }}...</option>
              <option value="Campsite">⛺ {{ t('directory.catCampsite') }}</option>
              <option value="Chalet">🏡 {{ t('directory.catChalet') }}</option>
              <option value="Guide">🧗 {{ t('directory.catGuide') }}</option>
              <option value="Transport">🚙 {{ t('directory.catTransport') }}</option>
              <option value="Rental">🎒 {{ t('directory.catRental') }}</option>
              <option value="Event">🚩 {{ t('directory.catEvent') }}</option>
            </select>
          </div>

          <div class="grid-2">
            <div class="input-wrap">
              <label>{{ t('createService.stateLabel') }}</label>
              <select v-model="form.state" class="clean-input">
                <option disabled value="">{{ t('common.selectState') }}</option>
                <option v-for="state in MALAYSIA_STATES" :key="state" :value="state">{{ state }}</option>
              </select>
            </div>
            <div class="input-wrap">
              <label>{{ t('createService.locLabel') }}</label>
              <input type="text" v-model="form.location" :placeholder="t('createService.locPlaceholder')" class="clean-input" />
            </div>
          </div>
        </div>

        <div v-if="currentStep === 2" class="form-section fade-up">
          <h2 class="section-title">{{ t('createService.section2Title') }}</h2>
          <p class="section-subtitle">{{ t('createService.section2Sub', { category: form.category }) }}</p>

          <div v-if="['Campsite', 'Chalet', 'Event'].includes(form.category)">
             <div class="grid-2">
               <div class="input-wrap">
                 <label>{{ t('service.checkIn') }}</label>
                 <input type="time" v-model="form.checkIn" class="clean-input" />
               </div>
               <div class="input-wrap">
                 <label>{{ t('service.checkOut') }}</label>
                 <input type="time" v-model="form.checkOut" class="clean-input" />
               </div>
             </div>
             
             <div class="input-wrap mt-4">
               <label>{{ t('createService.facilitiesLabel') }}</label>
               <div class="tags-container">
                 <div v-for="fac in FACILITY_OPTIONS" :key="fac" class="tag-item" 
                      :class="{ active: form.facilities.includes(fac) }"
                      @click="toggleFacility(fac)">
                   {{ fac }}
                 </div>
               </div>
             </div>
          </div>

          <div v-if="form.category === 'Guide'">
             <div class="grid-2">
               <div class="input-wrap">
                 <label>{{ t('createService.priceType') }}</label>
                 <select v-model="form.priceType" class="clean-input">
                   <option value="pax">{{ t('createService.perPax') }}</option>
                   <option value="group">{{ t('createService.perGroup') }}</option>
                   <option value="day">{{ t('createService.perDay') }}</option>
                 </select>
               </div>
               <div class="input-wrap">
                 <label>{{ t('createService.rateLabel') }}</label>
                 <input type="number" v-model="form.price" placeholder="0" class="clean-input" />
               </div>
             </div>
             <div class="input-wrap mt-4">
               <label>{{ t('service.ratio') }}</label>
               <input type="text" v-model="form.guideRatio" placeholder="Cth: 1:7" class="clean-input" />
             </div>
             <div class="input-wrap">
               <label>{{ t('service.cert') }}</label>
               <input type="text" v-model="form.certification" placeholder="Cth: WFA, Malim Gunung Berlesen" class="clean-input" />
             </div>
          </div>

          <div v-if="form.category === 'Transport'">
             <div class="input-wrap">
               <label>{{ t('service.vehicleType') }}</label>
               <input type="text" v-model="form.vehicleType" placeholder="Cth: Hilux 4x4, Van" class="clean-input" />
             </div>
             <div class="input-wrap">
               <label>{{ t('service.coverage') }}</label>
               <textarea v-model="form.coverageArea" rows="3" class="clean-input" placeholder="Cth: Lojing - Yong Belar"></textarea>
             </div>
             <div class="input-wrap">
               <label>{{ t('service.maxPax') }}</label>
               <input type="number" v-model="form.maxPax" placeholder="4" class="clean-input" />
             </div>
          </div>

          <div v-if="form.category === 'Rental'">
             <div class="input-wrap">
               <label>{{ t('service.rentalList') }}</label>
               <textarea v-model="form.equipmentList" rows="6" class="clean-input" :placeholder="t('createService.rentalPlaceholder')"></textarea>
             </div>
             <div class="input-wrap">
               <label>{{ t('service.pickup') }}</label>
               <input type="text" v-model="form.pickupLocation" placeholder="Cth: Gombak" class="clean-input" />
             </div>
          </div>

          <div v-if="form.category !== 'Guide' && form.category !== 'Rental'" class="input-wrap mt-4">
             <label>{{ t('createService.priceLabel') }}</label>
             <input type="text" v-model="form.priceDisplay" :placeholder="t('createService.pricePlaceholder')" class="clean-input" />
          </div>

        </div>

        <div v-if="currentStep === 3" class="form-section fade-up">
          <h2 class="section-title">{{ t('createService.section3Title') }}</h2>
          <p class="section-subtitle">{{ t('createService.section3Sub') }}</p>

          <div class="form-group">
            <label class="section-label">📸 {{ t('createService.galleryLabel') }} ({{ rawFiles.length }} / 10)</label>
            <div class="multi-upload-grid">
              <div class="add-img-box" @click="triggerMultiUpload" v-if="rawFiles.length < 10">
                <span class="plus">+</span>
                <span>{{ t('common.add') }}</span>
              </div>
              <input type="file" ref="multiFileInput" multiple accept="image/*" @change="handleMultiUpload" hidden />

              <div v-for="(img, index) in previewImages" :key="index" class="preview-thumb">
                <img :src="img" />
                <button class="btn-remove-img" @click="removeImage(index)">×</button>
              </div>
            </div>
          </div>

          <div class="input-wrap mt-4">
            <label>{{ t('createService.descLabel') }}</label>
            <textarea v-model="form.description" rows="5" class="clean-input" :placeholder="t('createService.descPlaceholder')"></textarea>
          </div>

          <div class="input-wrap">
            <label>{{ t('createService.waLabel') }}</label>
            <div class="currency-input">
              <span>+60</span>
              <input type="number" v-model="form.whatsapp" placeholder="123456789" />
            </div>
          </div>
        </div>

        <div class="action-bar">
          <button v-if="currentStep > 1" @click="prevStep" class="btn-text">{{ t('common.back') }}</button>
          <div class="spacer"></div>
          <button v-if="currentStep < 3" @click="nextStep" class="btn-pill">{{ t('common.next') }} &rarr;</button>
          <button v-if="currentStep === 3" @click="submitService" class="btn-pill finish" :disabled="loading">
            {{ loading ? t('common.uploading') : t('createService.submitBtn') }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'; // Import I18N
import { auth, db, storage } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MALAYSIA_STATES } from '../constants/data';

const { t } = useI18n(); // Init Translation
const router = useRouter();
const currentStep = ref(1);
const loading = ref(false);
const multiFileInput = ref<HTMLInputElement | null>(null);

// Fasiliti kekal hardcode atau boleh translate manual jika perlu
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

// Images Logic
const previewImages = ref<string[]>([]);
const rawFiles = ref<File[]>([]);

const triggerMultiUpload = () => { multiFileInput.value?.click(); };

const handleMultiUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const files = Array.from(target.files);
    const remainingSlots = 10 - rawFiles.value.length;
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      rawFiles.value.push(file);
      const reader = new FileReader();
      reader.onload = (e) => { if (e.target?.result) previewImages.value.push(e.target.result as string); };
      reader.readAsDataURL(file);
    });
  }
};

const removeImage = (index: number) => {
  previewImages.value.splice(index, 1);
  rawFiles.value.splice(index, 1);
};

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
  
  loading.value = true;
  try {
    const uploadedUrls: string[] = [];
    for (let i = 0; i < rawFiles.value.length; i++) {
      const file = rawFiles.value[i];
      if (!file) continue;
      const fileRef = storageRef(storage, `services/${auth.currentUser.uid}_${Date.now()}_${i}.jpg`);
      const snapshot = await uploadBytes(fileRef, file);
      const url = await getDownloadURL(snapshot.ref);
      uploadedUrls.push(url);
    }

    const serviceData = {
      ownerId: auth.currentUser.uid,
      ownerName: auth.currentUser.displayName || 'Organizer',
      ownerAvatar: auth.currentUser.photoURL || '',
      createdAt: serverTimestamp(),
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
    };

    await addDoc(collection(db, 'services'), serviceData);
    alert(t('createService.successMsg'));
    router.push('/directory');

  } catch (e) {
    console.error(e);
    alert(t('common.error'));
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* STYLE SAMA SEPERTI SEBELUM INI (SPLIT SCREEN) */
.create-layout { display: flex; min-height: 100vh; background: #fff; overflow: hidden; }

.left-panel {
  width: 40%;
  background-image: url('https://images.unsplash.com/photo-1533240332313-0db49b459ad6?q=80&w=1000&auto=format&fit=crop');
  background-size: cover; background-position: center; height: 100vh;
  display: flex; flex-direction: column; justify-content: flex-start; 
  padding: 4rem; padding-top: 20vh; color: white; position: relative;
}
.left-panel::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)); }
.overlay-content { position: relative; z-index: 2; }
.left-panel h1 { font-size: 3rem; margin: 0 0 15px 0; line-height: 1.1; font-weight: 800; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
.left-panel p { opacity: 0.9; font-size: 1.1rem; }

.steps-vertical { margin-top: 3rem; display: flex; flex-direction: column; gap: 0; }
.step-item { display: flex; align-items: center; gap: 15px; opacity: 0.5; transition: opacity 0.3s; min-height: 40px; }
.step-item.active { opacity: 1; font-weight: bold; }
.step-item.done .dot { background: #e67e22; border-color: #e67e22; color: white; font-weight: bold; }
.dot { width: 32px; height: 32px; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; background: rgba(255,255,255,0.1); backdrop-filter: blur(5px); }
.step-line { width: 2px; height: 30px; background: rgba(255,255,255,0.3); margin-left: 15px; }

.right-panel { width: 60%; height: 100vh; overflow-y: auto; position: relative; background: #ffffff; }
.form-wrapper { max-width: 650px; margin: 0 auto; padding: 4rem 3rem 120px 3rem; }
.mobile-header { display: none; }

.section-title { font-size: 2rem; color: #2c3e50; margin: 0; font-weight: 800; letter-spacing: -1px; }
.section-subtitle { color: #7f8c8d; margin-bottom: 2.5rem; font-size: 1.1rem; }

.input-wrap { margin-bottom: 1.8rem; }
.input-wrap label { display: block; font-size: 0.85rem; font-weight: 700; color: #34495e; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; }
.clean-input { width: 100%; padding: 0.8rem 0; border: none; border-bottom: 2px solid #e0e0e0; font-size: 1.1rem; outline: none; transition: border-color 0.3s; background: transparent; color: #2c3e50; font-family: inherit; }
.clean-input:focus { border-bottom-color: #e67e22; }
.clean-input.large { font-size: 1.5rem; font-weight: 800; padding: 1rem 0; }

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
.mt-4 { margin-top: 2rem; }

.tags-container { display: flex; flex-wrap: wrap; gap: 10px; }
.tag-item { padding: 8px 16px; border: 1px solid #eee; border-radius: 8px; cursor: pointer; user-select: none; transition: all 0.2s; background: #f8f9fa; color: #555; }
.tag-item.active { background: #e67e22; color: white; border-color: #e67e22; font-weight: 600; box-shadow: 0 2px 5px rgba(230, 126, 34, 0.3); }

.multi-upload-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
.add-img-box { width: 100%; height: 100px; border: 2px dashed #ccc; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; color: #999; transition: 0.2s; }
.add-img-box:hover { border-color: #e67e22; color: #e67e22; background: #fff8f0; }
.plus { font-size: 1.5rem; font-weight: bold; }
.preview-thumb { position: relative; width: 100%; height: 100px; border-radius: 8px; overflow: hidden; }
.preview-thumb img { width: 100%; height: 100%; object-fit: cover; }
.btn-remove-img { position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); color: white; border: none; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; }

.currency-input { display: flex; align-items: baseline; border-bottom: 2px solid #e0e0e0; }
.currency-input span { font-size: 1.2rem; color: #999; margin-right: 5px; font-weight: bold; }
.currency-input input { flex: 1; border: none; padding: 0.8rem 0; font-size: 1.5rem; font-weight: bold; outline: none; color: #2c3e50; }

.action-bar { position: fixed; bottom: 0; right: 0; width: 60%; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); padding: 1.5rem 3rem; border-top: 1px solid #eaeaea; display: flex; align-items: center; z-index: 10; box-shadow: 0 -5px 20px rgba(0,0,0,0.03); }
.spacer { flex: 1; }
.btn-text { background: none; border: none; color: #7f8c8d; font-weight: bold; cursor: pointer; font-size: 1rem; }
.btn-pill { background: #2c3e50; color: white; border: none; padding: 1rem 3rem; border-radius: 50px; font-weight: bold; font-size: 1rem; cursor: pointer; transition: transform 0.2s; box-shadow: 0 5px 15px rgba(44, 62, 80, 0.2); }
.btn-pill:hover { transform: translateY(-2px); background: #34495e; }
.btn-pill.finish { background: #e67e22; box-shadow: 0 5px 15px rgba(230, 126, 34, 0.3); }
.btn-pill.finish:hover { background: #d35400; }

.fade-up { animation: fadeUp 0.5s ease-out; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 1024px) {
  .create-layout { flex-direction: column; }
  .left-panel { display: none; }
  .right-panel { width: 100%; padding: 0; height: auto; overflow: visible; }
  .form-wrapper { padding: 2rem 1.5rem 100px 1.5rem; }
  .action-bar { width: 100%; padding: 1rem 1.5rem; }
  .grid-2 { grid-template-columns: 1fr; gap: 1.5rem; }
  .mobile-header { display: block; margin-bottom: 2rem; font-size: 0.9rem; color: #999; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; text-align: center; margin-top: 1rem;}
}
</style>