<template>
  <div class="profile-page">
    <div class="container profile-layout">
      
      <aside class="profile-sidebar">
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
             <a v-if="user.tiktok" :href="'https://tiktok.com/@' + user.tiktok" target="_blank"><img src="https://cdn.simpleicons.org/tiktok/000000" /></a>
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
              ⚙️ {{ t('profile.editProfile') }}
            </button>
          </div>

          <div class="action-stack" v-else>
             <a v-if="user.whatsapp" :href="'https://wa.me/' + user.whatsapp" target="_blank" class="btn-action contact">
               📞 WhatsApp
             </a>
          </div>

          <div class="settings-box">
            <h3>Tetapan Aplikasi</h3>
            <div class="setting-row">
              <span>Bahasa:</span>
              <LanguageSwitcher />
            </div>
          </div>

        </div>
      </aside>

      <main class="profile-main">
        <div class="tabs-strip">
          <button :class="{ active: activeTab === 'upcoming' }" @click="activeTab = 'upcoming'">
            📅 {{ t('profile.tabUpcoming') }}
          </button>
          <button :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">
            📜 {{ t('profile.tabHistory') }}
          </button>
          <button :class="{ active: activeTab === 'forum' }" @click="activeTab = 'forum'">
            💬 {{ t('profile.tabPosts') }}
          </button>
        </div>

        <div class="content-box">
          <div v-if="loadingData" class="loading-text">⏳ {{ t('common.loading') }}</div>
          
          <div v-else>
            <div v-if="activeTab === 'upcoming'">
              <div v-if="upcomingTrips.length > 0" class="grid-layout">
                <div v-for="trip in upcomingTrips" :key="trip.id" class="compact-card">
                  <div class="cc-date">
                    <span class="d">{{ getDay(trip.startDate) }}</span>
                    <span class="m">{{ getMonth(trip.startDate) }}</span>
                  </div>
                  <div class="cc-info">
                    <h4>{{ trip.title }}</h4>
                    <p>📍 {{ trip.destination || trip.location }}</p>
                    
                    <span v-if="trip.organizerId === user.id" class="status-pill organizer">Organizer</span>
                    <span v-else class="status-pill participant">Peserta</span>
                    
                    <span class="status-pill open">{{ t('trip.open') }}</span>
                  </div>
                  <button class="btn-mini" @click="$router.push('/trips/' + trip.id)">
                    {{ t('common.view') }}
                  </button>
                </div>
              </div>
              <div v-else class="empty-text">Tiada trip akan datang.</div>
            </div>

            <div v-if="activeTab === 'history'">
              <div v-if="historyTrips.length > 0" class="grid-layout">
                <div v-for="trip in historyTrips" :key="trip.id" class="compact-card faded">
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
                    {{ t('common.view') }}
                  </button>
                </div>
              </div>
              <div v-else class="empty-text">Tiada sejarah trip.</div>
            </div>

            <div v-if="activeTab === 'forum'">
              <div v-if="myPosts.length > 0" class="forum-layout">
                <div v-for="post in myPosts" :key="post.id" class="forum-row" @click="$router.push('/forum/' + post.id)">
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
import LanguageSwitcher from '../components/common/LanguageSwitcher.vue';

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
const isDark = ref(false);

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
    // 1. Fetch PUBLIC User Data (Sesiapa boleh baca)
    const docSnap = await getDoc(doc(db, "users", targetUserId));
    if (docSnap.exists()) { 
        const data = docSnap.data();
        Object.assign(user, data); 
        user.id = targetUserId; 
        if (!user.role) user.role = 'user'; 
        if (!user.organizerDetails) user.organizerDetails = { orgName: '', ssm: '', license: '' };
    } 
    else { user.name = 'User Tidak Dijumpai'; }

    // 🔥 2. Fetch PRIVATE Data (Hanya jika Owner atau Admin)
    // Reset data sensitif dulu supaya tak paparkan data user sebelum ni
    user.bloodType = ''; user.allergies = ''; user.emergencyContact = '';

    const currentUser = auth.currentUser;
    // Cek: Adakah yang login ni Owner atau Admin?
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
       } catch (err) {
         // Kalau permission denied (Rules block), dia akan masuk sini. Selamat.
         console.log("Akses data peribadi disekat (Bukan Owner).");
       }
    }

    // 3. FETCH TRIPS (GABUNGAN ORGANIZER + PARTICIPANT)
    const tripMap = new Map();
    // A. Cari Trip di mana user adalah Organizer
    const qOrganizer = query(collection(db, "trips"), where("organizerId", "==", targetUserId));
    const snapOrganizer = await getDocs(qOrganizer);
    snapOrganizer.forEach(doc => tripMap.set(doc.id, { id: doc.id, ...doc.data() }));

    // B. Cari Trip di mana user adalah Peserta
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

    // 4. Fetch Forum Posts
    const qPost = query(collection(db, "forum_posts"), where("authorId", "==", targetUserId), orderBy("createdAt", "desc"));
    const snapPost = await getDocs(qPost);
    myPosts.value = snapPost.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  } catch (e) { console.error("Error profile:", e); } 
  finally { loadingData.value = false; }
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') { isDark.value = true; document.body.classList.add('dark-mode'); }

  onAuthStateChanged(auth, (currentUser) => {
    const routeId = route.params.id as string;
    if (routeId) {
      // Periksa admin status
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

const openEmergency = () => {
    showEmergency.value = true;
};

// DOWNLOAD PDF
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
  } catch (error) { 
    console.error("Error download:", error);
    alert("Gagal download. Sila pastikan 'html2canvas' & 'jspdf' diinstall."); 
  } finally { 
    isDownloading.value = false; 
  }
};

const shareCard = () => { navigator.clipboard.writeText(`https://knotenup.com/user/${user.name}`); alert("Link disalin!"); };
</script>

<style scoped>
/* --- VARS & LAYOUT --- */
.profile-page { background-color: var(--bg-color, #f4f6f8); min-height: 100vh; padding: 2rem 0; color: var(--text-color, #333); }
.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
.profile-layout { display: grid; grid-template-columns: 300px 1fr; gap: 1.5rem; }
.profile-sidebar { background: var(--card-bg, white); border-radius: 8px; border: 1px solid var(--border-color, #eee); padding: 2rem; text-align: center; height: fit-content; }

/* --- SIDEBAR ELEMENTS --- */
.avatar { width: 100px; height: 100px; border-radius: 50%; border: 3px solid #eee; object-fit: cover; margin-bottom: 10px; }
.role-badge { background: #e67e22; color: white; padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: bold; display: inline-block; margin-bottom: 10px; }
.user-name { font-size: 1.3rem; color: var(--heading-color, #2c3e50); margin: 0; }
.user-bio { color: #777; font-size: 0.9rem; margin-top: 5px; line-height: 1.4; }
.stats-grid { display: flex; justify-content: center; gap: 20px; margin: 1.5rem 0; border-top: 1px dashed #eee; border-bottom: 1px dashed #eee; padding: 10px 0; }
.stat-item { display: flex; flex-direction: column; }
.stat-item strong { font-size: 1.2rem; color: #27ae60; }
.stat-item span { font-size: 0.8rem; color: #999; }
.social-links { display: flex; justify-content: center; gap: 10px; margin-bottom: 1.5rem; }
.social-links img { width: 20px; transition: transform 0.2s; }
.social-links a:hover img { transform: scale(1.2); }
.action-stack { display: flex; flex-direction: column; gap: 8px; }
.btn-action { width: 100%; padding: 0.6rem; border: 1px solid #ddd; background: white; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
.btn-action:hover { background: #f9f9f9; border-color: #ccc; }
.btn-action.upgrade { background: #27ae60; color: white; border: none; }
.btn-action.admin { background: #e74c3c; color: white; border: none; }
.btn-action.contact { background: #25D366; color: white; border: none; }
.btn-action.emergency { background: #fff; border: 1px solid #c0392b; color: #c0392b; }
.btn-action.emergency:hover { background: #c0392b; color: white; }

/* --- SETTINGS BOX --- */
.settings-box { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #eee; text-align: left; }
.settings-box h3 { font-size: 1rem; color: var(--heading-color, #333); margin-bottom: 1rem; }
.setting-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; font-size: 0.9rem; color: var(--text-color, #555); }

/* --- MAIN CONTENT --- */
.profile-main { display: flex; flex-direction: column; gap: 1rem; }
.tabs-strip { background: var(--card-bg, white); padding: 0 1rem; border-radius: 8px 8px 0 0; border-bottom: 1px solid #eee; display: flex; gap: 20px; }
.tabs-strip button { background: none; border: none; padding: 1rem 0; font-size: 0.95rem; color: #777; font-weight: bold; cursor: pointer; border-bottom: 3px solid transparent; }
.tabs-strip button.active { color: #e67e22; border-bottom-color: #e67e22; }
.content-box { background: var(--card-bg, white); padding: 1.5rem; border-radius: 0 0 8px 8px; min-height: 300px; border: 1px solid var(--border-color, #eee); border-top: none; }
.grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
.compact-card { border: 1px solid #eee; border-radius: 6px; padding: 10px; display: flex; align-items: center; gap: 10px; background: #fff; }
.compact-card.faded { opacity: 0.7; }
.cc-date { background: #f0f8ff; padding: 5px 10px; border-radius: 4px; text-align: center; min-width: 50px; }
.d { display: block; font-weight: bold; font-size: 1.1rem; color: #2c3e50; }
.m { font-size: 0.7rem; color: #7f8c8d; }
.cc-info { flex: 1; }
.cc-info h4 { margin: 0 0 3px 0; font-size: 0.95rem; color: #333; }
.cc-info p { margin: 0; font-size: 0.8rem; color: #777; }
/* 🔥 NEW STATUS PILL STYLE 🔥 */
.status-pill { font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; margin-top: 3px; display: inline-block; margin-right: 5px; }
.status-pill.open { background: #d4edda; color: #155724; }
.status-pill.closed { background: #e2e3e5; color: #383d41; }
.status-pill.organizer { background: #cce5ff; color: #004085; }
.status-pill.participant { background: #fff3cd; color: #856404; }

.btn-mini { padding: 5px 10px; font-size: 0.8rem; background: #2c3e50; color: white; border: none; border-radius: 4px; cursor: pointer; }
.btn-mini.outline { background: transparent; border: 1px solid #ccc; color: #555; }
.forum-layout { display: flex; flex-direction: column; gap: 0; }
.forum-row { padding: 1rem 0; border-bottom: 1px dashed #eee; display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
.forum-row:last-child { border: none; }
.forum-row:hover h4 { color: #e67e22; }
.fr-content h4 { margin: 0 0 5px 0; font-size: 1rem; }
.fr-content span { font-size: 0.8rem; color: #888; }
.fr-actions button { background: none; border: none; cursor: pointer; font-size: 1rem; padding: 5px; }
.fr-actions button.del:hover { background: #ffebee; border-radius: 4px; }
.empty-text, .loading-text { text-align: center; color: #999; padding: 2rem; font-style: italic; }

/* --- MODAL & CARD --- */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; justify-content: center; align-items: center; padding: 1rem; backdrop-filter: blur(5px); }
.card-modal-wrapper { background: transparent; padding: 1rem; }
.close-btn { position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #fff; z-index: 10; text-shadow: 0 2px 5px rgba(0,0,0,0.5); }
.modal-actions { padding: 1.5rem; display: flex; justify-content: center; gap: 10px; }
.share-btn { padding: 0.6rem 1.5rem; border: 1px solid #ccc; background: white; border-radius: 50px; cursor: pointer; font-weight: bold; color: #555; transition: background 0.2s; }
.share-btn:hover { background: #eee; }
.share-btn.download { background-color: #e67e22; color: white; border: none; }

/* 🔥 STANDARD CARD CSS (Fixed Size 600x340) 🔥 */
.standard-card { width: 600px; height: 340px; background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); overflow: hidden; position: relative; display: flex; font-family: 'Helvetica Neue', sans-serif; }

/* 1. BUSINESS CARD STYLE */
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

/* 2. EMERGENCY CARD STYLE */
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

/* RESPONSIVE FOR MOBILE */
@media (max-width: 768px) { 
  .profile-layout { grid-template-columns: 1fr; } 
}
@media (max-width: 650px) {
  .standard-card { width: 340px; height: auto; flex-direction: column; }
  .business-card { height: auto; }
  .bc-left-panel { padding: 20px; }
  .bc-right-panel { clip-path: none; margin-left: 0; padding: 20px; border-top: 5px solid #e67e22; }
  .qr-container { margin-left: 0; }
  .bc-socials-list { grid-template-columns: 1fr; }
  .emergency-card { height: auto; }
  .ec-body { flex-direction: column-reverse; gap: 15px; }
  .ec-side { border-left: none; border-bottom: 1px dashed #bdc3c7; padding-bottom: 15px; margin-bottom: 10px; flex-direction: row; justify-content: space-around; }
  .close-btn { color: #888; top: 5px; right: 10px; } 
}
</style>