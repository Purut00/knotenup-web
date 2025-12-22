<template>
  <div class="buddy-page">
    <div class="page-glow-purple"></div>
    <div class="contour-lines"></div>

    <div class="container pt-32 pb-20 relative z-10">
      
      <div class="flex justify-between items-end mb-10 border-b border-gray-700 pb-6">
        <div>
          <h1 class="text-4xl font-bold text-white mb-2">Geng Hiking (Buddy)</h1>
          <p class="text-gray-400 max-w-lg">
            Cari kawan hiking untuk trip santai, training, atau sekadar tong-tong minyak.
            <br><span class="text-xs text-orange-400">*Ini adalah open trip persendirian (Self-organized).</span>
          </p>
        </div>
        <button @click="$router.push('/create-buddy')" class="btn-create-buddy">
          <i class="fas fa-plus mr-2"></i> Cari Geng Baru
        </button>
      </div>

      <div v-if="loading" class="text-center py-20">
        <div class="spinner"></div>
        <p class="text-gray-400 mt-4">Mencari geng...</p>
      </div>

      <div v-else-if="buddies.length === 0" class="text-center py-20 glass-panel">
        <i class="fas fa-wind text-6xl text-gray-600 mb-4"></i>
        <h3 class="text-xl text-white font-bold">Tiada Open Trip Buat Masa Ini</h3>
        <p class="text-gray-400 mb-6">Jadilah orang pertama yang ajak kawan!</p>
        <button @click="$router.push('/create-buddy')" class="btn-outline">Mula Trip</button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BuddyCard 
          v-for="buddy in buddies" 
          :key="buddy.id" 
          :buddy="buddy" 
        />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import BuddyCard from '../components/buddy/BuddyCard.vue';

const buddies = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    // Ambil trip yang belum 'expired' (Logical check boleh tambah nanti)
    // Buat masa ni kita ambil semua dan susun ikut tarikh create (paling baru)
    const q = query(collection(db, 'buddies'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    buddies.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching buddies:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.buddy-page {
  background-color: #0f172a;
  min-height: 100vh; position: relative; color: white;
}
.container { max-width: 1200px; margin: 0 auto; padding-left: 1.5rem; padding-right: 1.5rem; }

/* Glows (Reuse) */
.page-glow-purple {
  position: absolute; top: 0; right: 0; width: 50vw; height: 50vw;
  background: #6c63ff; filter: blur(150px); opacity: 0.1; pointer-events: none; border-radius: 50%;
}
.contour-lines {
  position: absolute; inset: 0; z-index: 0; opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,500 Q250,300 500,500 T1000,500' stroke='white' fill='none' stroke-width='2' opacity='0.5'/%3E%3C/svg%3E");
  background-size: cover; pointer-events: none;
}

.btn-create-buddy {
  background: #6c63ff; color: white; border: none; padding: 12px 24px;
  border-radius: 50px; font-weight: 700; cursor: pointer;
  box-shadow: 0 4px 15px rgba(108, 99, 255, 0.4); transition: 0.2s;
}
.btn-create-buddy:hover { transform: translateY(-2px); background: #5b54e0; }

.btn-outline {
  border: 1px solid rgba(255,255,255,0.2); background: transparent; color: white;
  padding: 10px 20px; border-radius: 50px; cursor: pointer; transition: 0.2s;
}
.btn-outline:hover { background: white; color: #0f172a; }

.glass-panel {
  background: rgba(255,255,255,0.05); border-radius: 20px; border: 1px dashed rgba(255,255,255,0.2);
}

.spinner {
  border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid #6c63ff;
  border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Mobile Adjustment */
@media (max-width: 768px) {
  .flex { flex-direction: column; align-items: flex-start; gap: 20px; }
  .btn-create-buddy { width: 100%; display: flex; justify-content: center; }
}
</style>