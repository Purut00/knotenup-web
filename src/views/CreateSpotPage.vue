<template>
  <div class="create-layout">
    
    <div class="left-panel">
      <div class="overlay-content">
        <h1>{{ isEditMode ? t('createSpot.editTitle') : t('createSpot.title') }}</h1>
        <p>{{ isEditMode ? 'Kemaskini maklumat lokasi untuk komuniti.' : t('createSpot.sub') }}</p>
        
        <div class="info-box">
          <p>📍 Pastikan nama lokasi tepat.</p>
          <p>📸 Gambar mestilah jelas & relevan.</p>
          <p>🗺️ Fail GPX sangat membantu pendaki lain.</p>
        </div>
      </div>
    </div>

    <div class="right-panel">
      <div class="form-wrapper">
        
        <div class="mobile-header">
          <h2>{{ isEditMode ? 'Edit Lokasi' : 'Tambah Lokasi Baru' }}</h2>
        </div>

        <div class="form-section fade-up">
          <h2 class="section-title">Info Asas</h2>
          <p class="section-subtitle">Maklumat penting tentang tempat ini.</p>

          <div class="input-wrap">
            <label>{{ t('createSpot.nameLabel') }}</label>
            <input 
              type="text" 
              v-model="form.name" 
              :placeholder="t('createSpot.namePlaceholder')" 
              @blur="checkDuplicate"
              :disabled="isEditMode" 
              :class="{ 'locked-input': isEditMode }"
              class="clean-input large"
            />
            <small v-if="duplicateWarning && !isEditMode" class="warning-text">
               ⚠️ {{ t('createSpot.duplicateWarn') }}
            </small>
          </div>

          <div class="input-wrap">
            <label>{{ t('createSpot.viaLabel') }}</label>
            <input type="text" v-model="form.via" :placeholder="t('createSpot.viaPlaceholder')" class="clean-input" />
          </div>

          <div class="grid-2">
            <div class="input-wrap">
              <label>{{ t('createSpot.stateLabel') }}</label>
              <select v-model="form.state" class="clean-input">
                <option disabled value="">{{ t('common.selectState') }}</option>
                <option v-for="state in MALAYSIA_STATES" :key="state" :value="state">{{ state }}</option>
              </select>
            </div>
            <div class="input-wrap">
              <label>{{ t('createSpot.heightLabel') }} (m)</label>
              <input type="number" v-model="form.height" :placeholder="t('createSpot.heightPlaceholder')" class="clean-input" />
            </div>
          </div>

          <div class="grid-2 mt-4">
            <div class="input-wrap">
              <label>{{ t('createSpot.diffLabel') }}</label>
              <select v-model="form.difficulty" class="clean-input">
                <option value="Easy">🟢 {{ t('components.easy') }}</option>
                <option value="Moderate">🟡 {{ t('components.moderate') }}</option>
                <option value="Hard">🔴 {{ t('components.hard') }}</option>
              </select>
            </div>
            <div class="input-wrap">
              <label>{{ t('createSpot.permitLabel') }}</label>
              <select v-model="form.permit" class="clean-input">
                <option value="No">{{ t('spots.noPermit') }}</option>
                <option value="Perlu (Pejabat Hutan)">Perlu (Pejabat Hutan)</option>
                <option value="Perlu (Polis)">Perlu (Polis)</option>
              </select>
            </div>
          </div>

          <div class="input-wrap mt-4">
            <label>{{ t('createSpot.guideLabel') }}</label>
            <div class="radio-group">
               <label class="radio-card" :class="{ active: form.guideRequired === 'No' }">
                 <input type="radio" v-model="form.guideRequired" value="No" hidden>
                 <span>Bebas (Sendiri)</span>
               </label>
               <label class="radio-card" :class="{ active: form.guideRequired === 'Optional' }">
                 <input type="radio" v-model="form.guideRequired" value="Optional" hidden>
                 <span>Pilihan (Optional)</span>
               </label>
               <label class="radio-card" :class="{ active: form.guideRequired === 'Yes' }">
                 <input type="radio" v-model="form.guideRequired" value="Yes" hidden>
                 <span>Wajib Guide</span>
               </label>
            </div>
          </div>

          <div class="input-wrap mt-4">
            <label>{{ t('createSpot.mapLabel') }}</label>
            <input type="text" v-model="form.mapsLink" :placeholder="t('createSpot.mapPlaceholder')" class="clean-input" />
          </div>

          <div class="input-wrap">
            <label>{{ t('createSpot.gpxLabel') }}</label>
            <div class="file-box">
               <span class="icon">🗺️</span>
               <div class="file-info">
                 <span v-if="gpxFile">{{ gpxFile.name }}</span>
                 <span v-else-if="form.gpxUrl" class="existing-file">Fail GPX sedia ada disimpan.</span>
                 <span v-else>Klik untuk upload fail .gpx</span>
               </div>
               <input type="file" accept=".gpx" @change="handleGpxSelect" class="file-input-hidden" />
               <button class="btn-browse">Pilih Fail</button>
            </div>
          </div>

          <div class="form-group mt-4">
            <label class="section-title-small">📸 {{ t('createSpot.imagesLabel') }} (Max 10)</label>
            
            <div class="multi-upload-grid">
              <div class="add-img-box" @click="triggerMultiUpload" v-if="previewImages.length < 10">
                <span class="plus">+</span>
                <span>Tambah</span>
              </div>
              <input type="file" ref="multiFileInput" multiple accept="image/*" @change="handleImageSelect" hidden />

              <div v-for="(img, index) in previewImages" :key="index" class="preview-thumb">
                <img :src="img" />
                <button class="btn-remove-img" @click="removeImage(index)">×</button>
              </div>
            </div>
          </div>

          <div class="input-wrap mt-4">
            <label>{{ t('createSpot.descLabel') }}</label>
            <textarea v-model="form.description" rows="5" :placeholder="t('createSpot.descPlaceholder')" class="clean-input"></textarea>
          </div>

        </div>

        <div class="action-bar">
          <button class="btn-text" @click="$router.back()">{{ t('common.cancel') }}</button>
          <div class="spacer"></div>
          <button class="btn-pill finish" @click="submitSpot" :disabled="loading">
            {{ loading ? t('createSpot.uploading') : (isEditMode ? 'Hantar Cadangan' : t('createSpot.submitBtn')) }}
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
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MALAYSIA_STATES } from '../constants/data';
import { isSpam } from '../utils/spamFilter';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const loading = ref(false);
const duplicateWarning = ref(false);
const isEditMode = ref(false);
const spotId = route.params.id as string; 
const multiFileInput = ref<HTMLInputElement | null>(null);

