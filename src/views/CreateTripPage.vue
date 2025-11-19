<template>
  <div class="create-page">
    <div class="form-container">
      
      <div class="form-header">
        <h2>{{ t('createTrip.title') }}</h2>
        <div class="progress-bar">
          <div class="step" :class="{ active: currentStep >= 1 }">
            <div class="step-circle">1</div>
            <span>{{ t('createTrip.step1') }}</span>
          </div>
          <div class="line" :class="{ filled: currentStep >= 2 }"></div>
          <div class="step" :class="{ active: currentStep >= 2 }">
            <div class="step-circle">2</div>
            <span>{{ t('createTrip.step2') }}</span>
          </div>
          <div class="line" :class="{ filled: currentStep >= 3 }"></div>
          <div class="step" :class="{ active: currentStep >= 3 }">
            <div class="step-circle">3</div>
            <span>{{ t('createTrip.step3') }}</span>
          </div>
        </div>
      </div>

      <div class="form-body">
        
        <div v-if="currentStep === 1" class="step-content">
          <h3>{{ t('createTrip.basicInfo') }}</h3>
          
          <div class="form-group">
            <label>{{ t('createTrip.tripTitle') }}</label>
            <input type="text" v-model="form.title" placeholder="Contoh: Hiking Gunung Kinabalu 3H2M" />
          </div>

          <div class="row">
            <div class="form-group half">
              <label>{{ t('createTrip.category') }}</label>
              <select v-model="form.category">
                <option disabled value="">Pilih Kategori</option>
                <optgroup v-for="group in ACTIVITY_CATEGORIES" :key="group.group" :label="group.group">
                  <option v-for="item in group.items" :key="item" :value="item">
                    {{ item }}
                  </option>
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
              <label>{{ t('createTrip.duration') }}</label>
              <input type="text" v-model="form.duration" placeholder="Cth: 3 Hari 2 Malam" />
            </div>
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
            <label>Link Group WhatsApp (Optional)</label>
            <input type="text" v-model="form.groupLink" placeholder="https://chat.whatsapp.com/..." />
            <small>User yang dah bayar akan dapat link ini.</small>
          </div>
        </div>

        <div v-if="currentStep === 3" class="step-content">
          <h3>{{ t('createTrip.mediaInfo') }}</h3>

          <div class="form-group">
            <label>Gambar Utama (Cover)</label>
            <div class="upload-box">
              <span>📸 Klik untuk upload gambar</span>
              <input type="file" accept="image/*" /> 
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('createTrip.desc') }}</label>
            <textarea v-model="form.description" rows="6" placeholder="Terangkan tentatif program di sini..."></textarea>
          </div>

          <div class="form-group">
            <label style="margin-top: 1rem;">{{ t('createTrip.includes') }}:</label>
            <div class="services-grid">
              <label class="checkbox-item" v-for="service in TRIP_SERVICES" :key="service">
                <input type="checkbox" :value="service" v-model="form.includes">
                <span>{{ service }}</span>
              </label>
            </div>
            <small style="color: #666;">Perkara yang tidak ditanda akan dianggap sebagai "Tidak Termasuk" (Exclude).</small>
          </div>
        </div>
      </div>

      <div class="form-footer">
        <button v-if="currentStep > 1" @click="prevStep" class="btn-secondary">
          {{ t('common.back') }}
        </button>
        
        <div style="flex: 1"></div> 
        
        <button v-if="currentStep < 3" @click="nextStep" class="btn-primary">
          {{ t('common.next') }}
        </button>
        
        <button v-if="currentStep === 3" @click="submitForm" class="btn-success">
          {{ t('createTrip.submitBtn') }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'; // 1. Import i18n
import { ACTIVITY_CATEGORIES, TRIP_SERVICES } from '../constants/data';

const { t } = useI18n(); // 2. Activate function t
const router = useRouter();
const currentStep = ref(1);

// Data Form (Reactive)
const form = reactive({
  title: '',
  category: '',
  difficulty: '🟡 Sederhana (Moderate)',
  location: '',
  startDate: '',
  duration: '',
  price: null,
  maxSlots: null,
  groupLink: '',
  description: '',
  includes: [] as string[],
});

// Navigasi Step
const nextStep = () => {
  if (currentStep.value < 3) currentStep.value++;
};

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--;
};

// Submit Data
const submitForm = () => {
  console.log("Data untuk dihantar:", form);
  alert("Trip berjaya dicipta!");
  router.push('/trips');
};
</script>

<style scoped>
.create-page {
  background-color: #f4f6f8;
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.form-container {
  background: white;
  width: 100%;
  max-width: 600px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* HEADER & PROGRESS */
.form-header {
  background-color: #2c3e50;
  color: white;
  padding: 2rem;
  text-align: center;
}

.progress-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.5rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.step-circle {
  width: 35px;
  height: 35px;
  background-color: #34495e;
  border: 2px solid #7f8c8d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 5px;
  transition: all 0.3s;
}

.step span { font-size: 0.8rem; color: #bdc3c7; }

/* Active State */
.step.active .step-circle {
  background-color: #e67e22;
  border-color: #e67e22;
}
.step.active span { color: white; font-weight: bold; }

.line {
  width: 60px;
  height: 3px;
  background-color: #34495e;
  margin: 0 10px;
  margin-bottom: 20px; /* Align dgn circle */
}
.line.filled { background-color: #e67e22; }

/* BODY */
.form-body {
  padding: 2rem;
  flex-grow: 1;
}

h3 { margin-bottom: 1.5rem; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }

.form-group { margin-bottom: 1.2rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #555; font-size: 0.9rem; }
.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
}
.form-group input:focus { border-color: #3498db; }

.row { display: flex; gap: 1rem; }
.half { flex: 1; }

.upload-box {
  border: 2px dashed #ccc;
  padding: 2rem;
  text-align: center;
  border-radius: 8px;
  cursor: pointer;
  background-color: #fafafa;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* Responsive grid */
  gap: 0.8rem;
  margin-top: 0.5rem;
  background: #fff;
  border: 1px solid #eee;
  padding: 1rem;
  border-radius: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
}

.checkbox-item input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* FOOTER */
.form-footer {
  padding: 1.5rem 2rem;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
  display: flex;
  gap: 1rem;
}

button {
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
}
button:hover { opacity: 0.9; }

.btn-secondary { background-color: #bdc3c7; color: #333; }
.btn-primary { background-color: #3498db; color: white; }
.btn-success { background-color: #2ecc71; color: white; }
</style>