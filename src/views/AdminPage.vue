<template>
  <div class="admin-page">
    
    <!-- LOADING SCREEN -->
    <div v-if="checkingAccess" class="security-check">
      <div class="spinner"></div>
      <p>Verifikasi Identiti...</p>
    </div>

    <!-- MAIN ADMIN UI -->
    <div v-else-if="isAdmin" class="admin-container fade-in">
      
      <!-- HEADER -->
      <div class="header">
        <div>
          <h1>⚡ Admin Panel</h1>
          <p>Pusat Kawalan Utama</p>
        </div>
        <div class="user-badge">
           Admin Mode • {{ currentUserEmail ? maskEmail(currentUserEmail) : 'Unknown' }}
        </div>
      </div>

      <!-- TABS NAVIGATION -->
      <div class="admin-tabs custom-scrollbar">
        <button :class="{ active: activeTab === 'dashboard' }" @click="activeTab = 'dashboard'">📊 Dashboard</button>
        <button :class="{ active: activeTab === 'trips' }" @click="activeTab = 'trips'">🏕️ Trips <span v-if="counts.trips" class="badge">{{ counts.trips }}</span></button>
        <button :class="{ active: activeTab === 'forum' }" @click="activeTab = 'forum'">💬 Forum <span v-if="counts.forum" class="badge">{{ counts.forum }}</span></button>
        <button :class="{ active: activeTab === 'services' }" @click="activeTab = 'services'">🛠️ Services <span v-if="counts.services" class="badge">{{ counts.services }}</span></button>
        <button :class="{ active: activeTab === 'spots' }" @click="activeTab = 'spots'">📍 Spots <span v-if="counts.spots" class="badge">{{ counts.spots }}</span></button>
        <button :class="{ active: activeTab === 'banners' }" @click="activeTab = 'banners'">🎨 Banners</button>
        <!-- TAB DEV TOOLS -->
        <button :class="{ active: activeTab === 'devtools' }" @click="activeTab = 'devtools'" style="color: #ff5e57; border-color: #ff5e57;">🤖 Bot Tools</button>
      </div>

      <!-- ... (KOD TAB DASHBOARD, TRIPS, FORUM, SERVICES, SPOTS, BANNERS DIKEKALKAN SEPERTI ASAL) ... -->
      <!-- UNTUK JIMAT RUANG, SAYA HANYA PAPARKAN PERUBAHAN PADA TAB DEVTOOLS -->
      <!-- Pastikan anda tidak memadam kod tab lain yang sedia ada -->

      <!-- ==================== DASHBOARD TAB ==================== -->
      <div v-if="activeTab === 'dashboard'" class="tab-content fade-in">
         <div class="stats-grid">
            <div class="card"><h3>{{ users.length }}</h3><p>Total Users</p></div>
            <div class="card"><h3>{{ trips.length }}</h3><p>Total Trips</p></div>
            <div class="card"><h3>{{ spots.length }}</h3><p>Total Spots</p></div>
            <div class="card alert"><h3>{{ reports.length }}</h3><p>Total Reports</p></div>
         </div>
         <div class="dashboard-split">
            <div class="panel-section">
               <h3 class="text-yellow-400 mb-4">⏳ Permohonan Organizer ({{ pendingOrganizers.length }})</h3>
               <div v-if="pendingOrganizers.length > 0" class="list-wrapper">
                  <div v-for="user in pendingOrganizers" :key="user.id" class="list-item">
                     <div class="info"><strong>{{ user.name }}</strong><small>{{ user.organizerDetails?.orgName }}</small></div>
                     <button class="btn-approve" @click="approveOrganizer(user)">✅ Luluskan</button>
                  </div>
               </div>
               <p v-else class="empty-text">Tiada permohonan baru.</p>
            </div>
            <div class="panel-section">
               <h3>📝 Admin Notes</h3>
               <textarea v-model="adminNote" placeholder="Tulis nota penting..." class="note-area"></textarea>
               <button class="btn-save-note" @click="saveNote">Simpan Nota</button>
            </div>
         </div>
      </div>

      <!-- TRIPS TAB -->
      <div v-if="activeTab === 'trips'" class="tab-content fade-in">
         <div class="tab-header"><h3>Pengurusan Trip</h3><input type="text" v-model="searchQuery" placeholder="Cari..." class="search-box"/></div>
         <div class="data-list">
            <div v-for="trip in filteredTrips" :key="trip.id" class="data-item" :class="{ 'frozen-item': trip.isFrozen }">
               <div class="item-main">
                  <a :href="`/trips/${trip.id}`" target="_blank" class="item-title">{{ trip.title }} <span v-if="trip.isFrozen" class="frozen-badge">❄️ FROZEN</span></a>
                  <div class="item-meta">{{ trip.organizerName }} • {{ trip.status }}</div>
               </div>
               <div class="item-actions">
                  <button v-if="getReportCount(trip.id)" class="btn-report" @click="openReportModal(trip.id)">🚨 {{ getReportCount(trip.id) }} Reports</button>
                  <button class="btn-action" :class="trip.isFrozen ? 'btn-unfreeze' : 'btn-freeze'" @click="toggleFreeze('trips', trip)">{{ trip.isFrozen ? 'Unfreeze' : 'Freeze' }}</button>
                  <button class="btn-del" @click="deleteItem('trips', trip.id)">🗑️</button>
               </div>
            </div>
         </div>
      </div>

      <!-- FORUM TAB -->
      <div v-if="activeTab === 'forum'" class="tab-content fade-in">
         <div class="tab-header"><h3>Pengurusan Forum</h3><input type="text" v-model="searchQuery" placeholder="Cari..." class="search-box"/></div>
         <div class="data-list">
            <div v-for="post in filteredPosts" :key="post.id" class="data-item" :class="{ 'frozen-item': post.isFrozen }">
               <div class="item-main">
                  <a :href="`/forum/${post.id}`" target="_blank" class="item-title">{{ post.title }} <span v-if="post.isFrozen" class="frozen-badge">❄️ FROZEN</span></a>
               </div>
               <div class="item-actions">
                  <button v-if="getReportCount(post.id)" class="btn-report" @click="openReportModal(post.id)">🚨 {{ getReportCount(post.id) }} Reports</button>
                  <button class="btn-action" :class="post.isFrozen ? 'btn-unfreeze' : 'btn-freeze'" @click="toggleFreeze('forum_posts', post)">{{ post.isFrozen ? 'Unfreeze' : 'Freeze' }}</button>
                  <button class="btn-del" @click="deleteItem('forum_posts', post.id)">🗑️</button>
               </div>
            </div>
         </div>
      </div>

      <!-- SERVICES TAB -->
      <div v-if="activeTab === 'services'" class="tab-content fade-in">
         <div class="tab-header"><h3>Pengurusan Servis</h3><input type="text" v-model="searchQuery" placeholder="Cari..." class="search-box"/></div>
         <div class="data-list">
            <div v-for="item in filteredServices" :key="item.id" class="data-item" :class="{ 'frozen-item': item.isFrozen }">
               <div class="item-main"><span class="item-title">{{ item.name }}</span></div>
               <div class="item-actions">
                  <button v-if="getReportCount(item.id)" class="btn-report" @click="openReportModal(item.id)">🚨 {{ getReportCount(item.id) }}</button>
                  <button class="btn-action" :class="item.isFrozen ? 'btn-unfreeze' : 'btn-freeze'" @click="toggleFreeze('services', item)">{{ item.isFrozen ? 'Unfreeze' : 'Freeze' }}</button>
                  <button class="btn-del" @click="deleteItem('services', item.id)">🗑️</button>
               </div>
            </div>
         </div>
      </div>

      <!-- SPOTS TAB -->
      <div v-if="activeTab === 'spots'" class="tab-content fade-in">
         <div class="tab-header"><h3>Pengurusan Spot</h3><input type="text" v-model="searchQuery" placeholder="Cari..." class="search-box"/></div>
         <div class="data-list">
            <div v-for="item in filteredSpots" :key="item.id" class="data-item" :class="{ 'frozen-item': item.isFrozen }">
               <div class="item-main"><span class="item-title">{{ item.name }}</span></div>
               <div class="item-actions">
                  <button v-if="getReportCount(item.id)" class="btn-report" @click="openReportModal(item.id)">🚨 {{ getReportCount(item.id) }}</button>
                  <button class="btn-action" :class="item.isFrozen ? 'btn-unfreeze' : 'btn-freeze'" @click="toggleFreeze('spots', item)">{{ item.isFrozen ? 'Unfreeze' : 'Freeze' }}</button>
                  <button class="btn-del" @click="deleteItem('spots', item.id)">🗑️</button>
               </div>
            </div>
         </div>
      </div>

      <!-- BANNERS TAB -->
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

      <!-- ==================== TAB DEV TOOLS (UPDATED) ==================== -->
      <div v-if="activeTab === 'devtools'" class="tab-content fade-in">
        <h3 class="text-red-400 mb-4 flex items-center gap-2">
            <i class="fas fa-robot text-2xl"></i> Bot & Data Generator
        </h3>
        <p class="text-gray-400 mb-6 bg-white/5 p-3 rounded-lg border border-white/10">
            <i class="fas fa-info-circle text-blue-400 mr-2"></i> 
            Pilih jenis data yang anda mahu jana. Data palsu akan dimasukkan ke database untuk tujuan ujian UI.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           
           <!-- Card: Trip Seeder -->
           <div class="tool-card">
              <div class="icon-bg purple">🏔️</div>
              <h4>Trips Generator</h4>
              <p>Jana pelbagai trip (hiking, diving, dll).</p>
              <div class="action-row">
                 <input type="number" v-model="seedCounts.trips" min="1" max="20" class="mini-input-qty">
                 <button @click="runSeeder('trips')" class="btn-tool purple">Jana</button>
              </div>
           </div>

           <!-- Card: Forum Seeder -->
           <div class="tool-card">
              <div class="icon-bg blue">💬</div>
              <h4>Forum Generator</h4>
              <p>Jana topik perbincangan rawak.</p>
              <div class="action-row">
                 <input type="number" v-model="seedCounts.forum" min="1" max="20" class="mini-input-qty">
                 <button @click="runSeeder('forum')" class="btn-tool blue">Jana</button>
              </div>
           </div>

           <!-- Card: Service Seeder -->
           <div class="tool-card">
              <div class="icon-bg orange">🛠️</div>
              <h4>Services Generator</h4>
              <p>Jana iklan servis (rental, guide, dll).</p>
              <div class="action-row">
                 <input type="number" v-model="seedCounts.services" min="1" max="20" class="mini-input-qty">
                 <button @click="runSeeder('services')" class="btn-tool orange">Jana</button>
              </div>
           </div>

           <!-- Card: Spot Seeder -->
           <div class="tool-card">
              <div class="icon-bg green">📍</div>
              <h4>Spots Generator</h4>
              <p>Jana lokasi menarik (gunung, air terjun).</p>
              <div class="action-row">
                 <input type="number" v-model="seedCounts.spots" min="1" max="20" class="mini-input-qty">
                 <button @click="runSeeder('spots')" class="btn-tool green">Jana</button>
              </div>
           </div>

        </div>
      </div>

    </div>
    
    <!-- ACCESS DENIED STATE -->
    <div v-else class="access-denied">
       <h1>⛔ AKSES DITOLAK</h1>
       <p>Cubaan menceroboh telah direkodkan.</p>
       <button @click="router.push('/')">Balik ke Home</button>
    </div>

    <!-- REPORT MODAL -->
    <div v-if="showReportModal" class="modal-overlay" @click.self="showReportModal = false">
      <div class="glass-modal">
        <div class="modal-header"><h3>Laporan</h3><button class="close-btn" @click="showReportModal=false">✖</button></div>
        <div class="modal-body custom-scrollbar">
           <div v-for="rep in currentReporters" :key="rep.id" class="reporter-item">
              <strong>{{ rep.reporterName }}</strong>: "{{ rep.reason }}"
           </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db, storage } from '../firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc, getDoc, setDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// IMPORT SEMUA FUNGSI SEEDER BARU
