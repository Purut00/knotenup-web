<template>
  <div class="create-layout">
    
    <div class="left-panel">
      <div class="overlay-content">
        <h1>Cipta Pengalaman Baru.</h1>
        <p>"Setiap perjalanan bermula dengan satu langkah (dan satu form)."</p>
        
        <div class="steps-vertical">
          <div class="step-item" :class="{ active: currentStep === 1, done: currentStep > 1 }">
            <div class="dot">1</div>
            <span>Info Asas</span>
          </div>
          <div class="step-line"></div>
          <div class="step-item" :class="{ active: currentStep === 2, done: currentStep > 2 }">
            <div class="dot">2</div>
            <span>Logistik</span>
          </div>
          <div class="step-line"></div>
          <div class="step-item" :class="{ active: currentStep === 3, done: currentStep > 3 }">
            <div class="dot">3</div>
            <span>Galeri</span>
          </div>
        </div>
      </div>
    </div>

    <div class="right-panel">
      <div class="form-wrapper">
        
        <div class="mobile-header">
          <h2>Langkah {{ currentStep }} / 3</h2>
        </div>

        <div v-if="currentStep === 1" class="form-section fade-up">
          <h2 class="section-title">Mula dengan info asas</h2>
          <p class="section-subtitle">Ke mana kita nak pergi kali ini?</p>

          <div class="input-wrap">
            <label>{{ t('createTrip.tripTitle') }}</label>
            <input type="text" v-model="form.title" placeholder="Cth: Trans Yam Tuan Antah" class="clean-input large" />
          </div>

          <div class="grid-2">
            <div class="input-wrap">
              <label>{{ t('createTrip.category') }}</label>
              <select v-model="form.category" class="clean-input">
                <option disabled value="">Pilih...</option>
                <optgroup v-for="group in ACTIVITY_CATEGORIES" :key="group.group" :label="group.group">
                  <option v-for="item in group.items" :key="item" :value="item">{{ item }}</option>
                </optgroup>
              </select>
            </div>
            <div class="input-wrap">
              <label>{{ t('createTrip.level') }}</label>
              <select v-model="form.difficulty" class="clean-input">
                <option value="Easy">🟢 Santai</option>
                <option value="Moderate">🟡 Sederhana</option>
                <option value="Hard">🔴 Padu</option>
              </select>
            </div>
          </div>

          <div class="input-wrap mt-4">
            <label>Lokasi</label>
            <div class="chip-group">
              <button 
                class="chip" 
                :class="{ active: locationType === 'malaysia' }" 
                @click="locationType = 'malaysia'"
              >🇲🇾 Malaysia</button>
              <button 
                class="chip" 
                :class="{ active: locationType === 'overseas' }" 
                @click="locationType = 'overseas'"
              >✈️ Luar Negara</button>
            </div>
          </div>

          <div v-if="locationType === 'malaysia'" class="grid-2">
            <div class="input-wrap">
              <select v-model="form.state" class="clean-input">
                <option disabled value="">Pilih Negeri</option>
                <option v-for="state in MALAYSIA_STATES" :key="state" :value="state">{{ state }}</option>
              </select>
            </div>
            <div class="input-wrap">
              <input type="text" v-model="form.placeName" placeholder="Nama Hutan / Tempat" class="clean-input" />
            </div>
          </div>
          <div v-else class="input-wrap">
            <input type="text" v-model="form.overseasLocation" placeholder="Nama Lokasi Penuh" class="clean-input" />
          </div>
        </div>

        <div v-if="currentStep === 2" class="form-section fade-up">
          <h2 class="section-title">Tetapan Logistik</h2>
          <p class="section-subtitle">Bila dan berapa bajet?</p>

          <div class="grid-2">
            <div class="input-wrap">
              <label>{{ t('createTrip.startDate') }}</label>
              <input type="date" v-model="form.startDate" class="clean-input" />
            </div>
            <div class="input-wrap">
              <label>{{ t('createTrip.endDate') }}</label>
              <input type="date" v-model="form.endDate" :min="form.startDate" class="clean-input" />
            </div>
          </div>
          
          <div class="duration-pill">
            ⏳ {{ computedDuration }}
          </div>

          <div class="grid-2 mt-4">
            <div class="input-wrap">
              <label>{{ t('createTrip.price') }}</label>
              <div class="currency-input">
                <span>RM</span>
                <input type="number" v-model="form.price" placeholder="0" />
              </div>
            </div>
            <div class="input-wrap">
              <label>{{ t('createTrip.slots') }}</label>
              <input type="number" v-model="form.maxSlots" placeholder="20" class="clean-input" />
            </div>
          </div>

          <div class="input-wrap mt-4">
            <label>Link WhatsApp Group</label>
            <input type="text" v-model="form.groupLink" placeholder="https://chat.whatsapp.com/..." class="clean-input" />
          </div>
        </div>

        <div v-if="currentStep === 3" class="form-section fade-up">
          <h2 class="section-title">Galeri & Info</h2>
          <p class="section-subtitle">Tarik perhatian peserta dengan gambar padu.</p>

          <div class="gallery-uploader">
            <div class="main-upload" @click="triggerUpload(0)" :style="{ backgroundImage: `url(${previewImages[0]})` }">
              <div v-if="!previewImages[0]" class="upload-placeholder">
                <span class="plus">+</span>
                <span>Cover Photo</span>
              </div>
              <input type="file" ref="fileInput0" @change="(e) => handleImageSelect(e, 0)" accept="image/*" hidden />
            </div>
            <div class="sub-uploads">
              <div v-for="i in 4" :key="i" class="sub-box" @click="triggerUpload(i)" :style="{ backgroundImage: `url(${previewImages[i]})` }">
                <span v-if="!previewImages[i]">+</span>
                <input type="file" :ref="'fileInput' + i" @change="(e) => handleImageSelect(e, i)" accept="image/*" hidden />
              </div>
            </div>
          </div>

          <div class="input-wrap mt-4">
            <label>Deskripsi</label>
            <textarea v-model="form.description" rows="5" class="clean-input" placeholder="Ceritakan detail trip..."></textarea>
          </div>

          <div class="details-stack">
            <div class="input-wrap">
              <label>⚠️ Wajib Bawa</label>
              <input type="text" v-model="form.mandatory" class="clean-input" placeholder="Headlamp, Whistle..." />
            </div>
            <div class="input-wrap">
              <label>🎒 Disyorkan</label>
              <input type="text" v-model="form.recommended" class="clean-input" placeholder="Tongkat, Gloves..." />
            </div>
          </div>

          <div class="input-wrap mt-4">
            <label>Pakej Termasuk:</label>
            <div class="tags-container">
              <div 
                v-for="service in TRIP_SERVICES" 
                :key="service" 
                class="tag-item" 
                :class="{ active: form.includes.includes(service) }"
                @click="toggleService(service)"
              >
                {{ service }}
              </div>
            </div>
          </div>
        </div>

        <div class="action-bar">
          <button v-if="currentStep > 1" @click="prevStep" class="btn-text">Kembali</button>
          <div class="spacer"></div>
          <button v-if="currentStep < 3" @click="nextStep" class="btn-pill">Seterusnya &rarr;</button>
          <button v-if="currentStep === 3" @click="submitForm" class="btn-pill finish" :disabled="loading">
            {{ loading ? 'Uploading...' : 'Terbitkan Trip' }}
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

  if (diffDays < 0) return 'Tarikh Salah';
  if (diffDays === 0) return 'Day Trip';
  return `${diffDays + 1}D ${diffDays}N`;
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

