<template>
  <div class="profile-page">
    
    <!-- BACKGROUND LAYERS (Ikut Tema) -->
    <div class="contour-lines"></div>
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <!-- UPDATE: Guna style manual padding-top: 180px supaya betul-betul tak kena potong -->
    <div class="container profile-layout" style="padding-top: 100px; padding-bottom: 3rem;">
      
      <!-- LEFT SIDEBAR -->
      <aside class="profile-sidebar glass-panel">
        <div class="user-card">
          <div class="avatar-wrapper">
            <img :src="user.avatar" alt="Avatar" class="avatar" />
            <span v-if="user.role === 'organizer'" class="role-badge">Organizer</span>
          </div>
          
          <h2 class="user-name">{{ user.name }} <span class="verified-icon">✅</span></h2>
          <p class="user-bio">{{ user.bio || 'Tiada bio.' }}</p>

          <div class="stats-grid">
             <div class="stat-item"><strong>{{ organizedCount }}</strong><span>Trip</span></div>
             <div class="stat-item"><strong>{{ myPosts.length }}</strong><span>Post</span></div>
          </div>

          <div class="social-links">
             <a v-if="user.whatsapp" :href="'https://wa.me/' + user.whatsapp" target="_blank"><img src="https://cdn.simpleicons.org/whatsapp/25D366" /></a>
             <a v-if="user.facebook" :href="'https://facebook.com/' + user.facebook" target="_blank"><img src="https://cdn.simpleicons.org/facebook/1877F2" /></a>
             <a v-if="user.instagram" :href="'https://instagram.com/' + user.instagram" target="_blank"><img src="https://cdn.simpleicons.org/instagram/E4405F" /></a>
             <a v-if="user.tiktok" :href="'https://tiktok.com/@' + user.tiktok" target="_blank"><img src="https://cdn.simpleicons.org/tiktok/white" /></a>
             <a v-if="user.youtube" :href="'https://youtube.com/' + user.youtube" target="_blank"><img src="https://cdn.simpleicons.org/youtube/FF0000" /></a>
          </div>

          <div class="action-stack" v-if="isOwnProfile">
            <button v-if="user.role !== 'organizer'" class="btn-action upgrade" @click="$router.push('/be-organizer')">
              🏆 Aktifkan Akaun Organizer
            </button>
            <button v-if="isAdmin" class="btn-action admin" @click="$router.push('/admin')">
              ⚡ Admin Panel
            </button>
            
            <button v-if="user.role === 'organizer'" class="btn-action card" @click="showCard = true">
              🪪 Business Card
            </button>

            <button class="btn-action emergency" @click="openEmergency">
              ⛑️ Emergency Card
            </button>

            <button class="btn-action edit" @click="$router.push('/profile/edit')">
              ⚙️ {{ t('profile.editProfile') || 'Edit Profil' }}
            </button>
          </div>

          <div class="action-stack" v-else>
             <a v-if="user.whatsapp" :href="'https://wa.me/' + user.whatsapp" target="_blank" class="btn-action contact">
               📞 WhatsApp
             </a>
          </div>

        </div>
      </aside>

      <!-- RIGHT MAIN CONTENT -->
      <main class="profile-main">
        
        <!-- TABS -->
        <div class="tabs-strip glass-panel-top">
          <button :class="{ active: activeTab === 'upcoming' }" @click="activeTab = 'upcoming'">
            📅 {{ t('profile.tabUpcoming') || 'Akan Datang' }}
          </button>
          <button :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">
            📜 {{ t('profile.tabHistory') || 'Sejarah' }}
          </button>
          <button :class="{ active: activeTab === 'forum' }" @click="activeTab = 'forum'">
            💬 {{ t('profile.tabPosts') || 'Post Saya' }}
          </button>
        </div>

        <!-- CONTENT BOX -->
        <div class="content-box glass-panel-bottom">
          <div v-if="loadingData" class="loading-text">⏳ {{ t('common.loading') }}...</div>
          
          <div v-else>
            <!-- UPCOMING TAB -->
            <div v-if="activeTab === 'upcoming'">
              <div v-if="upcomingTrips.length > 0" class="grid-layout">
                <div v-for="trip in upcomingTrips" :key="trip.id" class="compact-card glass-card-small">
                  <div class="cc-date">
                    <span class="d">{{ getDay(trip.startDate) }}</span>
                    <span class="m">{{ getMonth(trip.startDate) }}</span>
                  </div>
                  <div class="cc-info">
                    <h4>{{ trip.title }}</h4>
                    <p>📍 {{ trip.destination || trip.location }}</p>
                    
                    <span v-if="trip.organizerId === user.id" class="status-pill organizer">Organizer</span>
                    <span v-else class="status-pill participant">Peserta</span>
                    
                    <span class="status-pill open">{{ t('trip.open') || 'Open' }}</span>
                  </div>
                  <button class="btn-mini" @click="$router.push('/trips/' + trip.id)">
                    {{ t('common.view') || 'Lihat' }}
                  </button>
                </div>
              </div>
              <div v-else class="empty-text">Tiada trip akan datang.</div>
            </div>

            <!-- HISTORY TAB -->
            <div v-if="activeTab === 'history'">
              <div v-if="historyTrips.length > 0" class="grid-layout">
                <div v-for="trip in historyTrips" :key="trip.id" class="compact-card glass-card-small faded">
                  <div class="cc-date">
                    <span class="d">{{ getDay(trip.startDate) }}</span>
                    <span class="m">{{ getMonth(trip.startDate) }}</span>
                  </div>
                  <div class="cc-info">
                    <h4>{{ trip.title }}</h4>
                    <p>📍 {{ trip.destination || trip.location }}</p>
                    <span class="status-pill closed">Tamat</span>
                  </div>
                  <button class="btn-mini outline" @click="$router.push('/trips/' + trip.id)">
                    {{ t('common.view') || 'Lihat' }}
                  </button>
                </div>
              </div>
              <div v-else class="empty-text">Tiada sejarah trip.</div>
            </div>

            <!-- FORUM TAB -->
            <div v-if="activeTab === 'forum'">
              <div v-if="myPosts.length > 0" class="forum-layout">
                <div v-for="post in myPosts" :key="post.id" class="forum-row glass-row" @click="$router.push('/forum/' + post.id)">
                   <div class="fr-content">
                     <h4>{{ post.title }}</h4>
                     <span>💬 {{ post.commentCount || 0 }} • ❤️ {{ post.votes || 0 }}</span>
                   </div>
                   <div class="fr-actions" v-if="isOwnProfile">
                     <button @click.stop="editPost(post.id)">✏️</button>
                     <button @click.stop="deletePost(post.id)" class="del">🗑️</button>
                   </div>
                </div>
              </div>
              <div v-else class="empty-text">Tiada post forum.</div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- MODALS (Business Card & Emergency) - KEKAL SAMA FUNGSI -->
    <div v-if="showCard" class="modal-overlay" @click.self="showCard = false">
      <div class="card-modal-wrapper">
        <button class="close-btn" @click="showCard = false">✖</button>
        
        <div class="standard-card business-card" id="capture-business">
          <div class="bc-left-panel">
             <div class="bc-profile-header">
                <img :src="user.avatar" class="bc-avatar-square" crossorigin="anonymous" />
                <div class="bc-texts">
                   <h3 class="bc-name">{{ user.name }}</h3>
                   <span class="bc-role">OUTDOOR ORGANIZER</span>
                   <p v-if="user.organizerDetails.orgName && user.organizerDetails.orgName !== user.name" class="bc-company">
                     {{ user.organizerDetails.orgName }}
                   </p>
                   <p v-if="user.organizerDetails.ssm" class="bc-ssm">
                     {{ user.organizerDetails.ssm }}
                   </p>
                </div>
             </div>
             <div class="bc-socials-list">
                <div v-if="user.whatsapp" class="bc-soc-row"><img src="https://cdn.simpleicons.org/whatsapp/white" /> {{ user.whatsapp }}</div>
                <div v-if="user.facebook" class="bc-soc-row"><img src="https://cdn.simpleicons.org/facebook/white" /> /{{ user.facebook }}</div>
                <div v-if="user.instagram" class="bc-soc-row"><img src="https://cdn.simpleicons.org/instagram/white" /> /{{ user.instagram }}</div>
                <div v-if="user.tiktok" class="bc-soc-row"><img src="https://cdn.simpleicons.org/tiktok/white" /> @{{ user.tiktok }}</div>
                <div v-if="user.youtube" class="bc-soc-row"><img src="https://cdn.simpleicons.org/youtube/white" /> /{{ user.youtube }}</div>
             </div>
          </div>
          <div class="bc-right-panel">
             <div class="qr-container">
               <span class="scan-text">SCAN ME</span>
               <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://knotenup.com/user/${user.name}`" class="bc-qr" crossorigin="anonymous" />
               <span class="bc-brand">KnotenUp</span>
             </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="share-btn" @click="shareCard">🔗 Copy Link</button>
          <button class="share-btn download" @click="downloadCard('capture-business', `BusinessCard-${user.name}`)">
            {{ isDownloading ? 'Prosessing...' : '⬇️ Download PDF' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showEmergency" class="modal-overlay" @click.self="showEmergency = false">
      <div class="card-modal-wrapper">
        <button class="close-btn" @click="showEmergency = false">✖</button>
        
        <div class="standard-card emergency-card" id="capture-emergency">
           <div class="ec-header">
             <h2>EMERGENCY INFO</h2>
             <span>ID: {{ user.name }}</span>
           </div>
           
           <div class="ec-body">
             <div class="ec-main">
                 <div class="ec-row">
                    <label>NAMA:</label>
                    <strong>{{ user.name }}</strong>
                 </div>
                 <div class="ec-grid">
                    <div class="ec-col">
                       <label>JENIS DARAH:</label>
                       <strong class="blood-type">{{ user.bloodType || '-' }}</strong>
                    </div>
                    <div class="ec-col">
                       <label>ALAHAN:</label>
                       <strong>{{ user.allergies || 'Tiada' }}</strong>
                    </div>
                 </div>
                 <div class="ec-alert-box">
                    <label>HUBUNGI KECEMASAN (WARIS):</label>
                    <strong style="color: #c0392b;">{{ user.emergencyContact || 'Belum ditetapkan' }}</strong>
                 </div>
             </div>
             <div class="ec-side">
                 <img :src="user.avatar" class="ec-avatar" crossorigin="anonymous" />
                 <div class="ec-qr-box">
                    <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://knotenup.com/user/${user.name}`" class="ec-qr" crossorigin="anonymous" />
                 </div>
             </div>
           </div>
        </div>

        <div class="modal-actions">
          <button class="share-btn download" style="background:#c0392b;" @click="downloadCard('capture-emergency', `EmergencyCard-${user.name}`)">
            {{ isDownloading ? 'Prosessing...' : '⬇️ Download PDF' }}
          </button>
          <button class="share-btn" @click="$router.push('/profile/edit')">✏️ Edit Info</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, orderBy, deleteDoc } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// STATE MODALS
const activeTab = ref('upcoming');
const showCard = ref(false);
const showEmergency = ref(false); 

const loadingData = ref(true);
const isOwnProfile = ref(false);
const isAdmin = ref(false);
const isDownloading = ref(false);

const ADMIN_EMAIL = "knotenup@gmail.com"; 

const upcomingTrips = ref<any[]>([]);
const historyTrips = ref<any[]>([]);
const myPosts = ref<any[]>([]);

const user = reactive({
  id: '', name: 'Loading...', bio: '', avatar: 'https://i.pravatar.cc/300?img=3',
  whatsapp: '', facebook: '', instagram: '', tiktok: '', youtube: '', role: 'user',
  organizerDetails: { orgName: '', ssm: '', license: '' },
  bloodType: '', allergies: '', emergencyContact: ''
});

const organizedCount = computed(() => upcomingTrips.value.length + historyTrips.value.length);
const getDay = (dateString: string) => { if(!dateString) return '01'; return new Date(dateString).getDate(); };
const getMonth = (dateString: string) => { if(!dateString) return 'JAN'; return new Date(dateString).toLocaleDateString('en-MY', { month: 'short' }).toUpperCase(); };

const fetchUserData = async (targetUserId: string) => {
  loadingData.value = true;
  upcomingTrips.value = []; historyTrips.value = []; myPosts.value = [];
  
  try {
    const docSnap = await getDoc(doc(db, "users", targetUserId));
    if (docSnap.exists()) { 
        const data = docSnap.data();
        Object.assign(user, data); 
        user.id = targetUserId; 
        if (!user.role) user.role = 'user'; 
        if (!user.organizerDetails) user.organizerDetails = { orgName: '', ssm: '', license: '' };
    } 
    else { user.name = 'User Tidak Dijumpai'; }

    user.bloodType = ''; user.allergies = ''; user.emergencyContact = '';

    const currentUser = auth.currentUser;
    if (currentUser && (currentUser.uid === targetUserId || isAdmin.value)) {
       try {
         const privateRef = doc(db, "users", targetUserId, "private_data", "info");
         const privateSnap = await getDoc(privateRef);
         if(privateSnap.exists()) {
            const pData = privateSnap.data();
            user.bloodType = pData.bloodType;
            user.allergies = pData.allergies;
            user.emergencyContact = pData.emergencyContact;
         }
       } catch (err) { console.log("Akses data peribadi disekat."); }
    }

    const tripMap = new Map();
    const qOrganizer = query(collection(db, "trips"), where("organizerId", "==", targetUserId));
    const snapOrganizer = await getDocs(qOrganizer);
    snapOrganizer.forEach(doc => tripMap.set(doc.id, { id: doc.id, ...doc.data() }));

    const qParticipant = query(collection(db, "trips"), where("participants", "array-contains", targetUserId));
    const snapParticipant = await getDocs(qParticipant);
    snapParticipant.forEach(doc => tripMap.set(doc.id, { id: doc.id, ...doc.data() }));

    const today = new Date();
    Array.from(tripMap.values()).forEach((trip: any) => {
      const tripDate = new Date(trip.startDate);
      tripDate.setHours(0,0,0,0); today.setHours(0,0,0,0);
      if (tripDate >= today) upcomingTrips.value.push(trip);
      else historyTrips.value.push(trip);
    });

    upcomingTrips.value.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    historyTrips.value.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    const qPost = query(collection(db, "forum_posts"), where("authorId", "==", targetUserId), orderBy("createdAt", "desc"));
    const snapPost = await getDocs(qPost);
    myPosts.value = snapPost.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  } catch (e) { console.error("Error profile:", e); } 
  finally { loadingData.value = false; }
};

onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    const routeId = route.params.id as string;
    if (routeId) {
      if (currentUser && currentUser.email === ADMIN_EMAIL) isAdmin.value = true;
      fetchUserData(routeId);
      isOwnProfile.value = currentUser ? (currentUser.uid === routeId) : false;
    } else {
      if (currentUser) {
        if (currentUser.email === ADMIN_EMAIL) isAdmin.value = true;
        fetchUserData(currentUser.uid);
        isOwnProfile.value = true;
      } else { router.push('/'); }
    }
  });
});

