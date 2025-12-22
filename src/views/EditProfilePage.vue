<template>
  <div class="edit-page">
    <div class="contour-lines"></div>
    
    <div class="container pt-32 pb-20 relative z-10 max-w-2xl mx-auto">
      <div class="glass-form p-8 rounded-2xl bg-slate-800/90 border border-white/10">
        <h2 class="text-2xl font-bold text-white mb-6">⚙️ Edit Profil</h2>

        <div class="mb-8">
          <label class="block text-gray-400 mb-2 text-sm">Gambar Profil</label>
          <div class="flex items-center gap-4">
            <img :src="form.avatar || 'https://i.pravatar.cc/150'" class="w-20 h-20 rounded-full border border-white/20 object-cover">
            <label class="cursor-pointer bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm text-white transition">
              Tukar Gambar
              <input type="file" @change="handleFileUpload" hidden accept="image/*">
            </label>
          </div>
        </div>

        <div class="grid gap-4 mb-8">
          <div>
            <label class="text-gray-400 text-sm">Nama Paparan</label>
            <input v-model="form.name" type="text" class="input-glass" />
          </div>
          <div>
            <label class="text-gray-400 text-sm">Bio</label>
            <textarea v-model="form.bio" rows="3" class="input-glass"></textarea>
          </div>
        </div>

        <div class="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <h3 class="text-red-400 font-bold mb-2 flex items-center gap-2">
            <i class="fas fa-lock"></i> Info Kecemasan (SULIT)
          </h3>
          <p class="text-xs text-gray-400 mb-4">Hanya untuk kegunaan Emergency Card anda.</p>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-gray-400 text-sm">Jenis Darah</label>
              <select v-model="privateForm.bloodType" class="input-glass">
                <option value="">- Pilih -</option>
                <option v-for="t in ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div>
              <label class="text-gray-400 text-sm">No. Waris</label>
              <input v-model="privateForm.emergencyContact" type="text" class="input-glass" placeholder="01X-XXXXXXX" />
            </div>
            <div class="col-span-2">
              <label class="text-gray-400 text-sm">Alahan / Penyakit</label>
              <input v-model="privateForm.allergies" type="text" class="input-glass" placeholder="Contoh: Kacang, Seafood" />
            </div>
          </div>
        </div>

        <div v-if="form.role === 'organizer'" class="mb-8 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
           <h3 class="text-orange-400 font-bold mb-4">Maklumat Penganjur</h3>
           <div class="grid gap-3">
             <input v-model="form.organizerDetails?.orgName" placeholder="Nama Organisasi" class="input-glass" />
             <input v-model="form.organizerDetails?.ssm" placeholder="No. SSM" class="input-glass" />
           </div>
        </div>

        <div class="mb-8">
          <h3 class="text-white font-bold mb-4">Pautan Sosial</h3>
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <i class="fab fa-whatsapp text-green-500 w-6"></i>
              <input v-model="form.whatsapp" placeholder="No. WhatsApp (e.g 6012345678)" class="input-glass" />
            </div>
            <div class="flex items-center gap-2">
              <i class="fab fa-facebook text-blue-500 w-6"></i>
              <input v-model="form.facebook" placeholder="Facebook Username" class="input-glass" />
            </div>
            <div class="flex items-center gap-2">
              <i class="fab fa-instagram text-pink-500 w-6"></i>
              <input v-model="form.instagram" placeholder="Instagram Username" class="input-glass" />
            </div>
             <div class="flex items-center gap-2">
              <i class="fab fa-tiktok text-white w-6"></i>
              <input v-model="form.tiktok" placeholder="TikTok Username" class="input-glass" />
            </div>
             <div class="flex items-center gap-2">
              <i class="fab fa-youtube text-red-500 w-6"></i>
              <input v-model="form.youtube" placeholder="YouTube Username" class="input-glass" />
            </div>
          </div>
        </div>

        <div class="flex gap-4 pt-4 border-t border-white/10">
          <button class="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition" @click="$router.back()">Batal</button>
          <button class="flex-[2] py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg transition" @click="saveProfile" :disabled="loading">
            {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import type { UserProfile, UserPrivateData } from '../types';

const router = useRouter();
const loading = ref(false);

// State Public (Flat structure)
const form = reactive<UserProfile>({
  id: '', name: '', bio: '', avatar: '', role: 'user',
  whatsapp: '', facebook: '', instagram: '', tiktok: '', youtube: '',
  organizerDetails: { orgName: '', ssm: '', license: '' }
});

// State Private
const privateForm = reactive<UserPrivateData>({
  bloodType: '', allergies: '', emergencyContact: ''
});

onMounted(() => {
  onAuthStateChanged(auth, async (currentUser) => {
    if (!currentUser) { router.push('/'); return; }

    // 1. Load Public Data
    const snap = await getDoc(doc(db, "users", currentUser.uid));
    if (snap.exists()) {
      const data = snap.data();
      // Manual mapping untuk elak overwrite object reactivity
      form.name = data.name || '';
      form.bio = data.bio || '';
      form.avatar = data.avatar || '';
      form.role = data.role || 'user';
      form.whatsapp = data.whatsapp || '';
      form.facebook = data.facebook || '';
      form.instagram = data.instagram || '';
      form.tiktok = data.tiktok || '';
      form.youtube = data.youtube || '';
      if(data.organizerDetails) form.organizerDetails = data.organizerDetails;
    }

    // 2. Load Private Data
    try {
      const pSnap = await getDoc(doc(db, "users", currentUser.uid, "private_data", "info"));
      if (pSnap.exists()) {
        const pData = pSnap.data();
        privateForm.bloodType = pData.bloodType || '';
        privateForm.allergies = pData.allergies || '';
        privateForm.emergencyContact = pData.emergencyContact || '';
      }
    } catch (e) { console.log("Tiada data private"); }
  });
});

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    if(file.size > 5 * 1024 * 1024) return alert("Fail terlalu besar (>5MB)");
    
    // Convert to Base64 (Basic implementation)
    // Untuk production, upload ke Firebase Storage adalah lebih baik
    const reader = new FileReader();
    reader.onload = (e) => {
      if(e.target?.result) form.avatar = e.target.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const saveProfile = async () => {
  if (!auth.currentUser) return;
  loading.value = true;

  try {
    const uid = auth.currentUser.uid;

    // 1. Simpan Data Public
    await setDoc(doc(db, "users", uid), {
      name: form.name,
      bio: form.bio,
      avatar: form.avatar,
      whatsapp: form.whatsapp,
      facebook: form.facebook,
      instagram: form.instagram,
      tiktok: form.tiktok,
      youtube: form.youtube,
      organizerDetails: form.organizerDetails
    }, { merge: true });

    // 2. Simpan Data Private (Subcollection)
    await setDoc(doc(db, "users", uid, "private_data", "info"), {
      bloodType: privateForm.bloodType,
      allergies: privateForm.allergies,
      emergencyContact: privateForm.emergencyContact
    }, { merge: true });

    alert("Profil berjaya dikemaskini!");
    router.push('/profile');

  } catch (e) {
    console.error(e);
    alert("Gagal menyimpan profil.");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.edit-page { background-color: #0f172a; min-height: 100vh; color: white; }
.input-glass {
  width: 100%; padding: 10px 15px; border-radius: 10px;
  background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
  color: white; outline: none; transition: 0.3s;
}
.input-glass:focus { border-color: #6c63ff; background: rgba(0,0,0,0.5); }
.input-glass option { background: #1e293b; color: white; }
</style>