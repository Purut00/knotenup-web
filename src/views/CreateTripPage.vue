<template>
  <div class="create-page">
    <div class="form-container">
      
      <div class="form-header">
        <h2>{{ t('createTrip.title') }}</h2>
        <div class="progress-bar">
          <div class="step" :class="{ active: currentStep >= 1 }"><div class="step-circle">1</div><span>{{ t('createTrip.step1') }}</span></div>
          <div class="line" :class="{ filled: currentStep >= 2 }"></div>
          <div class="step" :class="{ active: currentStep >= 2 }"><div class="step-circle">2</div><span>{{ t('createTrip.step2') }}</span></div>
          <div class="line" :class="{ filled: currentStep >= 3 }"></div>
          <div class="step" :class="{ active: currentStep >= 3 }"><div class="step-circle">3</div><span>{{ t('createTrip.step3') }}</span></div>
        </div>
      </div>

      <div class="form-body">
        
        <div v-if="currentStep === 1" class="step-content">
          <h3>{{ t('createTrip.basicInfo') }}</h3>
          <div class="form-group">
            <label>{{ t('createTrip.tripTitle') }}</label>
            <input type="text" v-model="form.title" placeholder="Contoh: Hiking Gunung Kinabalu" />
          </div>
          <div class="row">
            <div class="form-group half">
              <label>{{ t('createTrip.category') }}</label>
              <select v-model="form.category">
                <option disabled value="">Pilih Kategori</option>
                <optgroup v-for="group in ACTIVITY_CATEGORIES" :key="group.group" :label="group.group">
                  <option v-for="item in group.items" :key="item" :value="item">{{ item }}</option>
                </optgroup>
              </select>
            </div>
            <div class="form-group half">
              <label>{{ t('createTrip.level') }}</label>
              <select v-model="form.difficulty">
                <option>🟢 Santai (Easy)</option>
                <option>🟡 Sederhana (Moderate)</option>
                <option>🔴 Hardcore (Hard)</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>{{ t('createTrip.location') }}</label>
            <input type="text" v-model="form.location" placeholder="Contoh: Taman Negara, Pahang" />
          </div>
        </div>

        <div v-if="currentStep === 2" class="step-content">
          <h3>{{ t('createTrip.datePrice') }}</h3>
          
          <div class="row">
            <div class="form-group half">
              <label>{{ t('createTrip.startDate') }}</label>
              <input type="date" v-model="form.startDate" />
            </div>
            <div class="form-group half">
              <label>{{ t('createTrip.endDate') }}</label>
              <input type="date" v-model="form.endDate" :min="form.startDate" />
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('createTrip.calculatedDuration') }}</label>
            <input 
              type="text" 
              :value="computedDuration" 
              disabled 
              class="disabled-input"
              style="background-color: #f0f0f0; color: #2c3e50; font-weight: bold;"
            />
          </div>

          <div class="row">
            <div class="form-group half">
              <label>{{ t('createTrip.price') }}</label>
              <input type="number" v-model="form.price" placeholder="0.00" />
            </div>
            <div class="form-group half">
              <label>{{ t('createTrip.slots') }}</label>
              <input type="number" v-model="form.maxSlots" placeholder="Cth: 20" />
            </div>
          </div>
          <div class="form-group">
            <label>Link Group WhatsApp</label>
            <input type="text" v-model="form.groupLink" />
          </div>
        </div>

        <div v-if="currentStep === 3" class="step-content">
          <h3>{{ t('createTrip.mediaInfo') }}</h3>
          
          <div class="form-group">
            <label>Gambar Utama</label>
            <img v-if="previewImage" :src="previewImage" class="img-preview" />
            <div class="upload-box">
              <span>📸 Klik untuk upload gambar</span>
              <input type="file" accept="image/*" @change="handleImageSelect" /> 
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('createTrip.desc') }}</label>
            <textarea v-model="form.description" rows="6"></textarea>
          </div>

          <div class="form-group">
            <label>{{ t('createTrip.includes') }}:</label>
            <div class="services-grid">
              <label class="checkbox-item" v-for="service in TRIP_SERVICES" :key="service">
                <input type="checkbox" :value="service" v-model="form.includes">
                <span>{{ service }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="form-footer">
        <button v-if="currentStep > 1" @click="prevStep" class="btn-secondary">{{ t('common.back') }}</button>
        <div style="flex: 1"></div> 
        <button v-if="currentStep < 3" @click="nextStep" class="btn-primary">{{ t('common.next') }}</button>
        <button v-if="currentStep === 3" @click="submitForm" class="btn-success" :disabled="loading">
          {{ loading ? 'Sedang Upload...' : t('createTrip.submitBtn') }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ACTIVITY_CATEGORIES, TRIP_SERVICES } from '../constants/data';
import { auth, db, storage } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { isSpam } from '../utils/spamFilter';

const { t } = useI18n();
const router = useRouter();
const currentStep = ref(1);
const loading = ref(false);
const previewImage = ref('');
const rawFile = ref<File | null>(null);

const form = reactive({
  title: '', category: '', difficulty: '🟡 Sederhana (Moderate)', location: '',
  startDate: '',
  endDate: '', // Tambah End Date
  price: null, maxSlots: null, groupLink: '', description: '',
  includes: [] as string[], image: ''
});

// 🔥 LOGIK PENGIRAAN DURASI 🔥
const computedDuration = computed(() => {
  if (!form.startDate || !form.endDate) return '-';

  const start = new Date(form.startDate);
  const end = new Date(form.endDate);
  
  // Kira beza masa (milisaat)
  const diffTime = end.getTime() - start.getTime();
  // Tukar ke hari (1000ms * 60s * 60m * 24h)
  const diffDays = diffTime / (1000 * 3600 * 24);

  if (diffDays < 0) return 'Tarikh Tidak Sah'; // Kalau end date sebelum start date

  if (diffDays === 0) {
    // Hari sama = Daytrip
    return t('createTrip.dayTrip');
  } else {
    // Contoh: 2 hari 1 malam (Logic: Malam = diffDays, Hari = diffDays + 1)
    const nights = diffDays;
    const days = diffDays + 1;
    // Format: 2h 1m (MS) atau 2d 1n (EN)
    return `${days}${t('createTrip.days')} ${nights}${t('createTrip.nights')}`;
  }
});

const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    rawFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => { if (e.target?.result) previewImage.value = e.target.result as string; };
    reader.readAsDataURL(file);
  }
};

