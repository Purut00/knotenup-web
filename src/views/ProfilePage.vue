<template>
  <div class="profile-page">
    
    <div class="profile-header">
      <div class="cover-photo"></div>
      <div class="profile-info-container">
        <div class="avatar-container">
          <img :src="user.avatar" alt="User Avatar" class="avatar" />
          <span class="role-badge organizer">Organizer</span>
        </div>
        <div class="info-text">
          <h1>{{ user.name }} <span class="verification">✅</span></h1>
          <p class="bio">{{ user.bio || 'Tiada bio.' }}</p>
          
          <div class="social-mini-links">
             <a v-if="user.whatsapp" :href="'https://wa.me/' + user.whatsapp" target="_blank"><img src="https://cdn.simpleicons.org/whatsapp/25D366" alt="WA"/></a>
             <a v-if="user.facebook" :href="'https://facebook.com/' + user.facebook" target="_blank"><img src="https://cdn.simpleicons.org/facebook/1877F2" alt="FB"/></a>
             <a v-if="user.instagram" :href="'https://instagram.com/' + user.instagram" target="_blank"><img src="https://cdn.simpleicons.org/instagram/E4405F" alt="IG"/></a>
             <a v-if="user.tiktok" :href="'https://tiktok.com/@' + user.tiktok" target="_blank"><img src="https://cdn.simpleicons.org/tiktok/000000" alt="TT"/></a>
             <a v-if="user.youtube" :href="'https://youtube.com/' + user.youtube" target="_blank"><img src="https://cdn.simpleicons.org/youtube/FF0000" alt="YT"/></a>
          </div>

          <div class="stats-row">
            <span><strong>{{ organizedCount }}</strong> {{ t('profile.tripsOrganized') }}</span>
            <span><strong>{{ myPosts.length }}</strong> {{ t('profile.posts') }}</span>
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="btn-card" @click="showCard = true">🪪 {{ t('profile.myCard') }}</button>
          <button class="btn-edit" @click="$router.push('/profile/edit')">⚙️ {{ t('profile.editProfile') }}</button>
        </div>
      </div>
    </div>

    <div class="tabs-container">
      <button class="tab-btn" :class="{ active: activeTab === 'upcoming' }" @click="activeTab = 'upcoming'">📅 {{ t('profile.tabUpcoming') }}</button>
      <button class="tab-btn" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">📜 {{ t('profile.tabHistory') }}</button>
      <button class="tab-btn" :class="{ active: activeTab === 'forum' }" @click="activeTab = 'forum'">💬 {{ t('profile.tabPosts') }}</button>
    </div>

    <div class="content-area">
      <div v-if="loadingData" style="text-align: center; padding: 3rem;"><p>⏳ {{ t('common.loading') }}</p></div>
      <div v-else>
        <div v-if="activeTab === 'upcoming'" class="tab-panel">
          <h2>{{ t('profile.tabUpcoming') }} ({{ upcomingTrips.length }})</h2>
          <div v-if="upcomingTrips.length > 0" class="trip-list">
            <div v-for="trip in upcomingTrips" :key="trip.id" class="mini-trip-card">
              <div class="date-box"><span class="day">{{ getDay(trip.startDate) }}</span><span class="month">{{ getMonth(trip.startDate) }}</span></div>
              <div class="trip-details">
                <h3>{{ trip.title }}</h3>
                <p>📍 {{ trip.location }} • 💰 RM {{ trip.price }}</p>
                <span class="status confirmed">{{ t('trip.open') }}</span>
              </div>
              <button class="btn-view" @click="$router.push('/trips/' + trip.id)">{{ t('components.viewDetails') }}</button>
            </div>
          </div>
          <p v-else class="empty-text">Tiada trip akan datang.</p>
        </div>

        <div v-if="activeTab === 'history'" class="tab-panel">
          <h2>{{ t('profile.tabHistory') }} ({{ historyTrips.length }})</h2>
          <div v-if="historyTrips.length > 0" class="trip-list">
            <div v-for="trip in historyTrips" :key="trip.id" class="mini-trip-card faded">
              <div class="date-box"><span class="day">{{ getDay(trip.startDate) }}</span><span class="month">{{ getMonth(trip.startDate) }}</span></div>
              <div class="trip-details">
                <h3>{{ trip.title }}</h3>
                <p>📍 {{ trip.location }}</p>
                <span class="status completed">Selesai</span>
              </div>
              <button class="btn-outline" @click="$router.push('/trips/' + trip.id)">Lihat</button>
            </div>
          </div>
          <p v-else class="empty-text">Tiada sejarah trip.</p>
        </div>

        <div v-if="activeTab === 'forum'" class="tab-panel">
          <h2>{{ t('profile.tabPosts') }} ({{ myPosts.length }})</h2>
          <div v-if="myPosts.length > 0" class="forum-list">
            <div v-for="post in myPosts" :key="post.id" class="forum-item" @click="$router.push('/forum/' + post.id)">
              <div class="forum-content-left">
                <h4>{{ post.title }}</h4>
                <p>💬 {{ post.commentCount || 0 }} {{ t('forum.comments') }} • ❤️ {{ post.votes || 0 }} Likes</p>
              </div>
              <div class="forum-actions">
                <button @click.stop="editPost(post.id)" class="action-icon edit">✏️</button>
                <button @click.stop="deletePost(post.id)" class="action-icon delete">🗑️</button>
              </div>
            </div>
          </div>
          <p v-else class="empty-text">Tiada post forum.</p>
        </div>
      </div>
    </div>

    <div v-if="showCard" class="modal-overlay" @click.self="showCard = false">
      <div class="card-modal">
        <button class="close-btn" @click="showCard = false">✖</button>
        
        <div class="business-card" id="capture-card">
          <div class="card-left">
            <img :src="user.avatar" class="card-avatar" crossorigin="anonymous" />
            <h3>{{ user.name }}</h3>
            <span class="card-role">OUTDOOR ORGANIZER</span>
            <p class="card-bio">{{ user.bio }}</p>
            <div class="card-socials">
              <div v-if="user.whatsapp" class="social-row"><img src="https://cdn.simpleicons.org/whatsapp/white" class="card-icon"/> {{ user.whatsapp }}</div>
              <div v-if="user.facebook" class="social-row"><img src="https://cdn.simpleicons.org/facebook/white" class="card-icon"/> /{{ user.facebook }}</div>
              <div v-if="user.instagram" class="social-row"><img src="https://cdn.simpleicons.org/instagram/white" class="card-icon"/> @{{ user.instagram }}</div>
              <div v-if="user.tiktok" class="social-row"><img src="https://cdn.simpleicons.org/tiktok/white" class="card-icon"/> @{{ user.tiktok }}</div>
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
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, orderBy, deleteDoc } from 'firebase/firestore';

