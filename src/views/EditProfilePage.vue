<template>
  <div class="edit-page">
    
    <!-- BACKGROUND LAYERS -->
    <div class="contour-lines"></div>
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <!-- MAIN CONTAINER -->
    <div class="container pt-48 pb-20 relative z-10">
      <div class="glass-form-container fade-up">
        <h2 class="text-3xl font-bold text-white text-center mb-6">⚙️ Tetapan Profil</h2>

        <!-- SECTION 1: INFO PERIBADI -->
        <div class="section">
          <h3 class="section-title">Info Peribadi</h3>
          
          <div class="form-group avatar-section">
            <div class="avatar-wrapper">
              <img :src="form.avatar || 'https://i.pravatar.cc/150?img=3'" class="avatar-preview" />
              <div class="file-input-container">
                <label for="file-upload" class="btn-upload">
                  <i class="fas fa-camera mr-2"></i> Tukar Gambar
                </label>
                <input id="file-upload" type="file" accept="image/*" @change="handleFileUpload" hidden />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Nama Paparan</label>
            <input type="text" v-model="form.name" class="glass-input" placeholder="Nama Penuh / Samaran" />
          </div>
          <div class="form-group">
            <label>Bio Ringkas</label>
            <textarea v-model="form.bio" rows="3" class="glass-input" placeholder="Ceritakan sedikit tentang diri anda..."></textarea>
          </div>
        </div>

        <!-- SECTION 2: INFO KECEMASAN -->
        <div class="section">
          <h3 class="section-title text-red-400">🏥 Info Kecemasan (Private)</h3>
          <div class="info-text mb-4">
            <i class="fas fa-lock mr-1"></i> Maklumat ini selamat dan hanya dilihat oleh anda (untuk Emergency Card).
          </div>
          
          <div class="form-group">
            <label>Jenis Darah</label>
            <div class="select-wrapper">
                <select v-model="form.bloodType" class="glass-input">
                  <option value="">- Pilih -</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                </select>
                <i class="fas fa-chevron-down select-arrow"></i>
            </div>
          </div>

          <div class="form-group">
            <label>Alahan (Allergies)</label>
            <input type="text" v-model="form.allergies" class="glass-input" placeholder="Cth: Kacang, Seafood, Ubat Penicillin" />
          </div>

          <div class="form-group">
            <label>No. Kecemasan (Waris/Kawan)</label>
            <input type="text" v-model="form.emergencyContact" class="glass-input" placeholder="Cth: 012-3456789 (Isteri)" />
          </div>
        </div>

        <!-- SECTION 3: ORGANIZER INFO (Conditional) -->
        <div class="section" v-if="form.role === 'organizer'">
          <h3 class="section-title text-orange-400">💼 Maklumat Penganjur</h3>
          <div class="form-group">
            <label>Nama Organisasi / Guide</label>
            <input type="text" v-model="form.organizerDetails.orgName" class="glass-input" />
          </div>
          <div class="form-group">
            <label>No. SSM (Jika ada)</label>
            <input type="text" v-model="form.organizerDetails.ssm" class="glass-input" />
          </div>
          <div class="form-group">
            <label>No. Lesen / Permit</label>
            <input type="text" v-model="form.organizerDetails.license" class="glass-input" />
          </div>
        </div>

        <!-- SECTION 4: SOCIAL MEDIA -->
        <div class="section">
          <h3 class="section-title">Sosial Media & Contact</h3>
          
          <!-- WhatsApp -->
          <div class="form-group icon-input-wrapper">
            <span class="input-icon"><i class="fab fa-whatsapp text-green-500"></i></span>
            <input type="text" v-model="form.whatsapp" class="glass-input pl-12" placeholder="No. WhatsApp (Cth: 0123456789)" />
          </div>
          
          <!-- Facebook -->
          <div class="form-group icon-input-wrapper">
            <span class="input-icon"><i class="fab fa-facebook text-blue-500"></i></span>
            <input type="text" v-model="form.facebook" class="glass-input pl-12" placeholder="Facebook Username" />
          </div>
          
          <!-- Instagram -->
          <div class="form-group icon-input-wrapper">
            <span class="input-icon"><i class="fab fa-instagram text-pink-500"></i></span>
            <input type="text" v-model="form.instagram" class="glass-input pl-12" placeholder="Instagram Username" />
          </div>
          
          <!-- TikTok -->
          <div class="form-group icon-input-wrapper">
            <span class="input-icon"><i class="fab fa-tiktok text-white"></i></span>
            <input type="text" v-model="form.tiktok" class="glass-input pl-12" placeholder="TikTok Username" />
          </div>
          
          <!-- YouTube -->
          <div class="form-group icon-input-wrapper">
            <span class="input-icon"><i class="fab fa-youtube text-red-500"></i></span>
            <input type="text" v-model="form.youtube" class="glass-input pl-12" placeholder="YouTube Channel" />
          </div>
        </div>

        <!-- SECTION 5: DANGER ZONE -->
        <div class="section danger-zone">
          <h3 class="text-red-500 font-bold mb-4">⚠️ Zon Bahaya</h3>
          
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

        <!-- ACTIONS -->
        <div class="actions mt-8">
          <button class="btn-cancel" @click="$router.back()">Batal</button>
          <button class="btn-save" @click="handleSave" :disabled="loading">
            {{ loading ? 'Memproses...' : 'Simpan Perubahan' }}
          </button>
        </div>

      </div>
    </div>

    <!-- DELETE MODAL (Dark Theme) -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="glass-modal delete-card">
        <h3 class="text-xl font-bold text-red-500 mb-4">⚠️ Pengesahan Padam Akaun</h3>
        <p class="text-gray-300 mb-4">Sila masukkan emel anda <strong class="text-white">({{ auth.currentUser?.email }})</strong> untuk sahkan pemadaman.</p>
        <input type="email" v-model="confirmEmail" placeholder="Masukkan emel anda..." class="glass-input mb-6" />
        <div class="modal-actions">
          <button class="btn-cancel w-full" @click="showDeleteModal = false">Batal</button>
          <button class="btn-danger w-full" @click="confirmDeleteAccount">SAHKAN PADAM</button>
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
  bloodType: '', allergies: '', emergencyContact: ''
});

