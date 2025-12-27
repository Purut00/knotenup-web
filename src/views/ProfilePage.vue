<template>
  <div class="profile-page">
    
    <div class="contour-lines"></div>
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <div class="container" style="padding-top: 100px; padding-bottom: 3rem;">
      
      <div v-if="loadingData" class="flex flex-col items-center justify-center py-20 text-gray-400">
          <div class="spinner mb-4"></div>
          <p>Memuatkan Profil...</p>
      </div>

      <div v-else-if="!user" class="text-center py-20">
          <h2 class="text-red-400 text-2xl font-bold">Pengguna Tidak Dijumpai</h2>
          <button @click="$router.push('/')" class="mt-4 btn-mini outline">Kembali ke Home</button>
      </div>

      <div v-else class="profile-layout fade-up">
        
        <!-- SIDEBAR -->
        <aside class="profile-sidebar relative z-10">
           <img :src="user.photoURL || 'https://i.pravatar.cc/150'" class="avatar" />
           
           <div class="mb-2">
              <span class="role-badge" v-if="user.role !== 'user'">{{ user.role }}</span>
              <span class="role-badge" style="background:#2ecc71" v-if="user.organizerStatus === 'approved'">Organizer Sah</span>
           </div>

           <h1 class="user-name">{{ user.name }}</h1>
           <p class="user-bio">{{ user.bio || 'Tiada bio.' }}</p>

           <div class="stats-grid">
              <div class="stat-item">
                 <strong>{{ tripsAsOrganizer.length + tripsAsParticipant.length }}</strong>
                 <span>Trips</span>
              </div>
              <div class="stat-item">
                 <strong>{{ myPosts.length }}</strong>
                 <span>Posts</span>
              </div>
           </div>

           <div class="social-links" v-if="user.telegramUsername || user.instagram || user.facebook || user.tiktok">
              <a v-if="user.telegramUsername" :href="`https://t.me/${user.telegramUsername}`" target="_blank" title="Telegram">
                 <img src="https://img.icons8.com/fluency/48/telegram-app.png" alt="TG" />
              </a>
              <a v-if="user.instagram" :href="`https://instagram.com/${user.instagram}`" target="_blank">
                 <img src="https://img.icons8.com/fluency/48/instagram-new.png" alt="IG" />
              </a>
              <a v-if="user.facebook" :href="user.facebook" target="_blank">
                 <img src="https://img.icons8.com/fluency/48/facebook-new.png" alt="FB" />
              </a>
              <a v-if="user.tiktok" :href="user.tiktok" target="_blank">
                 <img src="https://img.icons8.com/fluency/48/tiktok.png" alt="TT" />
              </a>
           </div>
           
           <!-- Actions -->
           <div class="action-stack">
              <!-- [NEW] TELEGRAM DEEP LINK BUTTON FOR VISITORS -->
              <a 
                 v-if="!isOwnProfile && user.telegramUsername" 
                 :href="`https://t.me/${user.telegramUsername}`" 
                 target="_blank"
                 class="btn-action telegram-btn flex items-center justify-center gap-2"
                 style="text-decoration:none;"
              >
                  <i class="fab fa-telegram-plane text-lg"></i> Chat via Telegram
              </a>

              <button v-if="isOwnProfile || isAdmin" class="btn-action" @click="$router.push('/profile/edit')">✏️ Edit Profil</button>
              
              <button v-if="isOwnProfile || isAdmin" class="btn-action" @click="openCard('business')">📇 Business Card</button>
              
              <button v-if="isOwnProfile || isAdmin" class="btn-action emergency" @click="openEmergency">🚨 Emergency Card</button>

              <button v-if="isOwnProfile && user.role === 'user' && user.organizerStatus !== 'approved'" class="btn-action upgrade" @click="$router.push('/upgrade-organizer')">
                  🚀 Jadi Organizer
              </button>
              <button v-if="isAdmin" class="btn-action admin" @click="$router.push('/admin')">
                  ⚡ Admin Panel
              </button>
              <button v-if="isOwnProfile" class="btn-action" style="color:#ef4444; border-color: #ef4444;" @click="handleLogout">
                  🚪 Logout
              </button>
           </div>
        </aside>

        <!-- MAIN CONTENT -->
        <main class="profile-main relative z-10">
           
           <div class="tabs-strip">
              <button :class="{ active: activeTab === 'trips' }" @click="activeTab = 'trips'">🏕️ Trips</button>
              <button :class="{ active: activeTab === 'posts' }" @click="activeTab = 'posts'">💬 Forum Posts</button>
              <button :class="{ active: activeTab === 'info' }" @click="activeTab = 'info'">📝 Biodata</button>
           </div>

           <div class="content-box">
              
              <!-- TRIPS TAB -->
              <div v-if="activeTab === 'trips'" class="fade-in">
                 
                 <h3 class="text-xl font-bold mb-4 text-white">Upcoming Trips</h3>
                 <div v-if="upcomingTrips.length === 0" class="empty-text">Tiada trip akan datang.</div>
                 <div class="grid-layout mb-8">
                    <div v-for="trip in upcomingTrips" :key="trip.id" class="compact-card" @click="goToTrip(trip.id)">
                       <div class="cc-date">
                          <span class="d">{{ new Date(trip.startDate).getDate() }}</span>
                          <span class="m">{{ new Date(trip.startDate).toLocaleString('default', { month: 'short' }) }}</span>
                       </div>
                       <div class="cc-info">
                          <h4>{{ trip.title }}</h4>
                          <p>{{ trip.location || trip.destination }}</p>
                          <span class="status-pill organizer" v-if="trip.organizerId === user.id">Organizer</span>
                          <span class="status-pill participant" v-else>Participant</span>
                       </div>
                    </div>
                 </div>

                 <h3 class="text-xl font-bold mb-4 text-gray-400">History</h3>
                 <div v-if="historyTrips.length === 0" class="empty-text">Tiada sejarah trip.</div>
                 <div class="grid-layout">
                    <div v-for="trip in historyTrips" :key="trip.id" class="compact-card faded" @click="goToTrip(trip.id)">
                       <div class="cc-date grayscale">
                          <span class="d">{{ new Date(trip.startDate).getDate() }}</span>
                          <span class="m">{{ new Date(trip.startDate).toLocaleString('default', { month: 'short' }) }}</span>
                       </div>
                       <div class="cc-info">
                          <h4>{{ trip.title }}</h4>
                          <p>{{ trip.location }}</p>
                          <span class="status-pill closed">Completed</span>
                       </div>
                    </div>
                 </div>

              </div>

              <!-- POSTS TAB -->
              <div v-if="activeTab === 'posts'" class="fade-in">
                 <div v-if="myPosts.length === 0" class="empty-text">Belum ada post di forum.</div>
                 <div class="forum-layout">
                    <div v-for="post in myPosts" :key="post.id" class="forum-row" @click="router.push(`/forum/${post.id}`)">
                       <div class="fr-content">
                          <h4>{{ post.title }}</h4>
                          <span>{{ new Date(post.createdAt.seconds * 1000).toLocaleDateString() }} • {{ post.category }}</span>
                       </div>
                       <div class="fr-actions" v-if="isOwnProfile || isAdmin">
                          <button class="del" @click.stop="deletePost(post.id)">🗑️</button>
                       </div>
                    </div>
                 </div>
              </div>

              <!-- INFO TAB -->
              <div v-if="activeTab === 'info'" class="fade-in">
                 <div class="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 class="text-lg font-bold text-white mb-4">Maklumat Peribadi</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                       <div><strong>Email:</strong> {{ user.email }}</div>
                       <div><strong>Phone:</strong> {{ user.phone || '-' }}</div>
                       <div><strong>Lokasi:</strong> {{ user.location || '-' }}</div>
                       <div><strong>Join Date:</strong> {{ user.createdAt ? new Date(user.createdAt.seconds*1000).toLocaleDateString() : '-' }}</div>
                    </div>
                    
                    <div v-if="user.organizerDetails?.orgName" class="mt-6 pt-6 border-t border-white/10">
                        <h3 class="text-lg font-bold text-green-400 mb-2">Organizer Info</h3>
                        <p><strong>Organization:</strong> {{ user.organizerDetails.orgName }}</p>
                        <p><strong>SSM No:</strong> {{ user.organizerDetails.ssmNo || '-' }}</p>
                    </div>

                    <div v-if="isOwnProfile || isAdmin" class="mt-6 pt-6 border-t border-white/10">
                        <h3 class="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
                           <i class="fas fa-lock"></i> Private / Emergency Info
                        </h3>
                        <p class="text-xs text-gray-500 mb-4">Hanya anda dan admin boleh melihat info ini.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                           <div><strong>Nama Penuh (IC):</strong> {{ privateData.fullName || '-' }}</div>
                           <div><strong>No. KP:</strong> {{ privateData.icNo || '-' }}</div>
                           <div><strong>Contact Kecemasan:</strong> {{ privateData.emergencyContact || '-' }}</div>
                           <div><strong>Hubungan:</strong> {{ privateData.emergencyRelationship || '-' }}</div>
                           <div><strong>Jenis Darah:</strong> {{ privateData.bloodType || '-' }}</div>
                           <div class="col-span-1 md:col-span-2 bg-red-900/20 p-3 rounded-lg border border-red-500/20">
                             <strong>Medical Condition:</strong><br>
                             {{ privateData.medicalCondition || 'Tiada' }}
                           </div>
                        </div>
                    </div>
                 </div>
              </div>

           </div>
        </main>

      </div>
    </div>
    
    <!-- CARD GENERATOR MODAL -->
    <ProfileCardGenerator 
       v-model:visible="showCardModal" 
       :type="cardType" 
       :userData="user" 
       :privateData="privateData" 
    />

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, orderBy, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import ProfileCardGenerator from '../components/profile/ProfileCardGenerator.vue';

