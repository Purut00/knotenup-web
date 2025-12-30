<template>
  <div class="min-h-screen bg-slate-900 relative overflow-x-hidden text-white">
    
    <!-- Background Decor -->
    <div class="absolute inset-0 z-0 opacity-[0.08] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' viewBox=\'0 0 1000 1000\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400\' stroke=\'white\' fill=\'none\' stroke-width=\'2\' opacity=\'0.5\'/%3E%3C/svg%3E')] bg-cover"></div>
    <div class="absolute top-0 left-0 w-[50vw] h-[50vw] bg-[#6c63ff] blur-[150px] opacity-15 pointer-events-none rounded-full z-0"></div>
    <div class="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-[#ff8c42] blur-[150px] opacity-10 pointer-events-none rounded-full z-0"></div>

    <div class="max-w-[1200px] mx-auto px-6 pt-[100px] pb-12 relative z-[2]">
      
      <div v-if="loadingData" class="flex flex-col items-center justify-center py-20 text-gray-400">
          <div class="w-10 h-10 border-4 border-white/10 border-t-[#3498db] rounded-full animate-spin mb-4"></div>
          <p>Memuatkan Profil...</p>
      </div>

      <div v-else-if="!user" class="text-center py-20">
          <h2 class="text-red-400 text-2xl font-bold">Pengguna Tidak Dijumpai</h2>
          <button @click="$router.push('/')" class="mt-4 px-3 py-1.5 text-sm bg-[#6c63ff] text-white rounded-md hover:bg-[#5b54e0] border border-transparent font-semibold">Kembali ke Home</button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8 relative z-[2] animate-fade-in-up">
        
        <!-- SIDEBAR -->
        <aside class="bg-white/5 border border-white/10 rounded-2xl p-8 text-center h-fit backdrop-blur-md relative z-10">
           <img :src="user.avatar || user.photoURL || 'https://i.pravatar.cc/150'" class="w-[120px] h-[120px] rounded-full border-[3px] border-white/20 object-cover mb-4 mx-auto" />
           
           <div class="mb-2">
              <span class="inline-block bg-[#e67e22] text-white px-3 py-1 rounded-full text-xs font-bold uppercase mb-3 mr-1" v-if="user.role !== 'user'">{{ user.role }}</span>
              <span class="inline-block bg-[#2ecc71] text-white px-3 py-1 rounded-full text-xs font-bold uppercase mb-3 mr-1" v-if="user.organizerStatus === 'approved'">Organizer Sah</span>
           </div>

           <h1 class="text-2xl text-white m-0 font-bold">{{ user.name }}</h1>
           <p class="text-slate-300 text-sm mt-2 leading-relaxed">{{ user.bio || 'Tiada bio.' }}</p>

           <div class="flex justify-center gap-6 my-6 py-4 border-y border-white/10">
              <div class="flex flex-col">
                 <strong class="text-xl text-[#6c63ff]">{{ tripsAsOrganizer.length + tripsAsParticipant.length }}</strong>
                 <span class="text-xs text-slate-400 uppercase">Trips</span>
              </div>
              <div class="flex flex-col">
                 <strong class="text-xl text-[#6c63ff]">{{ myPosts.length }}</strong>
                 <span class="text-xs text-slate-400 uppercase">Posts</span>
              </div>
           </div>

           <div class="flex justify-center gap-3 mb-6" v-if="user.telegramUsername || user.instagram || user.facebook || user.tiktok">
              <a v-if="user.telegramUsername" :href="`https://t.me/${user.telegramUsername}`" target="_blank" title="Telegram" class="transition-transform hover:scale-110">
                 <img src="https://img.icons8.com/fluency/48/telegram-app.png" alt="TG" class="w-6" />
              </a>
              <a v-if="user.instagram" :href="`https://instagram.com/${user.instagram}`" target="_blank" class="transition-transform hover:scale-110">
                 <img src="https://img.icons8.com/fluency/48/instagram-new.png" alt="IG" class="w-6" />
              </a>
              <a v-if="user.facebook" :href="user.facebook" target="_blank" class="transition-transform hover:scale-110">
                 <img src="https://img.icons8.com/fluency/48/facebook-new.png" alt="FB" class="w-6" />
              </a>
              <a v-if="user.tiktok" :href="user.tiktok" target="_blank" class="transition-transform hover:scale-110">
                 <img src="https://img.icons8.com/fluency/48/tiktok.png" alt="TT" class="w-6" />
              </a>
           </div>
           
           <!-- Actions -->
           <div class="flex flex-col gap-2.5">
              <!-- [NEW] TELEGRAM DEEP LINK BUTTON FOR VISITORS -->
              <a 
                 v-if="!isOwnProfile && user.telegramUsername" 
                 :href="`https://t.me/${user.telegramUsername.replace('@', '')}`" 
                 target="_blank"
                 class="w-full p-3 border-none bg-[#229ED9] text-white rounded-lg font-semibold text-sm cursor-pointer transition-all hover:bg-[#1a8cc2] hover:-translate-y-0.5 flex items-center justify-center gap-2 no-underline"
              >
                  <i class="fab fa-telegram-plane text-lg"></i> Chat via Telegram
              </a>

              <button v-if="isOwnProfile || isAdmin" class="w-full p-3 border border-white/10 bg-white/5 text-white rounded-lg font-semibold cursor-pointer text-sm transition-all duration-200 hover:bg-white/10 hover:border-[#6c63ff]" @click="$router.push('/profile/edit')">✏️ Edit Profil</button>
              
              <button v-if="isOwnProfile || isAdmin" class="w-full p-3 border border-white/10 bg-white/5 text-white rounded-lg font-semibold cursor-pointer text-sm transition-all duration-200 hover:bg-white/10 hover:border-[#6c63ff]" @click="openCard('business')">📇 Business Card</button>
              
              <button v-if="isOwnProfile || isAdmin" class="w-full p-3 border border-[#c0392b] bg-white/5 text-red-400 rounded-lg font-semibold cursor-pointer text-sm transition-all duration-200 hover:bg-[#c0392b] hover:text-white" @click="openEmergency">🚨 Emergency Card</button>

              <button v-if="isOwnProfile && user.role === 'user' && user.organizerStatus !== 'approved'" class="w-full p-3 border-none bg-gradient-to-br from-[#10b981] to-[#059669] text-white rounded-lg font-semibold cursor-pointer text-sm transition-all duration-200" @click="$router.push('/upgrade-organizer')">
                  🚀 Jadi Organizer
              </button>
              <button v-if="isAdmin" class="w-full p-3 border-none bg-gradient-to-br from-[#e74c3c] to-[#c0392b] text-white rounded-lg font-semibold cursor-pointer text-sm transition-all duration-200 shadow-lg shadow-red-500/30" @click="$router.push('/admin')">
                  ⚡ Admin Panel
              </button>
              <button v-if="isOwnProfile" class="w-full p-3 border border-red-500 bg-white/5 text-red-500 rounded-lg font-semibold cursor-pointer text-sm transition-all duration-200 hover:bg-red-500/10" @click="handleLogout">
                  🚪 Logout
              </button>

              <button v-if="!isOwnProfile" class="w-full p-3 border border-red-500/30 bg-white/5 text-red-500 rounded-lg font-semibold cursor-pointer text-sm transition-all duration-200 hover:bg-red-500/10" @click="openReportModal">
                  🚩 Report User
              </button>
           </div>
        </aside>

        <!-- MAIN CONTENT -->
        <main class="flex flex-col relative z-10">
           
           <div class="bg-white/5 px-6 rounded-t-2xl border border-white/10 border-b-0 flex gap-6 backdrop-blur-md overflow-x-auto">
              <button :class="['py-5 text-base font-semibold cursor-pointer border-b-[3px] transition-colors bg-transparent border-none', activeTab === 'trips' ? 'text-[#6c63ff] border-[#6c63ff]' : 'text-slate-400 border-transparent hover:text-white']" @click="activeTab = 'trips'">🏕️ Trips</button>
              <button :class="['py-5 text-base font-semibold cursor-pointer border-b-[3px] transition-colors bg-transparent border-none', activeTab === 'posts' ? 'text-[#6c63ff] border-[#6c63ff]' : 'text-slate-400 border-transparent hover:text-white']" @click="activeTab = 'posts'">💬 Forum Posts</button>
              <button :class="['py-5 text-base font-semibold cursor-pointer border-b-[3px] transition-colors bg-transparent border-none', activeTab === 'info' ? 'text-[#6c63ff] border-[#6c63ff]' : 'text-slate-400 border-transparent hover:text-white']" @click="activeTab = 'info'">📝 Biodata</button>
           </div>

           <div class="bg-white/[0.03] p-8 rounded-b-2xl min-h-[400px] border border-white/10 backdrop-blur-md">
              
              <!-- TRIPS TAB -->
              <div v-if="activeTab === 'trips'" class="animate-fade-in-up">
                 
                 <h3 class="text-xl font-bold mb-4 text-white">Upcoming Trips</h3>
                 <div v-if="upcomingTrips.length === 0" class="text-center text-slate-500 py-12 italic">Tiada trip akan datang.</div>
                 <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 mb-8">
                    <div v-for="trip in upcomingTrips" :key="trip.id" class="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:border-[#6c63ff] cursor-pointer" @click="goToTrip(trip.id)">
                       <div class="bg-[#6c63ff]/20 text-[#a78bfa] p-2 rounded-lg text-center min-w-[60px]">
                          <span class="block font-extrabold text-xl leading-none">{{ new Date(trip.startDate).getDate() }}</span>
                          <span class="text-xs font-semibold uppercase">{{ new Date(trip.startDate).toLocaleString('default', { month: 'short' }) }}</span>
                       </div>
                       <div class="flex-1">
                          <h4 class="m-0 mb-1 text-base text-white font-semibold">{{ trip.title }}</h4>
                          <p class="m-0 text-sm text-slate-400">{{ trip.location || trip.destination }}</p>
                          <span class="inline-block text-[0.7rem] px-2 py-[3px] rounded font-bold mt-1 bg-blue-500/20 text-blue-400 mr-1" v-if="trip.organizerId === user.id">Organizer</span>
                          <span class="inline-block text-[0.7rem] px-2 py-[3px] rounded font-bold mt-1 bg-amber-500/20 text-amber-400 mr-1" v-else>Participant</span>
                       </div>
                    </div>
                 </div>

                 <h3 class="text-xl font-bold mb-4 text-gray-400">History</h3>
                 <div v-if="historyTrips.length === 0" class="text-center text-slate-500 py-12 italic">Tiada sejarah trip.</div>
                 <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
                    <div v-for="trip in historyTrips" :key="trip.id" class="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:border-[#6c63ff] cursor-pointer opacity-60" @click="goToTrip(trip.id)">
                       <div class="bg-[#6c63ff]/20 text-[#a78bfa] p-2 rounded-lg text-center min-w-[60px] grayscale">
                          <span class="block font-extrabold text-xl leading-none">{{ new Date(trip.startDate).getDate() }}</span>
                          <span class="text-xs font-semibold uppercase">{{ new Date(trip.startDate).toLocaleString('default', { month: 'short' }) }}</span>
                       </div>
                       <div class="flex-1">
                          <h4 class="m-0 mb-1 text-base text-white font-semibold">{{ trip.title }}</h4>
                          <p class="m-0 text-sm text-slate-400">{{ trip.location }}</p>
                          <span class="inline-block text-[0.7rem] px-2 py-[3px] rounded font-bold mt-1 bg-white/10 text-slate-400 mr-1">Completed</span>
                       </div>
                    </div>
                 </div>

              </div>

              <!-- POSTS TAB -->
              <div v-if="activeTab === 'posts'" class="animate-fade-in-up">
                 <div v-if="myPosts.length === 0" class="text-center text-slate-500 py-12 italic">Belum ada post di forum.</div>
                 <div class="flex flex-col gap-2.5">
                    <div v-for="post in myPosts" :key="post.id" class="p-5 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center cursor-pointer transition-all hover:bg-white/10 hover:border-[#6c63ff]" @click="router.push(`/forum/${post.id}`)">
                       <div class="flex-1">
                          <h4 class="m-0 mb-1 text-[1.05rem] text-white">{{ post.title }}</h4>
                          <span class="text-sm text-slate-400">{{ new Date(post.createdAt.seconds * 1000).toLocaleDateString() }} • {{ post.category }}</span>
                       </div>
                       <div class="ml-4" v-if="isOwnProfile || isAdmin">
                          <button class="bg-none border-none cursor-pointer text-lg p-1 text-slate-300 hover:text-red-500" @click.stop="deletePost(post.id)">🗑️</button>
                       </div>
                    </div>
                 </div>
              </div>

              <!-- INFO TAB -->
              <div v-if="activeTab === 'info'" class="animate-fade-in-up">
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

    <ReportModal
      v-if="user" 
      v-model:visible="showReportModal"
      :targetId="user.id"
      targetType="user"
      :targetName="user.name"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, orderBy, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Lazy Load ProfileCardGenerator for performance
const ProfileCardGenerator = defineAsyncComponent(() => 
  import('../components/profile/ProfileCardGenerator.vue')
);
const ReportModal = defineAsyncComponent(() => 
  import('../components/common/ReportModal.vue')
);

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

const showReportModal = ref(false);
const openReportModal = () => { showReportModal.value = true; };

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