// Import PDF Tools
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const { t } = useI18n();
const router = useRouter();
const activeTab = ref('upcoming');
const showCard = ref(false);
const loadingData = ref(true);
const isDownloading = ref(false);

const upcomingTrips = ref<any[]>([]);
const historyTrips = ref<any[]>([]);
const myPosts = ref<any[]>([]);

const user = reactive({
  name: 'Loading...', bio: '', avatar: 'https://i.pravatar.cc/300?img=3',
  whatsapp: '', facebook: '', instagram: '', tiktok: '', youtube: ''
});

const organizedCount = computed(() => upcomingTrips.value.length + historyTrips.value.length);

// --- PDF DOWNLOAD LOGIC ---
const downloadPDF = async () => {
  const element = document.getElementById('capture-card');
  if (!element) return;

  isDownloading.value = true;
  try {
    // 1. Tangkap gambar kad (High Quality)
    const canvas = await html2canvas(element, { 
      scale: 3, // Kualiti tinggi
      useCORS: true // Benarkan gambar luar (avatar/qr)
    });

    // 2. Setup PDF Landscape
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height] // Saiz PDF ikut saiz kad
    });

    // 3. Masukkan gambar dan simpan
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`KnotenUp-Card-${user.name}.pdf`);
  
  } catch (error) {
    console.error("Gagal download PDF:", error);
    alert("Gagal download. Sila cuba lagi.");
  } finally {
    isDownloading.value = false;
  }
};
// --------------------------

