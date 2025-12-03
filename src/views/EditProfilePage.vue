<template>
  <div class="edit-page">
    <div class="form-container">
      <h2>⚙️ Tetapan Profil</h2>

      <div class="section">
        <h3>Info Peribadi</h3>
        <div class="form-group avatar-section">
          <div class="avatar-wrapper">
            <img :src="form.avatar || 'https://i.pravatar.cc/150?img=3'" class="avatar-preview" />
            <div class="file-input-container">
              <label for="file-upload" class="custom-file-upload">📸 Tukar Gambar</label>
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
        <h3>🏥 Info Kecemasan (Private)</h3>
        <div class="info-text">Maklumat ini selamat dan hanya dilihat oleh anda (untuk Emergency Card).</div>
        
        <div class="form-group">
          <label>Jenis Darah</label>
          <select v-model="form.bloodType" class="custom-select">
            <option value="">- Pilih -</option>
            <option value="A+">A+</option><option value="A-">A-</option>
            <option value="B+">B+</option><option value="B-">B-</option>
            <option value="O+">O+</option><option value="O-">O-</option>
            <option value="AB+">AB+</option><option value="AB-">AB-</option>
          </select>
        </div>

        <div class="form-group">
          <label>Alahan (Allergies)</label>
          <input type="text" v-model="form.allergies" placeholder="Cth: Kacang, Seafood, Ubat Penicillin" />
        </div>

        <div class="form-group">
          <label>No. Kecemasan (Waris/Kawan)</label>
          <input type="text" v-model="form.emergencyContact" placeholder="Cth: 012-3456789 (Isteri)" />
        </div>
      </div>

      <div class="section" v-if="form.role === 'organizer'">
        <h3 style="color: #e67e22;">Maklumat Penganjur</h3>
        <div class="form-group">
          <label>Nama Organisasi / Guide</label>
          <input type="text" v-model="form.organizerDetails.orgName" />
        </div>
        <div class="form-group">
          <label>No. SSM</label>
          <input type="text" v-model="form.organizerDetails.ssm" />
        </div>
        <div class="form-group">
          <label>No. Lesen / Permit</label>
          <input type="text" v-model="form.organizerDetails.license" />
        </div>
      </div>

      <div class="section">
        <h3>Sosial Media & Contact</h3>
        <div class="form-group icon-input"><span>📞</span><input type="text" v-model="form.whatsapp" placeholder="No. WhatsApp" /></div>
        <div class="form-group icon-input"><span>📘</span><input type="text" v-model="form.facebook" placeholder="Facebook Username" /></div>
        <div class="form-group icon-input"><span>📸</span><input type="text" v-model="form.instagram" placeholder="Instagram Username" /></div>
        <div class="form-group icon-input"><span>🎵</span><input type="text" v-model="form.tiktok" placeholder="TikTok Username" /></div>
        <div class="form-group icon-input"><span>▶️</span><input type="text" v-model="form.youtube" placeholder="YouTube Channel" /></div>
      </div>

      <div class="section danger-zone">
        <h3>Zon Bahaya</h3>
        
        <div class="danger-item" v-if="form.role === 'organizer'">
          <label class="checkbox-danger">
            <input type="checkbox" v-model="wantToDowngrade">
            <span>Turun pangkat ke User Biasa (Hilang akses Create Trip)</span>
          </label>
        </div>

        <div class="danger-item">
          <label class="checkbox-danger">
            <input type="checkbox" v-model="wantToDelete">
            <span>Padam Akaun Sepenuhnya (Data akan hilang)</span>
          </label>
        </div>
      </div>

      <div class="actions">
        <button class="btn-cancel" @click="$router.back()">Batal</button>
        <button class="btn-save" @click="handleSave" :disabled="loading">
          {{ loading ? 'Memproses...' : 'Simpan Perubahan' }}
        </button>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="delete-card">
        <h3>⚠️ Pengesahan Padam Akaun</h3>
        <p>Sila masukkan emel anda <strong>({{ auth.currentUser?.email }})</strong> untuk sahkan pemadaman.</p>
        <input type="email" v-model="confirmEmail" placeholder="Masukkan emel anda..." class="delete-input" />
        <div class="modal-actions">
          <button class="btn-cancel" @click="showDeleteModal = false">Batal</button>
          <button class="btn-danger" @click="confirmDeleteAccount">SAHKAN PADAM</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, deleteUser } from 'firebase/auth';

const router = useRouter();
const loading = ref(false);
const wantToDowngrade = ref(false);
const wantToDelete = ref(false);
const showDeleteModal = ref(false);
const confirmEmail = ref('');

const form = reactive({
  name: '', bio: '', avatar: '', role: 'user',
  whatsapp: '', facebook: '', instagram: '', tiktok: '', youtube: '',
  organizerDetails: { orgName: '', ssm: '', license: '' },
  // Field Baru untuk Emergency Card
  bloodType: '',
  allergies: '',
  emergencyContact: ''
});

onMounted(() => {
  onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      // 1. Ambil Public Data
      const docSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        Object.assign(form, data);
        
        // Pastikan object structure wujud kalau user lama
        if (!form.organizerDetails) form.organizerDetails = { orgName: '', ssm: '', license: '' };
      }

      // 2. Ambil Private Data (Dari Subcollection)
      try {
        const privateSnap = await getDoc(doc(db, "users", currentUser.uid, "private_data", "info"));
        if (privateSnap.exists()) {
          const pData = privateSnap.data();
          form.bloodType = pData.bloodType || '';
          form.allergies = pData.allergies || '';
          form.emergencyContact = pData.emergencyContact || '';
        }
      } catch (e) {
        console.log("Tiada data peribadi atau akses disekat.");
      }

    } else { router.push('/'); }
  });
});

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => { if (e.target?.result) form.avatar = e.target.result as string; };
    reader.readAsDataURL(target.files[0]);
  }
};

