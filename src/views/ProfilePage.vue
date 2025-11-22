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
            <button class="btn-action card" @click="showCard = true">
              🪪 {{ t('profile.myCard') }}
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
                    <p>📍 {{ trip.location }}</p>
                    <span class="status-pill open">{{ t('trip.open') }}</span>
                  </div>
                  <button class="btn-mini" @click="$router.push('/trips/' + trip.id)">{{ t('components.view') }}</button>
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
                    <p>📍 {{ trip.location }}</p>
                    <span class="status-pill closed">Tamat</span>
                  </div>
                  <button class="btn-mini outline" @click="$router.push('/trips/' + trip.id)">{{ t('components.view') }}</button>
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
      <div class="card-modal">
        <button class="close-btn" @click="showCard = false">✖</button>
        <div class="business-card" id="capture-card">
          <div class="card-left">
            <img :src="user.avatar" class="card-avatar" crossorigin="anonymous" />
            <h3>{{ user.name }}</h3>
            <span class="card-role" v-if="user.role === 'organizer'">OUTDOOR ORGANIZER</span>
            <span class="card-role" v-else>OUTDOOR ENTHUSIAST</span>
            <p class="card-bio">{{ user.bio }}</p>
            
            <div v-if="user.role === 'organizer' && user.organizerDetails" class="org-details-box">
               <p v-if="user.organizerDetails.orgName" class="org-name-card">{{ user.organizerDetails.orgName }}</p>
               <p v-if="user.organizerDetails.ssm" class="org-meta">🏢 {{ user.organizerDetails.ssm }}</p>
               <p v-if="user.organizerDetails.license" class="org-meta">📜 {{ user.organizerDetails.license }}</p>
            </div>

            <div class="card-socials">
              <div v-if="user.whatsapp" class="social-row"><img src="https://cdn.simpleicons.org/whatsapp/white" class="card-icon"/> {{ user.whatsapp }}</div>
              <div v-if="user.facebook" class="social-row"><img src="https://cdn.simpleicons.org/facebook/white" class="card-icon"/> /{{ user.facebook }}</div>
            </div>
          </div>
          <div class="card-right">
            <span class="qr-label">SCAN ME</span>
            <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://knotenup.com/user/${user.name}`" class="qr-code" crossorigin="anonymous" />
            <span class="logo-watermark">KnotenUp</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="share-btn" @click="shareCard">🔗 Copy Link</button>
          <button class="share-btn download" @click="downloadPDF">
            {{ isDownloading ? 'Processing...' : '⬇️ Download PDF' }}
          </button>
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
import LanguageSwitcher from '../components/common/LanguageSwitcher.vue'; // Import Switcher

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const activeTab = ref('upcoming');
const showCard = ref(false);
const loadingData = ref(true);
const isOwnProfile = ref(false);
const isAdmin = ref(false);
const isDownloading = ref(false);
const isDark = ref(false); // State Dark Mode

const ADMIN_EMAIL = "knotenup@gmail.com"; 

const upcomingTrips = ref<any[]>([]);
const historyTrips = ref<any[]>([]);
const myPosts = ref<any[]>([]);

const user = reactive({
  id: '', name: 'Loading...', bio: '', avatar: 'https://i.pravatar.cc/300?img=3',
  whatsapp: '', facebook: '', instagram: '', tiktok: '', youtube: '', role: 'user',
  organizerDetails: { orgName: '', ssm: '', license: '' }
});

const organizedCount = computed(() => upcomingTrips.value.length + historyTrips.value.length);
const getDay = (dateString: string) => { if(!dateString) return '01'; return new Date(dateString).getDate(); };
const getMonth = (dateString: string) => { if(!dateString) return 'JAN'; return new Date(dateString).toLocaleDateString('en-MY', { month: 'short' }).toUpperCase(); };