// Logic Delete & Edit (Sama macam sebelum ni)
const editPost = (id: string) => { router.push(`/forum/edit/${id}`); };
const deletePost = async (id: string) => {
  if (confirm("Padam topik ini?")) {
    try { await deleteDoc(doc(db, "forum_posts", id)); myPosts.value = myPosts.value.filter(p => p.id !== id); alert("Dipadam."); }
    catch(e) { alert("Gagal."); }
  }
};

const getDay = (dateString: string) => { if(!dateString) return '01'; return new Date(dateString).getDate(); };
const getMonth = (dateString: string) => { if(!dateString) return 'JAN'; return new Date(dateString).toLocaleDateString('en-MY', { month: 'short' }).toUpperCase(); };

onMounted(() => {
  onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      // Profile
      try {
        const docSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (docSnap.exists()) Object.assign(user, docSnap.data());
        else { user.name = currentUser.displayName || 'User'; user.avatar = currentUser.photoURL || ''; }
      } catch (e) {}

      // Trips
      try {
        const qTrip = query(collection(db, "trips"), where("organizerId", "==", currentUser.uid));
        const snapTrip = await getDocs(qTrip);
        const today = new Date();
        snapTrip.forEach(doc => {
          const data = doc.data();
          const trip = { id: doc.id, ...data };
          const tripDate = new Date(data.startDate);
          if (tripDate >= today) upcomingTrips.value.push(trip); else historyTrips.value.push(trip);
        });
        upcomingTrips.value.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      } catch (e) {}

      // Forum
      try {
        const qPost = query(collection(db, "forum_posts"), where("authorId", "==", currentUser.uid), orderBy("createdAt", "desc"));
        const snapPost = await getDocs(qPost);
        myPosts.value = snapPost.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (e) {}

      loadingData.value = false;
    }
  });
});

const shareCard = () => {
  navigator.clipboard.writeText(`https://knotenup.com/user/${user.name}`);
  alert("Link disalin!");
};
</script>

