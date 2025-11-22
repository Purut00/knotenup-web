<template>
  <div class="admin-page">
    <div v-if="isAdmin" class="admin-container">
      
      <div class="header">
        <div>
          <h1>⚡ Admin Panel</h1>
          <p>Selamat datang, Boss. Pantau operasi di sini.</p>
        </div>
        <div class="user-badge">Admin Mode</div>
      </div>

      <div class="admin-tabs">
        <button :class="{ active: activeTab === 'dashboard' }" @click="activeTab = 'dashboard'">📊 Dashboard & Isu</button>
        <button :class="{ active: activeTab === 'banners' }" @click="activeTab = 'banners'">🎨 Tampilan & Promosi</button>
        <button :class="{ active: activeTab === 'database' }" @click="activeTab = 'database'">🗄️ Pangkalan Data</button>
      </div>

      <div v-if="activeTab === 'dashboard'" class="tab-content">
        <div class="stats-grid">
          <div class="card"><h3>{{ users.length }}</h3><p>Total Users</p></div>
          <div class="card"><h3>{{ trips.length }}</h3><p>Active Trips</p></div>
          <div class="card"><h3>{{ requests.length }}</h3><p>Trip Requests</p></div>
          <div class="card alert"><h3>{{ reports.length }}</h3><p>Laporan Spam</p></div>
        </div>

        <div class="dashboard-split">
          <div class="note-section">
            <h3>📝 Admin Notes (Simpanan Local)</h3>
            <textarea v-model="adminNote" placeholder="Tulis nota penting di sini..."></textarea>
            <button class="btn-save-note" @click="saveNote">Simpan Nota</button>
          </div>

          <div class="report-section">
            <h3>🚨 Laporan Pengguna (Spam/Scam)</h3>
            <div v-if="reports.length > 0" class="report-list">
              <div v-for="rep in reports" :key="rep.id" class="report-item">
                <div>
                  <strong>{{ rep.reason }}</strong><br>
                  <small>Suspect: {{ rep.suspect }}</small>
                </div>
                <div class="report-actions">
                  <button class="btn-view-link" @click="viewSuspect(rep.suspect)">Lihat</button>
                  <button class="btn-del-small" @click="deleteReport(rep.id)">Selesai</button>
                </div>
              </div>
            </div>
            <p v-else class="empty-text">Tiada laporan baru. Aman damai.</p>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'banners'" class="tab-content">
        <h3>🎨 Pengurusan Banner Homepage</h3>
        <div class="banner-manager">
          <div class="banner-edit-card large">
            <h4>Banner Utama</h4>
            <p class="size-hint">Saiz: 800 x 600 px</p>
            <div class="preview-box" :style="{ backgroundImage: `url(${banners.large.imageUrl || 'https://via.placeholder.com/800x600'})` }"></div>
            <div class="input-group"><label>Tajuk:</label> <input type="text" v-model="banners.large.title"></div>
            <div class="input-group"><label>Link URL:</label> <input type="text" v-model="banners.large.linkUrl"></div>
            <input type="file" @change="(e) => handleFileSelect(e, 'large')">
            <button class="btn-save" @click="saveBanner('large')" :disabled="loading['large']">{{ loading['large'] ? 'Uploading...' : 'Simpan' }}</button>
          </div>

          <div class="small-banners-wrapper">
            <div class="banner-edit-card">
              <h4>Banner Kecil 1</h4>
              <div class="preview-box small" :style="{ backgroundImage: `url(${banners.small1.imageUrl || 'https://via.placeholder.com/500x250'})` }"></div>
              <div class="input-group"><label>Link URL:</label><input type="text" v-model="banners.small1.linkUrl"></div>
              <input type="file" @change="(e) => handleFileSelect(e, 'small1')">
              <button class="btn-save" @click="saveBanner('small1')" :disabled="loading['small1']">Simpan</button>
            </div>
            <div class="banner-edit-card">
              <h4>Banner Kecil 2</h4>
              <div class="preview-box small" :style="{ backgroundImage: `url(${banners.small2.imageUrl || 'https://via.placeholder.com/500x250'})` }"></div>
              <div class="input-group"><label>Link URL:</label><input type="text" v-model="banners.small2.linkUrl"></div>
              <input type="file" @change="(e) => handleFileSelect(e, 'small2')">
              <button class="btn-save" @click="saveBanner('small2')" :disabled="loading['small2']">Simpan</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'database'" class="tab-content">
        <div class="db-header">
          <h3>🗄️ Pengurusan Data</h3>
          <div class="admin-search">
            <input type="text" v-model="searchQuery" placeholder="Cari Trip / Organizer..." />
            <button>🔍</button>
          </div>
        </div>
        <div class="data-section">
          <h4>Senarai Trip Aktif ({{ filteredTrips.length }})</h4>
          <table class="data-table">
            <thead><tr><th>Tajuk</th><th>Organizer</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              <tr v-for="trip in filteredTrips" :key="trip.id">
                <td>{{ trip.title }}</td><td>{{ trip.organizerName }}</td>
                <td><span class="status-pill">{{ trip.status }}</span></td>
                <td><button class="btn-del" @click="deleteTrip(trip.id)">Padam</button></td>
              </tr>
            </tbody>
          </table>
          <p v-if="filteredTrips.length === 0" class="empty-text">Tiada data ditemui.</p>
        </div>
      </div>

    </div>
    <div v-else class="loading"><p>Checking access...</p></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
