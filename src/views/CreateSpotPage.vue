<template>
  <div class="create-page">
    <div class="form-container">
      
      <div class="form-header">
        <h2>📍 {{ t('createSpot.title') }}</h2>
        <p>{{ t('createSpot.sub') }}</p>
      </div>

      <div class="form-body">
        
        <div class="form-group">
          <label>{{ t('createSpot.nameLabel') }}</label>
          <input type="text" v-model="form.name" :placeholder="t('createSpot.namePlaceholder')" />
        </div>

        <div class="row">
          <div class="form-group half">
            <label>{{ t('createSpot.stateLabel') }}</label>
            <select v-model="form.state">
              <option disabled value="">{{ t('common.selectState') }}</option>
              <option v-for="state in MALAYSIA_STATES" :key="state" :value="state">{{ state }}</option>
            </select>
          </div>
          <div class="form-group half">
            <label>{{ t('createSpot.heightLabel') }}</label>
            <input type="number" v-model="form.height" :placeholder="t('createSpot.heightPlaceholder')" />
          </div>
        </div>

        <div class="row">
          <div class="form-group half">
            <label>{{ t('createSpot.diffLabel') }}</label>
            <select v-model="form.difficulty">
              <option value="Easy">{{ t('components.easy') }}</option>
              <option value="Moderate">{{ t('components.moderate') }}</option>
              <option value="Hard">{{ t('components.hard') }}</option>
            </select>
          </div>
          <div class="form-group half">
            <label>{{ t('createSpot.permitLabel') }}</label>
            <select v-model="form.permit">
              <option value="No">{{ t('spots.noPermit') }}</option>
              <option value="Perlu (Pejabat Hutan)">Perlu (Pejabat Hutan)</option>
              <option value="Perlu (Polis)">Perlu (Polis)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>{{ t('createSpot.mapLabel') }}</label>
          <input type="text" v-model="form.mapsLink" :placeholder="t('createSpot.mapPlaceholder')" />
        </div>

        <div class="form-group">
          <label>{{ t('createSpot.imgLabel') }}</label>
          <div class="upload-box">
            <input type="file" accept="image/*" @change="handleImageSelect" />
            <span v-if="!previewImage">{{ t('createSpot.uploadText') }}</span>
            <img v-else :src="previewImage" class="img-preview" />
          </div>
        </div>

        <div class="form-group">
          <label>{{ t('createSpot.descLabel') }}</label>
          <textarea v-model="form.description" rows="5" :placeholder="t('createSpot.descPlaceholder')"></textarea>
        </div>

      </div>

      <div class="form-footer">
        <button class="btn-cancel" @click="$router.back()">{{ t('common.cancel') }}</button>
        <button class="btn-submit" @click="submitSpot" :disabled="loading">
          {{ loading ? t('createSpot.uploading') : t('createSpot.submitBtn') }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'; // 🔥 Import i18n
import { auth, db, storage } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MALAYSIA_STATES } from '../constants/data';

const { t } = useI18n(); // 🔥 Init i18n
const router = useRouter();
const loading = ref(false);
const previewImage = ref('');
const rawFile = ref<File | null>(null);

const form = reactive({
  name: '',
  state: '',
  height: null,
  difficulty: 'Moderate', // Default value simplifiied
  permit: 'No',
  mapsLink: '',
  description: '',
  image: ''
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

const submitSpot = async () => {
  if (!auth.currentUser) return alert(t('auth.loginRequired'));
  if (!form.name || !form.state) return alert(t('createSpot.errorMsg'));

  loading.value = true;

  try {
    let imageUrl = '';
    if (rawFile.value) {
      const fileRef = storageRef(storage, `spots/${auth.currentUser.uid}_${Date.now()}.jpg`);
      const snapshot = await uploadBytes(fileRef, rawFile.value);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    await addDoc(collection(db, 'spots'), {
      ...form,
      image: imageUrl,
      contributorId: auth.currentUser.uid,
      contributorName: auth.currentUser.displayName || 'User',
      createdAt: serverTimestamp()
    });

    alert(t('createSpot.successMsg'));
    router.push('/spots');

  } catch (e) {
    console.error(e);
    alert(t('common.error'));
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.create-page { background-color: #f4f6f8; min-height: 100vh; padding: 2rem; display: flex; justify-content: center; }
.form-container { background: white; width: 100%; max-width: 600px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); display: flex; flex-direction: column; overflow: hidden; }
.form-header { background-color: #2c3e50; color: white; padding: 2rem; text-align: center; }
.form-header h2 { margin: 0; font-size: 1.5rem; }
.form-body { padding: 2rem; flex-grow: 1; }
.form-group { margin-bottom: 1.2rem; }
label { display: block; font-weight: bold; margin-bottom: 0.5rem; font-size: 0.9rem; color: #333; }
input, select, textarea { width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; outline: none; background: #fff; }
input:focus, select:focus, textarea:focus { border-color: #27ae60; box-shadow: 0 0 0 2px rgba(39, 174, 96, 0.1); }
.row { display: flex; gap: 1rem; } .half { flex: 1; }
.upload-box { border: 2px dashed #ccc; padding: 1rem; text-align: center; cursor: pointer; background: #fafafa; position: relative; height: 150px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: border 0.2s;}
.upload-box:hover { border-color: #27ae60; }
.upload-box input { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.img-preview { max-height: 100%; max-width: 100%; object-fit: contain; }
.form-footer { padding: 1.5rem 2rem; background-color: #f9f9f9; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 1rem; }
.btn-cancel { background: #ddd; color: #333; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-submit { background: #27ae60; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
.btn-submit:hover { background: #219150; }
.btn-submit:disabled { background: #ccc; cursor: not-allowed; }

@media (max-width: 600px) {
  .row { flex-direction: column; gap: 0; }
  .create-page { padding: 1rem; }
}
</style>