const nextStep = () => { if (currentStep.value < 3) currentStep.value++; };
const prevStep = () => { if (currentStep.value > 1) currentStep.value--; };

const submitForm = async () => {
  if (!auth.currentUser) { alert(t('auth.loginRequired')); return; }
  
  const checkText = `${form.title} ${form.description}`;
  if (isSpam(checkText)) { alert("⚠️ " + t('createTrip.spamError')); return; }

  loading.value = true;

  try {
    // Upload Images
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
    alert(t('createTrip.successMsg'));
    router.push('/trips');

  } catch (error) {
    console.error("Error:", error);
    alert(t('common.error') + ": " + error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 🔥 SPLIT SCREEN LAYOUT 🔥 */
.create-layout {
  display: flex;
  min-height: 100vh;
  background: #fff;
}

/* KIRI: GAMBAR (Fixed) */
.left-panel {
  width: 40%;
  background-image: url('https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1000&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: flex-end;
  padding: 3rem;
  color: white;
}

.overlay-content {
  position: relative;
  z-index: 2;
}
.left-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
}

.left-panel h1 { font-size: 2.5rem; margin: 0 0 10px 0; line-height: 1.1; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
.left-panel p { opacity: 0.8; font-size: 1rem; max-width: 80%; }

/* Vertical Progress Steps di Kiri */
.steps-vertical { margin-top: 2rem; display: flex; flex-direction: column; gap: 0; }
.step-item { display: flex; align-items: center; gap: 15px; opacity: 0.5; transition: opacity 0.3s; }
.step-item.active { opacity: 1; font-weight: bold; }
.step-item.done .dot { background: #2ecc71; border-color: #2ecc71; color: #2ecc71; } /* Dot Hijau bila done? Atau transparent checkmark? */
.dot { width: 30px; height: 30px; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
.step-line { width: 2px; height: 30px; background: rgba(255,255,255,0.3); margin-left: 14px; }

/* KANAN: FORM (Scrollable) */
.right-panel {
  width: 60%;
  height: 100vh;
  overflow-y: auto;
  padding: 4rem 5rem;
}

.form-wrapper { max-width: 600px; margin: 0 auto; padding-bottom: 100px; }
.mobile-header { display: none; } /* Sembunyi di desktop */

.section-title { font-size: 2rem; color: #2c3e50; margin: 0; }
.section-subtitle { color: #7f8c8d; margin-bottom: 2rem; }

/* Input Styles (Clean Line) */
.input-wrap { margin-bottom: 1.5rem; }
.input-wrap label { display: block; font-size: 0.85rem; font-weight: 700; color: #34495e; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; }

.clean-input {
  width: 100%;
  padding: 1rem 0;
  border: none;
  border-bottom: 2px solid #eee;
  font-size: 1.1rem;
  outline: none;
  transition: border-color 0.3s;
  background: transparent;
  color: #2c3e50;
}
.clean-input:focus { border-bottom-color: #2c3e50; }
.clean-input.large { font-size: 1.5rem; font-weight: bold; }

/* Grid Helpers */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
.mt-4 { margin-top: 2rem; }

/* Chips (Lokasi) */
.chip-group { display: flex; gap: 10px; }
.chip {
  padding: 0.8rem 1.5rem;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  color: #555;
}
.chip:hover { background: #f9f9f9; }
.chip.active { background: #2c3e50; color: white; border-color: #2c3e50; box-shadow: 0 4px 10px rgba(44, 62, 80, 0.3); }

/* Currency Input */
.currency-input { display: flex; align-items: baseline; border-bottom: 2px solid #eee; }
.currency-input span { font-size: 1rem; color: #999; margin-right: 5px; }
.currency-input input { flex: 1; border: none; padding: 1rem 0; font-size: 1.5rem; font-weight: bold; outline: none; }

.duration-pill { display: inline-block; background: #e8f5e9; color: #27ae60; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 0.9rem; }

/* Gallery */
.gallery-uploader { display: grid; grid-template-columns: 2fr 1fr; gap: 10px; height: 300px; }
.main-upload { background: #f0f2f5; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; background-size: cover; background-position: center; position: relative; }
.sub-uploads { display: grid; grid-template-rows: 1fr 1fr; grid-template-columns: 1fr 1fr; gap: 10px; }
.sub-box { background: #f0f2f5; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 2rem; color: #ccc; background-size: cover; background-position: center; }
.upload-placeholder { text-align: center; color: #95a5a6; }
.plus { font-size: 2rem; display: block; }

/* Tags */
.tags-container { display: flex; flex-wrap: wrap; gap: 10px; }
.tag-item { 
  padding: 8px 16px; border: 1px solid #eee; border-radius: 8px; cursor: pointer; user-select: none; transition: all 0.2s; 
}
.tag-item.active { background: #e67e22; color: white; border-color: #e67e22; }

/* Action Bar (Sticky Bottom) */
.action-bar {
  position: fixed; bottom: 0; right: 0; width: 60%; /* Match right panel width */
  background: white; padding: 1.5rem 5rem; border-top: 1px solid #f0f0f0;
  display: flex; align-items: center; z-index: 10;
}
.spacer { flex: 1; }
.btn-text { background: none; border: none; color: #7f8c8d; font-weight: bold; cursor: pointer; font-size: 1rem; }
.btn-text:hover { color: #2c3e50; }
.btn-pill { background: #2c3e50; color: white; border: none; padding: 1rem 2.5rem; border-radius: 50px; font-weight: bold; font-size: 1rem; cursor: pointer; transition: transform 0.2s; box-shadow: 0 5px 15px rgba(44, 62, 80, 0.2); }
.btn-pill:hover { transform: translateY(-3px); background: #34495e; }
.btn-pill.finish { background: #27ae60; }

/* Animasi */
.fade-up { animation: fadeUp 0.5s ease-out; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* RESPONSIVE MOBILE */
@media (max-width: 1024px) {
  .create-layout { flex-direction: column; }
  .left-panel { display: none; } /* Sembunyi gambar di mobile */
  
  .right-panel { width: 100%; padding: 2rem 1.5rem; height: auto; overflow: visible; }
  .form-wrapper { padding-bottom: 80px; }
  
  .mobile-header { display: block; margin-bottom: 2rem; font-size: 0.9rem; color: #999; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
  
  .action-bar { width: 100%; padding: 1rem 1.5rem; }
  .grid-2 { grid-template-columns: 1fr; gap: 0; }
  
  .gallery-uploader { height: auto; grid-template-columns: 1fr; }
  .main-upload { height: 200px; margin-bottom: 10px; }
  .sub-uploads { height: auto; grid-template-rows: 100px 100px; }
}
</style>