const fetchUserData = async (targetUserId: string) => {
  loadingData.value = true;
  upcomingTrips.value = []; historyTrips.value = []; myPosts.value = [];
  try {
    const docSnap = await getDoc(doc(db, "users", targetUserId));
    if (docSnap.exists()) { Object.assign(user, docSnap.data()); user.id = targetUserId; if (!user.role) user.role = 'user'; } 
    else { user.name = 'User Tidak Dijumpai'; }

    const qTrip = query(collection(db, "trips"), where("organizerId", "==", targetUserId));
    const snapTrip = await getDocs(qTrip);
    const today = new Date();
    snapTrip.forEach(doc => {
      const data = doc.data(); const trip = { id: doc.id, ...data }; const tripDate = new Date(data.startDate);
      if (tripDate >= today) upcomingTrips.value.push(trip); else historyTrips.value.push(trip);
    });
    upcomingTrips.value.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const qPost = query(collection(db, "forum_posts"), where("authorId", "==", targetUserId), orderBy("createdAt", "desc"));
    const snapPost = await getDocs(qPost);
    myPosts.value = snapPost.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { console.error("Error profile:", e); } 
  finally { loadingData.value = false; }
};

onMounted(() => {
  // Cek theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') { isDark.value = true; document.body.classList.add('dark-mode'); }

  onAuthStateChanged(auth, (currentUser) => {
    const routeId = route.params.id as string;
    if (routeId) {
      fetchUserData(routeId);
      isOwnProfile.value = currentUser ? (currentUser.uid === routeId) : false;
    } else {
      if (currentUser) {
        fetchUserData(currentUser.uid);
        isOwnProfile.value = true;
        if (currentUser.email === ADMIN_EMAIL) isAdmin.value = true;
      } else { router.push('/'); }
    }
  });
});

watch(() => route.params.id, (newId) => { if (newId) fetchUserData(newId as string); });
const editPost = (id: string) => { router.push(`/forum/edit/${id}`); };
const deletePost = async (id: string) => { if (confirm("Padam?")) { try { await deleteDoc(doc(db, "forum_posts", id)); myPosts.value = myPosts.value.filter(p => p.id !== id); } catch(e) {} } };
const downloadPDF = async () => {
  const element = document.getElementById('capture-card');
  if (!element) return; isDownloading.value = true;
  try { const canvas = await html2canvas(element, { scale: 3, useCORS: true }); const imgData = canvas.toDataURL('image/png'); const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] }); pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height); pdf.save(`KnotenUp-Card-${user.name}.pdf`); } catch (error) { alert("Gagal download."); } finally { isDownloading.value = false; }
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

