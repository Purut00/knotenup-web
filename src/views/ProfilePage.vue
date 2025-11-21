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
            <span><strong>{{ organizedCount }}</strong> Trip Dianjurkan</span>
            <span><strong>{{ myPosts.length }}</strong> Post Forum</span>
          </div>
        </div>
        
        <div class="action-buttons" v-if="isOwnProfile">
          <button class="btn-card" @click="showCard = true">🪪 Kad Saya</button>
          <button class="btn-edit" @click="$router.push('/profile/edit')">⚙️ Edit</button>
        </div>
        <div class="action-buttons" v-else>
           <a v-if="user.whatsapp" :href="'https://wa.me/' + user.whatsapp" target="_blank" class="btn-card">
             💬 WhatsApp
           </a>
        </div>
      </div>
    </div>

    <div class="tabs-container">
      <button class="tab-btn" :class="{ active: activeTab === 'upcoming' }" @click="activeTab = 'upcoming'">
        📅 Trip Akan Datang
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">
        📜 Sejarah Trip
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'forum' }" @click="activeTab = 'forum'">
        💬 Topik Forum
      </button>
    </div>

    <div class="content-area">
      
      <div v-if="loadingData" style="text-align: center; padding: 3rem;">
        <p>⏳ Memuatkan data...</p>
      </div>

      <div v-else>
        
        <div v-if="activeTab === 'upcoming'" class="tab-panel">
          <h2>Trip Akan Datang ({{ upcomingTrips.length }})</h2>
          <div v-if="upcomingTrips.length > 0" class="trip-list">
            <div v-for="trip in upcomingTrips" :key="trip.id" class="mini-trip-card">
              <div class="date-box"><span class="day">{{ getDay(trip.startDate) }}</span><span class="month">{{ getMonth(trip.startDate) }}</span></div>
              <div class="trip-details">
                <h3>{{ trip.title }}</h3>
                <p>📍 {{ trip.location }} • 💰 RM {{ trip.price }}</p>
                <span class="status confirmed">Buka</span>
              </div>
              <button class="btn-view" @click="$router.push('/trips/' + trip.id)">Lihat</button>
            </div>
          </div>
          <p v-else class="empty-text">Tiada trip akan datang.</p>
        </div>

        <div v-if="activeTab === 'history'" class="tab-panel">
          <h2>Sejarah Trip ({{ historyTrips.length }})</h2>
          <div v-if="historyTrips.length > 0" class="trip-list">
            <div v-for="trip in historyTrips" :key="trip.id" class="mini-trip-card faded">
              <div class="date-box"><span class="day">{{ getDay(trip.startDate) }}</span><span class="month">{{ getMonth(trip.startDate) }}</span></div>
              <div class="trip-details">
                <h3>{{ trip.title }}</h3>
                <p>📍 {{ trip.location }}</p>
                <span class="status completed">Tamat</span>
              </div>
              <button class="btn-outline" @click="$router.push('/trips/' + trip.id)">Lihat</button>
            </div>
          </div>
          <p v-else class="empty-text">Tiada sejarah trip.</p>
        </div>

        <div v-if="activeTab === 'forum'" class="tab-panel">
          <h2>Topik Forum ({{ myPosts.length }})</h2>
          <div v-if="myPosts.length > 0" class="forum-list">
            <div v-for="post in myPosts" :key="post.id" class="forum-item" @click="$router.push('/forum/' + post.id)">
              <h4>{{ post.title }}</h4>
              <p>💬 {{ post.commentCount || 0 }} Komen • ❤️ {{ post.votes || 0 }} Likes</p>
            </div>
          </div>
          <p v-else class="empty-text">Tiada topik forum.</p>
        </div>

      </div>
    </div>

    <div v-if="showCard" class="modal-overlay" @click.self="showCard = false">
      <div class="card-modal">
        <button class="close-btn" @click="showCard = false">✖</button>
        <div class="business-card">
          <div class="card-left">
            <img :src="user.avatar" class="card-avatar" />
            <h3>{{ user.name }}</h3>
            <span class="card-role">OUTDOOR ORGANIZER</span>
            <p class="card-bio">{{ user.bio }}</p>
            <div class="card-socials">
              <div v-if="user.whatsapp" class="social-row"><img src="https://cdn.simpleicons.org/whatsapp/white" class="card-icon"/> {{ user.whatsapp }}</div>
              <div v-if="user.facebook" class="social-row"><img src="https://cdn.simpleicons.org/facebook/white" class="card-icon"/> /{{ user.facebook }}</div>
            </div>
          </div>
          <div class="card-right">
            <span class="qr-label">SCAN ME</span>
            <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://knotenup.com/user/${user.name}`" class="qr-code" />
            <span class="logo-watermark">KnotenUp</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Guna Route
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const route = useRoute();
const router = useRouter();
const activeTab = ref('upcoming');
const showCard = ref(false);
const loadingData = ref(true);
const isOwnProfile = ref(false); // Flag penting!

