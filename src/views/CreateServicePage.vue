<template>
  <div class="create-page">
    <div class="form-container">
      
      <div class="form-header">
        <h2>📢 {{ t('createService.title') }}</h2>
        <p>{{ t('createService.sub') }}</p>
      </div>

      <div class="form-body">
        
        <div class="form-group">
          <label>{{ t('createService.nameLabel') }}</label>
          <input type="text" v-model="form.name" :placeholder="t('createService.namePlaceholder')" />
        </div>

        <div class="row">
          <div class="form-group half">
            <label>{{ t('createService.catLabel') }}</label>
            <select v-model="form.category">
              <option disabled value="">{{ t('createService.catPlaceholder') }}</option>
              <option>Campsite (Tapak Khemah)</option>
              <option>Guide / Malim Gunung</option>
              <option>Boathouse / Pengangkutan</option>
              <option>Equipment Rental (Sewaan)</option>
              <option>Chalet / Homestay</option>
            </select>
          </div>
          
          <div class="form-group half">
            <label>{{ t('createService.stateLabel') }}</label>
            <select v-model="form.state">
              <option disabled value="">{{ t('directory.statePlaceholder') }}</option>
              <option v-for="state in MALAYSIA_STATES" :key="state" :value="state">{{ state }}</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>{{ t('createService.locLabel') }}</label>
          <input type="text" v-model="form.location" :placeholder="t('createService.locPlaceholder')" />
        </div>

        <div class="row">
          <div class="form-group half">
            <label>{{ t('createService.priceLabel') }}</label>
            <input type="text" v-model="form.priceRange" :placeholder="t('createService.pricePlaceholder')" />
          </div>
          <div class="form-group half">
            <label>{{ t('createService.waLabel') }}</label>
            <input type="number" v-model="form.whatsapp" placeholder="60123456789" />
          </div>
        </div>

        <div class="form-group">
          <label>{{ t('createService.imgLabel') }}</label>
          <img v-if="previewImage" :src="previewImage" class="img-preview" />
          <div class="upload-box">
            <span>{{ t('createService.uploadText') }}</span>
            <input type="file" accept="image/*" @change="handleImageSelect" /> 
          </div>
        </div>

        <div class="form-group">
          <label>{{ t('createService.descLabel') }}</label>
          <textarea v-model="form.description" rows="5" :placeholder="t('createService.descPlaceholder')"></textarea>
        </div>

      </div>

      <div class="form-footer">
        <button class="btn-cancel" @click="$router.back()">{{ t('common.cancel') }}</button>
        <button class="btn-submit" @click="submitService" :disabled="loading">
          {{ loading ? t('common.loading') : t('createService.submitBtn') }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'; // Import
import { auth, db, storage } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MALAYSIA_STATES } from '../constants/data';

const { t } = useI18n(); // Activate
const router = useRouter();
const loading = ref(false);
const previewImage = ref('');
const rawFile = ref<File | null>(null);

const form = reactive({
  name: '', category: '', state: '', location: '', priceRange: '', whatsapp: '', description: '', image: ''
});

const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    rawFile.value = target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => { if(e.target?.result) previewImage.value = e.target.result as string };
    reader.readAsDataURL(rawFile.value);
  }
};

const submitService = async () => {
  if (!auth.currentUser) return alert("Sila login dahulu.");
  if (!form.name || !form.category || !form.state) return alert("Sila isi nama, kategori dan negeri.");

  loading.value = true;

  try {
    let imageUrl = '';
    if (rawFile.value) {
      const fileRef = storageRef(storage, `services/${auth.currentUser.uid}_${Date.now()}.jpg`);
      const snapshot = await uploadBytes(fileRef, rawFile.value);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 90); 

    await addDoc(collection(db, 'services'), {
      ...form,
      image: imageUrl,
      ownerId: auth.currentUser.uid,
      ownerName: auth.currentUser.displayName || 'Owner',
      ownerAvatar: auth.currentUser.photoURL || '',
      createdAt: serverTimestamp(),
      expiryDate: Timestamp.fromDate(expiryDate)
    });

    alert("Iklan servis berjaya diterbitkan!");
    router.push('/directory');

  } catch (e) {
    console.error(e);
    alert("Gagal menerbitkan iklan.");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* CSS KEKAL SAMA */
.create-page { background-color: #f4f6f8; min-height: 100vh; padding: 2rem; display: flex; justify-content: center; }
.form-container { background: white; width: 100%; max-width: 600px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); display: flex; flex-direction: column; overflow: hidden; }
.form-header { background-color: #2c3e50; color: white; padding: 2rem; text-align: center; }
.form-body { padding: 2rem; flex-grow: 1; }
.form-group { margin-bottom: 1.2rem; }
label { display: block; font-weight: bold; margin-bottom: 0.5rem; font-size: 0.9rem; }
input, select, textarea { width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; outline: none; }
input:focus, select:focus, textarea:focus { border-color: #27ae60; }
.row { display: flex; gap: 1rem; } .half { flex: 1; }
.upload-box { border: 2px dashed #ccc; padding: 1rem; text-align: center; cursor: pointer; background: #fafafa; position: relative; height: 150px; display: flex; align-items: center; justify-content: center; }
.upload-box input { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.img-preview { max-height: 100%; max-width: 100%; object-fit: contain; }
.form-footer { padding: 1.5rem 2rem; background-color: #f9f9f9; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 1rem; }
.btn-cancel { background: #ddd; color: #333; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-submit { background: #27ae60; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-submit:disabled { background: #ccc; }
</style>