<template>
  <div class="admin-page">
    
    <div v-if="checkingAccess" class="security-check">
      <div class="spinner"></div>
      <p>Verifikasi Identiti...</p>
    </div>

    <div v-else-if="isAdmin" class="admin-container fade-in">
      
      <div class="header">
        <div>
          <h1>⚡ Admin Panel</h1>
          <p>Pusat Kawalan Utama</p>
        </div>
        <div class="user-badge">
           Admin Mode • {{ currentUserEmail ? maskEmail(currentUserEmail) : 'Unknown' }}
        </div>
      </div>

      <div class="admin-tabs custom-scrollbar">
        <button :class="{ active: activeTab === 'dashboard' }" @click="activeTab = 'dashboard'">📊 Dashboard</button>
        <button :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">👥 Users</button>
        <button :class="{ active: activeTab === 'trips' }" @click="activeTab = 'trips'">🏕️ Trips</button>
        <button :class="{ active: activeTab === 'forum' }" @click="activeTab = 'forum'">💬 Forum</button>
        <button :class="{ active: activeTab === 'services' }" @click="activeTab = 'services'">🛠️ Services</button>
        <button :class="{ active: activeTab === 'spots' }" @click="activeTab = 'spots'">📍 Spots</button>
        <button :class="{ active: activeTab === 'banners' }" @click="activeTab = 'banners'">🎨 Banners</button>
        <button :class="{ active: activeTab === 'devtools' }" @click="activeTab = 'devtools'" style="color: #ff5e57; border-color: #ff5e57;">🤖 Data Tools</button>
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
      <div v-if="activeTab === 'banners'" class="tab-content fade-in">
        <h3>🎨 Pengurusan Tampilan</h3>
        <div class="banner-manager-layout">
           <div class="banner-edit-card large-section">
              <div class="section-header"><h4>Slider Utama</h4><span>{{ banners.largeSlides.length }}/5</span></div>
              <div class="slides-list custom-scrollbar">
                 <div v-for="(slide, i) in banners.largeSlides" :key="i" class="slide-item">
                    <img :src="slide.imageUrl" class="slide-thumb">
                    <div class="slide-info"><input v-model="slide.title" class="mini-input"><input v-model="slide.linkUrl" class="mini-input"></div>
                    <button class="btn-del-slide" @click="removeSlide(i)">✖</button>
                 </div>
              </div>
              <div v-if="banners.largeSlides.length < 5" class="add-slide-box">
                 <input type="file" @change="handleSlideFileSelect" accept="image/*" class="file-input-mini">
                 <button class="btn-add" @click="addSlide" :disabled="loading.slide || !newSlide.file">Upload</button>
              </div>
              <button class="btn-save main-save" @click="saveAllSlides" :disabled="loading.saveAll">Simpan Slider</button>
           </div>
           <div class="small-banners-wrapper">
              <div class="banner-edit-card">
                 <h4>Banner Kecil 1</h4>
                 <div class="preview-box small" :style="{ backgroundImage: `url(${banners.small1.imageUrl})` }"></div>
                 <input type="file" @change="(e) => handleFileSelect(e, 'small1')" class="file-input-mini">
                 <button class="btn-save w-full mt-2" @click="saveBanner('small1')" :disabled="loading.small1">Simpan</button>
              </div>
              <div class="banner-edit-card">
                 <h4>Banner Kecil 2</h4>
                 <div class="preview-box small" :style="{ backgroundImage: `url(${banners.small2.imageUrl})` }"></div>
                 <input type="file" @change="(e) => handleFileSelect(e, 'small2')" class="file-input-mini">
                 <button class="btn-save w-full mt-2" @click="saveBanner('small2')" :disabled="loading.small2">Simpan</button>
              </div>
           </div>
        </div>
      </div>

      <!-- DEVTOOLS -->
      <div v-if="activeTab === 'devtools'" class="tab-content fade-in">
        <h3 class="text-red-400 mb-4 flex items-center gap-2">
            <i class="fas fa-database text-2xl"></i> Import Data Sebenar
        </h3>
        <p class="text-gray-400 mb-6 bg-white/5 p-3 rounded-lg border border-white/10">
            <i class="fas fa-info-circle text-blue-400 mr-2"></i> 
            Bahagian ini adalah untuk memasukkan data bukit/gunung sebenar dari fail JSON yang telah diproses.
        </p>
        <div class="single-tool-container">
           <div class="tool-card big-card" style="border: 1px solid #e74c3c;">
               <div class="icon-bg" style="background: rgba(231, 76, 60, 0.2); width: 70px; height: 70px; font-size: 2rem;">🗺️</div>
               <h4 style="color: #ff8787; font-size: 1.5rem; margin: 10px 0;">Real Maps Import</h4>
               <p style="font-size: 1rem; max-width: 400px;">
                 Import data bukit dari fail <code>gunung_siap_negeri.json</code>. 
                 Sistem akan automatik memasukkan Nama, Lokasi, Ketinggian, dan Negeri ke dalam database.
               </p>
               <div class="action-row" style="justify-content: center; margin-top: 20px;">
               <button @click="seedRealSpots" class="btn-tool" style="background: #e74c3c; padding: 15px 40px; font-size: 1.1rem;">
                 MULA IMPORT DATA
               </button>
               </div>
            </div>
        </div>
      </div>

    </div>
    
    <div v-else class="access-denied">
       <h1>⛔ AKSES DITOLAK</h1>
       <p>Cubaan menceroboh telah direkodkan.</p>
       <button @click="router.push('/')">Balik ke Home</button>
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