import { seedTrips, seedForumPosts, seedServices, seedSpots } from '../utils/seeder';

const router = useRouter();
const isAdmin = ref(false);
const checkingAccess = ref(true);
const currentUserEmail = ref('');
const activeTab = ref('dashboard');
const searchQuery = ref('');
const adminNote = ref('');

// Seed Counts State
const seedCounts = reactive({
    trips: 5,
    forum: 5,
    services: 5,
    spots: 5
});

// Data
const trips = ref<any[]>([]);
const spots = ref<any[]>([]); 
const users = ref<any[]>([]);
const reports = ref<any[]>([]); 
const posts = ref<any[]>([]);
const services = ref<any[]>([]);

// Report Modal
const showReportModal = ref(false);
const currentReporters = ref<any[]>([]);

// Counts
const counts = reactive({ trips: 0, forum: 0, services: 0, spots: 0 });

// Banners
const loading = reactive({ slide: false, saveAll: false, small1: false, small2: false });
const banners = reactive({ 
  largeSlides: [] as any[], 
  small1: { imageUrl: '', linkUrl: '', file: null as File | null }, 
  small2: { imageUrl: '', linkUrl: '', file: null as File | null } 
});
const newSlide = reactive({ file: null as File | null, title: '', linkUrl: '' });

// Helper: Mask Email
const maskEmail = (email: string) => {
  const [name, domain] = email.split('@');
  if(!name || !domain) return email;
  return `${name.substring(0, 2)}***@${domain}`;
};

