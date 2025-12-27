<template>
  <div class="admin-tab-content fade-in">
     <div class="tab-header">
        <h3>Pengurusan Pengguna</h3>
        <div class="actions">
            <input type="text" v-model="searchQuery" placeholder="Cari email/nama..." class="search-box" @keyup.enter="performSearch"/>
            <button class="btn-search" @click="performSearch">Cari</button>
        </div>
     </div>

     <div v-if="loading" class="text-center py-4">Loading users...</div>
     
     <div v-else class="data-list custom-scrollbar">
        <div v-for="user in users" :key="user.id" class="data-item">
           <div class="item-main">
              <div class="flex items-center gap-2">
                 <span class="font-bold text-white">{{ user.displayName || user.name || 'User' }}</span>
                 <span v-if="user.role === 'admin'" class="badge-admin">ADMIN</span>
                 <span v-else-if="user.role === 'organizer'" class="badge-org">ORGANIZER</span>
                 <span v-if="user.isBanned" class="badge-banned">BANNED</span>
              </div>
              <div class="item-meta">{{ user.email }} • Joined: {{ formatDate(user.createdAt) }}</div>
              <div v-if="user.organizerStatus === 'pending'" class="mt-1 text-yellow-400 text-xs flex items-center gap-1">
                 <i class="fas fa-clock"></i> Memohon Organizer: {{ user.organizerDetails?.orgName }}
              </div>
           </div>
           
           <div class="item-actions">
              <button v-if="user.organizerStatus === 'pending'" class="btn-approve" @click="approveOrganizer(user)">
                 ✅ Approve
              </button>
              
              <button class="btn-action" :class="user.isBanned ? 'btn-unban' : 'btn-ban'" @click="toggleBan(user)">
                  {{ user.isBanned ? 'Unban' : 'Ban' }}
              </button>
              
              <!-- Prevent deleting own account or crucial admins via UI if needed, but generic delete here -->
              <button class="btn-del" @click="deleteUser(user.id)" title="Padam User">🗑️</button>
           </div>
        </div>
        
        <div v-if="hasMore" class="text-center mt-4">
            <button class="btn-load-more" @click="loadMore">Load More</button>
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

<style scoped>
.tab-header { display: flex; justify-content: space-between; margin-bottom: 1rem; align-items: center; }
.actions { display: flex; gap: 5px; }
.search-box { padding: 8px; border-radius: 5px; border: none; background: #34495e; color: white; }
.btn-search { background: #3498db; color: white; border: none; padding: 0 15px; border-radius: 5px; cursor: pointer; }

.data-list { display: flex; flex-direction: column; gap: 10px; max-height: 70vh; overflow-y: auto; }
.data-item { background: #2c3e50; padding: 1rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid #95a5a6; }

.item-main { display: flex; flex-direction: column; gap: 2px; }
.item-meta { color: #95a5a6; font-size: 0.8rem; }
.item-actions { display: flex; gap: 5px; }

.btn-del, .btn-ban, .btn-unban, .btn-approve { padding: 5px 10px; border-radius: 5px; border: none; cursor: pointer; color: white; font-size: 0.8rem; font-weight: bold; }
.btn-del { background: #c0392b; }
.btn-ban { background: #e74c3c; }
.btn-unban { background: #f39c12; }
.btn-approve { background: #27ae60; }
.btn-load-more { background: #34495e; color: white; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; }

.badge-admin { background: #c0392b; color: white; font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; margin-left: 5px; }
.badge-org { background: #27ae60; color: white; font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; margin-left: 5px; }
.badge-banned { background: #7f8c8d; color: white; font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; margin-left: 5px; }
</style>