// PEMBETULAN 2: Guna relative path (..) bukan @
import { auth, db, storage } from '../firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const router = useRouter();
const isAdmin = ref(false);
const activeTab = ref('dashboard');
const searchQuery = ref('');
const adminNote = ref('');

const trips = ref<any[]>([]);
const requests = ref<any[]>([]);
const users = ref<any[]>([]);
const reports = ref<any[]>([
  { id: 1, reason: "Scam Duit Deposit", suspect: "Ali Baba" },
  { id: 2, reason: "Iklan Judi di Forum", suspect: "Jack Ma" },
]);

const loading = reactive({ large: false, small1: false, small2: false });
const banners = reactive({
  large: { imageUrl: '', linkUrl: '', title: '', file: null as File | null },
  small1: { imageUrl: '', linkUrl: '', file: null as File | null },
  small2: { imageUrl: '', linkUrl: '', file: null as File | null }
});

// 🔥 GANTI DENGAN EMAIL ADMIN ANDA 🔥
const ADMIN_EMAILS = ["knotenup@gmail.com", "admin@knotenup.com"];

const filteredTrips = computed(() => {
  if (!searchQuery.value) return trips.value;
  return trips.value.filter(t => 
    t.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    t.organizerName.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(() => {
  adminNote.value = localStorage.getItem('adminNote') || '';
  onAuthStateChanged(auth, async (user) => {
    if (user && user.email && ADMIN_EMAILS.includes(user.email)) {
      isAdmin.value = true;
      loadData();
      loadBanners();
    } else {
      alert("ko bukan admin, memandai nak masuk pulak, mendee!!");
      router.push('/');
    }
  });
});

const loadData = async () => {
  const tripSnap = await getDocs(collection(db, "trips"));
  trips.value = tripSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const reqSnap = await getDocs(collection(db, "trip_requests"));
  requests.value = reqSnap.docs.map(d => d.data());
  const userSnap = await getDocs(collection(db, "users"));
  users.value = userSnap.docs.map(d => d.data());
};

const saveNote = () => {
  localStorage.setItem('adminNote', adminNote.value);
  alert("Nota disimpan.");
};

const deleteReport = (id: number) => {
  reports.value = reports.value.filter(r => r.id !== id);
};

// PEMBETULAN 3: Function pengganti alert di template
const viewSuspect = (name: string) => {
  alert('Ke Profile: ' + name);
};

const deleteTrip = async (id: string) => {
  if(confirm("Padam trip ini?")) {
    await deleteDoc(doc(db, "trips", id));
    trips.value = trips.value.filter(t => t.id !== id);
  }
};

const loadBanners = async () => {
  try {
    const docSnap = await getDoc(doc(db, "site_settings", "banners"));
    if (docSnap.exists()) {
      const data = docSnap.data();
      if(data.large) Object.assign(banners.large, data.large);
      if(data.small1) Object.assign(banners.small1, data.small1);
      if(data.small2) Object.assign(banners.small2, data.small2);
    }
  } catch (e) { console.error(e); }
};

const handleFileSelect = (event: Event, type: 'large' | 'small1' | 'small2') => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    banners[type].file = file;
    const reader = new FileReader();
    reader.onload = (e) => { if(e.target?.result) banners[type].imageUrl = e.target.result as string; };
    reader.readAsDataURL(file);
  }
};

const saveBanner = async (type: 'large' | 'small1' | 'small2') => {
  loading[type] = true;
  try {
    let finalImageUrl = banners[type].imageUrl;
    if (banners[type].file) {
      const fileRef = storageRef(storage, `banners/${type}_${Date.now()}.jpg`);
      const snapshot = await uploadBytes(fileRef, banners[type].file!);
      finalImageUrl = await getDownloadURL(snapshot.ref);
    }
    await setDoc(doc(db, "site_settings", "banners"), {
      [type]: { imageUrl: finalImageUrl, linkUrl: banners[type].linkUrl, title: (banners[type] as any).title || '' }
    }, { merge: true });
    alert(`Banner ${type} disimpan!`);
  } catch (e) { alert("Gagal."); } 
  finally { loading[type] = false; }
};
</script>

<style scoped>
.admin-page { background: #1a252f; min-height: 100vh; padding: 2rem; color: #ecf0f1; }
.admin-container { max-width: 1000px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid #34495e; padding-bottom: 1rem; }
.user-badge { background: #e67e22; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 0.8rem; }
.admin-tabs { display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid #34495e; }
.admin-tabs button { background: none; border: none; color: #95a5a6; padding: 1rem 1.5rem; font-size: 1rem; cursor: pointer; border-bottom: 3px solid transparent; font-weight: bold; transition: all 0.2s; }
.admin-tabs button:hover { color: white; }
.admin-tabs button.active { color: #e67e22; border-bottom-color: #e67e22; }
.tab-content { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.card { background: #2c3e50; padding: 1.5rem; border-radius: 8px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.card.alert h3 { color: #e74c3c; }
.card h3 { font-size: 2.5rem; margin: 0; color: #e67e22; }
.card p { margin: 5px 0 0; color: #bdc3c7; }
.dashboard-split { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
.note-section textarea { width: 100%; height: 200px; background: #34495e; border: none; color: white; padding: 1rem; border-radius: 8px; resize: none; margin-bottom: 10px; }
.btn-save-note { background: #27ae60; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; }
.report-list { display: flex; flex-direction: column; gap: 10px; }
.report-item { background: #34495e; padding: 1rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid #e74c3c; }
.report-item a { color: #e67e22; }
.btn-view-link { background: #3498db; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px; }
.btn-del-small { background: #27ae60; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; }
.db-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.admin-search { display: flex; gap: 5px; }
.admin-search input { padding: 8px 12px; border-radius: 4px; border: none; width: 250px; }
.admin-search button { padding: 8px; border-radius: 4px; border: none; cursor: pointer; background: #e67e22; color: white; }
.data-table { width: 100%; border-collapse: collapse; background: #2c3e50; border-radius: 8px; overflow: hidden; }
.data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #34495e; }
.data-table th { background: #34495e; color: #bdc3c7; }
.status-pill { background: #27ae60; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }
.btn-del { background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; transition: background 0.2s; }
.btn-del:hover { background: #c0392b; }
.banner-manager { display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.5rem; }
.banner-edit-card { background: #2c3e50; padding: 1.5rem; border-radius: 8px; display: flex; flex-direction: column; gap: 10px; }
.small-banners-wrapper { display: flex; flex-direction: column; gap: 1.5rem; }
.banner-edit-card h4 { margin: 0; color: #e67e22; }
.size-hint { font-size: 0.8rem; color: #95a5a6; margin: 0; }
.preview-box { width: 100%; height: 200px; background-color: #34495e; background-size: cover; background-position: center; border-radius: 6px; border: 2px dashed #555; }
.preview-box.small { height: 120px; }
.input-group { display: flex; flex-direction: column; gap: 5px; }
.input-group label { font-size: 0.8rem; font-weight: bold; }
.input-group input { padding: 8px; border-radius: 4px; border: none; }
.btn-save { background: #27ae60; color: white; padding: 10px; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; margin-top: 5px; }
.btn-save:disabled { background: #7f8c8d; cursor: not-allowed; }
.loading { text-align: center; padding-top: 5rem; font-size: 1.5rem; }
@media (max-width: 768px) { .dashboard-split, .banner-manager { grid-template-columns: 1fr; } }
</style>