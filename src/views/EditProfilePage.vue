<template>
  <div class="edit-page">
    <div class="form-container">
      <h2>⚙️ {{ t('profile.settingsTitle') }}</h2>

      <div class="section">
        <h3>{{ t('profile.personalInfo') }}</h3>
        
        <div class="form-group avatar-section">
          <div class="avatar-wrapper">
            <img :src="form.avatar" alt="Avatar Preview" class="avatar-preview" />
            
            <div class="file-input-container">
              <label for="file-upload" class="custom-file-upload">
                📸 {{ t('profile.changePhoto') }}
              </label>
              <input id="file-upload" type="file" accept="image/*" @change="handleFileUpload" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>{{ t('profile.displayName') }}</label>
          <input type="text" v-model="form.name" />
        </div>
        <div class="form-group">
          <label>{{ t('profile.bio') }}</label>
          <textarea v-model="form.bio" rows="3"></textarea>
        </div>
      </div>

      <div class="section">
        <h3>{{ t('profile.socialMedia') }}</h3>
        <div class="form-group icon-input">
          <span>📞</span>
          <input type="text" v-model="form.whatsapp" :placeholder="t('profile.whatsappPlaceholder')" />
        </div>
        <div class="form-group icon-input">
          <span>📘</span>
          <input type="text" v-model="form.facebook" :placeholder="'Facebook ' + t('profile.usernamePlaceholder')" />
        </div>
        <div class="form-group icon-input">
          <span>📸</span>
          <input type="text" v-model="form.instagram" :placeholder="'Instagram ' + t('profile.usernamePlaceholder')" />
        </div>
        <div class="form-group icon-input">
          <span>🎵</span>
          <input type="text" v-model="form.tiktok" :placeholder="'TikTok ' + t('profile.usernamePlaceholder')" />
        </div>
        <div class="form-group icon-input">
          <span>▶️</span>
          <input type="text" v-model="form.youtube" :placeholder="'YouTube Channel'" />
        </div>
      </div>

      <div class="actions">
        <button class="btn-cancel" @click="$router.back()">{{ t('common.cancel') }}</button>
        <button class="btn-save" @click="saveProfile" :disabled="loading">
          {{ loading ? t('common.loading') : t('common.save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { auth, db } from '../firebaseConfig'; // Import DB
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Import Firestore Functions
import { onAuthStateChanged } from 'firebase/auth';

const { t } = useI18n();
const router = useRouter();
const loading = ref(false);

const form = reactive({
  name: '',
  bio: '',
  avatar: 'https://i.pravatar.cc/300?img=3',
  whatsapp: '',
  facebook: '',
  instagram: '',
  tiktok: '',
  youtube: ''
});

onMounted(() => {
  // Tunggu Auth ready
  onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      // 1. Cuba tarik data dari Firestore dulu
      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Kalau user pernah save profile sebelum ni, guna data tu
        const data = docSnap.data();
        Object.assign(form, data);
      } else {
        // Kalau first time (takde data kat DB), guna data Google
        form.name = currentUser.displayName || '';
        form.avatar = currentUser.photoURL || 'https://i.pravatar.cc/300?img=3';
      }
    } else {
      // Kalau tak login, tendang balik
      router.push('/');
    }
  });
});

// Convert Image to Base64 (Sementara, nanti Fasa Storage baru upload betul2)
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        form.avatar = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  }
};

const saveProfile = async () => {
  if (!auth.currentUser) return;
  
  loading.value = true;
  try {
    // Simpan ke Firestore dalam collection 'users', document ID = User UID
    await setDoc(doc(db, "users", auth.currentUser.uid), form, { merge: true });
    
    alert(t('profile.saveSuccess'));
    router.push('/profile');
    
  } catch (error) {
    console.error("Error saving profile:", error);
    alert("Error saving profile!");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.edit-page { background: #f4f6f8; min-height: 100vh; padding: 2rem; display: flex; justify-content: center; }
.form-container { background: white; width: 100%; max-width: 500px; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
h2 { margin-bottom: 1.5rem; color: #2c3e50; text-align: center; }
.section { margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem; }
.section h3 { margin-bottom: 1rem; color: #7f8c8d; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }

/* AVATAR STYLING */
.avatar-section { text-align: center; }
.avatar-wrapper { display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-top: 1rem; }
.avatar-preview { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #eee; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }

/* HIDE DEFAULT FILE INPUT & STYLE BUTTON */
input[type="file"] { display: none; }
.custom-file-upload { border: 1px solid #ccc; display: inline-block; padding: 6px 12px; cursor: pointer; border-radius: 20px; font-size: 0.85rem; background: #f9f9f9; transition: all 0.2s; }
.custom-file-upload:hover { background: #e67e22; color: white; border-color: #e67e22; }

.form-group { margin-bottom: 1rem; }
label { display: block; font-weight: bold; margin-bottom: 0.4rem; font-size: 0.9rem; }
input[type="text"], textarea { width: 100%; padding: 0.7rem; border: 1px solid #ddd; border-radius: 6px; }

.icon-input { display: flex; align-items: center; gap: 10px; }
.icon-input span { font-size: 1.2rem; width: 30px; text-align: center; }

.actions { display: flex; gap: 1rem; margin-top: 2rem; }
.btn-save { flex: 2; background-color: #2c3e50; color: white; padding: 0.8rem; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-save:hover { background-color: #1a252f; }
.btn-save:disabled { background-color: #95a5a6; cursor: not-allowed; }

.btn-cancel { flex: 1; background-color: white; border: 1px solid #ccc; color: #555; padding: 0.8rem; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-cancel:hover { background-color: #f1f1f1; }
</style>