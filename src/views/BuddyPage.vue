<template>
  <div class="min-h-screen bg-slate-900 relative text-white">
    <div class="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#6c63ff] blur-[150px] opacity-10 pointer-events-none rounded-full"></div>
    <div class="absolute inset-0 z-0 opacity-[0.05] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' viewBox=\'0 0 1000 1000\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,500 Q250,300 500,500 T1000,500\' stroke=\'white\' fill=\'none\' stroke-width=\'2\' opacity=\'0.5\'/%3E%3C/svg%3E')] bg-cover"></div>

    <div class="container mx-auto px-6 pt-32 pb-20 relative z-10 max-w-[1200px]">
      
      <div class="flex justify-between items-end mb-10 border-b border-gray-700 pb-6 max-md:flex-col max-md:items-start max-md:gap-5">
        <div>
          <h1 class="text-4xl font-bold text-white mb-2">Geng Hiking (Buddy)</h1>
          <p class="text-gray-400 max-w-lg">
            Cari kawan hiking untuk trip santai, training, atau sekadar tong-tong minyak.
            <br><span class="text-xs text-orange-400">*Ini adalah open trip persendirian (Self-organized).</span>
          </p>
        </div>
        <button @click="$router.push('/create-buddy')" class="bg-[#6c63ff] text-white border-none py-3 px-6 rounded-full font-bold cursor-pointer shadow-[0_4px_15px_rgba(108,99,255,0.4)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#5b54e0] max-md:w-full max-md:flex max-md:justify-center">
          <i class="fas fa-plus mr-2"></i> Cari Geng Baru
        </button>
      </div>

      <div v-if="loading" class="text-center py-20">
        <div class="w-10 h-10 border-4 border-white/10 border-t-[#6c63ff] rounded-full animate-spin mx-auto"></div>
        <p class="text-gray-400 mt-4">Mencari geng...</p>
      </div>

      <div v-else-if="buddies.length === 0" class="text-center py-20 bg-white/5 rounded-[20px] border border-dashed border-white/20">
        <i class="fas fa-wind text-6xl text-gray-600 mb-4"></i>
        <h3 class="text-xl text-white font-bold">Tiada Open Trip Buat Masa Ini</h3>
        <p class="text-gray-400 mb-6">Jadilah orang pertama yang ajak kawan!</p>
        <button @click="$router.push('/create-buddy')" class="border border-white/20 bg-transparent text-white py-2.5 px-5 rounded-full cursor-pointer transition duration-200 hover:bg-white hover:text-[#0f172a]">Mula Trip</button>
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