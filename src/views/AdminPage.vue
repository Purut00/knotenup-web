<template>
  <div class="min-h-screen bg-[#1a252f] p-8 text-[#ecf0f1] font-sans">
    
    <div v-if="checkingAccess" class="flex flex-col items-center justify-center h-[80vh] text-center">
      <div class="w-10 h-10 border-4 border-white/10 border-t-[#3498db] rounded-full animate-spin mb-5"></div>
      <p>Verifikasi Identiti...</p>
    </div>

    <div v-else-if="isAdmin" class="max-w-[1200px] mx-auto animate-fade-in">
      
      <div class="flex justify-between items-center mb-8 border-b border-[#34495e] pb-4">
        <div>
          <h1 class="text-3xl font-bold m-0">⚡ Admin Panel</h1>
          <p class="text-gray-400">Pusat Kawalan Utama</p>
        </div>
        <div class="bg-[#e67e22] text-white py-1.5 px-4 rounded-full font-bold text-xs">
           Admin Mode • {{ currentUserEmail ? maskEmail(currentUserEmail) : 'Unknown' }}
        </div>
      </div>

      <div class="flex gap-2.5 mb-8 overflow-x-auto pb-2">
        <button :class="['bg-[#2c3e50] border-none text-[#bdc3c7] py-2.5 px-5 cursor-pointer rounded-lg font-semibold whitespace-nowrap transition-colors', activeTab === 'dashboard' ? 'bg-[#3498db] text-white' : '']" @click="activeTab = 'dashboard'">📊 Dashboard</button>
        <button :class="['bg-[#2c3e50] border-none text-[#bdc3c7] py-2.5 px-5 cursor-pointer rounded-lg font-semibold whitespace-nowrap transition-colors', activeTab === 'users' ? 'bg-[#3498db] text-white' : '']" @click="activeTab = 'users'">👥 Users</button>
        <button :class="['bg-[#2c3e50] border-none text-[#bdc3c7] py-2.5 px-5 cursor-pointer rounded-lg font-semibold whitespace-nowrap transition-colors', activeTab === 'trips' ? 'bg-[#3498db] text-white' : '']" @click="activeTab = 'trips'">🏕️ Trips</button>
        <button :class="['bg-[#2c3e50] border-none text-[#bdc3c7] py-2.5 px-5 cursor-pointer rounded-lg font-semibold whitespace-nowrap transition-colors', activeTab === 'forum' ? 'bg-[#3498db] text-white' : '']" @click="activeTab = 'forum'">💬 Forum</button>
        <button :class="['bg-[#2c3e50] border-none text-[#bdc3c7] py-2.5 px-5 cursor-pointer rounded-lg font-semibold whitespace-nowrap transition-colors', activeTab === 'services' ? 'bg-[#3498db] text-white' : '']" @click="activeTab = 'services'">🛠️ Services</button>
        <button :class="['bg-[#2c3e50] border-none text-[#bdc3c7] py-2.5 px-5 cursor-pointer rounded-lg font-semibold whitespace-nowrap transition-colors', activeTab === 'spots' ? 'bg-[#3498db] text-white' : '']" @click="activeTab = 'spots'">📍 Spots</button>
        <button :class="['bg-[#2c3e50] border-none text-[#bdc3c7] py-2.5 px-5 cursor-pointer rounded-lg font-semibold whitespace-nowrap transition-colors', activeTab === 'banners' ? 'bg-[#3498db] text-white' : '']" @click="activeTab = 'banners'">🎨 Banners</button>
        <button :class="['bg-[#2c3e50] border border-[#ff5e57] text-[#ff5e57] py-2.5 px-5 cursor-pointer rounded-lg font-semibold whitespace-nowrap transition-colors', activeTab === 'devtools' ? 'bg-[#ff5e57] text-white' : '']" @click="activeTab = 'devtools'">🤖 Data Tools</button>
      </div>

      <!-- DASHBOARD -->
      <!-- COMPONENTS -->
      <AdminDashboard v-if="activeTab === 'dashboard'" @switch-tab="(t) => activeTab = t" />
      <AdminUsers v-if="activeTab === 'users'" />

      <!-- SUB COMPONENTS -->
      <AdminTrips v-if="activeTab === 'trips'" @view-reports="openReportModal" />
      <AdminForum v-if="activeTab === 'forum'" @view-reports="openReportModal" />
      <AdminServices v-if="activeTab === 'services'" @view-reports="openReportModal" />
      <AdminSpots v-if="activeTab === 'spots'" @view-reports="openReportModal" />

      <!-- BANNERS MANAGER -->
      <div v-if="activeTab === 'banners'" class="animate-fade-in">
        <h3 class="text-xl font-bold mb-4">🎨 Pengurusan Tampilan</h3>
        <div class="grid grid-cols-[2fr_1fr] gap-5 max-md:grid-cols-1">
           <div class="bg-[#2c3e50] p-6 rounded-xl border border-[#34495e] flex flex-col">
              <div class="flex justify-between items-center mb-4"><h4 class="font-bold m-0">Slider Utama</h4><span class="text-gray-400 text-sm">{{ banners.largeSlides.length }}/5</span></div>
              <div class="max-h-[400px] overflow-y-auto pr-2 mb-4">
                 <div v-for="(slide, i) in banners.largeSlides" :key="i" class="flex items-center gap-2.5 bg-[#34495e] p-2.5 rounded-lg mb-2.5">
                    <img :src="slide.imageUrl" class="w-[60px] h-[35px] object-cover rounded">
                    <div class="flex-1"><input v-model="slide.title" class="bg-[#253342] border border-[#555] text-white p-1 rounded w-full mb-0.5 text-xs placeholder-gray-500" placeholder="Title"><input v-model="slide.linkUrl" class="bg-[#253342] border border-[#555] text-white p-1 rounded w-full text-xs placeholder-gray-500" placeholder="Link URL"></div>
                    <button class="bg-transparent border-none text-[#e74c3c] font-bold cursor-pointer" @click="removeSlide(i)">✖</button>
                 </div>
              </div>
              <div v-if="banners.largeSlides.length < 5" class="bg-[#253342] p-2.5 rounded-lg border border-dashed border-[#555] flex gap-1.5 items-center mb-4">
                 <input type="file" @change="handleSlideFileSelect" accept="image/*" class="text-xs text-gray-400 file:bg-[#34495e] file:border-none file:text-white file:rounded file:px-2 file:py-1 file:mr-2 file:cursor-pointer">
                 <button class="bg-[#3498db] text-white border-none py-1.5 px-2.5 rounded cursor-pointer text-xs font-bold disabled:opacity-50" @click="addSlide" :disabled="loading.slide || !newSlide.file">Upload</button>
              </div>
              <button class="bg-[#27ae60] text-white p-2.5 border-none rounded-lg cursor-pointer font-bold mt-auto disabled:opacity-50" @click="saveAllSlides" :disabled="loading.saveAll">Simpan Slider</button>
           </div>
           <div class="flex flex-col gap-5">
              <div class="bg-[#2c3e50] p-6 rounded-xl border border-[#34495e] flex flex-col">
                 <h4 class="font-bold m-0 mb-3">Banner Kecil 1</h4>
                 <div class="w-full h-[120px] bg-[#253342] bg-cover bg-center rounded-lg mb-2.5 border-2 border-dashed border-[#555]" :style="{ backgroundImage: `url(${banners.small1.imageUrl})` }"></div>
                 <input type="file" @change="(e) => handleFileSelect(e, 'small1')" class="text-xs text-gray-400 file:bg-[#34495e] file:border-none file:text-white file:rounded file:px-2 file:py-1 file:mr-2 file:cursor-pointer mb-2">
                 <button class="w-full mt-2 bg-[#27ae60] text-white p-2.5 border-none rounded-lg cursor-pointer font-bold disabled:opacity-50" @click="saveBanner('small1')" :disabled="loading.small1">Simpan</button>
              </div>
              <div class="bg-[#2c3e50] p-6 rounded-xl border border-[#34495e] flex flex-col">
                 <h4 class="font-bold m-0 mb-3">Banner Kecil 2</h4>
                 <div class="w-full h-[120px] bg-[#253342] bg-cover bg-center rounded-lg mb-2.5 border-2 border-dashed border-[#555]" :style="{ backgroundImage: `url(${banners.small2.imageUrl})` }"></div>
                 <input type="file" @change="(e) => handleFileSelect(e, 'small2')" class="text-xs text-gray-400 file:bg-[#34495e] file:border-none file:text-white file:rounded file:px-2 file:py-1 file:mr-2 file:cursor-pointer mb-2">
                 <button class="w-full mt-2 bg-[#27ae60] text-white p-2.5 border-none rounded-lg cursor-pointer font-bold disabled:opacity-50" @click="saveBanner('small2')" :disabled="loading.small2">Simpan</button>
              </div>
           </div>
        </div>
      </div>

      <!-- DEVTOOLS -->
      <div v-if="activeTab === 'devtools'" class="animate-fade-in">
        <h3 class="text-red-400 mb-4 flex items-center gap-2 font-bold text-xl">
            <i class="fas fa-database text-2xl"></i> Import Data Sebenar
        </h3>
        <p class="text-gray-400 mb-6 bg-white/5 p-3 rounded-lg border border-white/10">
            <i class="fas fa-info-circle text-blue-400 mr-2"></i> 
            Bahagian ini adalah untuk memasukkan data bukit/gunung sebenar dari fail JSON yang telah diproses.
        </p>
        <div class="flex justify-center items-center min-h-[400px]">
           <div class="bg-[#253342] p-12 rounded-xl border border-[#e74c3c] flex flex-col items-center text-center w-full max-w-[600px]">
               <div class="w-[70px] h-[70px] rounded-full flex items-center justify-center mb-2.5 bg-[rgba(231,76,60,0.2)] text-[2rem]">🗺️</div>
               <h4 class="text-[#ff8787] text-[1.5rem] my-2.5 font-bold">Real Maps Import</h4>
               <p class="text-[1rem] max-w-[400px] mb-5 text-gray-300">
                 Import data bukit dari fail <code>gunung_siap_negeri.json</code>. 
                 Sistem akan automatik memasukkan Nama, Lokasi, Ketinggian, dan Negeri ke dalam database.
               </p>
               <div class="flex justify-center mt-5">
               <button @click="seedRealSpots" class="bg-[#e74c3c] text-white py-[15px] px-[40px] text-[1.1rem] font-bold rounded-lg border-none cursor-pointer transition duration-200 hover:brightness-110 hover:scale-105">
                 MULA IMPORT DATA
               </button>
               </div>
            </div>
        </div>
      </div>

    </div>
    
    <div v-else class="flex flex-col items-center justify-center h-[80vh] text-center">
       <h1 class="text-[#e74c3c] text-[3rem] mb-4 font-bold">⛔ AKSES DITOLAK</h1>
       <p class="text-gray-300">Cubaan menceroboh telah direkodkan.</p>
       <button @click="router.push('/')" class="bg-[#e74c3c] text-white border-none py-2.5 px-5 rounded cursor-pointer mt-4 font-bold hover:brightness-110">Balik ke Home</button>
    </div>

    <!-- REPORT MODAL -->
    <AdminReportModal v-model:visible="showReportModal" :reports="currentReports" />

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db, storage } from '../firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, getDoc, setDoc, query, where } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

