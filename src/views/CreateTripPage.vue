<template>
  <div class="create-trip-page">
    
    <!-- BACKGROUND LAYERS -->
    <div class="contour-lines"></div>
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <!-- MAIN CONTAINER (Padding Besar) -->
    <div class="container pt-44 pb-20">
      
      <!-- HEADER -->
      <div class="text-center mb-10 relative z-10">
        <h1 class="text-4xl font-bold text-white mb-2">{{ t('createTrip.heroTitle') || 'Cipta Trip Baru' }}</h1>
        <p class="text-gray-400">"{{ t('createTrip.heroSub') || 'Bawa orang lain meneroka keindahan alam bersama anda.' }}"</p>
      </div>

      <!-- STEPPER (Horizontal) -->
      <div class="stepper-wrapper relative z-10">
        <div class="step-item" :class="{ active: currentStep >= 1, done: currentStep > 1 }">
          <div class="step-circle">1</div>
          <span class="step-label">{{ t('createTrip.step1') || 'Info Asas' }}</span>
        </div>
        <div class="step-line" :class="{ active: currentStep > 1 }"></div>
        <div class="step-item" :class="{ active: currentStep >= 2, done: currentStep > 2 }">
          <div class="step-circle">2</div>
          <span class="step-label">{{ t('createTrip.step2') || 'Logistik' }}</span>
        </div>
        <div class="step-line" :class="{ active: currentStep > 2 }"></div>
        <div class="step-item" :class="{ active: currentStep >= 3, done: currentStep > 3 }">
          <div class="step-circle">3</div>
          <span class="step-label">{{ t('createTrip.step3') || 'Media' }}</span>
        </div>
      </div>

      <!-- FORM GLASS CARD -->
      <div class="glass-form-card relative z-10 fade-up">
        
        <!-- STEP 1: INFO ASAS -->
        <div v-if="currentStep === 1">
          <h2 class="section-title">{{ t('createTrip.section1Title') || 'Maklumat Trip' }}</h2>
          
          <div class="form-group">
            <label>{{ t('createTrip.tripTitle') || 'Tajuk Trip' }}</label>
            <input 
              type="text" 
              v-model="form.title" 
              class="glass-input" 
              :placeholder="t('createTrip.placeholderTitle') || 'Cth: Hiking Gunung Kinabalu 3H2M'" 
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>{{ t('createTrip.category') || 'Kategori Aktiviti' }}</label>
              <div class="select-wrapper">
                  <select v-model="form.category" class="glass-input">
                    <option disabled value="">Sila Pilih...</option>
                    <optgroup v-for="group in ACTIVITY_CATEGORIES" :key="group.group" :label="group.group">
                      <option v-for="item in group.items" :key="item" :value="item">
                        {{ item }}
                      </option>
                    </optgroup>
                  </select>
                  <i class="fas fa-chevron-down select-arrow"></i>
              </div>
            </div>
            <div class="form-group">
              <label>{{ t('createTrip.level') || 'Tahap Kesukaran' }}</label>
              <div class="select-wrapper">
                  <select v-model="form.difficulty" class="glass-input">
                    <option value="Easy">🟢 Mudah (Easy)</option>
                    <option value="Moderate">🟡 Sederhana (Moderate)</option>
                    <option value="Hard">🔴 Sukar (Hard)</option>
                  </select>
                  <i class="fas fa-chevron-down select-arrow"></i>
              </div>
            </div>
          </div>

          <div class="form-group mt-4">
            <label>{{ t('createTrip.locationType') || 'Lokasi' }}</label>
            <div class="radio-group">
               <label class="radio-card" :class="{ active: locationType === 'malaysia' }">
                 <input type="radio" v-model="locationType" value="malaysia" hidden>
                 <span>🇲🇾 Dalam Malaysia</span>
               </label>
               <label class="radio-card" :class="{ active: locationType === 'overseas' }">
                 <input type="radio" v-model="locationType" value="overseas" hidden>
                 <span>✈️ Luar Negara</span>
               </label>
            </div>
          </div>

          <div v-if="locationType === 'malaysia'" class="form-row mt-4">
            <div class="form-group">
              <label>Negeri</label>
              <div class="select-wrapper">
                  <select v-model="form.state" class="glass-input">
                    <option disabled value="">Pilih Negeri</option>
                    <option v-for="state in MALAYSIA_STATES" :key="state" :value="state">{{ state }}</option>
                  </select>
                  <i class="fas fa-chevron-down select-arrow"></i>
              </div>
            </div>
            <div class="form-group">
              <label>Tempat Spesifik</label>
              <input type="text" v-model="form.placeName" class="glass-input" :placeholder="t('createTrip.specificPlace') || 'Cth: Taman Negara'" />
            </div>
          </div>

          <div v-else class="form-group mt-4">
            <label>Lokasi Penuh</label>
            <input type="text" v-model="form.overseasLocation" class="glass-input" :placeholder="t('createTrip.fullLocation') || 'Cth: Mount Fuji, Japan'" />
          </div>
        </div>

        <!-- STEP 2: LOGISTIK -->
        <div v-if="currentStep === 2">
          <h2 class="section-title">{{ t('createTrip.section2Title') || 'Tarikh & Harga' }}</h2>

          <div class="form-row">
            <div class="form-group">
              <label>{{ t('createTrip.startDate') || 'Tarikh Mula' }}</label>
              <input type="date" v-model="form.startDate" class="glass-input" />
            </div>
            <div class="form-group">
              <label>{{ t('createTrip.endDate') || 'Tarikh Tamat' }}</label>
              <input type="date" v-model="form.endDate" :min="form.startDate" class="glass-input" />
            </div>
          </div>
          
          <div class="duration-pill mb-6">
            ⏳ Durasi: {{ computedDuration }}
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>{{ t('createTrip.price') || 'Harga Per Pax' }} (RM)</label>
              <input type="number" v-model="form.price" class="glass-input" placeholder="0" />
            </div>
            <div class="form-group">
              <label>{{ t('createTrip.slots') || 'Jumlah Slot' }}</label>
              <input type="number" v-model="form.maxSlots" class="glass-input" placeholder="20" />
            </div>
          </div>

          <div class="form-group mt-4">
            <label>{{ t('createTrip.groupLink') || 'Link WhatsApp Group' }}</label>
            <input type="text" v-model="form.groupLink" class="glass-input" placeholder="https://chat.whatsapp.com/..." />
            <small class="text-gray-400 mt-1 block text-xs">
               *Link ini hanya akan dipaparkan kepada peserta yang telah disahkan (Join).
            </small>
          </div>
        </div>

        <!-- STEP 3: MEDIA & DETAIL -->
        <div v-if="currentStep === 3">
          <h2 class="section-title">{{ t('createTrip.section3Title') || 'Galeri & Info Lanjut' }}</h2>

          <div class="form-group">
            <label>📸 Gambar Trip (Max 5)</label>
            <div class="upload-grid-trip mt-2">
               <!-- Main Image -->
               <div class="main-upload" @click="triggerUpload(0)" :style="{ backgroundImage: `url(${previewImages[0]})` }">
                 <div v-if="!previewImages[0]" class="placeholder-center">
                   <i class="fas fa-camera text-2xl mb-2 text-purple-400"></i>
                   <span>Cover Photo</span>
                 </div>
                 <input type="file" ref="fileInput0" @change="(e) => handleImageSelect(e, 0)" accept="image/*" hidden />
               </div>
               
               <!-- Sub Images -->
               <div class="sub-uploads">
                 <div v-for="i in 4" :key="i" class="sub-box" @click="triggerUpload(i)" :style="{ backgroundImage: `url(${previewImages[i]})` }">
                   <span v-if="!previewImages[i]">+</span>
                   <input type="file" :ref="'fileInput' + i" @change="(e) => handleImageSelect(e, i)" accept="image/*" hidden />
                 </div>
               </div>
            </div>
          </div>

          <div class="form-group mt-6">
            <label>{{ t('createTrip.desc') || 'Deskripsi Penuh' }}</label>
            <textarea v-model="form.description" rows="5" class="glass-input" placeholder="Tentatif, apa yang menarik..."></textarea>
          </div>

          <div class="details-stack space-y-4">
            <div class="form-group">
              <label>⚠️ {{ t('createTrip.mandatory') || 'Wajib Bawa' }}</label>
              <input type="text" v-model="form.mandatory" class="glass-input" placeholder="Headlamp, Kasut Hiking..." />
            </div>
            <div class="form-group">
              <label>💡 {{ t('createTrip.tips') || 'Tips Extra' }}</label>
              <input type="text" v-model="form.tips" class="glass-input" placeholder="Bawa baju hujan, training 2 minggu..." />
            </div>
            <div class="form-group">
              <label>🎒 {{ t('createTrip.recommended') || 'Disyorkan' }}</label>
              <input type="text" v-model="form.recommended" class="glass-input" placeholder="Powerbank, Tongkat..." />
            </div>
          </div>

          <div class="form-group mt-6">
            <label>{{ t('createTrip.includes') || 'Pakej Termasuk:' }}</label>
            <div class="chips-container">
              <div 
                v-for="service in TRIP_SERVICES" 
                :key="service" 
                class="chip" 
                :class="{ active: form.includes.includes(service) }"
                @click="toggleService(service)"
              >
                {{ t('services.' + service) || service }}
              </div>
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
           <button v-if="currentStep === 3" @click="submitForm" class="btn-submit" :disabled="loading">
             {{ loading ? 'Sedang Upload...' : '🚀 Terbitkan Trip' }}
           </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ACTIVITY_CATEGORIES, TRIP_SERVICES, MALAYSIA_STATES } from '../constants/data';