onMounted(() => {
  onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      const docSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        Object.assign(form, data);
        if (!form.organizerDetails) form.organizerDetails = { orgName: '', ssm: '', license: '' };
      }

      try {
        const privateSnap = await getDoc(doc(db, "users", currentUser.uid, "private_data", "info"));
        if (privateSnap.exists()) {
          const pData = privateSnap.data();
          form.bloodType = pData.bloodType || '';
          form.allergies = pData.allergies || '';
          form.emergencyContact = pData.emergencyContact || '';
        }
      } catch (e) { console.log("Tiada data peribadi."); }

    } else { router.push('/'); }
  });
});

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert(`Fail terlalu besar (Max 5MB).`);
      target.value = ''; return;
    }
    const reader = new FileReader();
    reader.onload = (e) => { if (e.target?.result) form.avatar = e.target.result as string; };
    reader.readAsDataURL(file);
  }
};

const handleSave = async () => {
  if (!auth.currentUser) return;
  if (wantToDelete.value) { showDeleteModal.value = true; return; }

  loading.value = true;
  try {
    if (wantToDowngrade.value) form.role = 'user';

    const publicData = {
      name: form.name, bio: form.bio, avatar: form.avatar,
      ...(wantToDowngrade.value ? { role: 'user' } : {}), 
      whatsapp: form.whatsapp, facebook: form.facebook, instagram: form.instagram, tiktok: form.tiktok, youtube: form.youtube,
      organizerDetails: form.organizerDetails
    };

    const privateData = {
      bloodType: form.bloodType, allergies: form.allergies, emergencyContact: form.emergencyContact
    };

    await setDoc(doc(db, "users", auth.currentUser.uid), publicData, { merge: true });
    await setDoc(doc(db, "users", auth.currentUser.uid, "private_data", "info"), privateData, { merge: true });
    
    alert("Profil berjaya dikemaskini!");
    router.push('/profile');

  } catch (e) { console.error(e); alert("Gagal menyimpan."); } 
  finally { loading.value = false; }
};

