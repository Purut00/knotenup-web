<template>
  <div class="create-service-page">
    
    <!-- BACKGROUND LAYERS -->
    <div class="contour-lines"></div>
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <!-- MAIN CONTAINER (Padding Top 180px) -->
    <div class="container pt-44 pb-20">
      
      <!-- HEADER -->
      <div class="text-center mb-10 relative z-10">
        <h1 class="text-4xl font-bold text-white mb-2">{{ t('createService.heroTitle') || 'Daftar Servis Baru' }}</h1>
        <p class="text-gray-400">{{ t('createService.heroSub') || 'Iklankan perkhidmatan anda kepada komuniti outdoor.' }}</p>
      </div>

      <!-- STEPPER (Horizontal) -->
      <div class="stepper-wrapper relative z-10">
        <div class="step-item" :class="{ active: currentStep >= 1, done: currentStep > 1 }">
          <div class="step-circle">1</div>
          <span class="step-label">{{ t('createService.step1') || 'Info Asas' }}</span>
        </div>
        <div class="step-line" :class="{ active: currentStep > 1 }"></div>
        <div class="step-item" :class="{ active: currentStep >= 2, done: currentStep > 2 }">
          <div class="step-circle">2</div>
          <span class="step-label">{{ t('createService.step2') || 'Perincian' }}</span>
        </div>
        <div class="step-line" :class="{ active: currentStep > 2 }"></div>
        <div class="step-item" :class="{ active: currentStep >= 3, done: currentStep > 3 }">
          <div class="step-circle">3</div>
          <span class="step-label">{{ t('createService.step3') || 'Galeri' }}</span>
        </div>
      </div>

      <!-- FORM GLASS CARD -->
      <div class="glass-form-card relative z-10 fade-up">
        
        <!-- STEP 1: BASIC INFO -->
        <div v-if="currentStep === 1">
          <h2 class="section-title">Info Asas Servis</h2>
          
          <div class="form-group">
            <label>{{ t('createService.nameLabel') || 'Nama Servis / Tempat' }}</label>
            <input type="text" v-model="form.name" class="glass-input" placeholder="Cth: Tapak Khemah Sg. Chiling" />
          </div>

          <div class="form-group">
            <label>{{ t('createService.catLabel') || 'Kategori' }}</label>
            <div class="select-wrapper">
                <select v-model="form.category" class="glass-input">
                  <option disabled value="">Sila Pilih...</option>
                  <option value="Campsite">⛺ Campsite</option>
                  <option value="Chalet">🏡 Chalet / Homestay</option>
                  <option value="Guide">🧗 Guide / Malim</option>
                  <option value="Transport">🚙 Transport (4x4/Van)</option>
                  <option value="Rental">🎒 Sewaan Barang</option>
                  <option value="Event">🚩 Event / Trip</option>
                </select>
                <i class="fas fa-chevron-down select-arrow"></i>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>{{ t('createService.stateLabel') || 'Negeri' }}</label>
              <div class="select-wrapper">
                  <select v-model="form.state" class="glass-input">
                    <option disabled value="">Pilih Negeri</option>
                    <option v-for="state in MALAYSIA_STATES" :key="state" :value="state">{{ state }}</option>
                  </select>
                  <i class="fas fa-chevron-down select-arrow"></i>
              </div>
            </div>
            <div class="form-group">
              <label>{{ t('createService.locLabel') || 'Lokasi Spesifik' }}</label>
              <input type="text" v-model="form.location" class="glass-input" placeholder="Cth: Kuala Kubu Bharu" />
            </div>
          </div>
        </div>

        <!-- STEP 2: DETAILS -->
        <div v-if="currentStep === 2">
          <h2 class="section-title">Perincian {{ form.category || 'Servis' }}</h2>

          <!-- Dynamic Fields Based on Category -->
          <div v-if="['Campsite', 'Chalet', 'Event'].includes(form.category)">
             <div class="form-row">
                <div class="form-group">
                  <label>Masa Check-In</label>
                  <input type="time" v-model="form.checkIn" class="glass-input" />
                </div>
                <div class="form-group">
                  <label>Masa Check-Out</label>
                  <input type="time" v-model="form.checkOut" class="glass-input" />
                </div>
             </div>
             
             <div class="form-group mt-4">
               <label>Fasiliti Disediakan</label>
               <div class="chips-container">
                 <div v-for="fac in FACILITY_OPTIONS" :key="fac" 
                      class="chip" 
                      :class="{ active: form.facilities.includes(fac) }"
                      @click="toggleFacility(fac)">
                   {{ fac }}
                 </div>
               </div>
             </div>
          </div>

          <div v-if="form.category === 'Guide'">
             <div class="form-row">
                <div class="form-group">
                   <label>Jenis Harga</label>
                   <div class="select-wrapper">
                       <select v-model="form.priceType" class="glass-input">
                         <option value="pax">Per Pax</option>
                         <option value="group">Per Group</option>
                         <option value="day">Per Hari</option>
                       </select>
                       <i class="fas fa-chevron-down select-arrow"></i>
                   </div>
                </div>
                <div class="form-group">
                   <label>Kadar Harga (RM)</label>
                   <input type="number" v-model="form.price" class="glass-input" placeholder="0" />
                </div>
             </div>
             <div class="form-group mt-4">
                <label>Nisbah Guide (Guide Ratio)</label>
                <input type="text" v-model="form.guideRatio" class="glass-input" placeholder="Cth: 1:7" />
             </div>
             <div class="form-group">
                <label>Sijil / Lesen</label>
                <input type="text" v-model="form.certification" class="glass-input" placeholder="Cth: WFA, Malim Gunung Berlesen" />
             </div>
          </div>

          <div v-if="form.category === 'Transport'">
             <div class="form-group">
               <label>Jenis Kenderaan</label>
               <input type="text" v-model="form.vehicleType" class="glass-input" placeholder="Cth: Hilux 4x4, Van Persiaran" />
             </div>
             <div class="form-group">
               <label>Kawasan Liputan</label>
               <textarea v-model="form.coverageArea" rows="2" class="glass-input" placeholder="Cth: Lojing - Yong Belar"></textarea>
             </div>
             <div class="form-group">
               <label>Max Penumpang</label>
               <input type="number" v-model="form.maxPax" class="glass-input" placeholder="4" />
             </div>
          </div>

          <div v-if="form.category === 'Rental'">
             <div class="form-group">
               <label>Senarai Barang Sewaan</label>
               <textarea v-model="form.equipmentList" rows="5" class="glass-input" placeholder="Senaraikan barang dan harga..."></textarea>
             </div>
             <div class="form-group">
               <label>Lokasi Pickup</label>
               <input type="text" v-model="form.pickupLocation" class="glass-input" placeholder="Cth: Gombak / Pos Laju" />
             </div>
          </div>

          <!-- General Price Field for others -->
          <div v-if="form.category !== 'Guide' && form.category !== 'Rental'" class="form-group mt-4">
             <label>Paparan Harga (Ringkas)</label>
             <input type="text" v-model="form.priceDisplay" class="glass-input" placeholder="Cth: RM50 / malam" />
          </div>
        </div>

        <!-- STEP 3: MEDIA & CONTACT -->
        <div v-if="currentStep === 3">
          <h2 class="section-title">Galeri & Hubungan</h2>
          
          <div class="form-group">
            <label>Gambar Servis ({{ rawFiles.length }} / 10)</label>
            <div class="upload-grid">
               <div class="upload-box" @click="triggerMultiUpload" v-if="rawFiles.length < 10">
                 <i class="fas fa-plus text-2xl mb-2 text-purple-400"></i>
                 <span>Tambah</span>
               </div>
               <input type="file" ref="multiFileInput" multiple accept="image/*" @change="handleMultiUpload" hidden />

               <div v-for="(img, index) in previewImages" :key="index" class="preview-box">
                 <img :src="img" />
                 <button class="btn-remove" @click="removeImage(index)">×</button>
               </div>
            </div>
          </div>

          <div class="form-group mt-6">
            <label>Deskripsi Penuh</label>
            <textarea v-model="form.description" rows="5" class="glass-input" placeholder="Terangkan kelebihan servis anda..."></textarea>
          </div>

          <div class="form-group">
            <label>No. WhatsApp (Tanpa 0/60)</label>
            <div class="phone-input-group">
               <span class="prefix">+60</span>
               <input type="number" v-model="form.whatsapp" class="glass-input" placeholder="123456789" />
            </div>
          </div>
        </div>

        <!-- ACTION BUTTONS -->
        <div class="form-actions mt-8 flex justify-between items-center">
           <button v-if="currentStep > 1" @click="prevStep" class="btn-back">
             <i class="fas fa-arrow-left mr-2"></i> Kembali
           </button>
           <div v-else></div> <!-- Spacer -->

           <button v-if="currentStep < 3" @click="nextStep" class="btn-next">
             Seterusnya <i class="fas fa-arrow-right ml-2"></i>
           </button>
           <button v-if="currentStep === 3" @click="submitService" class="btn-submit" :disabled="loading">
             {{ loading ? 'Sedang Upload...' : '🚀 Terbitkan Iklan' }}
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
import { auth, db, storage } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MALAYSIA_STATES } from '../constants/data';