// 🔥 UPDATE: Split Save Logic 🔥
const handleSave = async () => {
  if (!auth.currentUser) return;

  // 1. Cek Delete Dulu
  if (wantToDelete.value) {
    showDeleteModal.value = true;
    return;
  }

  loading.value = true;
  try {
    // 2. Cek Downgrade
    if (wantToDowngrade.value) {
      form.role = 'user';
    }

    // 3. Asingkan Data Public
    const publicData = {
      name: form.name,
      bio: form.bio,
      avatar: form.avatar,
      // Jangan update role sewenang-wenangnya jika bukan downgrade (Security #1)
      ...(wantToDowngrade.value ? { role: 'user' } : {}), 
      whatsapp: form.whatsapp,
      facebook: form.facebook,
      instagram: form.instagram,
      tiktok: form.tiktok,
      youtube: form.youtube,
      organizerDetails: form.organizerDetails
    };

    // 4. Asingkan Data Private
    const privateData = {
      bloodType: form.bloodType,
      allergies: form.allergies,
      emergencyContact: form.emergencyContact
    };

    // 5. Simpan ke DUA tempat berbeza
    await setDoc(doc(db, "users", auth.currentUser.uid), publicData, { merge: true });
    await setDoc(doc(db, "users", auth.currentUser.uid, "private_data", "info"), privateData, { merge: true });
    
    alert(wantToDowngrade.value ? "Akaun berjaya diturunkan ke User Biasa." : "Profil berjaya dikemaskini!");
    router.push('/profile');

  } catch (e) { 
    console.error(e); 
    alert("Gagal menyimpan."); 
  } finally { 
    loading.value = false; 
  }
};

// LOGIC DELETE AKAUN
const confirmDeleteAccount = async () => {
  if (confirmEmail.value !== auth.currentUser?.email) {
    alert("Emel tidak sepadan!");
    return;
  }

  try {
    const user = auth.currentUser;
    // 1. Padam Data Firestore
    await deleteDoc(doc(db, "users", user.uid));
    await deleteDoc(doc(db, "users", user.uid, "private_data", "info")); // Delete private data juga
    
    // 2. Padam Auth User
    await deleteUser(user);
    
    alert("Akaun anda telah dipadam sepenuhnya. Selamat tinggal!");
    router.push('/');
  } catch (e: any) {
    console.error(e);
    if (e.code === 'auth/requires-recent-login') {
      alert("Sila Log Keluar dan Log Masuk semula untuk padam akaun (Sekuriti Google).");
    } else {
      alert("Gagal memadam akaun: " + e.message);
    }
  }
};
</script>

<style scoped>
.edit-page { background: #f4f6f8; min-height: 100vh; padding: 2rem; display: flex; justify-content: center; }
.form-container { background: white; width: 100%; max-width: 500px; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
h2 { margin-bottom: 1.5rem; color: #2c3e50; text-align: center; }
.section { margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem; }
.section h3 { margin-bottom: 1rem; color: #7f8c8d; font-size: 0.9rem; text-transform: uppercase; }

/* CSS untuk text info kecil */
.info-text { font-size: 0.8rem; color: #27ae60; margin-bottom: 10px; font-style: italic; background: #e8f5e9; padding: 5px; border-radius: 4px; }
/* CSS untuk dropdown darah */
.custom-select { width: 100%; padding: 0.7rem; border: 1px solid #ddd; border-radius: 6px; background: white; }

/* Avatar & Inputs (Sama macam dulu) */
.avatar-wrapper { display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-top: 1rem; }
.avatar-preview { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #eee; }
input[type="file"] { display: none; }
.custom-file-upload { border: 1px solid #ccc; padding: 6px 12px; cursor: pointer; border-radius: 20px; font-size: 0.85rem; background: #f9f9f9; }
.form-group { margin-bottom: 1rem; }
label { display: block; font-weight: bold; margin-bottom: 0.4rem; font-size: 0.9rem; }
input, textarea { width: 100%; padding: 0.7rem; border: 1px solid #ddd; border-radius: 6px; }
.icon-input { display: flex; align-items: center; gap: 10px; }

/* DANGER ZONE */
.danger-zone { border: 1px solid #f8d7da; background: #fff5f5; padding: 1rem; border-radius: 8px; }
.danger-zone h3 { color: #c0392b; }
.danger-item { margin-bottom: 10px; }
.checkbox-danger { display: flex; gap: 10px; cursor: pointer; color: #c0392b; font-weight: bold; font-size: 0.9rem; }

.actions { display: flex; gap: 1rem; margin-top: 2rem; }
.btn-save { flex: 2; background-color: #2c3e50; color: white; padding: 0.8rem; border: none; border-radius: 6px; cursor: pointer; }
.btn-cancel { flex: 1; background-color: white; border: 1px solid #ccc; padding: 0.8rem; border-radius: 6px; cursor: pointer; }

/* MODAL DELETE */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; justify-content: center; align-items: center; }
.delete-card { background: white; padding: 2rem; border-radius: 12px; width: 90%; max-width: 400px; text-align: center; border-top: 5px solid #e74c3c; }
.delete-input { margin: 1rem 0; border: 2px solid #e74c3c; }
.modal-actions { display: flex; gap: 10px; justify-content: center; }
.btn-danger { background-color: #e74c3c; color: white; border: none; padding: 0.8rem; border-radius: 6px; font-weight: bold; cursor: pointer; }
</style>