const route = useRoute();
const router = useRouter();

const loadingData = ref(true);
const isOwnProfile = ref(false);
const isAdmin = ref(false);
const activeTab = ref('trips');

const user = ref<any>(null);
const privateData = reactive<any>({});
const myPosts = ref<any[]>([]);

const tripsAsOrganizer = ref<any[]>([]);
const tripsAsParticipant = ref<any[]>([]);
const upcomingTrips = ref<any[]>([]);
const historyTrips = ref<any[]>([]);

// Card Generator
const showCardModal = ref(false);
const cardType = ref<'business' | 'emergency'>('business');

const handleLogout = async () => { await signOut(auth); router.push('/login'); };

const fetchUserData = async (targetUserId: string) => {
  loadingData.value = true;
  user.value = null;
  tripsAsOrganizer.value = [];
  tripsAsParticipant.value = [];
  upcomingTrips.value = [];
  historyTrips.value = [];
  myPosts.value = [];
  
  try {
    // 1. Fetch Public Data
    const userDoc = await getDoc(doc(db, "users", targetUserId));
    if (userDoc.exists()) {
        user.value = { id: userDoc.id, ...userDoc.data() };
        if (!user.value.organizerDetails) user.value.organizerDetails = {};
    } else { 
        user.value = { name: 'Pengguna Tidak Dijumpai' }; 
    }

    // 2. Fetch Private Data (If owner or admin)
    const currentUser = auth.currentUser;
    if (currentUser && (currentUser.uid === targetUserId || isAdmin.value)) {
       try {
         const privateRef = doc(db, "users", targetUserId, "private_data", "info");
         const privateSnap = await getDoc(privateRef);
         if(privateSnap.exists()) Object.assign(privateData, privateSnap.data());
       } catch (err) {}
    }

    // 3. Fetch Trips
    await fetchUserTrips(targetUserId);

    // 4. Fetch Posts
    const qPost = query(collection(db, "forum_posts"), where("authorId", "==", targetUserId), orderBy("createdAt", "desc"));
    const snapPost = await getDocs(qPost);
    myPosts.value = snapPost.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  } catch (e) { console.error("Error profile:", e); } 
  finally { loadingData.value = false; }
};

