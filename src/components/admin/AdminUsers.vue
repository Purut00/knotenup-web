<template>
  <div class="animate-fade-in">
     <div class="flex justify-between mb-4 items-center">
        <h3>Pengurusan Pengguna</h3>
        <div class="flex gap-[5px]">
            <input type="text" v-model="searchQuery" placeholder="Cari email/nama..." class="p-2 rounded-[5px] border-none bg-[#34495e] text-white" @keyup.enter="performSearch"/>
            <button class="bg-[#3498db] text-white border-none px-[15px] py-0 rounded-[5px] cursor-pointer" @click="performSearch">Cari</button>
        </div>
     </div>

     <div v-if="loading" class="text-center py-4">Loading users...</div>
     
     <div v-else class="flex flex-col gap-[10px] max-h-[70vh] overflow-y-auto custom-scrollbar">
        <div v-for="user in users" :key="user.id" class="bg-[#2c3e50] p-4 rounded-lg flex justify-between items-center border-l-4 border-[#95a5a6]">
           <div class="flex flex-col gap-[2px]">
              <div class="flex items-center gap-2">
                 <span class="font-bold text-white">{{ user.displayName || user.name || 'User' }}</span>
                 <span v-if="user.role === 'admin'" class="bg-[#c0392b] text-white text-[0.6rem] px-[6px] py-[2px] rounded-[4px] ml-[5px]">ADMIN</span>
                 <span v-else-if="user.role === 'organizer'" class="bg-[#27ae60] text-white text-[0.6rem] px-[6px] py-[2px] rounded-[4px] ml-[5px]">ORGANIZER</span>
                 <span v-if="user.isBanned" class="bg-[#7f8c8d] text-white text-[0.6rem] px-[6px] py-[2px] rounded-[4px] ml-[5px]">BANNED</span>
              </div>
              <div class="text-[#95a5a6] text-[0.8rem]">{{ user.email }} • Joined: {{ formatDate(user.createdAt) }}</div>
              <div v-if="user.organizerStatus === 'pending'" class="mt-1 text-yellow-400 text-xs flex items-center gap-1">
                 <i class="fas fa-clock"></i> Memohon Organizer: {{ user.organizerDetails?.orgName }}
              </div>
           </div>
           
           <div class="flex gap-[5px]">
              <button v-if="user.organizerStatus === 'pending'" class="p-[5px_10px] rounded-[5px] border-none cursor-pointer text-white text-[0.8rem] font-bold bg-[#27ae60]" @click="approveOrganizer(user)">
                 ✅ Approve
              </button>
              
              <button class="p-[5px_10px] rounded-[5px] border-none cursor-pointer text-white text-[0.8rem] font-bold" :class="user.isBanned ? 'bg-[#f39c12]' : 'bg-[#e74c3c]'" @click="toggleBan(user)">
                  {{ user.isBanned ? 'Unban' : 'Ban' }}
              </button>
              
              <!-- Prevent deleting own account or crucial admins via UI if needed, but generic delete here -->
              <button class="p-[5px_10px] rounded-[5px] border-none cursor-pointer text-white text-[0.8rem] font-bold bg-[#c0392b]" @click="deleteUser(user.id)" title="Padam User">🗑️</button>
           </div>
        </div>
        
        <div v-if="hasMore" class="text-center mt-4">
            <button class="bg-[#34495e] text-white px-[20px] py-[10px] rounded-[8px] border-none cursor-pointer" @click="loadMore">Load More</button>
        </div>
     </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebaseConfig';
import { collection, query, orderBy, limit, getDocs, startAfter, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';

const users = ref<any[]>([]);
const lastDoc = ref<any>(null);
const loading = ref(false);
const hasMore = ref(true);
const searchQuery = ref('');

const PAGE_SIZE = 20;

const formatDate = (ts: any) => {
    if(!ts) return '-';
    // Handle both Firestore Timestamp and standard Date/strings if mixed
    if(ts.seconds) return new Date(ts.seconds * 1000).toLocaleDateString();
    return new Date(ts).toLocaleDateString();
};

const fetchUsers = async (isLoadMore = false) => {
    loading.value = !isLoadMore;
    try {
        const coll = collection(db, "users");
        let q;

        if (searchQuery.value && searchQuery.value.trim() !== '') {
             // Server-side Prefix Search (Case-sensitive in Firestore)
             // We prioritize searching by 'email' as it's unique and lowercased usually.
             const term = searchQuery.value.trim();
             q = query(coll, 
                  where("email", ">=", term), 
                  where("email", "<=", term + '\uf8ff'), 
                  limit(PAGE_SIZE));
             
             // Note: This requires the user to type the case correctly if searching names, 
             // but for emails (if stored lowercase) it works well.
             // We disable orderBy("createdAt") during search to avoid index requirements for every field combination.
        } else {
             if (isLoadMore && lastDoc.value) {
                 q = query(coll, orderBy("createdAt", "desc"), startAfter(lastDoc.value), limit(PAGE_SIZE));
             } else {
                 q = query(coll, orderBy("createdAt", "desc"), limit(PAGE_SIZE));
             }
        }

        const snap = await getDocs(q);
        
        if (snap.empty) {
            hasMore.value = false;
        } else {
            // For search, lastDoc might not work perfectly with standard pagination if we switch sort order,
            // but for "Load More" on search results, we would need to track the last term.
            // Simplified: Search results just show first page(s) or we use the last doc from search sort.
            // Since we use the same query structure, startAfter(lastDoc) works if we stick to the same sort.
            // But here we changed sort ID/Email vs CreatedAt.
            // For robust search pagination, we'd need to keep the state. 
            // valid for this iteration: Just limit search results to 20-50 or rely on 'view more' re-querying if needed.
            // Detailed implementation:
            lastDoc.value = snap.docs[snap.docs.length - 1];
            
            const newUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            
            if (isLoadMore) users.value.push(...newUsers);
            else users.value = newUsers;
            
            if (snap.docs.length < PAGE_SIZE) hasMore.value = false;
        }

    } catch (e) {
        console.error("Error fetching users:", e);
    } finally {
        loading.value = false;
    }
};

const performSearch = () => {
    users.value = []; lastDoc.value = null; hasMore.value = true;
    fetchUsers();
};

const loadMore = () => fetchUsers(true);

const toggleBan = async (user: any) => {
    if (!confirm(user.isBanned ? "Nyahsekat pengguna ini?" : "Sekat (Ban) pengguna ini?")) return;
    try {
        await updateDoc(doc(db, "users", user.id), { isBanned: !user.isBanned });
        user.isBanned = !user.isBanned;
    } catch(e) { alert("Gagal mengemaskini status ban."); }
};

const deleteUser = async (id: string) => {
    if (!confirm("ADAKAH ANDA PASTI? Ini akan memadam rekod user dari Firestore sahaja (Auth akaun kekal jika tidak guna Admin SDK).")) return;
    try {
        await deleteDoc(doc(db, "users", id));
        users.value = users.value.filter(u => u.id !== id);
    } catch(e) { alert("Gagal memadam data user."); }
};

const approveOrganizer = async (user: any) => {
  if(!confirm(`Luluskan status Organizer untuk ${user.name || user.email}?`)) return;
  try {
    await updateDoc(doc(db, "users", user.id), { 
        role: 'organizer', 
        organizerStatus: 'approved',
        organizerApprovedAt: new Date()
    });
    // Update local state
    user.role = 'organizer';
    user.organizerStatus = 'approved';
    alert("Berjaya diluluskan!");
  } catch(e) { alert("Gagal meluluskan."); console.error(e); }
};

onMounted(() => {
    fetchUsers();
});
</script>