<style scoped>
.admin-page { background: #1a252f; min-height: 100vh; padding: 2rem; color: #ecf0f1; font-family: 'Inter', sans-serif; }
.admin-container { max-width: 1200px; margin: 0 auto; }
.security-check, .access-denied { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh; color: white; text-align: center; }
.access-denied h1 { color: #e74c3c; font-size: 3rem; margin-bottom: 1rem; }
.access-denied button { background: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 1rem; }
.spinner { border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* HEADER & TABS */
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid #34495e; padding-bottom: 1rem; }
.user-badge { background: #e67e22; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 0.8rem; }
.admin-tabs { display: flex; gap: 10px; margin-bottom: 2rem; overflow-x: auto; }
.admin-tabs button { background: #2c3e50; border: none; color: #bdc3c7; padding: 10px 20px; cursor: pointer; border-radius: 8px; font-weight: 600; white-space: nowrap; }
.admin-tabs button.active { background: #3498db; color: white; }

/* LAYOUTS */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
.card { background: #2c3e50; padding: 1.5rem; border-radius: 12px; text-align: center; border: 1px solid #34495e; }
.card h3 { font-size: 2rem; margin: 0; color: #f1c40f; }
.dashboard-split { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
.panel-section { background: #2c3e50; padding: 1.5rem; border-radius: 12px; }
.note-area { width: 100%; height: 100px; background: #34495e; border: none; color: white; padding: 1rem; margin-bottom: 10px; }

.list-wrapper { display: flex; flex-direction: column; gap: 10px; }
.list-item { background: #34495e; padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
.info strong { display: block; color:white; } .info small { color: #bdc3c7; }
.btn-approve { background: #27ae60; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; }
.btn-save-note { background: #27ae60; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer; }

/* BANNER MANAGER */
.banner-manager-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
.banner-edit-card { background: #2c3e50; padding: 1.5rem; border-radius: 12px; border: 1px solid #34495e; display: flex; flex-direction: column; }
.slide-item { display: flex; align-items: center; gap: 10px; background: #34495e; padding: 10px; border-radius: 8px; margin-bottom: 10px; }
.slide-thumb { width: 60px; height: 35px; object-fit: cover; }
.mini-input { background: #253342; border: 1px solid #555; color: white; padding: 4px; border-radius: 4px; width: 100%; margin-bottom: 2px; }
.preview-box { width: 100%; height: 120px; background-color: #253342; background-size: cover; border-radius: 8px; margin-bottom: 10px; border: 2px dashed #555; }
.btn-save { background: #27ae60; color: white; padding: 10px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin-top: 10px; }
.add-slide-box { background: #253342; padding: 10px; border-radius: 8px; border: 1px dashed #555; display: flex; gap: 5px; align-items: center; }
.btn-add { background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
.btn-del-slide { background: none; border: none; color: #e74c3c; font-weight: bold; cursor: pointer; }

/* TOOL CARD */
.single-tool-container { display: flex; justify-content: center; align-items: center; min-height: 400px; }
.tool-card { background: #253342; padding: 1.5rem; border-radius: 12px; border: 1px solid #34495e; display: flex; flex-direction: column; align-items: center; text-align: center; }
.tool-card.big-card { width: 100%; max-width: 600px; padding: 3rem; }
.icon-bg { border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
.btn-tool { border: none; border-radius: 6px; color: white; font-weight: bold; cursor: pointer; transition: 0.2s; }
.btn-tool:hover { filter: brightness(1.1); transform: scale(1.05); }

@media (max-width: 768px) { .dashboard-split, .banner-manager-layout { grid-template-columns: 1fr; } }
</style>