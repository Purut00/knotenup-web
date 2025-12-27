<template>
  <div class="create-spot-page">
    
    <div class="contour-lines"></div>
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <div class="container pt-44 pb-20">
      
      <div class="text-center mb-10 relative z-10">
        <h1 class="text-4xl font-bold text-white mb-2">
          {{ isEditMode ? t('createSpot.editTitle') : (t('createSpot.title') || 'Kongsi Lokasi Baru') }}
        </h1>
        <p class="text-gray-400">
          {{ isEditMode ? t('createSpot.editSub') : (t('createSpot.sub') || 'Bantu komuniti temui tempat menarik.') }}
        </p>
      </div>

      <div class="stepper-wrapper relative z-10">
        <div class="step-item" :class="{ active: currentStep >= 1, done: currentStep > 1 }">
          <div class="step-circle">1</div>
          <span class="step-label">{{ t('createSpot.steps.step1') || 'Info Asas' }}</span>
        </div>
        <div class="step-line" :class="{ active: currentStep > 1 }"></div>
        <div class="step-item" :class="{ active: currentStep >= 2, done: currentStep > 2 }">
          <div class="step-circle">2</div>
          <span class="step-label">{{ t('createSpot.steps.step2') || 'Galeri & Tips' }}</span>
        </div>
      </div>

      <div class="glass-form-card relative z-10 fade-up">
        
        <div v-if="currentStep === 1">
          <h2 class="section-title">{{ t('createSpot.section1.title') || 'Maklumat Lokasi' }}</h2>
          
          <div class="form-group">
            <label>{{ t('createSpot.nameLabel') || 'Nama Tempat' }}</label>
            <input 
              type="text" 
              v-model="form.name" 
              class="glass-input"
              :placeholder="t('createSpot.namePlaceholder')" 
              @blur="checkDuplicate"
              :disabled="isEditMode"
            />
            <small v-if="duplicateWarning && !isEditMode" class="text-red-400 font-bold mt-1 block">
                ⚠️ {{ t('createSpot.duplicateWarn') || 'Nama ini mungkin sudah wujud.' }}
            </small>
          </div>

          <div class="form-group">
            <label>{{ t('createSpot.viaLabel') || 'Laluan Masuk (Via)' }}</label>
            <input type="text" v-model="form.via" class="glass-input" :placeholder="t('createSpot.viaPlaceholder')" />
          </div>

          <div class="form-group mb-6">
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

          <div class="form-row">
            <div class="form-group">
              <label>{{ t('createSpot.stateLabel') || 'Negeri' }}</label>
              <div class="select-wrapper">
                  <select v-model="form.state" class="glass-input">
                    <option disabled value="">Pilih Negeri</option>
                    <option v-for="state in MALAYSIA_STATES" :key="state" :value="state">{{ state }}</option>
                  </select>
                  <i class="fas fa-chevron-down select-arrow"></i>
              </div>
            </div>
            <div class="form-group">
              <label>{{ t('createSpot.heightLabel') || 'Ketinggian (m)' }}</label>
              <input type="number" v-model="form.height" class="glass-input" :placeholder="t('createSpot.heightPlaceholder')" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Jarak (KM)</label>
              <input type="number" step="0.1" v-model="form.distance" class="glass-input" placeholder="Cth: 5.2" />
            </div>
            <div class="form-group">
              <label>Anggaran Masa</label>
              <input type="text" v-model="form.duration" class="glass-input" placeholder="Cth: 4 Jam / 2H1M" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>{{ t('createSpot.diffLabel') || 'Tahap Kesukaran' }}</label>
              <div class="select-wrapper">
                  <select v-model="form.difficulty" class="glass-input">
                    <option value="Easy">🟢 Mudah (Easy)</option>
                    <option value="Moderate">🟡 Sederhana (Moderate)</option>
                    <option value="Hard">🔴 Sukar (Hard)</option>
                    <option value="Extreme">⚫ Extreme</option>
                  </select>
                  <i class="fas fa-chevron-down select-arrow"></i>
              </div>
            </div>
            <div class="form-group">
              <label>{{ t('createSpot.permitLabel') || 'Status Permit' }}</label>
              <div class="select-wrapper">
                  <select v-model="form.permit" class="glass-input">
                    <option value="Unknown">Tidak Diketahui</option>
                    <option value="No">{{ t('spots.noPermit') || 'Tidak Perlu' }}</option>
                    <option value="Perlu">Perlu</option>
                  </select>
                  <i class="fas fa-chevron-down select-arrow"></i>
              </div>
            </div>
          </div>

          <div class="form-group mt-4">
            <label>{{ t('createSpot.guideLabel') || 'Keperluan Guide' }}</label>
            <div class="radio-group">
              <label class="radio-card" :class="{ active: form.guideRequired === 'Unknown' }">
                 <input type="radio" v-model="form.guideRequired" value="Unknown" hidden>
                 <span>Tidak Diketahui</span>
               </label>
               <label class="radio-card" :class="{ active: form.guideRequired === 'No' }">
                 <input type="radio" v-model="form.guideRequired" value="No" hidden>
                 <span>Tidak Perlu</span>
               </label>
               <label class="radio-card" :class="{ active: form.guideRequired === 'Optional' }">
                 <input type="radio" v-model="form.guideRequired" value="Optional" hidden>
                 <span>Pilihan (Optional)</span>
               </label>
               <label class="radio-card" :class="{ active: form.guideRequired === 'Yes' }">
                 <input type="radio" v-model="form.guideRequired" value="Yes" hidden>
                 <span>Wajib</span>
               </label>
            </div>
          </div>

          <div class="form-group mt-4">
            <label>Link Google Maps Trailhead (Optional)</label>
            <input type="text" v-model="form.mapsLink" class="glass-input" :placeholder="t('createSpot.mapPlaceholder')" />
          </div>

          <div class="form-group">
            <label>{{ t('createSpot.gpxLabel') || 'Fail GPX Trail' }}</label>
            <div class="file-upload-box">
               <div class="file-info">
                 <i class="fas fa-map-marked-alt text-2xl mb-2 text-green-400"></i>
                 <span v-if="gpxFile" class="text-white font-bold">{{ gpxFile.name }}</span>
                 <span v-else-if="form.gpxUrl" class="text-green-400 font-bold">Fail GPX Sedia Ada</span>
                 <span v-else class="text-gray-400 text-sm">Upload fail .gpx (Optional)</span>
               </div>
               <input type="file" accept=".gpx" @change="handleGpxSelect" class="hidden-input" ref="gpxInput" />
               <button class="btn-browse" @click="((gpxInput as any) || {}).click?.()">Pilih Fail</button>
            </div>
          </div>
        </div>

        <div v-if="currentStep === 2">
          <h2 class="section-title">Galeri & Info Lanjut</h2>

          <div class="form-group">
            <label>📸 {{ t('createSpot.imagesLabel') }} (Max 10)</label>
            <div class="upload-grid mt-2">
               <div class="upload-box" @click="triggerMultiUpload" v-if="previewImages.length < 10">
                 <i class="fas fa-plus text-2xl mb-2 text-purple-400"></i>
                 <span>Tambah</span>
               </div>
               <input type="file" ref="multiFileInput" multiple accept="image/*" @change="handleImageSelect" hidden />

               <div v-for="(img, index) in previewImages" :key="index" class="preview-box">
                 <img :src="img" />
                 <button class="btn-remove" @click="removeImage(index)">×</button>
               </div>
            </div>
          </div>

          <div class="form-group mt-6">
              <label>💡 {{ t('createSpot.labels.tips') || 'Tips Pendaki' }}</label>
              <textarea v-model="form.tips" rows="2" class="glass-input" placeholder="Cth: Bawa air secukupnya, pacat banyak..."></textarea>
          </div>

          <div class="form-group">
              <label>🚗 {{ t('createSpot.labels.parking') || 'Info Parking' }}</label>
              <input type="text" v-model="form.parking" class="glass-input" placeholder="Cth: RM5 per entry, tepi jalan" />
          </div>

          <div class="form-group">
              <label>📍 {{ t('createSpot.labels.checkpoint') || 'Checkpoints' }}</label>
              <textarea v-model="form.checkpointDetail" rows="3" class="glass-input" placeholder="Senarai CP, punca air, campsite..."></textarea>
          </div>

          <div class="form-group">
              <label>📝 {{ t('createSpot.labels.other') || 'Deskripsi Penuh' }}</label>
              <textarea v-model="form.description" rows="4" class="glass-input" placeholder="Ceritakan pengalaman atau info tambahan..."></textarea>
          </div>
        </div>

        <div class="form-actions mt-8 flex justify-between items-center">
           <button v-if="currentStep === 1" class="btn-back" @click="$router.back()">
             Batal
           </button>
           <button v-if="currentStep === 2" class="btn-back" @click="prevStep">
             <i class="fas fa-arrow-left mr-2"></i> Kembali
           </button>
           
           <div v-if="currentStep === 1" class="spacer"></div>

           <button v-if="currentStep === 1" @click="nextStep" class="btn-next">
             Seterusnya <i class="fas fa-arrow-right ml-2"></i>
           </button>
           <button v-if="currentStep === 2" @click="submitSpot" class="btn-submit" :disabled="loading">
             {{ loading ? 'Sedang Upload...' : (isEditMode ? 'Simpan Perubahan' : '🚀 Hantar Spot') }}
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
    alert(t('createSpot.alerts.fillNameState') || "Sila isi Nama dan Negeri.");
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
    if (previewImages.value.length + files.length > 10) return alert("Maksimum 10 gambar sahaja.");

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Fail ${file.name} terlalu besar (Max 5MB).`);
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
  if (!auth.currentUser) return alert(t('auth.loginRequired') || "Sila login dahulu.");
  if (isSpam(form.name) || isSpam(form.description) || isSpam(form.via)) return alert("Input mengandungi perkataan dilarang.");

  loading.value = true;
  try {
    const newUploadedUrls: string[] = [];
    for (const file of newImageFiles.value) {
       const fileRef = storageRef(storage, `spots/images/${auth.currentUser.uid}_${Date.now()}_${file.name}`);
       const snap = await uploadBytes(fileRef, file);
       const url = await getDownloadURL(snap.ref);
       newUploadedUrls.push(url);
    }

    const finalImages = [...existingImageUrls.value, ...newUploadedUrls];

    let gpxDownloadUrl = form.gpxUrl;
    if (gpxFile.value) {
      const gpxRef = storageRef(storage, `spots/gpx/${auth.currentUser.uid}_${Date.now()}.gpx`);
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
      alert("Kemaskini berjaya!");
      router.push('/spots/' + spotId);
    } else {
      await addDoc(collection(db, 'spots'), {
        ...spotData,
        contributorId: auth.currentUser.uid,
        contributorName: auth.currentUser.displayName || 'User',
        createdAt: serverTimestamp()
      });
      alert("Spot berjaya ditambah!");
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

<style scoped>
/* --- BASE THEME (DARK) --- */
.create-spot-page { 
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

.glass-input option { 
  background-color: #1e293b; 
  color: white; 
  padding: 10px;
}

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

/* FILE UPLOAD BOX */
.file-upload-box {
  border: 2px dashed rgba(255,255,255,0.2); border-radius: 10px; padding: 1.5rem;
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  background: rgba(0,0,0,0.2); transition: 0.2s;
}
.file-upload-box:hover { border-color: #10b981; background: rgba(16, 185, 129, 0.05); }
.file-info { display: flex; flex-direction: column; align-items: flex-start; }
.hidden-input { display: none; }
.btn-browse {
  background: #34495e; color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer;
}

/* UPLOAD GRID */
.upload-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 15px; }
.upload-box {
  height: 100px; border: 2px dashed rgba(255,255,255,0.2); border-radius: 12px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  cursor: pointer; color: #94a3b8; transition: 0.2s; background: rgba(0,0,0,0.2);
}
.upload-box:hover { border-color: #e67e22; color: #e67e22; }
.preview-box { position: relative; height: 100px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
.preview-box img { width: 100%; height: 100%; object-fit: cover; }
.btn-remove { position: absolute; top: 2px; right: 2px; width: 22px; height: 22px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; }

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
}
</style>