const fetchUserTrips = async (uid: string) => {
    const tripMap = new Map();
    // Organizer
    const qOrg = query(collection(db, "trips"), where("organizerId", "==", uid));
    const snapOrg = await getDocs(qOrg);
    snapOrg.forEach(d => tripMap.set(d.id, { id: d.id, ...d.data() }));
    // Participant
    const qPart = query(collection(db, "trips"), where("participants", "array-contains", uid));
    const snapPart = await getDocs(qPart);
    snapPart.forEach(d => tripMap.set(d.id, { id: d.id, ...d.data() }));

    const today = new Date();
    today.setHours(0,0,0,0);

    Array.from(tripMap.values()).forEach((trip: any) => {
        if (!trip.startDate) return;
        const tDate = new Date(trip.startDate);
        if (tDate >= today) upcomingTrips.value.push(trip);
        else historyTrips.value.push(trip);
        
        if (trip.organizerId === uid) tripsAsOrganizer.value.push(trip);
        else tripsAsParticipant.value.push(trip);
    });
    
    upcomingTrips.value.sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    historyTrips.value.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
};

const deletePost = async (id: string) => {
  if (confirm("Padam post ini?")) {
    try {
      await deleteDoc(doc(db, "forum_posts", id));
      myPosts.value = myPosts.value.filter(p => p.id !== id);
    } catch(e) { alert("Gagal memadam."); }
  }
};