// Image Handling
const previewImages = ref<string[]>([]); 
const newImageFiles = ref<File[]>([]); 
const existingImageUrls = ref<string[]>([]);
const gpxFile = ref<File | null>(null);

const form = reactive({
  name: '', via: '', state: '', height: null, difficulty: 'Moderate',
  permit: 'No', guideRequired: 'No', mapsLink: '', description: '',
  images: [] as string[], gpxUrl: ''
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
        if (data.image && (!data.images || data.images.length === 0)) form.images = [data.image];
        existingImageUrls.value = [...form.images];
        previewImages.value = [...form.images];
      }
    } catch (e) { console.error(e); }
    finally { loading.value = false; }
  }
});

const triggerMultiUpload = () => { multiFileInput.value?.click(); };

const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const files = Array.from(target.files);
    if (previewImages.value.length + files.length > 10) return alert(t('createSpot.maxImgError'));

    files.forEach(file => {
      newImageFiles.value.push(file);
      const reader = new FileReader();
      reader.onload = (e) => { if(e.target?.result) previewImages.value.push(e.target.result as string); };
      reader.readAsDataURL(file);
    });
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
  if (!form.name || !form.state) return alert(t('createSpot.errorMsg'));
  if (duplicateWarning.value && !isEditMode.value) return alert("Lokasi sudah wujud.");
  if (isSpam(form.name) || isSpam(form.description) || isSpam(form.via)) return alert(t('createSpot.spamDetected'));

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

    const spotData = {
      ...form,
      images: finalImages,
      image: finalImages[0] || '',
      gpxUrl: gpxDownloadUrl,
      name_lowercase: form.name.toLowerCase().trim()
    };

    if (isEditMode.value) {
      await addDoc(collection(db, 'spots', spotId, 'suggestions'), {
        ...spotData,
        suggestedBy: auth.currentUser.displayName || 'User',
        suggestedById: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        votes: 0,
        verifiedUsers: []
      });
      alert("Cadangan kemaskini dihantar! Perlu 5 pengesahan.");
      router.push('/spots/' + spotId);
    } else {
      await addDoc(collection(db, 'spots'), {
        ...spotData,
        contributorId: auth.currentUser.uid,
        contributorName: auth.currentUser.displayName || 'User',
        createdAt: serverTimestamp()
      });
      alert(t('createSpot.successMsg'));
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
/* 🔥 SPLIT SCREEN THEME 🔥 */
.create-layout { display: flex; min-height: 100vh; background: #fff; overflow: hidden; }

.left-panel {
  width: 40%;
  background-image: url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop'); /* Gambar Gunung */
  background-size: cover; background-position: center; height: 100vh;
  display: flex; flex-direction: column; justify-content: flex-start; 
  padding: 4rem; padding-top: 20vh; color: white; position: relative;
}
.left-panel::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)); }
.overlay-content { position: relative; z-index: 2; }
.left-panel h1 { font-size: 3rem; margin: 0 0 15px 0; line-height: 1.1; font-weight: 800; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
.left-panel p { opacity: 0.9; font-size: 1.1rem; }

.info-box { margin-top: 2rem; background: rgba(255,255,255,0.1); backdrop-filter: blur(5px); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2); }
.info-box p { font-size: 0.9rem; margin-bottom: 5px; opacity: 1; }