const confirmDeleteAccount = async () => {
  if (confirmEmail.value !== auth.currentUser?.email) return alert("Emel tidak sepadan!");
  try {
    const user = auth.currentUser;
    await deleteDoc(doc(db, "users", user.uid));
    await deleteDoc(doc(db, "users", user.uid, "private_data", "info")); 
    await deleteUser(user);
    alert("Akaun dipadam. Selamat tinggal!");
    router.push('/');
  } catch (e: any) {
    if (e.code === 'auth/requires-recent-login') alert("Sila Log Masuk semula untuk padam akaun.");
    else alert("Gagal: " + e.message);
  }
};
</script>

<style scoped>
/* --- BASE THEME (DARK) --- */
.edit-page { 
  background-color: #0f172a; 
  min-height: 100vh; position: relative; overflow-x: hidden; color: white;
}
.container { max-width: 600px; margin: 0 auto; padding: 0 1.5rem; }

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

/* --- GLASS FORM --- */
.glass-form-container {
  background: rgba(30, 41, 59, 0.6); 
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px; padding: 2.5rem;
  backdrop-filter: blur(15px);
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}

.section { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
.section:last-child { border-bottom: none; }
.section-title { font-size: 1.2rem; font-weight: 700; color: #e2e8f0; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 1px; }

.form-group { margin-bottom: 1.2rem; position: relative; }
label { display: block; font-weight: 600; margin-bottom: 0.5rem; font-size: 0.9rem; color: #94a3b8; }

/* GLASS INPUT */
.glass-input {
  width: 100%; padding: 12px; border-radius: 10px; 
  border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3);
  color: white; outline: none; transition: 0.3s; font-size: 0.95rem;
}
.glass-input:focus { border-color: #6c63ff; background: rgba(0,0,0,0.5); }
.glass-input option { background-color: #1e293b; color: white; } /* Fix Dropdown BG */
.pl-12 { padding-left: 3.5rem; } /* Adjusted padding for icons */

/* SELECT ARROW */
.select-wrapper { position: relative; }
.select-arrow { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
select.glass-input { appearance: none; }

/* ICONS (UPDATED ALIGNMENT) */
.icon-input-wrapper {
  position: relative; /* Wajib ada untuk reference point */
}

.input-icon { 
  position: absolute; 
  left: 14px; 
  top: 50%; /* Duduk di tengah ketinggian */
  transform: translateY(-50%); /* Tolak balik 50% ketinggian diri sendiri supaya betul-betul center */
  font-size: 1.3rem; 
  display: flex; align-items: center; justify-content: center; width: 24px;
  pointer-events: none; /* Supaya boleh click input di belakang icon */
  z-index: 10;
}

/* AVATAR */
.avatar-wrapper { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.avatar-preview { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(255,255,255,0.2); }
.btn-upload { 
  background: rgba(255,255,255,0.1); color: white; padding: 6px 15px; 
  border-radius: 20px; cursor: pointer; font-size: 0.8rem; transition: 0.2s; border: 1px solid rgba(255,255,255,0.1);
}
.btn-upload:hover { background: rgba(255,255,255,0.2); }

/* INFO TEXT */
.info-text { font-size: 0.85rem; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 10px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2); }

/* DANGER ZONE */
.danger-zone { border: 1px solid rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.05); padding: 1.5rem; border-radius: 12px; }
.checkbox-danger { display: flex; gap: 10px; cursor: pointer; color: #fca5a5; font-weight: 600; font-size: 0.9rem; align-items: center; }
.checkbox-danger input { accent-color: #ef4444; width: 16px; height: 16px; }

/* ACTIONS */
.actions { display: flex; gap: 1rem; margin-top: 2rem; }
.btn-save { flex: 2; background: linear-gradient(135deg, #6c63ff, #5b54e0); color: white; padding: 12px; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; transition: 0.2s; }
.btn-save:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(108, 99, 255, 0.4); }
.btn-cancel { flex: 1; background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; padding: 12px; border-radius: 10px; cursor: pointer; font-weight: bold; transition: 0.2s; }
.btn-cancel:hover { background: rgba(255,255,255,0.1); color: white; }

/* MODAL */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px); }
.glass-modal { background: rgba(30, 41, 59, 0.95); padding: 2rem; border-radius: 16px; width: 90%; max-width: 400px; text-align: center; border: 1px solid rgba(239, 68, 68, 0.5); box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
.modal-actions { display: flex; gap: 10px; justify-content: center; }
.btn-danger { background-color: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; }
.btn-danger:hover { background-color: #dc2626; }

.fade-up { animation: fadeUp 0.6s ease-out; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>