/* --- SETTINGS BOX (NEW) --- */
.settings-box { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #eee; text-align: left; }
.settings-box h3 { font-size: 1rem; color: var(--heading-color, #333); margin-bottom: 1rem; }
.setting-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; font-size: 0.9rem; color: var(--text-color, #555); }

/* Toggle Switch */
.switch { position: relative; display: inline-block; width: 40px; height: 22px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px; }
.slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
input:checked + .slider { background-color: #2c3e50; }
input:checked + .slider:before { transform: translateX(18px); }

/* --- MAIN CONTENT --- */
.profile-main { display: flex; flex-direction: column; gap: 1rem; }
.tabs-strip { background: var(--card-bg, white); padding: 0 1rem; border-radius: 8px 8px 0 0; border-bottom: 1px solid #eee; display: flex; gap: 20px; }
.tabs-strip button { background: none; border: none; padding: 1rem 0; font-size: 0.95rem; color: #777; font-weight: bold; cursor: pointer; border-bottom: 3px solid transparent; }
.tabs-strip button.active { color: #e67e22; border-bottom-color: #e67e22; }

.content-box { background: var(--card-bg, white); padding: 1.5rem; border-radius: 0 0 8px 8px; min-height: 300px; border: 1px solid var(--border-color, #eee); border-top: none; }
.grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }

/* Compact Card */
.compact-card { border: 1px solid #eee; border-radius: 6px; padding: 10px; display: flex; align-items: center; gap: 10px; background: #fff; }
.compact-card.faded { opacity: 0.7; }
.cc-date { background: #f0f8ff; padding: 5px 10px; border-radius: 4px; text-align: center; min-width: 50px; }
.d { display: block; font-weight: bold; font-size: 1.1rem; color: #2c3e50; }
.m { font-size: 0.7rem; color: #7f8c8d; }
.cc-info { flex: 1; }
.cc-info h4 { margin: 0 0 3px 0; font-size: 0.95rem; color: #333; }
.cc-info p { margin: 0; font-size: 0.8rem; color: #777; }
.status-pill { font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; margin-top: 3px; display: inline-block; }
.status-pill.open { background: #d4edda; color: #155724; }
.status-pill.closed { background: #e2e3e5; color: #383d41; }
.btn-mini { padding: 5px 10px; font-size: 0.8rem; background: #2c3e50; color: white; border: none; border-radius: 4px; cursor: pointer; }
.btn-mini.outline { background: transparent; border: 1px solid #ccc; color: #555; }

/* Forum Row */
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
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; display: flex; justify-content: center; align-items: center; padding: 1rem; backdrop-filter: blur(5px); }
.card-modal { background: white; padding: 0; border-radius: 15px; position: relative; max-width: 650px; width: 100%; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
.close-btn { position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #fff; z-index: 10; text-shadow: 0 2px 5px rgba(0,0,0,0.5); }
.modal-actions { padding: 1.5rem; display: flex; justify-content: center; background: #f9f9f9; gap: 10px; }
.share-btn { padding: 0.6rem 1.5rem; border: 1px solid #ccc; background: white; border-radius: 50px; cursor: pointer; font-weight: bold; color: #555; transition: background 0.2s; }
.share-btn:hover { background: #eee; }
.share-btn.download { background-color: #e67e22; color: white; border: none; }
.business-card { display: flex; min-height: 280px; }
.card-left { flex: 1.6; padding: 2.5rem 2rem; background-color: #2c3e50; color: white; display: flex; flex-direction: column; justify-content: center; }
.card-right { flex: 1; background: white; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; border-left: 1px dashed #eee; }
.card-avatar { width: 70px; height: 70px; border-radius: 50%; border: 3px solid white; margin-bottom: 1rem; object-fit: cover; }
.card-left h3 { margin: 0; font-size: 1.6rem; font-weight: 700; line-height: 1.2; }
.card-role { color: #e67e22; font-weight: bold; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 1rem; display: block; }
.card-bio { font-size: 0.85rem; color: #bdc3c7; margin-bottom: 1.5rem; line-height: 1.5; border-left: 3px solid #e67e22; padding-left: 10px; }
.card-socials { display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem; }
.social-row { display: flex; align-items: center; gap: 10px; opacity: 0.9; }
.card-icon { width: 18px; height: 18px; }
.qr-label { font-weight: bold; margin-bottom: 15px; font-size: 0.7rem; letter-spacing: 2px; color: #555; }
.qr-code { width: 140px; height: 140px; }
.logo-watermark { margin-top: 15px; font-weight: 900; color: #2c3e50; font-size: 1.3rem; }
.org-details-box { margin-bottom: 1.5rem; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); }
.org-name-card { font-weight: bold; color: #f39c12; font-size: 1rem; margin-bottom: 5px; }
.org-meta { font-size: 0.8rem; color: #bdc3c7; margin: 2px 0; }

@media (max-width: 768px) { 
  .profile-layout { grid-template-columns: 1fr; } 
  .tabs-strip { justify-content: flex-start; overflow-x: auto; } 
}
@media (max-width: 600px) { 
  .business-card { flex-direction: column; } 
  .card-left { padding: 2rem; text-align: center; align-items: center; } 
  .card-bio { border-left: none; padding-left: 0; } 
  .card-socials { align-items: center; } 
  .card-right { padding: 2rem; border-left: none; border-top: 1px dashed #eee; } 
  .close-btn { color: #888; top: 5px; right: 10px; } 
}
</style>