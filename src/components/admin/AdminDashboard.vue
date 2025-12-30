<template>
  <div class="animate-fade-in">
     <!-- Stats Grid -->
     <div class="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-[1rem] mb-[2rem]">
        <div class="bg-[#2c3e50] p-[1.5rem] rounded-[12px] text-center border border-[#34495e] text-white">
            <h3 class="text-[2rem] m-0 text-[#f1c40f]">🤖</h3>
            <p>System Status: Online</p>
        </div>
        <div class="bg-[#2c3e50] p-[1.5rem] rounded-[12px] text-center border border-[#34495e] text-white">
            <h3 class="text-[2rem] m-0 text-[#f1c40f]">{{ pendingCount }}</h3>
            <p>Pending Organizers</p>
        </div>
     </div>

     <div class="grid grid-cols-2 gap-[2rem] max-md:grid-cols-1">
        <!-- Pending Organizers Panel -->
        <div class="bg-[#2c3e50] p-[1.5rem] rounded-[12px] border border-[#34495e] text-white">
           <h3 class="text-yellow-400 mb-4 flex items-center gap-2">
               <i class="fas fa-user-clock"></i> Permohonan Organizer ({{ pendingCount }})
           </h3>
           
           <div v-if="loading" class="text-white text-sm">Loading...</div>
           <div v-if="error" class="text-red-400 text-sm mb-2">{{ error }}</div>

           <div v-if="pendingOrganizers.length > 0" class="flex flex-col gap-[10px] custom-scrollbar max-h-[300px] overflow-y-auto">
              <div v-for="user in pendingOrganizers" :key="user.id" class="bg-[#34495e] p-[10px] rounded-[8px] flex justify-between items-center border border-white/5">
                  <div class="info">
                      <strong class="block text-white">{{ user.name || user.displayName || 'User' }}</strong>
                      <small class="block">{{ user.organizerDetails?.orgName || 'Tiada Nama Org' }}</small>
                      <small class="text-xs text-gray-500">{{ user.email }}</small>
                  </div>
                  <button class="bg-[#27ae60] text-white border-none p-[6px_12px] rounded-[6px] cursor-pointer text-[0.8rem] font-bold transition duration-200 hover:bg-[#219150]" @click="approveOrganizer(user)">
                      ✅ Luluskan
                  </button>
              </div>
           </div>
           
           <p v-else-if="!loading" class="text-gray-400 italic text-sm">
               Tiada permohonan baru pada masa ini.
           </p>
           
           <div class="mt-4 text-center">
               <button @click="$emit('switch-tab', 'users')" class="text-blue-400 text-xs hover:underline">
                   Lihat Semua Pengguna &rarr;
               </button>
           </div>
        </div>

        <!-- Admin Notes Panel -->
        <div class="bg-[#2c3e50] p-[1.5rem] rounded-[12px] border border-[#34495e] text-white">
           <h3 class="mb-4 flex items-center gap-2"><i class="fas fa-sticky-note text-blue-400"></i> Admin Notes</h3>
           <textarea 
             v-model="adminNote" 
             placeholder="Tulis nota penting untuk rujukan admin lain (simpan di LocalStorage)..." 
             class="w-full h-[200px] bg-[#34495e] border border-[#4a6278] text-white p-[1rem] mb-[5px] rounded-[8px] font-mono focus:outline-none focus:border-[#3498db] custom-scrollbar"
           ></textarea>
           <div class="flex justify-between items-center mt-2">
               <span class="text-xs text-gray-500">Auto-saved to browser</span>
               <button class="bg-[#3498db] text-white border-none p-[6px_12px] rounded-[6px] cursor-pointer text-[0.8rem] hover:bg-[#2980b9]" @click="saveNote">💾 Simpan Manual</button>
           </div>
        </div>
     </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const emit = defineEmits(['switch-tab']);

const pendingOrganizers = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const adminNote = ref('');

const pendingCount = computed(() => pendingOrganizers.value.length);

const fetchPendingOrganizers = async () => {
    loading.value = true;
    error.value = null;
    try {
        // Query users where organizerStatus == 'pending'
        const q = query(collection(db, "users"), where("organizerStatus", "==", "pending"));
        const snap = await getDocs(q);
        pendingOrganizers.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e: any) { 
        console.error(e); 
        error.value = "Gagal memuat naik senarai.";
    } finally { 
        loading.value = false; 
    }
};

const approveOrganizer = async (user: any) => {
  if(!confirm(`Luluskan ${user.name || user.email}?`)) return;
  try {
    await updateDoc(doc(db, "users", user.id), { 
        role: 'organizer', 
        organizerStatus: 'approved',
        organizerApprovedAt: new Date()
    });
    // Remove from local list
    pendingOrganizers.value = pendingOrganizers.value.filter(u => u.id !== user.id);
    alert("Berjaya diluluskan.");
  } catch(e) { alert("Gagal mengemaskini database."); }
};

const saveNote = () => {
    localStorage.setItem('adminNote', adminNote.value);
    alert("Nota disimpan!");
};

onMounted(() => {
    adminNote.value = localStorage.getItem('adminNote') || '';
    fetchPendingOrganizers();
});
</script>
