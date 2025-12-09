<template>
  <div class="reg-page">
    
    <!-- BACKGROUND LAYERS -->
    <div class="contour-lines"></div>
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <!-- MAIN CONTAINER (Hardcoded Padding Fix) -->
    <div class="container relative z-10" style="padding-top: 100px; padding-bottom: 80px;">
      
      <div class="glass-form-container fade-up">
        
        <!-- HEADER -->
        <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-white mb-2">🏆 Daftar Sebagai Organizer</h2>
            <p class="text-gray-400">Tingkatkan akaun anda untuk mula menganjurkan trip dan aktiviti menarik.</p>
        </div>

        <div class="form-body">
          
          <!-- NAMA ORGANISASI -->
          <div class="form-group">
            <label class="text-gray-300 font-semibold mb-2 block">Nama Organisasi / Jenama</label>
            
            <div class="checkbox-wrapper mb-3">
              <input type="checkbox" v-model="useProfileName" @change="syncName" id="useProfile" class="accent-purple-500 w-4 h-4">
              <label for="useProfile" class="text-sm text-gray-400 cursor-pointer select-none ml-2">
                Guna nama profil saya <span class="text-white font-bold">({{ currentUserName }})</span>
              </label>
            </div>

            <input 
                type="text" 
                v-model="form.orgName" 
                :disabled="useProfileName" 
                class="glass-input"
                :class="{ 'opacity-50 cursor-not-allowed': useProfileName }"
                placeholder="Cth: Abang Mat Guide Services" 
            />
          </div>

          <!-- SSM -->
          <div class="form-group">
            <label class="text-gray-300 font-semibold mb-2 block">
                No. Pendaftaran Perniagaan (SSM) 
                <span class="text-xs text-gray-500 font-normal ml-1">- Jika ada</span>
            </label>
            <input type="text" v-model="form.ssm" class="glass-input" placeholder="Cth: 20230100XXXX" />
          </div>

          <!-- LESEN -->
          <div class="form-group">
            <label class="text-gray-300 font-semibold mb-2 block">
                No. Pemandu Pelancong (Green Badge) / Malim Gunung Perhutanan 
                <span class="text-xs text-gray-500 font-normal ml-1">- Jika ada</span>
            </label>
            <input type="text" v-model="form.license" class="glass-input" placeholder="Cth: MGP-A9753" />
          </div>

          <!-- T&C BOX -->
          <div class="tnc-box">
            <label class="checkbox-container flex items-start gap-3 cursor-pointer">
              <input type="checkbox" v-model="form.agreed" class="accent-orange-500 mt-1 w-5 h-5 flex-shrink-0">
              <span class="text-sm text-gray-300 leading-relaxed">
                Saya mengesahkan maklumat ini adalah benar. Saya faham bahawa <span class="text-white font-bold">KnotenUp</span> hanyalah medium promosi dan saya bertanggungjawab sepenuhnya ke atas trip yang dianjurkan.
              </span>
            </label>
          </div>

          <!-- BUTTON -->
          <button class="btn-submit w-full" :disabled="!form.agreed || loading" @click="submitUpgrade">
            <span v-if="loading"><i class="fas fa-spinner fa-spin mr-2"></i> Sedang Proses...</span>
            <span v-else>Hantar Permohonan</span>
          </button>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router'; 
import { auth, db } from '../firebaseConfig';
import { doc, updateDoc, setDoc } from 'firebase/firestore';

const router = useRouter(); 
const loading = ref(false);
const useProfileName = ref(false);
const currentUserName = ref('');

const form = reactive({
  orgName: '',
  ssm: '',
  license: '',
  agreed: false
});

onMounted(() => {
  if(auth.currentUser) {
    currentUserName.value = auth.currentUser.displayName || 'User';
  }
});

const syncName = () => {
  if (useProfileName.value) {
    form.orgName = currentUserName.value;
  } else {
    form.orgName = '';
  }
};

const submitUpgrade = async () => {
  if (!auth.currentUser) return;
  if (!form.orgName) return alert("Sila letak nama organisasi/guide.");

  loading.value = true;

  try {
    const userRef = doc(db, "users", auth.currentUser.uid);
    
    // Status 'pending' untuk admin approval
  await updateDoc(userRef, {
      organizerStatus: 'pending',
        'organizerDetails.orgName': form.orgName,
        'organizerDetails.submittedAt': new Date()
});

// 2. Simpan SSM & Lesen ke Private Data (Secure)
  const privateDataRef = doc(db, "users", auth.currentUser.uid, "private_data", "organizer_info");
  await setDoc(privateDataRef, {
    ssm: form.ssm,
    license: form.license,
    updatedAt: new Date()
});

    alert("Permohonan dihantar! Sila tunggu pengesahan daripada Admin.");
    
    router.push('/profile');
    // Reload sedikit untuk update state user di navbar
    setTimeout(() => {
       window.location.reload();
    }, 100);

  } catch (e) {
    console.error(e);
    alert("Gagal menghantar permohonan.");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* --- BASE THEME (DARK) --- */
.reg-page { 
  background-color: #0f172a; 
  min-height: 100vh; position: relative; overflow-x: hidden; color: white;
}
.container { max-width: 600px; margin: 0 auto; padding-left: 1.5rem; padding-right: 1.5rem; }

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
  background: rgba(30, 41, 59, 0.7); 
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px; padding: 2.5rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}

.form-group { margin-bottom: 1.5rem; position: relative; }

/* GLASS INPUT */
.glass-input {
  width: 100%; padding: 12px 16px; border-radius: 10px; 
  border: 1px solid rgba(255,255,255,0.1); background: rgba(15, 23, 42, 0.6);
  color: white; outline: none; transition: 0.3s; font-size: 1rem;
}
.glass-input:focus { 
    border-color: #6c63ff; 
    background: rgba(15, 23, 42, 0.8); 
    box-shadow: 0 0 0 4px rgba(108, 99, 255, 0.1);
}
.glass-input::placeholder { color: #64748b; }

/* CHECKBOX WRAPPER */
.checkbox-wrapper { display: flex; align-items: center; }

/* TNC BOX */
.tnc-box {
  background: rgba(234, 179, 8, 0.1); /* Yellow tint */
  border: 1px solid rgba(234, 179, 8, 0.3);
  padding: 1rem; border-radius: 10px; margin-bottom: 2rem;
}

/* BUTTONS */
.btn-submit { 
  background: linear-gradient(135deg, #e67e22, #d35400); 
  color: white; padding: 14px; border: none; border-radius: 12px; 
  font-weight: 700; cursor: pointer; transition: 0.3s; font-size: 1rem;
  box-shadow: 0 4px 15px rgba(230, 126, 34, 0.3);
}
.btn-submit:hover:not(:disabled) { 
  transform: translateY(-2px); 
  box-shadow: 0 8px 25px rgba(230, 126, 34, 0.5);
}
.btn-submit:disabled { 
  background: #475569; color: #94a3b8; 
  cursor: not-allowed; box-shadow: none; transform: none;
}

/* ANIMATION */
.fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

/* RESPONSIVE */
@media (max-width: 640px) {
    .glass-form-container { padding: 1.5rem; }
}
</style>