const upcomingTrips = ref<any[]>([]);
const historyTrips = ref<any[]>([]);
const myPosts = ref<any[]>([]);

const user = reactive({
  id: '',
  name: 'Loading...', bio: '', avatar: 'https://i.pravatar.cc/300?img=3',
  whatsapp: '', facebook: '', instagram: '', tiktok: '', youtube: ''
});

const organizedCount = computed(() => upcomingTrips.value.length + historyTrips.value.length);
const getDay = (dateString: string) => { if(!dateString) return '01'; return new Date(dateString).getDate(); };
const getMonth = (dateString: string) => { if(!dateString) return 'JAN'; return new Date(dateString).toLocaleDateString('en-MY', { month: 'short' }).toUpperCase(); };

// Fungsi Utama: Tarik data berdasarkan User ID
const fetchUserData = async (targetUserId: string) => {
  loadingData.value = true;
  upcomingTrips.value = [];
  historyTrips.value = [];
  myPosts.value = [];

  try {
    // 1. Ambil Data User
    const docSnap = await getDoc(doc(db, "users", targetUserId));
    if (docSnap.exists()) {
      Object.assign(user, docSnap.data());
      user.id = targetUserId;
    } else {
      user.name = 'User Tidak Dijumpai';
    }

    // 2. Ambil Trip (Organizer == TargetID)
    const qTrip = query(collection(db, "trips"), where("organizerId", "==", targetUserId));
    const snapTrip = await getDocs(qTrip);
    const today = new Date();
    
    snapTrip.forEach(doc => {
      const data = doc.data();
      const trip = { id: doc.id, ...data };
      const tripDate = new Date(data.startDate);
      if (tripDate >= today) upcomingTrips.value.push(trip);
      else historyTrips.value.push(trip);
    });
    // Sort
    upcomingTrips.value.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    historyTrips.value.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    // 3. Ambil Post
    const qPost = query(collection(db, "forum_posts"), where("authorId", "==", targetUserId), orderBy("createdAt", "desc"));
    const snapPost = await getDocs(qPost);
    myPosts.value = snapPost.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  } catch (e) {
    console.error("Error loading profile:", e);
  } finally {
    loadingData.value = false;
  }
};

onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    // Logic menentukan siapa user sasaran
    const routeId = route.params.id as string;
    
    if (routeId) {
      // A. Ada ID di URL (Tengok profil orang)
      fetchUserData(routeId);
      // Cek adakah ini profil sendiri walaupun guna URL /user/:id
      isOwnProfile.value = currentUser ? (currentUser.uid === routeId) : false;
    } else {
      // B. Tiada ID di URL (Masuk ikut Navbar 'Profile')
      if (currentUser) {
        fetchUserData(currentUser.uid);
        isOwnProfile.value = true;
      } else {
        router.push('/'); // Tak login, tendang balik
      }
    }
  });
});

// Watch Route Change (Kalau user klik profil lain masa dah dalam page profil)
watch(() => route.params.id, (newId) => {
  if (newId) fetchUserData(newId as string);
});
</script>

<style scoped>
/* CSS SAMA SEPERTI PROFILE PAGE SEBELUM INI (Copy paste je) */
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
.btn-card { background-color: #2c3e50; color: white; border: none; text-decoration: none; text-align: center; }
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
.forum-item { padding: 1rem; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s; }
.forum-item:last-child { border-bottom: none; }
.forum-item:hover { background-color: #f9f9f9; }
.forum-item h4 { margin: 0 0 5px 0; color: #0079d3; }
.forum-item p { margin: 0; font-size: 0.8rem; color: #666; }
.empty-text { text-align: center; color: #777; margin-top: 2rem; font-style: italic; }
/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; display: flex; justify-content: center; align-items: center; padding: 1rem; backdrop-filter: blur(5px); }
.card-modal { background: white; padding: 0; border-radius: 15px; position: relative; max-width: 650px; width: 100%; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
.close-btn { position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #fff; z-index: 10; text-shadow: 0 2px 5px rgba(0,0,0,0.5); }
.modal-actions { padding: 1.5rem; display: flex; justify-content: center; background: #f9f9f9; gap: 10px; }
.share-btn { padding: 0.6rem 1.5rem; border: 1px solid #ccc; background: white; border-radius: 50px; cursor: pointer; font-weight: bold; color: #555; transition: background 0.2s; }
.share-btn:hover { background: #eee; }
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
@media (max-width: 768px) { .profile-info-container { flex-direction: column; align-items: center; text-align: center; margin-top: -70px; } .social-mini-links { justify-content: center; } .stats-row { justify-content: center; } .action-buttons { width: 100%; justify-content: center; } }
@media (max-width: 600px) { .business-card { flex-direction: column; } .card-left { padding: 2rem; text-align: center; align-items: center; } .card-bio { border-left: none; padding-left: 0; } .card-socials { align-items: center; } .card-right { padding: 2rem; border-left: none; border-top: 1px dashed #eee; } .close-btn { color: #888; top: 5px; right: 10px; } }
</style>