// --- FUNGSI BOT / SEEDER (UPDATED) ---
const runSeeder = async (type: 'trips' | 'forum' | 'services' | 'spots') => {
  const count = seedCounts[type];
  if(!confirm(`Adakah anda pasti mahu menjana ${count} item untuk ${type}?`)) return;
  
  if (type === 'trips') await seedTrips(count);
  else if (type === 'forum') await seedForumPosts(count);
  else if (type === 'services') await seedServices(count);
  else if (type === 'spots') await seedSpots(count);
  
  // Reload data setempat selepas generate (tak perlu refresh page penuh)
  await loadAllData();
};

onMounted(() => {
  adminNote.value = localStorage.getItem('adminNote') || '';
  
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserEmail.value = user.email || '';
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          isAdmin.value = true;
          loadAllData();
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

const loadAllData = async () => {
  try {
    const [tripSnap, spotSnap, repSnap, userSnap, postSnap, serviceSnap] = await Promise.all([
      getDocs(query(collection(db, "trips"), orderBy("createdAt", "desc"))),
      getDocs(query(collection(db, "spots"), orderBy("createdAt", "desc"))),
      getDocs(query(collection(db, "reports"), orderBy("createdAt", "desc"))),
      getDocs(collection(db, "users")),
      getDocs(query(collection(db, "forum_posts"), orderBy("createdAt", "desc"))),
      getDocs(query(collection(db, "services"), orderBy("createdAt", "desc")))
    ]);

    trips.value = tripSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    spots.value = spotSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    reports.value = repSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    users.value = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    posts.value = postSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    services.value = serviceSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    counts.trips = trips.value.length;
    counts.forum = posts.value.length;
    counts.services = services.value.length;
    counts.spots = spots.value.length;
  } catch(e) {
    console.error("Error fetching admin data. Check Firestore rules.", e);
    isAdmin.value = false;
  }
};

// --- COMPUTED FILTERS ---
const filteredTrips = computed(() => searchQuery.value ? trips.value.filter(t => t.title.toLowerCase().includes(searchQuery.value.toLowerCase())) : trips.value);
const filteredPosts = computed(() => searchQuery.value ? posts.value.filter(p => p.title.toLowerCase().includes(searchQuery.value.toLowerCase())) : posts.value);
const filteredServices = computed(() => searchQuery.value ? services.value.filter(s => s.name.toLowerCase().includes(searchQuery.value.toLowerCase())) : services.value);
const filteredSpots = computed(() => searchQuery.value ? spots.value.filter(s => s.name.toLowerCase().includes(searchQuery.value.toLowerCase())) : spots.value);
const pendingOrganizers = computed(() => users.value.filter(u => u.organizerStatus === 'pending'));

// --- ACTIONS ---
const toggleFreeze = async (collectionName: string, item: any) => {
  if(!confirm("Ubah status freeze?")) return;
  try {
    await updateDoc(doc(db, collectionName, item.id), { isFrozen: !item.isFrozen });
    item.isFrozen = !item.isFrozen;
  } catch(e) { alert("Gagal update. Semak akses."); }
};

const deleteItem = async (collectionName: string, id: string) => {
  if(!confirm("Padam item ini?")) return;
  try {
    await deleteDoc(doc(db, collectionName, id));
    if(collectionName === 'trips') trips.value = trips.value.filter(i => i.id !== id);
    if(collectionName === 'forum_posts') posts.value = posts.value.filter(i => i.id !== id);
    if(collectionName === 'services') services.value = services.value.filter(i => i.id !== id);
    if(collectionName === 'spots') spots.value = spots.value.filter(i => i.id !== id);
  } catch(e) { alert("Gagal padam. Database dikunci."); }
};

const getReportCount = (targetId: string) => reports.value.filter(r => r.targetId === targetId).length;

const openReportModal = async (targetId: string) => {
  showReportModal.value = true;
  const itemReports = reports.value.filter(r => r.targetId === targetId);
  currentReporters.value = itemReports.map(rep => {
    const user = users.value.find(u => u.id === rep.reportedBy);
    return { ...rep, reporterName: user ? user.name : 'Unknown' };
  });
};

const approveOrganizer = async (user: any) => {
  if(!confirm(`Luluskan ${user.name}?`)) return;
  try {
    await updateDoc(doc(db, "users", user.id), { role: 'organizer', organizerStatus: 'approved' });
    user.role = 'organizer'; user.organizerStatus = 'approved';
  } catch(e) { alert("Gagal."); }
};

const saveNote = () => { localStorage.setItem('adminNote', adminNote.value); alert("Saved."); };

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
.badge { background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-left: 5px; }

/* LAYOUTS */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
.card { background: #2c3e50; padding: 1.5rem; border-radius: 12px; text-align: center; border: 1px solid #34495e; }
.card.alert h3 { color: #e74c3c; }
.card h3 { font-size: 2rem; margin: 0; color: #f1c40f; }
.dashboard-split { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
.panel-section { background: #2c3e50; padding: 1.5rem; border-radius: 12px; }
.note-area { width: 100%; height: 100px; background: #34495e; border: none; color: white; padding: 1rem; margin-bottom: 10px; }

/* DATA LISTS */
.tab-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
.search-box { padding: 8px; border-radius: 5px; border: none; background: #34495e; color: white; }
.data-list { display: flex; flex-direction: column; gap: 10px; }
.data-item { background: #2c3e50; padding: 1rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid #2ecc71; }
.data-item.frozen-item { border-left-color: #3498db; opacity: 0.7; }
.item-title { color: white; font-weight: bold; text-decoration: none; }
.item-meta { color: #95a5a6; font-size: 0.8rem; }
.item-actions { display: flex; gap: 5px; }
.btn-del, .btn-freeze, .btn-unfreeze, .btn-report { padding: 5px 10px; border-radius: 5px; border: none; cursor: pointer; color: white; font-size: 0.8rem; }
.btn-del { background: #e74c3c; } .btn-freeze { background: #3498db; } .btn-unfreeze { background: #f39c12; } .btn-report { background: #e74c3c; animation: pulse 2s infinite; }
.btn-approve { background: #27ae60; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; float: right; }
.btn-save-note { background: #27ae60; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer; }

/* BOT TOOLS */
.tool-card { background: #253342; padding: 1.5rem; border-radius: 12px; border: 1px solid #34495e; display: flex; flex-direction: column; align-items: center; text-align: center; }
.icon-bg { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 10px; }
.icon-bg.purple { background: rgba(155, 89, 182, 0.2); }
.icon-bg.blue { background: rgba(52, 152, 219, 0.2); }
.icon-bg.orange { background: rgba(230, 126, 34, 0.2); }
.icon-bg.green { background: rgba(46, 204, 113, 0.2); }
.tool-card h4 { font-size: 1.1rem; margin-bottom: 5px; color: white; }
.tool-card p { font-size: 0.85rem; color: #95a5a6; margin-bottom: 15px; flex: 1; }
.action-row { display: flex; gap: 8px; width: 100%; }
.mini-input-qty { width: 50px; background: #1a252f; border: 1px solid #555; color: white; text-align: center; border-radius: 6px; }
.btn-tool { flex: 1; border: none; border-radius: 6px; color: white; font-weight: bold; cursor: pointer; padding: 8px; transition: 0.2s; }
.btn-tool:hover { filter: brightness(1.1); }
.btn-tool.purple { background: #9b59b6; }
.btn-tool.blue { background: #3498db; }
.btn-tool.orange { background: #e67e22; }
.btn-tool.green { background: #2ecc71; }

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

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; justify-content: center; align-items: center; }
.glass-modal { background: #2c3e50; padding: 20px; border-radius: 12px; width: 90%; max-width: 500px; border: 1px solid #34495e; }
.modal-header { display: flex; justify-content: space-between; border-bottom: 1px solid #34495e; padding-bottom: 10px; margin-bottom: 10px; }
.reporter-item { padding: 10px; border-bottom: 1px solid #34495e; }

@media (max-width: 768px) { .dashboard-split, .banner-manager-layout { grid-template-columns: 1fr; } .grid-cols-4 { grid-template-columns: 1fr; } }
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
</style>