const nextStep = () => { if (currentStep.value < 3) currentStep.value++; };
const prevStep = () => { if (currentStep.value > 1) currentStep.value--; };

const submitForm = async () => {
  if (!auth.currentUser) { alert("Sila login!"); return; }
  loading.value = true;

const checkText = `${form.title} ${form.description} ${form.location}`;
  if (isSpam(checkText)) {
    alert("⚠️ Trip ditolak: Kandungan mencurigakan dikesan. Sila semak semula.");
    return;
  }

  loading.value = true;

  
  try {
    let imageUrl = '';
    if (rawFile.value) {
      const fileRef = storageRef(storage, `trips/${auth.currentUser.uid}_${Date.now()}.jpg`);
      const snapshot = await uploadBytes(fileRef, rawFile.value);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    const tripData = {
      ...form,
      image: imageUrl,
      duration: computedDuration.value, // Simpan durasi yang dah dikira
      price: Number(form.price),
      maxSlots: Number(form.maxSlots),
      currentSlots: 0,
      status: 'open',
      createdAt: serverTimestamp(),
      organizerId: auth.currentUser.uid,
      organizerName: auth.currentUser.displayName || 'Organizer',
      organizerImage: auth.currentUser.photoURL || '',
    };

    await addDoc(collection(db, 'trips'), tripData);
    alert("Trip berjaya diterbitkan!");
    router.push('/trips');

  } catch (error) {
    console.error("Error:", error);
    alert("Gagal: " + error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* CSS SAMA MACAM DULU */
.create-page { background-color: #f4f6f8; min-height: 100vh; padding: 2rem; display: flex; justify-content: center; }
.form-container { background: white; width: 100%; max-width: 600px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); display: flex; flex-direction: column; overflow: hidden; }
.form-header { background-color: #2c3e50; color: white; padding: 2rem; text-align: center; }
.progress-bar { display: flex; align-items: center; justify-content: center; margin-top: 1.5rem; }
.step { display: flex; flex-direction: column; align-items: center; position: relative; z-index: 2; }
.step-circle { width: 35px; height: 35px; background-color: #34495e; border: 2px solid #7f8c8d; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-bottom: 5px; transition: all 0.3s; }
.step span { font-size: 0.8rem; color: #bdc3c7; }
.step.active .step-circle { background-color: #e67e22; border-color: #e67e22; }
.step.active span { color: white; font-weight: bold; }
.line { width: 60px; height: 3px; background-color: #34495e; margin: 0 10px; margin-bottom: 20px; }
.line.filled { background-color: #e67e22; }
.form-body { padding: 2rem; flex-grow: 1; }
h3 { margin-bottom: 1.5rem; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
.form-group { margin-bottom: 1.2rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #555; font-size: 0.9rem; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; outline: none; }
.form-group input:focus { border-color: #3498db; }
.row { display: flex; gap: 1rem; }
.half { flex: 1; }
.upload-box { border: 2px dashed #ccc; padding: 2rem; text-align: center; border-radius: 8px; cursor: pointer; background-color: #fafafa; position: relative; }
.upload-box input { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.img-preview { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 10px; border: 1px solid #ddd; }
.services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.8rem; margin-top: 0.5rem; background: #fff; border: 1px solid #eee; padding: 1rem; border-radius: 8px; }
.checkbox-item { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.9rem; color: #333; }
.checkbox-item input { width: 18px; height: 18px; cursor: pointer; }
.form-footer { padding: 1.5rem 2rem; background-color: #f9f9f9; border-top: 1px solid #eee; display: flex; gap: 1rem; }
button { padding: 0.8rem 1.5rem; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; transition: opacity 0.2s; }
button:hover { opacity: 0.9; }
button:disabled { background-color: #bdc3c7; cursor: not-allowed; }
.btn-secondary { background-color: #bdc3c7; color: #333; }
.btn-primary { background-color: #3498db; color: white; }
.btn-success { background-color: #2ecc71; color: white; }
/* Style untuk input duration yang disable */
.disabled-input { cursor: not-allowed; border-color: #eee; }
</style>