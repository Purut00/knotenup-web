<template>
  <div class="min-h-screen bg-[#0f172a] relative overflow-x-hidden text-white">
    
    <!-- BACKGROUND LAYERS -->
    <div class="absolute inset-0 z-0 opacity-[0.08] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' viewBox=\'0 0 1000 1000\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400\' stroke=\'white\' fill=\'none\' stroke-width=\'2\' opacity=\'0.5\'/%3E%3C/svg%3E')] bg-cover"></div>
    <div class="absolute top-0 left-0 w-[60vw] h-[60vw] bg-[#6c63ff] blur-[150px] opacity-15 pointer-events-none rounded-full"></div>
    <div class="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-[#ff8c42] blur-[150px] opacity-10 pointer-events-none rounded-full"></div>

    <!-- MAIN CONTAINER -->
    <div class="container mx-auto px-6 pt-[100px] pb-20 relative z-10 max-w-[600px]">
      
      <div class="bg-[#1e293b]/70 border border-white/10 rounded-[20px] p-10 max-sm:p-6 backdrop-blur-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-fade-in-up">
        
        <!-- HEADER -->
        <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-white mb-2">🏆 Daftar Sebagai Organizer</h2>
            <p class="text-gray-400">Tingkatkan akaun anda untuk mula menganjurkan trip dan aktiviti menarik.</p>
        </div>

        <div>
          
          <!-- NAMA ORGANISASI -->
          <div class="mb-6 relative">
            <label class="text-gray-300 font-semibold mb-2 block">Nama Organisasi / Jenama</label>
            
            <div class="flex items-center mb-3">
              <input type="checkbox" v-model="useProfileName" @change="syncName" id="useProfile" class="accent-purple-500 w-4 h-4">
              <label for="useProfile" class="text-sm text-gray-400 cursor-pointer select-none ml-2">
                Guna nama profil saya <span class="text-white font-bold">({{ currentUserName }})</span>
              </label>
            </div>

            <input 
                type="text" 
                v-model="form.orgName" 
                :disabled="useProfileName" 
                class="w-full p-[12px] px-[16px] rounded-[10px] border border-white/10 bg-[#0f172a]/60 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-[#0f172a]/80 focus:shadow-[0_0_0_4px_rgba(108,99,255,0.1)] placeholder-slate-500"
                :class="{ 'opacity-50 cursor-not-allowed': useProfileName }"
                placeholder="Cth: Abang Mat Guide Services" 
            />
          </div>

          <!-- SSM -->
          <div class="mb-6 relative">
            <label class="text-gray-300 font-semibold mb-2 block">
                No. Pendaftaran Perniagaan (SSM) 
                <span class="text-xs text-gray-500 font-normal ml-1">- Jika ada</span>
            </label>
            <input type="text" v-model="form.ssm" class="w-full p-[12px] px-[16px] rounded-[10px] border border-white/10 bg-[#0f172a]/60 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-[#0f172a]/80 focus:shadow-[0_0_0_4px_rgba(108,99,255,0.1)] placeholder-slate-500" placeholder="Cth: 20230100XXXX" />
          </div>

          <!-- LESEN -->
          <div class="mb-6 relative">
            <label class="text-gray-300 font-semibold mb-2 block">
                No. Pemandu Pelancong (Green Badge) / Malim Gunung Perhutanan 
                <span class="text-xs text-gray-500 font-normal ml-1">- Jika ada</span>
            </label>
            <input type="text" v-model="form.license" class="w-full p-[12px] px-[16px] rounded-[10px] border border-white/10 bg-[#0f172a]/60 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-[#0f172a]/80 focus:shadow-[0_0_0_4px_rgba(108,99,255,0.1)] placeholder-slate-500" placeholder="Cth: MGP-A9753" />
          </div>

          <!-- T&C BOX -->
          <div class="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-[10px] mb-8">
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" v-model="form.agreed" class="accent-orange-500 mt-1 w-5 h-5 flex-shrink-0">
              <span class="text-sm text-gray-300 leading-relaxed">
                Saya mengesahkan maklumat ini adalah benar. Saya faham bahawa <span class="text-white font-bold">KnotenUp</span> hanyalah medium promosi dan saya bertanggungjawab sepenuhnya ke atas trip yang dianjurkan.
              </span>
            </label>
          </div>

          <!-- BUTTON -->
          <button 
            class="w-full bg-gradient-to-br from-[#e67e22] to-[#d35400] text-white p-[14px] border-none rounded-[12px] font-bold cursor-pointer transition duration-300 text-base shadow-[0_4px_15px_rgba(230,126,34,0.3)] hover:enabled:-translate-y-[2px] hover:enabled:shadow-[0_8px_25px_rgba(230,126,34,0.5)] disabled:bg-[#475569] disabled:text-[#94a3b8] disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none" 
            :disabled="!form.agreed || loading" 
            @click="submitUpgrade"
          >
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