watch(() => route.params.id, (newId) => { if (newId) fetchUserData(newId as string); });
const editPost = (id: string) => { router.push(`/forum/edit/${id}`); };
const deletePost = async (id: string) => { if (confirm("Padam?")) { try { await deleteDoc(doc(db, "forum_posts", id)); myPosts.value = myPosts.value.filter(p => p.id !== id); } catch(e) {} } };

const openEmergency = () => { showEmergency.value = true; };

const downloadCard = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  isDownloading.value = true;
  try {
    const canvas = await html2canvas(element, { scale: 3, useCORS: true, backgroundColor: null });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${fileName}.pdf`);
  } catch (error) { alert("Gagal download."); } finally { isDownloading.value = false; }
};

const shareCard = () => { navigator.clipboard.writeText(`https://knotenup.com/user/${user.name}`); alert("Link disalin!"); };
</script>

<style scoped>
/* --- THEME BACKGROUND (DARK SUNSET + CONTOUR) --- */
.profile-page { 
  background-color: #0f172a; /* Dark Blue Base */
  min-height: 100vh; position: relative; overflow-x: hidden; color: white;
}
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

/* LAYOUT */
.profile-layout { display: grid; grid-template-columns: 320px 1fr; gap: 2rem; position: relative; z-index: 2; }

/* --- SIDEBAR (GLASS DARK) --- */
.profile-sidebar { 
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px; padding: 2rem; text-align: center; height: fit-content;
  backdrop-filter: blur(10px);
}

.avatar { width: 120px; height: 120px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.2); object-fit: cover; margin-bottom: 15px; }
.role-badge { background: #e67e22; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; display: inline-block; margin-bottom: 12px; text-transform: uppercase; }
.user-name { font-size: 1.5rem; color: white; margin: 0; font-weight: 700; }
.user-bio { color: #cbd5e1; font-size: 0.95rem; margin-top: 8px; line-height: 1.5; }

.stats-grid { display: flex; justify-content: center; gap: 25px; margin: 1.5rem 0; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 15px 0; }
.stat-item { display: flex; flex-direction: column; }
.stat-item strong { font-size: 1.3rem; color: #6c63ff; } /* Purple Stat */
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
.btn-action.emergency { border-color: #c0392b; color: #f87171; }
.btn-action.emergency:hover { background: #c0392b; color: white; }

/* --- MAIN CONTENT (GLASS DARK) --- */
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
.tabs-strip button.active { color: #6c63ff; border-bottom-color: #6c63ff; } /* Purple Active */

.content-box { 
  background: rgba(255, 255, 255, 0.03); 
  padding: 2rem; border-radius: 0 0 16px 16px; min-height: 400px; 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  backdrop-filter: blur(10px);
}

.grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }

/* Compact Card (Glass Small) */
.compact-card { 
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px; 
  transition: transform 0.2s;
}
.compact-card:hover { transform: translateY(-3px); border-color: #6c63ff; }
.compact-card.faded { opacity: 0.6; }

.cc-date { 
  background: rgba(108, 99, 255, 0.2); color: #a78bfa; /* Purple tint */
  padding: 8px 12px; border-radius: 8px; text-align: center; min-width: 60px; 
}
.d { display: block; font-weight: 800; font-size: 1.2rem; line-height: 1; }
.m { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }

.cc-info { flex: 1; }
.cc-info h4 { margin: 0 0 5px 0; font-size: 1rem; color: white; font-weight: 600; }
.cc-info p { margin: 0; font-size: 0.85rem; color: #94a3b8; }

/* Status Pills */
.status-pill { font-size: 0.7rem; padding: 3px 8px; border-radius: 4px; font-weight: bold; margin-top: 5px; display: inline-block; margin-right: 5px; }
.status-pill.open { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.status-pill.closed { background: rgba(255,255,255,0.1); color: #94a3b8; }
.status-pill.organizer { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.status-pill.participant { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }

.btn-mini { padding: 6px 12px; font-size: 0.8rem; background: #6c63ff; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-mini:hover { background: #5b54e0; }
.btn-mini.outline { background: transparent; border: 1px solid rgba(255,255,255,0.3); color: #ccc; }

/* Forum Row (Glass) */
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

.empty-text, .loading-text { text-align: center; color: #64748b; padding: 3rem; font-style: italic; }

/* --- MODAL (No Dark Theme Changes Needed for Card Logic) --- */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; justify-content: center; align-items: center; padding: 1rem; backdrop-filter: blur(8px); }
.card-modal-wrapper { background: transparent; padding: 1rem; }
.close-btn { position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #fff; z-index: 10; }
.modal-actions { padding: 1.5rem; display: flex; justify-content: center; gap: 10px; }
.share-btn { padding: 0.6rem 1.5rem; border: none; background: white; border-radius: 50px; cursor: pointer; font-weight: bold; color: #333; transition: background 0.2s; }
.share-btn:hover { background: #eee; }
.share-btn.download { background-color: #e67e22; color: white; }

/* CARD CSS KEKAL SAMA (PUTIH) UTK PRINTING */
.standard-card { width: 600px; height: 340px; background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); overflow: hidden; position: relative; display: flex; font-family: 'Helvetica Neue', sans-serif; color: #333; }
.business-card { background: #2c3e50; color: white; }
.bc-left-panel { flex: 2; padding: 30px; display: flex; flex-direction: column; justify-content: center; gap: 20px; }
.bc-profile-header { display: flex; align-items: center; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; }
.bc-avatar-square { width: 90px; height: 90px; object-fit: cover; border-radius: 8px; border: 3px solid #e67e22; background: #fff; }
.bc-texts { display: flex; flex-direction: column; }
.bc-name { font-size: 1.5rem; font-weight: 800; margin: 0; line-height: 1.1; color: white; }
.bc-role { color: #e67e22; font-size: 0.75rem; font-weight: bold; letter-spacing: 1px; margin-top: 5px; }
.bc-company { font-size: 0.9rem; color: #bdc3c7; margin: 5px 0 0 0; font-style: italic; }
.bc-ssm { font-size: 0.65rem; color: #7f8c8d; margin: 0; }
.bc-socials-list { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.bc-soc-row { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: #ecf0f1; }
.bc-soc-row img { width: 16px; height: 16px; opacity: 0.9; }
.bc-right-panel { flex: 1; background: white; display: flex; align-items: center; justify-content: center; position: relative; clip-path: polygon(15% 0, 100% 0, 100% 100%, 0% 100%); margin-left: -20px; }
.qr-container { display: flex; flex-direction: column; align-items: center; text-align: center; margin-left: 15px; }
.scan-text { font-size: 0.7rem; font-weight: bold; letter-spacing: 2px; color: #2c3e50; margin-bottom: 5px; }
.bc-qr { width: 110px; height: 110px; }
.bc-brand { font-weight: 900; font-size: 1.1rem; color: #2c3e50; margin-top: 5px; }

.emergency-card { background: #ecf0f1; border: 4px solid #c0392b; flex-direction: column; }
.ec-header { background: #c0392b; color: white; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; height: 50px; }
.ec-header h2 { margin: 0; font-size: 1.2rem; letter-spacing: 1px; }
.ec-header span { font-size: 0.8rem; opacity: 0.8; }
.ec-body { display: flex; padding: 20px; height: calc(100% - 50px); }
.ec-main { flex: 2; display: flex; flex-direction: column; justify-content: space-around; padding-right: 10px; }
.ec-side { flex: 0.8; display: flex; flex-direction: column; align-items: center; border-left: 1px dashed #bdc3c7; padding-left: 10px; }
.ec-row { border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 5px; }
.ec-row label { font-size: 0.65rem; color: #7f8c8d; display: block; }
.ec-row strong { font-size: 1rem; color: #2c3e50; }
.ec-grid { display: flex; gap: 15px; margin-bottom: 5px; }
.ec-col label { font-size: 0.65rem; color: #7f8c8d; display: block; }
.blood-type { color: #c0392b; font-size: 1.4rem; font-weight: 900; }
.ec-alert-box { background: #fadbd8; padding: 8px; border-radius: 5px; border: 1px solid #f5b7b1; }
.ec-alert-box label { font-size: 0.65rem; color: #c0392b; font-weight: bold; display: block; }
.ec-avatar { width: 80px; height: 80px; border-radius: 4px; border: 1px solid #bdc3c7; object-fit: cover; margin-bottom: 10px; }
.ec-qr-box img { width: 80px; height: 80px; opacity: 0.8; }

/* RESPONSIVE */
@media (max-width: 768px) { 
  .profile-layout { grid-template-columns: 1fr; } 
  .tabs-strip { overflow-x: auto; }
}
</style>