// COMPONENTS
import AdminDashboard from '../components/admin/AdminDashboard.vue';
import AdminUsers from '../components/admin/AdminUsers.vue';
import AdminTrips from '../components/admin/AdminTrips.vue';
import AdminSpots from '../components/admin/AdminSpots.vue';
import AdminForum from '../components/admin/AdminForum.vue';
import AdminServices from '../components/admin/AdminServices.vue';
import AdminReportModal from '../components/admin/AdminReportModal.vue';

// SEEDER
import { seedRealSpots } from '../utils/seeder';

const router = useRouter();
const isAdmin = ref(false);
const checkingAccess = ref(true);
const currentUserEmail = ref('');
const activeTab = ref('dashboard');

// Report Modal
const showReportModal = ref(false);
const currentReports = ref<any[]>([]);

// Banners
const loading = reactive({ slide: false, saveAll: false, small1: false, small2: false });
const banners = reactive({ 
  largeSlides: [] as any[], 
  small1: { imageUrl: '', linkUrl: '', file: null as File | null }, 
  small2: { imageUrl: '', linkUrl: '', file: null as File | null } 
});
const newSlide = reactive({ file: null as File | null, title: '', linkUrl: '' });

const maskEmail = (email: string) => {
  const [name, domain] = email.split('@');
  if(!name || !domain) return email;
  return `${name.substring(0, 2)}***@${domain}`;
};

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserEmail.value = user.email || '';
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          isAdmin.value = true;
          loadBanners();
        } else {
          isAdmin.value = false;
        }
      } catch (e) {
        console.error("Security verify failed", e);
        isAdmin.value = false;
      }
    } else {
      router.push('/');
    }
    checkingAccess.value = false; 
  });
});

