<template>
  <div class="admin-tab-content fade-in">
     <!-- Stats Grid -->
     <div class="stats-grid">
        <div class="card">
            <h3>🤖</h3>
            <p>System Status: Online</p>
        </div>
        <div class="card">
            <h3>{{ pendingCount }}</h3>
            <p>Pending Organizers</p>
        </div>
     </div>

     <div class="dashboard-split">
        <!-- Pending Organizers Panel -->
        <div class="panel-section">
           <h3 class="text-yellow-400 mb-4 flex items-center gap-2">
               <i class="fas fa-user-clock"></i> Permohonan Organizer ({{ pendingCount }})
           </h3>
           
           <div v-if="loading" class="text-white text-sm">Loading...</div>
           <div v-if="error" class="text-red-400 text-sm mb-2">{{ error }}</div>

           <div v-if="pendingOrganizers.length > 0" class="list-wrapper custom-scrollbar max-h-[300px] overflow-y-auto">
              <div v-for="user in pendingOrganizers" :key="user.id" class="list-item">
                  <div class="info">
                      <strong>{{ user.name || user.displayName || 'User' }}</strong>
                      <small class="block">{{ user.organizerDetails?.orgName || 'Tiada Nama Org' }}</small>
                      <small class="text-xs text-gray-500">{{ user.email }}</small>
                  </div>
                  <button class="btn-approve" @click="approveOrganizer(user)">
                      ✅ Luluskan
                  </button>
              </div>
           </div>
           
           <p v-else-if="!loading" class="empty-text text-gray-400 italic text-sm">
               Tiada permohonan baru pada masa ini.
           </p>
           
           <div class="mt-4 text-center">
               <button @click="$emit('switch-tab', 'users')" class="text-blue-400 text-xs hover:underline">
                   Lihat Semua Pengguna &rarr;
               </button>
           </div>
        </div>

        <!-- Admin Notes Panel -->
        <div class="panel-section">
           <h3 class="mb-4 flex items-center gap-2"><i class="fas fa-sticky-note text-blue-400"></i> Admin Notes</h3>
           <textarea 
             v-model="adminNote" 
             placeholder="Tulis nota penting untuk rujukan admin lain (simpan di LocalStorage)..." 
             class="note-area custom-scrollbar"
           ></textarea>
           <div class="flex justify-between items-center mt-2">
               <span class="text-xs text-gray-500">Auto-saved to browser</span>
               <button class="btn-save-note" @click="saveNote">💾 Simpan Manual</button>
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

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
.card { background: #2c3e50; padding: 1.5rem; border-radius: 12px; text-align: center; border: 1px solid #34495e; color: white; }
.card h3 { font-size: 2rem; margin: 0; color: #f1c40f; }

.dashboard-split { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
@media (max-width: 768px) { .dashboard-split { grid-template-columns: 1fr; } }

.panel-section { background: #2c3e50; padding: 1.5rem; border-radius: 12px; border: 1px solid #34495e; color: white; }
.list-wrapper { display: flex; flex-direction: column; gap: 10px; }
.list-item { background: #34495e; padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.05); }
.info strong { display: block; color:white; } 

.btn-approve { background: #27ae60; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: bold; transition: 0.2s; }
.btn-approve:hover { background: #219150; }

.note-area { width: 100%; height: 200px; background: #34495e; border: 1px solid #4a6278; color: white; padding: 1rem; margin-bottom: 5px; border-radius: 8px; font-family: monospace; }
.note-area:focus { outline: none; border-color: #3498db; }

.btn-save-note { background: #3498db; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; }
.btn-save-note:hover { background: #2980b9; }
</style>