.right-panel { width: 60%; height: 100vh; overflow-y: auto; position: relative; background: #ffffff; }
.form-wrapper { max-width: 650px; margin: 0 auto; padding: 4rem 3rem 120px 3rem; }
.mobile-header { display: none; }

.section-title { font-size: 2rem; color: #2c3e50; margin: 0; font-weight: 800; letter-spacing: -1px; }
.section-subtitle { color: #7f8c8d; margin-bottom: 2.5rem; font-size: 1.1rem; }

/* Clean Input Style */
.input-wrap { margin-bottom: 1.8rem; }
.input-wrap label { display: block; font-size: 0.85rem; font-weight: 700; color: #34495e; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; }
.clean-input { width: 100%; padding: 0.8rem 0; border: none; border-bottom: 2px solid #e0e0e0; font-size: 1.1rem; outline: none; transition: border-color 0.3s; background: transparent; color: #2c3e50; font-family: inherit; }
.clean-input:focus { border-bottom-color: #27ae60; }
.clean-input.large { font-size: 1.5rem; font-weight: 800; padding: 1rem 0; }
.locked-input { color: #999; cursor: not-allowed; border-bottom: 2px dashed #eee; }

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
.mt-4 { margin-top: 2rem; }

.warning-text { color: #e74c3c; font-weight: bold; margin-top: 5px; display: block; font-size: 0.85rem; }

/* Radio Group (Guide) */
.radio-group { display: flex; gap: 10px; flex-wrap: wrap; }
.radio-card { padding: 8px 16px; border: 1px solid #e0e0e0; border-radius: 8px; cursor: pointer; transition: 0.2s; font-weight: 600; color: #555; }
.radio-card:hover { background: #f9f9f9; }
.radio-card.active { background: #27ae60; color: white; border-color: #27ae60; }

/* File Upload Box (GPX) */
.file-box { border: 2px dashed #ccc; border-radius: 8px; padding: 1rem; display: flex; align-items: center; justify-content: space-between; position: relative; transition: 0.2s; }
.file-box:hover { border-color: #27ae60; background: #f0fdf4; }
.file-box .icon { font-size: 1.5rem; margin-right: 10px; }
.file-info { flex: 1; font-weight: 500; color: #555; }
.file-input-hidden { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.btn-browse { background: #2c3e50; color: white; border: none; padding: 5px 12px; border-radius: 4px; pointer-events: none; font-size: 0.8rem; }
.existing-file { color: #27ae60; font-weight: bold; }

/* Multi Image Grid */
.multi-upload-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
.add-img-box { width: 100%; height: 100px; border: 2px dashed #ccc; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; color: #999; transition: 0.2s; }
.add-img-box:hover { border-color: #27ae60; color: #27ae60; background: #f0fdf4; }
.preview-thumb { position: relative; width: 100%; height: 100px; border-radius: 8px; overflow: hidden; }
.preview-thumb img { width: 100%; height: 100%; object-fit: cover; }
.btn-remove-img { position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); color: white; border: none; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; }

/* Action Bar */
.action-bar { position: fixed; bottom: 0; right: 0; width: 60%; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); padding: 1.5rem 3rem; border-top: 1px solid #eaeaea; display: flex; align-items: center; z-index: 10; box-shadow: 0 -5px 20px rgba(0,0,0,0.03); }
.spacer { flex: 1; }
.btn-text { background: none; border: none; color: #7f8c8d; font-weight: bold; cursor: pointer; font-size: 1rem; }
.btn-pill { background: #2c3e50; color: white; border: none; padding: 1rem 3rem; border-radius: 50px; font-weight: bold; font-size: 1rem; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 5px 15px rgba(44, 62, 80, 0.2); }
.btn-pill:hover { transform: translateY(-2px); background: #34495e; }
.btn-pill.finish { background: #27ae60; box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3); }
.btn-pill.finish:hover { background: #219150; }

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