const openReportModal = async (targetId: string) => {
  try {
      const q = query(collection(db, "reports"), where("targetId", "==", targetId));
      const snap = await getDocs(q);
      currentReports.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      showReportModal.value = true;
  } catch(e) { console.error(e); alert("Gagal fetch reports."); }
};

// --- BANNERS LOGIC ---
const loadBanners = async () => {
  try {
    const docSnap = await getDoc(doc(db, "site_settings", "banners"));
    if (docSnap.exists()) {
        const data = docSnap.data();
        if(data.largeSlides) banners.largeSlides = data.largeSlides;
        if(data.small1) Object.assign(banners.small1, data.small1);
        if(data.small2) Object.assign(banners.small2, data.small2);
    }
  } catch(e) {}
};
const handleSlideFileSelect = (e: any) => { if(e.target.files[0]) newSlide.file = e.target.files[0]; };
const addSlide = async () => {
    if(!newSlide.file) return;
    loading.slide = true;
    try {
        const snap = await uploadBytes(storageRef(storage, `banners/slide_${Date.now()}.jpg`), newSlide.file);
        const url = await getDownloadURL(snap.ref);
        banners.largeSlides.push({ imageUrl: url, title: newSlide.title, linkUrl: newSlide.linkUrl });
        await saveAllSlides();
        newSlide.file = null; newSlide.title = '';
    } catch(e) { alert("Gagal upload."); } finally { loading.slide = false; }
};
const removeSlide = async (idx: number) => { if(confirm("Padam?")) { banners.largeSlides.splice(idx, 1); await saveAllSlides(); } };
const saveAllSlides = async () => { 
    loading.saveAll = true; 
    try { await setDoc(doc(db, "site_settings", "banners"), { largeSlides: banners.largeSlides }, { merge: true }); } 
    catch(e) { alert("Gagal save."); } finally { loading.saveAll = false; } 
};
const handleFileSelect = (event: Event, type: 'small1' | 'small2') => { const t = event.target as HTMLInputElement; if (t.files?.[0]) banners[type].file = t.files[0]; };
const saveBanner = async (type: 'small1' | 'small2') => {
  loading[type] = true;
  try {
    let url = banners[type].imageUrl;
    if (banners[type].file) {
      const snap = await uploadBytes(storageRef(storage, `banners/${type}_${Date.now()}.jpg`), banners[type].file!);
      url = await getDownloadURL(snap.ref);
    }
    await setDoc(doc(db, "site_settings", "banners"), { [type]: { imageUrl: url, linkUrl: banners[type].linkUrl } }, { merge: true });
    alert("Disimpan.");
  } catch (e) { alert("Gagal."); } finally { loading[type] = false; }
};
</script>