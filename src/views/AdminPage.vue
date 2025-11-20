<template>
  <div class="admin-page">
    <div v-if="isAdmin" class="admin-container">
      <div class="header">
        <h1>⚡ Admin Dashboard</h1>
        <p>Selamat datang, Boss.</p>
      </div>

      <div class="stats-cards">
        <div class="card"><h3>{{ trips.length }}</h3><p>Total Trips</p></div>
        <div class="card"><h3>{{ requests.length }}</h3><p>Requests</p></div>
      </div>

      <div class="section">
        <h3>🎨 Pengurusan Banner Homepage</h3>
        <div class="banner-manager">
          
          <div class="banner-edit-card large">
            <h4>Banner Utama (Kiri)</h4>
            <p class="size-hint">Saiz Cadangan: <strong>800 x 600 px</strong></p>
            
            <div class="preview-box" :style="{ backgroundImage: `url(${banners.large.imageUrl || 'https://via.placeholder.com/800x600'})` }"></div>
            
            <div class="input-group">
              <label>Tajuk Banner:</label>
              <input type="text" v-model="banners.large.title" placeholder="Cth: Hiking Adventure">
            </div>
            <div class="input-group">
              <label>Link URL (Bila klik pergi mana):</label>
              <input type="text" v-model="banners.large.linkUrl" placeholder="/trips atau https://...">
            </div>
            <div class="input-group">
              <label>Tukar Gambar:</label>
              <input type="file" @change="(e) => handleFileSelect(e, 'large')">
            </div>
            <button class="btn-save" @click="saveBanner('large')" :disabled="loading['large']">
              {{ loading['large'] ? 'Uploading...' : 'Simpan Banner Utama' }}
            </button>
          </div>

          <div class="small-banners-wrapper">
            <div class="banner-edit-card">
              <h4>Banner Kecil 1 (Atas Kanan)</h4>
              <p class="size-hint">Saiz: <strong>500 x 250 px</strong></p>
              <div class="preview-box small" :style="{ backgroundImage: `url(${banners.small1.imageUrl || 'https://via.placeholder.com/500x250'})` }"></div>
              
              <div class="input-group">
                <label>Link URL:</label>
                <input type="text" v-model="banners.small1.linkUrl" placeholder="/trips?category=Diving">
              </div>
              <input type="file" @change="(e) => handleFileSelect(e, 'small1')">
              <button class="btn-save" @click="saveBanner('small1')" :disabled="loading['small1']">Simpan</button>
            </div>

            <div class="banner-edit-card">
              <h4>Banner Kecil 2 (Bawah Kanan)</h4>
              <p class="size-hint">Saiz: <strong>500 x 250 px</strong></p>
              <div class="preview-box small" :style="{ backgroundImage: `url(${banners.small2.imageUrl || 'https://via.placeholder.com/500x250'})` }"></div>
              
              <div class="input-group">
                <label>Link URL:</label>
                <input type="text" v-model="banners.small2.linkUrl" placeholder="/trips?category=Camping">
              </div>
              <input type="file" @change="(e) => handleFileSelect(e, 'small2')">
              <button class="btn-save" @click="saveBanner('small2')" :disabled="loading['small2']">Simpan</button>
            </div>
          </div>

        </div>
      </div>

      <div class="section">
        <h3>Urus Semua Trip</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Tajuk</th>
              <th>Organizer</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="trip in trips" :key="trip.id">
              <td>{{ trip.title }}</td>
              <td>{{ trip.organizerName }}</td>
              <td><span class="status-pill">{{ trip.status }}</span></td>
              <td>
                <button class="btn-del" @click="deleteTrip(trip.id)">Padam</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="loading">
      <p>Checking access...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db, storage } from '../firebaseConfig'; // Import storage (use relative path from views/)
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const router = useRouter();
const isAdmin = ref(false);
const trips = ref<any[]>([]);
const requests = ref<any[]>([]);
const loading = reactive({ large: false, small1: false, small2: false });

// STATE BANNERS
const banners = reactive({
  large: { imageUrl: '', linkUrl: '', title: 'Hiking Adventure', file: null as File | null },
  small1: { imageUrl: '', linkUrl: '', file: null as File | null },
  small2: { imageUrl: '', linkUrl: '', file: null as File | null }
});

