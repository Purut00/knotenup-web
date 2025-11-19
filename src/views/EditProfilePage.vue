<template>
  <div class="edit-page">
    <div class="form-container">
      <h2>⚙️ Tetapan Profil</h2>

      <div class="section">
        <h3>Info Peribadi</h3>
        
        <div class="form-group avatar-section">
          <label>Gambar Profil</label>
          <div class="avatar-wrapper">
            <img :src="form.avatar" alt="Avatar Preview" class="avatar-preview" />
            
            <div class="file-input-container">
              <label for="file-upload" class="custom-file-upload">
                📸 Tukar Gambar
              </label>
              <input id="file-upload" type="file" accept="image/*" @change="handleFileUpload" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Nama Paparan</label>
          <input type="text" v-model="form.name" />
        </div>
        <div class="form-group">
          <label>Bio Ringkas</label>
          <textarea v-model="form.bio" rows="3"></textarea>
        </div>
      </div>

      <div class="section">
        <h3>Sosial Media & Contact</h3>
        <div class="form-group icon-input">
          <span>📞</span>
          <input type="text" v-model="form.whatsapp" placeholder="No. WhatsApp (0123456789)" />
        </div>
        <div class="form-group icon-input">
          <span>📘</span>
          <input type="text" v-model="form.facebook" placeholder="Username Facebook" />
        </div>
        <div class="form-group icon-input">
          <span>📸</span>
          <input type="text" v-model="form.instagram" placeholder="Username Instagram" />
        </div>
        <div class="form-group icon-input">
          <span>🎵</span>
          <input type="text" v-model="form.tiktok" placeholder="Username TikTok" />
        </div>
        <div class="form-group icon-input">
          <span>▶️</span>
          <input type="text" v-model="form.youtube" placeholder="Channel YouTube" />
        </div>
      </div>

      <div class="actions">
        <button class="btn-cancel" @click="$router.back()">Batal</button>
        <button class="btn-save" @click="saveProfile">Simpan Perubahan</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const form = reactive({
  name: 'Ali Gunung',
  bio: 'Pencinta alam semulajadi. Hobi: Hiking & Camping setiap hujung minggu.',
  avatar: 'https://i.pravatar.cc/300?img=11', // Default avatar
  whatsapp: '',
  facebook: '',
  instagram: '',
  tiktok: '',
  youtube: ''
});

// Ambil data sedia ada bila page load
onMounted(() => {
  const saved = localStorage.getItem('userProfile');
  if (saved) {
    Object.assign(form, JSON.parse(saved));
  }
});

// FUNGSI UPLOAD GAMBAR (BASE64)
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    
    // Tukar file gambar jadi URL untuk preview & simpan
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        form.avatar = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  }
};

const saveProfile = () => {
  localStorage.setItem('userProfile', JSON.stringify(form));
  alert('Profil berjaya dikemaskini!');
  router.push('/profile');
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

.avatar-preview {
  width: 100px; height: 100px; border-radius: 50%; object-fit: cover;
  border: 3px solid #eee; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

/* HIDE DEFAULT FILE INPUT & STYLE BUTTON */
input[type="file"] { display: none; }
.custom-file-upload {
  border: 1px solid #ccc;
  display: inline-block;
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 20px;
  font-size: 0.85rem;
  background: #f9f9f9;
  transition: all 0.2s;
}
.custom-file-upload:hover { background: #e67e22; color: white; border-color: #e67e22; }

.form-group { margin-bottom: 1rem; }
label { display: block; font-weight: bold; margin-bottom: 0.4rem; font-size: 0.9rem; }
input[type="text"], textarea { width: 100%; padding: 0.7rem; border: 1px solid #ddd; border-radius: 6px; }

.icon-input { display: flex; align-items: center; gap: 10px; }
.icon-input span { font-size: 1.2rem; width: 30px; text-align: center; }

.actions { display: flex; gap: 1rem; margin-top: 2rem; }
.btn-save { flex: 2; background-color: #2c3e50; color: white; padding: 0.8rem; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-save:hover { background-color: #1a252f; }

.btn-cancel { flex: 1; background-color: white; border: 1px solid #ccc; color: #555; padding: 0.8rem; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-cancel:hover { background-color: #f1f1f1; }
</style>