const openCard = (type: 'business' | 'emergency') => {
    cardType.value = type;
    showCardModal.value = true;
};

const openEmergency = () => {
  if (!privateData.bloodType && !privateData.emergencyContact) {
    if(confirm("Maklumat kecemasan belum lengkap. Kemaskini sekarang?")) router.push('/profile/edit');
  } else {
    openCard('emergency');
  }
};

const checkAdminRole = async (uid: string) => {
  try {
      const s = await getDoc(doc(db, "users", uid));
      if (s.exists() && s.data().role === 'admin') isAdmin.value = true;
  } catch(e){}
};

const goToTrip = (id: string) => router.push(`/trips/${id}`);

onMounted(() => {
  onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) await checkAdminRole(currentUser.uid);
    const routeId = route.params.id as string;
    if (routeId) {
      fetchUserData(routeId);
      isOwnProfile.value = currentUser ? (currentUser.uid === routeId) : false;
    } else if (currentUser) {
      fetchUserData(currentUser.uid);
      isOwnProfile.value = true;
    } else {
      router.push('/');
    }
  });
});

watch(() => route.params.id, (newId) => {
  if (newId) fetchUserData(newId as string);
});
</script>

<style scoped>
.profile-page { background-color: #0f172a; min-height: 100vh; position: relative; overflow-x: hidden; color: white; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; position: relative; z-index: 2; }

/* GLOWS */
.page-glow-purple {
  position: absolute; top: 0; left: 0; width: 50vw; height: 50vw;
  background: #6c63ff; filter: blur(150px); opacity: 0.15; pointer-events: none; border-radius: 50%; z-index: 0;
}
.page-glow-orange {
  position: absolute; bottom: 0; right: 0; width: 50vw; height: 50vw;
  background: #ff8c42; filter: blur(150px); opacity: 0.1; pointer-events: none; border-radius: 50%; z-index: 0;
}
.contour-lines {
  position: absolute; inset: 0; z-index: 0; opacity: 0.08;
  background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400' stroke='white' fill='none' stroke-width='2' opacity='0.5'/%3E%3C/svg%3E");
  background-size: cover; pointer-events: none;
}

.profile-layout { display: grid; grid-template-columns: 320px 1fr; gap: 2rem; position: relative; z-index: 2; }

.profile-sidebar { 
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px; padding: 2rem; text-align: center; height: fit-content;
  backdrop-filter: blur(10px);
}

.avatar { width: 120px; height: 120px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.2); object-fit: cover; margin-bottom: 15px; }
.role-badge { background: #e67e22; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; display: inline-block; margin-bottom: 12px; text-transform: uppercase; margin-right: 5px; }
.user-name { font-size: 1.5rem; color: white; margin: 0; font-weight: 700; }
.user-bio { color: #cbd5e1; font-size: 0.95rem; margin-top: 8px; line-height: 1.5; }

.stats-grid { display: flex; justify-content: center; gap: 25px; margin: 1.5rem 0; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 15px 0; }
.stat-item { display: flex; flex-direction: column; }
.stat-item strong { font-size: 1.3rem; color: #6c63ff; }
.stat-item span { font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; }

.social-links { display: flex; justify-content: center; gap: 12px; margin-bottom: 1.5rem; }
.social-links img { width: 24px; transition: transform 0.2s; }
.social-links a:hover img { transform: scale(1.2); }

.action-stack { display: flex; flex-direction: column; gap: 10px; }
.btn-action { 
  width: 100%; padding: 0.8rem; border: 1px solid rgba(255,255,255,0.1); 
  background: rgba(255,255,255,0.05); color: white;
  border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; 
}
.btn-action:hover { background: rgba(255,255,255,0.1); border-color: #6c63ff; }
.btn-action.upgrade { background: linear-gradient(135deg, #10b981, #059669); border: none; }
.btn-action.admin { background: linear-gradient(135deg, #e74c3c, #c0392b); border: none; box-shadow: 0 4px 10px rgba(231, 76, 60, 0.3); }
.btn-action.emergency { border-color: #c0392b; color: #f87171; }
.btn-action.emergency:hover { background: #c0392b; color: white; }
.btn-action.telegram-btn { background: #229ED9; border: none; color: white; }
.btn-action.telegram-btn:hover { background: #1a8cc2; transform: translateY(-2px); }

/* MAIN CONTENT */
.profile-main { display: flex; flex-direction: column; }

.tabs-strip { 
  background: rgba(255, 255, 255, 0.05); 
  padding: 0 1.5rem; border-radius: 16px 16px 0 0; 
  border: 1px solid rgba(255, 255, 255, 0.1); border-bottom: none;
  display: flex; gap: 25px; backdrop-filter: blur(10px);
}
.tabs-strip button { 
  background: none; border: none; padding: 1.2rem 0; font-size: 1rem; 
  color: #94a3b8; font-weight: 600; cursor: pointer; 
  border-bottom: 3px solid transparent; transition: color 0.3s;
}
.tabs-strip button.active { color: #6c63ff; border-bottom-color: #6c63ff; }

.content-box { 
  background: rgba(255, 255, 255, 0.03); 
  padding: 2rem; border-radius: 0 0 16px 16px; min-height: 400px; 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  backdrop-filter: blur(10px);
}

.grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }

/* Compact Card */
.compact-card { 
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px; 
  transition: transform 0.2s; cursor: pointer;
}
.compact-card:hover { transform: translateY(-3px); border-color: #6c63ff; }
.compact-card.faded { opacity: 0.6; }

.cc-date { 
  background: rgba(108, 99, 255, 0.2); color: #a78bfa; 
  padding: 8px 12px; border-radius: 8px; text-align: center; min-width: 60px; 
}
.d { display: block; font-weight: 800; font-size: 1.2rem; line-height: 1; }
.m { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }

.cc-info { flex: 1; }
.cc-info h4 { margin: 0 0 5px 0; font-size: 1rem; color: white; font-weight: 600; }
.cc-info p { margin: 0; font-size: 0.85rem; color: #94a3b8; }

.status-pill { font-size: 0.7rem; padding: 3px 8px; border-radius: 4px; font-weight: bold; margin-top: 5px; display: inline-block; margin-right: 5px; }
.status-pill.open { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.status-pill.closed { background: rgba(255,255,255,0.1); color: #94a3b8; }
.status-pill.organizer { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.status-pill.participant { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }

.btn-mini { padding: 6px 12px; font-size: 0.8rem; background: #6c63ff; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-mini:hover { background: #5b54e0; }
.btn-mini.outline { background: transparent; border: 1px solid rgba(255,255,255,0.3); color: #ccc; }

.forum-layout { display: flex; flex-direction: column; gap: 10px; }
.forum-row { 
  padding: 1.2rem; background: rgba(255,255,255,0.05); 
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);
  display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: 0.2s;
}
.forum-row:hover { background: rgba(255,255,255,0.08); border-color: #6c63ff; }
.fr-content h4 { margin: 0 0 5px 0; font-size: 1.05rem; color: white; }
.fr-content span { font-size: 0.85rem; color: #94a3b8; }
.fr-actions button { background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 5px; color: #ccc; }
.fr-actions button:hover { color: #6c63ff; }
.fr-actions button.del:hover { color: #ef4444; }

.empty-text { text-align: center; color: #64748b; padding: 3rem; font-style: italic; }
.spinner { border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.fade-up { animation: fadeUp 0.6s ease-out; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 768px) { 
  .profile-layout { grid-template-columns: 1fr; } 
  .tabs-strip { overflow-x: auto; }
}
</style>