// 🔥 GANTI DENGAN EMAIL ADMIN ANDA 🔥
const ADMIN_EMAIL = "knotenup@gmail.com";

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user && user.email === ADMIN_EMAIL) {
      isAdmin.value = true;
      loadData();
      loadBanners(); // Load banner settings
    } else {
      alert("Maaf, kawasan larangan. Anda bukan Admin.");
      router.push('/');
    }
  });
});

const loadData = async () => {
  const tripSnap = await getDocs(collection(db, "trips"));
  trips.value = tripSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const reqSnap = await getDocs(collection(db, "trip_requests"));
  requests.value = reqSnap.docs.map(d => d.data());
};

// Load Banner dari Firestore
const loadBanners = async () => {
  try {
    const docSnap = await getDoc(doc(db, "site_settings", "banners"));
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Merge data database dengan state (kekalkan struktur jika data tak lengkap)
      if(data.large) Object.assign(banners.large, data.large);
      if(data.small1) Object.assign(banners.small1, data.small1);
      if(data.small2) Object.assign(banners.small2, data.small2);
    }
  } catch (e) { console.error("Error loading banners:", e); }
};

const deleteTrip = async (id: string) => {
  if(confirm("Betul nak padam trip orang ni boss?")) {
    await deleteDoc(doc(db, "trips", id));
    trips.value = trips.value.filter(t => t.id !== id);
  }
};

// --- BANNER LOGIC ---

const handleFileSelect = (event: Event, type: 'large' | 'small1' | 'small2') => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    banners[type].file = file;

    // Local Preview
    const reader = new FileReader();
    reader.onload = (e) => { if(e.target?.result) banners[type].imageUrl = e.target.result as string; };
    reader.readAsDataURL(file);
  }
};

const saveBanner = async (type: 'large' | 'small1' | 'small2') => {
  loading[type] = true;
  try {
    let finalImageUrl = banners[type].imageUrl;

    // 1. Upload Gambar jika ada fail baru
    if (banners[type].file) {
      const fileRef = storageRef(storage, `banners/${type}_${Date.now()}.jpg`);
      const snapshot = await uploadBytes(fileRef, banners[type].file!);
      finalImageUrl = await getDownloadURL(snapshot.ref);
    }

    // 2. Simpan Link & Info ke Firestore
    // Kita guna 'merge: true' supaya tak padam banner lain
    await setDoc(doc(db, "site_settings", "banners"), {
      [type]: {
        imageUrl: finalImageUrl,
        linkUrl: banners[type].linkUrl,
        title: (banners[type] as any).title || '' // Hanya large ada title
      }
    }, { merge: true });

    alert(`Banner ${type} berjaya disimpan!`);

  } catch (e) {
    console.error(e);
    alert("Gagal simpan banner.");
  } finally {
    loading[type] = false;
  }
};
</script>

<style scoped>
.admin-page { background: #1a252f; min-height: 100vh; padding: 2rem; color: white; }
.admin-container { max-width: 1000px; margin: 0 auto; }
.header { margin-bottom: 2rem; border-bottom: 1px solid #34495e; padding-bottom: 1rem; }
.stats-cards { display: flex; gap: 1rem; margin-bottom: 2rem; }
.card { background: #2c3e50; padding: 1.5rem; border-radius: 8px; flex: 1; text-align: center; }
.card h3 { font-size: 2rem; margin: 0; color: #e67e22; }

/* BANNER MANAGER STYLE */
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
.btn-save:hover { background: #219150; }
.btn-save:disabled { background: #7f8c8d; cursor: not-allowed; }

.data-table { width: 100%; border-collapse: collapse; background: #2c3e50; border-radius: 8px; overflow: hidden; }
.data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #34495e; }
.data-table th { background: #34495e; color: #bdc3c7; }
.btn-del { background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; transition: background 0.2s; }
.btn-del:hover { background: #c0392b; }
.loading { text-align: center; padding-top: 5rem; font-size: 1.5rem; }
.status-pill { background: #27ae60; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }

@media (max-width: 768px) {
  .banner-manager { grid-template-columns: 1fr; }
}
</style>