import { auth, db, storage } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { isSpam } from '../utils/spamFilter';

const { t } = useI18n(); 
const router = useRouter();
const currentStep = ref(1);
const loading = ref(false);
const locationType = ref('malaysia');

// Logic Gambar
const previewImages = ref<string[]>(Array.from({ length: 5 }).map(() => ''));
const rawFiles = ref<(File | null)[]>(Array.from({ length: 5 }).map(() => null));

const form = reactive({
  title: '', category: '', difficulty: 'Moderate', 
  state: '', placeName: '', overseasLocation: '', 
  startDate: '', endDate: '',   
  price: null, maxSlots: null, groupLink: '', description: '',
  tips: '', mandatory: '', recommended: '', includes: [] as string[]
});

// Duration Logic
const computedDuration = computed(() => {
  if (!form.startDate || !form.endDate) return '-';
  const start = new Date(form.startDate);
  const end = new Date(form.endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);

  if (diffDays < 0) return "Tarikh Tidak Sah"; 
  if (diffDays === 0) return "Day Trip";
  
  return `${diffDays + 1}H ${diffDays}M`;
});

// Helpers
const toggleService = (service: string) => {
  if (form.includes.includes(service)) {
    form.includes = form.includes.filter(i => i !== service);
  } else {
    form.includes.push(service);
  }
};