const { t } = useI18n();
const router = useRouter();
const currentStep = ref(1);
const loading = ref(false);
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
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB Limit
      if (file.size > MAX_SIZE) {
        alert(`Fail terlalu besar (${(file.size / 1024 / 1024).toFixed(2)}MB). Sila pilih fail bawah 5MB.`);
        return;
      }
      rawFiles.value.push(file);
      const reader = new FileReader();
      reader.onload = (e) => { if (e.target?.result) previewImages.value.push(e.target.result as string); };
      reader.readAsDataURL(file);
    });
    target.value = '';
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
  if (currentStep.value === 1 && (!form.name || !form.category || !form.state)) return alert("Sila lengkapkan info asas.");
  if (currentStep.value < 3) currentStep.value++;
};
const prevStep = () => { if (currentStep.value > 1) currentStep.value--; };

const submitService = async () => {
  if (!auth.currentUser) return alert("Sila login dahulu.");
  if (rawFiles.value.length === 0) return alert("Sila upload sekurang-kurangnya 1 gambar.");
  
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
      expiryDate: null, // Unlimited for now or add logic
      
      name: form.name,
      category: form.category,
      state: form.state,
      location: form.location,
      description: form.description,
      whatsapp: form.whatsapp,
      images: uploadedUrls,
      image: uploadedUrls[0], // Cover image

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
    alert("Servis berjaya diterbitkan!");
    router.push('/service');

  } catch (e) {
    console.error(e);
    alert("Ralat semasa menerbitkan iklan.");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* --- BASE THEME (DARK) --- */
.create-service-page { 
  background-color: #0f172a; 
  min-height: 100vh; position: relative; overflow-x: hidden; color: white;
}
.container { max-width: 800px; margin: 0 auto; padding: 0 1.5rem; position: relative; z-index: 2; }

/* GLOWS */
.page-glow-purple {
  position: absolute; top: 0; left: 0; width: 60vw; height: 60vw;
  background: #6c63ff; filter: blur(150px); opacity: 0.15; pointer-events: none; border-radius: 50%;
}
.page-glow-orange {
  position: absolute; bottom: 0; right: 0; width: 60vw; height: 60vw;
  background: #ff8c42; filter: blur(150px); opacity: 0.1; pointer-events: none; border-radius: 50%;
}
.contour-lines {
  position: absolute; inset: 0; z-index: 0; opacity: 0.08;
  background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400' stroke='white' fill='none' stroke-width='2' opacity='0.5'/%3E%3C/svg%3E");
  background-size: cover; pointer-events: none;
}

/* --- STEPPER --- */
.stepper-wrapper {
  display: flex; align-items: center; justify-content: center; margin-bottom: 2rem;
}
.step-item { display: flex; flex-direction: column; align-items: center; gap: 5px; opacity: 0.5; transition: 0.3s; position: relative; z-index: 2; }
.step-item.active { opacity: 1; }
.step-circle {
  width: 40px; height: 40px; border-radius: 50%; border: 2px solid #6c63ff; color: #6c63ff;
  display: flex; align-items: center; justify-content: center; font-weight: bold; background: #0f172a;
}
.step-item.done .step-circle { background: #6c63ff; color: white; }
.step-item.active .step-circle { border-color: #ff8c42; color: #ff8c42; }
.step-label { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }

.step-line { width: 60px; height: 2px; background: rgba(255,255,255,0.1); margin: 0 10px; margin-bottom: 20px; transition: 0.3s; }
.step-line.active { background: linear-gradient(90deg, #6c63ff, #ff8c42); }

/* --- GLASS FORM CARD --- */
.glass-form-card {
  background: rgba(30, 41, 59, 0.6); 
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px; padding: 2.5rem;
  backdrop-filter: blur(15px);
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}

.section-title { font-size: 1.5rem; color: white; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; font-weight: 700; }

.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; font-size: 0.9rem; color: #cbd5e1; margin-bottom: 8px; font-weight: 600; }
.glass-input {
  width: 100%; padding: 12px; border-radius: 10px; 
  border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3);
  color: white; outline: none; transition: 0.3s; font-size: 1rem;
}
.glass-input:focus { border-color: #6c63ff; background: rgba(0,0,0,0.5); }
/* Fix Dark Dropdown */
.glass-input option { background-color: #1e293b; color: white; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

/* Custom Select Arrow */
.select-wrapper { position: relative; }
.select-arrow { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
.glass-input { appearance: none; }

/* CHIPS (Facilities) */
.chips-container { display: flex; flex-wrap: wrap; gap: 10px; }
.chip {
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  padding: 8px 16px; border-radius: 50px; cursor: pointer; color: #cbd5e1; font-size: 0.9rem; transition: 0.2s;
}
.chip:hover { background: rgba(255,255,255,0.1); }
.chip.active { background: #6c63ff; color: white; border-color: #6c63ff; box-shadow: 0 4px 10px rgba(108, 99, 255, 0.3); }

/* UPLOAD GRID */
.upload-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 15px; }
.upload-box {
  height: 100px; border: 2px dashed rgba(255,255,255,0.2); border-radius: 12px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  cursor: pointer; color: #94a3b8; transition: 0.2s;
}
.upload-box:hover { border-color: #e67e22; color: #e67e22; background: rgba(230, 126, 34, 0.1); }
.preview-box { position: relative; height: 100px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
.preview-box img { width: 100%; height: 100%; object-fit: cover; }
.btn-remove { position: absolute; top: 2px; right: 2px; width: 22px; height: 22px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; }

/* PHONE INPUT */
.phone-input-group { display: flex; align-items: center; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; }
.prefix { padding: 0 15px; color: #94a3b8; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.1); }
.phone-input-group input { border: none; background: transparent; padding: 12px; flex: 1; }

/* ACTIONS */
.btn-back { background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.2); padding: 10px 24px; border-radius: 50px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-back:hover { color: white; border-color: white; }

.btn-next { 
  background: linear-gradient(135deg, #6c63ff, #5b54e0); color: white; 
  border: none; padding: 12px 30px; border-radius: 50px; font-weight: 700; 
  cursor: pointer; box-shadow: 0 4px 15px rgba(108, 99, 255, 0.4); transition: 0.2s;
}
.btn-next:hover { transform: translateY(-2px); }

.btn-submit {
  background: linear-gradient(135deg, #e67e22, #d35400); color: white;
  border: none; padding: 12px 30px; border-radius: 50px; font-weight: 700;
  cursor: pointer; box-shadow: 0 4px 15px rgba(230, 126, 34, 0.4); transition: 0.2s;
}
.btn-submit:hover { transform: translateY(-2px); }
.btn-submit:disabled { background: #555; cursor: not-allowed; transform: none; box-shadow: none; }

.fade-up { animation: fadeUp 0.6s ease-out; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 768px) {
  .form-row { grid-template-columns: 1fr; gap: 0; }
  .stepper-wrapper { display: none; } /* Optional: Hide stepper on mobile if too crowded */
  .container { padding-top: 140px; }
}
</style>