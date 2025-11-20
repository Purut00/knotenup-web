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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const router = useRouter();
const isAdmin = ref(false);
const trips = ref<any[]>([]);
const requests = ref<any[]>([]);

// 🔥 GANTI DENGAN EMAIL ADMIN ANDA 🔥
const ADMIN_EMAIL = "knotenup@gmail.com"; 

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user && user.email === ADMIN_EMAIL) {
      isAdmin.value = true;
      loadData();
    } else {
      alert("Maaf, kawasan larangan. Anda bukan Admin.");
      router.push('/');
    }
  });
});

const loadData = async () => {
  // Load Trips
  const tripSnap = await getDocs(collection(db, "trips"));
  trips.value = tripSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Load Requests
  const reqSnap = await getDocs(collection(db, "trip_requests"));
  requests.value = reqSnap.docs.map(d => d.data());
};

const deleteTrip = async (id: string) => {
  if(confirm("Betul nak padam trip orang ni boss?")) {
    await deleteDoc(doc(db, "trips", id));
    trips.value = trips.value.filter(t => t.id !== id);
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

.data-table { width: 100%; border-collapse: collapse; background: #2c3e50; border-radius: 8px; overflow: hidden; }
.data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #34495e; }
.data-table th { background: #34495e; }
.btn-del { background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
.loading { text-align: center; padding-top: 5rem; font-size: 1.5rem; }
</style>