const triggerUpload = (index: number) => {
  // Hacky way to trigger specific refs in v-for
  // In Vue 3 script setup, dynamic refs are handled differently, but DOM query works for simple cases
  const input = document.querySelectorAll('input[type=file]')[index] as HTMLInputElement;
  if(input) input.click();
};

const handleImageSelect = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    if (file.size > 5 * 1024 * 1024) return alert("Fail terlalu besar (Max 5MB).");
    
    rawFiles.value[index] = file;
    const reader = new FileReader();
    reader.onload = (e) => { if (e.target?.result) previewImages.value[index] = e.target.result as string; };
    reader.readAsDataURL(file);
  }
};

const nextStep = () => { if (currentStep.value < 3) currentStep.value++; window.scrollTo(0,0); };
const prevStep = () => { if (currentStep.value > 1) currentStep.value--; window.scrollTo(0,0); };

const submitForm = async () => {
  if (!auth.currentUser) { alert(t('auth.loginRequired') || "Sila login."); return; }
  
  const checkText = `${form.title} ${form.description}`;
  if (isSpam(checkText)) { alert("Input mengandungi perkataan dilarang."); return; }

  loading.value = true;

  try {
    const uploadedUrls: string[] = [];
    for (let i = 0; i < 5; i++) {
      if (rawFiles.value[i]) {
        const fileRef = storageRef(storage, `trips/${auth.currentUser.uid}_${Date.now()}_${i}.jpg`);
        const snapshot = await uploadBytes(fileRef, rawFiles.value[i]!);
        const url = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(url);
      }
    }

    const finalLocation = locationType.value === 'malaysia' ? `${form.placeName}, ${form.state}` : form.overseasLocation;

    const tripData = {
      ...form,
      location: finalLocation,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      duration: computedDuration.value, 
      images: uploadedUrls, 
      image: uploadedUrls[0] || '',
      price: Number(form.price),
      maxSlots: Number(form.maxSlots),
      currentSlots: 0,
      status: 'open',
      createdAt: serverTimestamp(),
      organizerId: auth.currentUser.uid,
      organizerName: auth.currentUser.displayName || 'Organizer',
      organizerImage: auth.currentUser.photoURL || '',
    };

    delete (tripData as any).state;
    delete (tripData as any).placeName;
    delete (tripData as any).overseasLocation;

    await addDoc(collection(db, 'trips'), tripData);
    alert("Trip berjaya diterbitkan!");
    router.push('/trips');

  } catch (error) {
    console.error("Error:", error);
    alert("Gagal mencipta trip.");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* --- BASE THEME (DARK) --- */
.create-trip-page { 
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

/* GLASS INPUT */
.glass-input {
  width: 100%; padding: 12px; border-radius: 10px; 
  border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3);
  color: white; outline: none; transition: 0.3s; font-size: 1rem;
}
.glass-input:focus { border-color: #6c63ff; background: rgba(0,0,0,0.5); }

/* Fix Dark Dropdown */
.glass-input option, .glass-input optgroup { background-color: #1e293b; color: white; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

/* Custom Select Arrow */
.select-wrapper { position: relative; }
.select-arrow { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
.glass-input { appearance: none; }

/* RADIO GROUP */
.radio-group { display: flex; gap: 10px; flex-wrap: wrap; }
.radio-card { 
  padding: 10px 16px; border: 1px solid rgba(255,255,255,0.1); 
  border-radius: 8px; cursor: pointer; transition: 0.2s; color: #cbd5e1; background: rgba(255,255,255,0.05);
}
.radio-card:hover { background: rgba(255,255,255,0.1); }
.radio-card.active { 
  background: #6c63ff; color: white; border-color: #6c63ff; 
  box-shadow: 0 4px 10px rgba(108, 99, 255, 0.3); 
}

/* CHIPS */
.chips-container { display: flex; flex-wrap: wrap; gap: 10px; }
.chip {
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  padding: 8px 16px; border-radius: 50px; cursor: pointer; color: #cbd5e1; font-size: 0.9rem; transition: 0.2s;
}
.chip:hover { background: rgba(255,255,255,0.1); }
.chip.active { background: #6c63ff; color: white; border-color: #6c63ff; box-shadow: 0 4px 10px rgba(108, 99, 255, 0.3); }

.duration-pill { display: inline-block; background: rgba(108, 99, 255, 0.2); color: #a78bfa; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 0.9rem; }

/* TRIP GALLERY UPLOADER */
.upload-grid-trip { display: grid; grid-template-columns: 2fr 1fr; gap: 10px; height: 250px; }
.main-upload { background: rgba(255,255,255,0.05); border-radius: 12px; border: 2px dashed rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; background-size: cover; background-position: center; transition: 0.2s; }
.main-upload:hover { border-color: #6c63ff; background-color: rgba(255,255,255,0.08); }
.placeholder-center { display: flex; flex-direction: column; align-items: center; color: #94a3b8; }

.sub-uploads { display: grid; grid-template-rows: 1fr 1fr; grid-template-columns: 1fr 1fr; gap: 10px; }
.sub-box { background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px dashed rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; cursor: pointer; color: #94a3b8; font-size: 1.5rem; background-size: cover; background-position: center; transition: 0.2s; }
.sub-box:hover { border-color: #6c63ff; color: #6c63ff; }

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
  .stepper-wrapper { display: none; } 
  .container { padding-top: 140px; }
  .upload-grid-trip { grid-template-columns: 1fr; height: auto; }
  .main-upload { height: 200px; margin-bottom: 10px; }
  .sub-uploads { height: auto; grid-template-columns: 1fr 1fr; }
  .sub-box { height: 100px; }
}
</style>