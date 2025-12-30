<template>
  <div class="min-h-screen bg-[#0f172a] text-white">
    <div class="absolute inset-0 z-0 opacity-[0.08] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' viewBox=\'0 0 1000 1000\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400\' stroke=\'white\' fill=\'none\' stroke-width=\'2\' opacity=\'0.5\'/%3E%3C/svg%3E')] bg-cover"></div>
    
    <div class="container pt-32 pb-20 relative z-10 max-w-2xl mx-auto px-6">
      <div class="p-8 rounded-2xl bg-slate-800/90 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-[15px]">
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
            <input v-model="form.name" type="text" class="w-full p-[10px_15px] rounded-[10px] bg-black/30 border border-white/10 text-white outline-none transition duration-300 focus:border-[#6c63ff] focus:bg-black/50" />
          </div>
          <div>
            <label class="text-gray-400 text-sm">Bio</label>
            <textarea v-model="form.bio" rows="3" class="w-full p-[10px_15px] rounded-[10px] bg-black/30 border border-white/10 text-white outline-none transition duration-300 focus:border-[#6c63ff] focus:bg-black/50"></textarea>
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
              <select v-model="privateForm.bloodType" class="w-full p-[10px_15px] rounded-[10px] bg-black/30 border border-white/10 text-white outline-none transition duration-300 focus:border-[#6c63ff] focus:bg-black/50 appearance-none">
                <option value="" class="bg-[#1e293b] text-white">- Pilih -</option>
                <option v-for="t in ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']" :key="t" :value="t" class="bg-[#1e293b] text-white">{{ t }}</option>
              </select>
            </div>
            <div>
              <label class="text-gray-400 text-sm">No. Waris</label>
              <input v-model="privateForm.emergencyContact" type="text" class="w-full p-[10px_15px] rounded-[10px] bg-black/30 border border-white/10 text-white outline-none transition duration-300 focus:border-[#6c63ff] focus:bg-black/50" placeholder="01X-XXXXXXX" />
            </div>
            <div class="col-span-2">
              <label class="text-gray-400 text-sm">Alahan / Penyakit</label>
              <input v-model="privateForm.allergies" type="text" class="w-full p-[10px_15px] rounded-[10px] bg-black/30 border border-white/10 text-white outline-none transition duration-300 focus:border-[#6c63ff] focus:bg-black/50" placeholder="Contoh: Kacang, Seafood" />
            </div>
          </div>
        </div>

        <div v-if="form.role === 'organizer' && form.organizerDetails" class="mb-8 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
           <h3 class="text-orange-400 font-bold mb-4">Maklumat Penganjur</h3>
           <div class="grid gap-3">
             <input v-model="form.organizerDetails.orgName" placeholder="Nama Organisasi" class="w-full p-[10px_15px] rounded-[10px] bg-black/30 border border-white/10 text-white outline-none transition duration-300 focus:border-[#6c63ff] focus:bg-black/50" />
             <input v-model="form.organizerDetails.ssm" placeholder="No. SSM" class="w-full p-[10px_15px] rounded-[10px] bg-black/30 border border-white/10 text-white outline-none transition duration-300 focus:border-[#6c63ff] focus:bg-black/50" />
           </div>
        </div>

        <div class="mb-8">
          <h3 class="text-white font-bold mb-4">Pautan Sosial</h3>
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <i class="fab fa-telegram text-blue-400 w-6 text-xl"></i>
              <div class="relative w-full">
                 <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                 <input v-model="form.telegramUsername" placeholder="Telegram Username (tanpa @)" class="w-full p-[10px_15px] rounded-[10px] bg-black/30 border border-white/10 text-white outline-none transition duration-300 focus:border-[#6c63ff] focus:bg-black/50 pl-8" />
              </div>
            </div>
            <div class="flex items-center gap-2">
              <i class="fab fa-whatsapp text-green-500 w-6"></i>
              <input v-model="form.whatsapp" placeholder="No. WhatsApp (e.g 0123456789)" class="w-full p-[10px_15px] rounded-[10px] bg-black/30 border border-white/10 text-white outline-none transition duration-300 focus:border-[#6c63ff] focus:bg-black/50" />
            </div>
            <div class="flex items-center gap-2">
              <i class="fab fa-facebook text-blue-500 w-6"></i>
              <input v-model="form.facebook" placeholder="Facebook Username" class="w-full p-[10px_15px] rounded-[10px] bg-black/30 border border-white/10 text-white outline-none transition duration-300 focus:border-[#6c63ff] focus:bg-black/50" />
            </div>
            <div class="flex items-center gap-2">
              <i class="fab fa-instagram text-pink-500 w-6"></i>
              <input v-model="form.instagram" placeholder="Instagram Username" class="w-full p-[10px_15px] rounded-[10px] bg-black/30 border border-white/10 text-white outline-none transition duration-300 focus:border-[#6c63ff] focus:bg-black/50" />
            </div>
             <div class="flex items-center gap-2">
              <i class="fab fa-tiktok text-white w-6"></i>
              <input v-model="form.tiktok" placeholder="TikTok Username" class="w-full p-[10px_15px] rounded-[10px] bg-black/30 border border-white/10 text-white outline-none transition duration-300 focus:border-[#6c63ff] focus:bg-black/50" />
            </div>
             <div class="flex items-center gap-2">
              <i class="fab fa-youtube text-red-500 w-6"></i>
              <input v-model="form.youtube" placeholder="YouTube Username" class="w-full p-[10px_15px] rounded-[10px] bg-black/30 border border-white/10 text-white outline-none transition duration-300 focus:border-[#6c63ff] focus:bg-black/50" />
            </div>
          </div>
        </div>

        <div class="flex gap-4 pt-4 border-t border-white/10">
          <button class="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition" @click="$router.back()">Batal</button>
          <button class="flex-[2] py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed" @click="saveProfile" :disabled="loading">
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
  telegramUsername: '', whatsapp: '', facebook: '', instagram: '', tiktok: '', youtube: '',
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
      form.telegramUsername = data.telegramUsername || '';
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
    } catch (e) { /* No private data found */ }
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
      telegramUsername: form.telegramUsername || '',
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