<style scoped>
/* CSS KEKAL SAMA - Gunakan style penuh anda */
.profile-page { background-color: #f4f6f8; min-height: 100vh; }
.profile-header { background: white; border-bottom: 1px solid #ddd; }
.cover-photo { height: 200px; background-image: url('https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80'); background-size: cover; background-position: center; }
.profile-info-container { max-width: 1000px; margin: 0 auto; padding: 0 2rem 2rem 2rem; display: flex; align-items: flex-end; gap: 2rem; margin-top: -50px; position: relative; }
.avatar-container { position: relative; }
.avatar { width: 140px; height: 140px; border-radius: 50%; border: 5px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); background: #fff; object-fit: cover; }
.role-badge { position: absolute; bottom: 10px; right: 0; background-color: #e67e22; color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; border: 2px solid white; }
.info-text { flex-grow: 1; padding-bottom: 0.5rem; }
.info-text h1 { margin: 0; color: #2c3e50; display: flex; align-items: center; gap: 5px; font-size: 1.8rem; }
.verification { font-size: 1rem; }
.bio { color: #666; margin: 5px 0 10px 0; font-size: 0.95rem; }
.stats-row { display: flex; gap: 1.5rem; font-size: 0.9rem; color: #555; margin-top: 1rem; }
.social-mini-links { display: flex; gap: 12px; margin-top: 8px; }
.social-mini-links img { width: 24px; height: 24px; transition: transform 0.2s; }
.social-mini-links a:hover img { transform: scale(1.1); }
.action-buttons { display: flex; gap: 10px; }
.btn-edit, .btn-card { padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: bold; margin-bottom: 1rem; font-size: 0.9rem; transition: background 0.2s; }
.btn-edit { border: 1px solid #ccc; background: white; color: #333; }
.btn-edit:hover { background-color: #f9f9f9; }
.btn-card { background-color: #2c3e50; color: white; border: none; }
.btn-card:hover { background-color: #1a252f; }
.tabs-container { background: white; padding: 0 2rem; border-bottom: 1px solid #eee; display: flex; justify-content: center; gap: 2rem; }
.tab-btn { background: none; border: none; padding: 1rem 0.5rem; font-size: 1rem; color: #777; cursor: pointer; border-bottom: 3px solid transparent; font-weight: 600; }
.tab-btn.active { color: #e67e22; border-bottom-color: #e67e22; }
.content-area { max-width: 1000px; margin: 2rem auto; padding: 0 1rem; }
.tab-panel h2 { font-size: 1.2rem; margin-bottom: 1rem; color: #333; }
.trip-list { display: flex; flex-direction: column; gap: 1rem; }
.mini-trip-card { background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 1rem; border: 1px solid #eee; }
.faded { opacity: 0.7; }
.date-box { background-color: #f0f3f4; padding: 0.5rem 1rem; border-radius: 8px; text-align: center; min-width: 60px; }
.date-box .day { display: block; font-size: 1.2rem; font-weight: bold; color: #2c3e50; }
.date-box .month { display: block; font-size: 0.8rem; color: #7f8c8d; }
.trip-details { flex-grow: 1; }
.trip-details h3 { margin: 0 0 5px 0; color: #333; }
.trip-details p { margin: 0; font-size: 0.9rem; color: #666; }
.status { display: inline-block; margin-top: 5px; font-size: 0.75rem; font-weight: bold; padding: 2px 8px; border-radius: 4px; }
.status.confirmed { background-color: #d4edda; color: #155724; }
.status.pending { background-color: #fff3cd; color: #856404; }
.status.completed { background-color: #e2e3e5; color: #383d41; }
.btn-view, .btn-outline { padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-size: 0.9rem; }
.btn-view { background-color: #3498db; color: white; border: none; }
.btn-outline { background: white; border: 1px solid #ccc; }
.forum-list { background: white; border-radius: 8px; border: 1px solid #eee; overflow: hidden; }
.forum-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s; }
.forum-item:hover { background-color: #f9f9f9; }
.forum-content-left { flex-grow: 1; }
.forum-actions { display: flex; gap: 10px; }
.action-icon { background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 5px; border-radius: 4px; transition: background 0.2s; }
.action-icon.edit:hover { background-color: #d4edda; }
.action-icon.delete:hover { background-color: #f8d7da; }
.forum-item h4 { margin: 0 0 5px 0; color: #0079d3; }
.forum-item p { margin: 0; font-size: 0.8rem; color: #666; }
.empty-text { text-align: center; color: #777; margin-top: 2rem; font-style: italic; }
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
/* --- RESPONSIVE PROFILE --- */
@media (max-width: 768px) {
  /* Header Profile */
  .profile-info-container {
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: -70px;
    padding: 0 1rem 2rem 1rem;
  }

  .info-text h1 {
    justify-content: center; /* Centerkan nama */
    font-size: 1.5rem;
  }

  /* Social Icons Center */
  .social-mini-links {
    justify-content: center;
  }

  /* Stats (Jumlah Trip) Center & Wrap */
  .stats-row {
    justify-content: center;
    flex-wrap: wrap; /* Kalau panjang sangat, turun bawah */
    gap: 1rem;
  }

  /* Butang Action */
  .action-buttons {
    width: 100%;
    justify-content: center;
    margin-top: 1rem;
  }

  /* Tabs (Scroll Tepi) */
  .tabs-container {
    justify-content: flex-start;
    overflow-x: auto;
    white-space: nowrap;
  }
  
  /* Kad Bisnes Jadi Memanjang */
  .business-card {
    flex-direction: column;
  }
  .card-left {
    text-align: center;
    align-items: center;
    padding: 2rem 1rem;
  }
  .card-bio {
    border-left: none;
    padding-left: 0;
  }
  .card-right {
    border-left: none;
    border-top: 1px dashed #eee;
    padding: 2rem;
  }
}@media (max-width: 600px) { .business-card { flex-direction: column; } .card-left { padding: 2rem; text-align: center; align-items: center; } .card-bio { border-left: none; padding-left: 0; } .card-socials { align-items: center; } .card-right { padding: 2rem; border-left: none; border-top: 1px dashed #eee; } .close-btn { color: #888; top: 5px; right: 10px; } }
</style>