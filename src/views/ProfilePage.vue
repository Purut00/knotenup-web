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
          <p class="bio">{{ user.bio }}</p>
          
          <div class="social-mini-links">
             <a v-if="user.facebook" :href="'https://fb.com/'+user.facebook" target="_blank">📘</a>
             <a v-if="user.instagram" :href="'https://instagram.com/'+user.instagram" target="_blank">📸</a>
             <a v-if="user.whatsapp" :href="'https://wa.me/'+user.whatsapp" target="_blank">📞</a>
          </div>

          <div class="stats-row">
            <span><strong>12</strong> Trip Disertai</span>
            <span><strong>5</strong> Trip Dianjurkan</span>
            <span><strong>45</strong> Post Forum</span>
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="btn-card" @click="showCard = true">🪪 My Card</button>
          <button class="btn-edit" @click="$router.push('/profile/edit')">⚙️ Edit</button>
        </div>
      </div>
    </div>

    <div class="tabs-container">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'upcoming' }" 
        @click="activeTab = 'upcoming'"
      >
        📅 Trip Akan Datang
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'history' }" 
        @click="activeTab = 'history'"
      >
        📜 Sejarah Trip
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'forum' }" 
        @click="activeTab = 'forum'"
      >
        💬 Post Saya
      </button>
    </div>

    <div class="content-area">
      
      <div v-if="activeTab === 'upcoming'" class="tab-panel">
        <h2>Trip Yang Bakal Disertai / Dianjurkan</h2>
        <div class="trip-list">
          <div class="mini-trip-card">
            <div class="date-box">
              <span class="day">12</span>
              <span class="month">DIS</span>
            </div>
            <div class="trip-details">
              <h3>Ekspedisi Gunung Tahan</h3>
              <p>📍 Pahang • 👨‍✈️ Organizer: Kembara Malaya</p>
              <span class="status confirmed">Disahkan</span>
            </div>
            <button class="btn-view">Lihat Tiket</button>
          </div>

          <div class="mini-trip-card">
            <div class="date-box">
              <span class="day">15</span>
              <span class="month">JAN</span>
            </div>
            <div class="trip-details">
              <h3>Camping Santai Sungai Chiling</h3>
              <p>📍 Selangor • 👨‍✈️ Organizer: Anda (Organizer)</p>
              <span class="status pending">Menunggu Peserta (15/20)</span>
            </div>
            <button class="btn-view">Urus Trip</button>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'history'" class="tab-panel">
        <h2>Sejarah Pengembaraan</h2>
        <div class="trip-list">
          <div class="mini-trip-card faded">
            <div class="date-box">
              <span class="day">01</span>
              <span class="month">NOV</span>
            </div>
            <div class="trip-details">
              <h3>Fun Run KL City 10KM</h3>
              <p>📍 Kuala Lumpur</p>
              <span class="status completed">Selesai</span>
            </div>
            <button class="btn-outline">Beri Review</button>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'forum'" class="tab-panel">
        <h2>Perbincangan Saya</h2>
        <div class="forum-list">
          <div class="forum-item">
            <h4>Kasut hiking apa paling tahan lasak?</h4>
            <p>💬 24 Komen • ❤️ 15 Likes</p>
          </div>
          <div class="forum-item">
            <h4>Mencari geng hiking Bukit Tabur esok!</h4>
            <p>💬 5 Komen • ❤️ 2 Likes</p>
          </div>
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
            <span class="card-role">Outdoor Organizer</span>
            <p class="card-bio">{{ user.bio }}</p>
            
            <div class="card-socials">
              <div v-if="user.whatsapp">📞 {{ user.whatsapp }}</div>
              <div v-if="user.facebook">📘 /{{ user.facebook }}</div>
              <div v-if="user.instagram">📸 @{{ user.instagram }}</div>
            </div>
          </div>
          
          <div class="card-right">
            <span class="qr-label">SCAN ME</span>
            <img 
              :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://knotenup.com/user/${user.name}`" 
              class="qr-code"
            />
            <span class="logo-watermark">KnotenUp</span>
          </div>
        </div>

        <div class="modal-actions">
          <button class="share-btn" @click="shareCard">🔗 Copy Link</button>
          <button class="share-btn download">⬇️ Download Image</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

const activeTab = ref('upcoming');
const showCard = ref(false);

// Data User Default (Reactive supaya boleh update)
const user = reactive({
  name: 'Ali Gunung',
  bio: 'Pencinta alam semulajadi. Hobi: Hiking & Camping setiap hujung minggu.',
  avatar: 'https://i.pravatar.cc/300?img=11',
  whatsapp: '60123456789',
  facebook: 'aligunung',
  instagram: 'aligunung_adv'
});

// Check jika ada data baru dari Edit Profile (LocalStorage Simulation)
onMounted(() => {
  const saved = localStorage.getItem('userProfile');
  if (saved) {
    const parsed = JSON.parse(saved);
    Object.assign(user, parsed); 
  }
});

const shareCard = () => {
  navigator.clipboard.writeText(`https://knotenup.com/user/${user.name}`);
  alert("Link Profil disalin!");
};
</script>

<style scoped>
.profile-page {
  background-color: #f4f6f8;
  min-height: 100vh;
}

/* HEADER STYLE */
.profile-header {
  background: white;
  border-bottom: 1px solid #ddd;
}

.cover-photo {
  height: 200px;
  background-image: url('https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80');
  background-size: cover;
  background-position: center;
}

.profile-info-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem 2rem 2rem;
  display: flex;
  align-items: flex-end;
  gap: 2rem;
  margin-top: -50px; 
  position: relative;
}

.avatar-container { position: relative; }

.avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 5px solid white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  background: #fff;
}

.role-badge {
  position: absolute;
  bottom: 10px; right: 0;
  background-color: #2c3e50; color: white;
  padding: 4px 10px; border-radius: 20px;
  font-size: 0.75rem; font-weight: bold;
  border: 2px solid white;
}
.role-badge.organizer { background-color: #e67e22; }

.info-text { flex-grow: 1; padding-bottom: 0.5rem; }
.info-text h1 { margin: 0; color: #2c3e50; display: flex; align-items: center; gap: 5px; }
.verification { font-size: 1rem; }
.bio { color: #666; margin: 5px 0 10px 0; }
.stats-row { display: flex; gap: 1.5rem; font-size: 0.9rem; color: #555; }

/* NEW: Social Mini Links */
.social-mini-links { margin: 5px 0 10px 0; display: flex; gap: 10px; }
.social-mini-links a { font-size: 1.2rem; text-decoration: none; transition: transform 0.2s; }
.social-mini-links a:hover { transform: scale(1.2); }

/* BUTTONS */
.action-buttons { display: flex; gap: 10px; }

.btn-edit {
  padding: 0.6rem 1.2rem;
  border: 1px solid #ccc; background: white;
  border-radius: 6px; cursor: pointer; font-weight: bold;
  margin-bottom: 1rem;
}
.btn-edit:hover { background-color: #f9f9f9; }

.btn-card {
  padding: 0.6rem 1.2rem;
  background-color: #2c3e50; color: white; border: none;
  border-radius: 6px; cursor: pointer; font-weight: bold;
  margin-bottom: 1rem;
}
.btn-card:hover { background-color: #1a252f; }

/* RESPONSIVE HEADER */
@media (max-width: 768px) {
  .profile-info-container { flex-direction: column; align-items: center; text-align: center; margin-top: -70px; }
  .stats-row { justify-content: center; }
  .action-buttons { width: 100%; text-align: center; justify-content: center; }
}

/* TABS STYLE (SAMA) */
.tabs-container {
  background: white; padding: 0 2rem; border-bottom: 1px solid #eee;
  display: flex; justify-content: center; gap: 2rem;
}
.tab-btn {
  background: none; border: none; padding: 1rem 0.5rem; font-size: 1rem;
  color: #777; cursor: pointer; border-bottom: 3px solid transparent; font-weight: 600;
}
.tab-btn.active { color: #e67e22; border-bottom-color: #e67e22; }

/* CONTENT AREA (SAMA) */
.content-area { max-width: 1000px; margin: 2rem auto; padding: 0 1rem; }
.tab-panel h2 { font-size: 1.2rem; margin-bottom: 1rem; color: #333; }

/* TRIP LIST STYLE */
.trip-list { display: flex; flex-direction: column; gap: 1rem; }
.mini-trip-card {
  background: white; padding: 1rem; border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  display: flex; align-items: center; gap: 1rem; border: 1px solid #eee;
}
.faded { opacity: 0.7; }
.date-box {
  background-color: #f0f3f4; padding: 0.5rem 1rem; border-radius: 8px;
  text-align: center; min-width: 60px;
}
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

/* FORUM LIST STYLE */
.forum-list { background: white; border-radius: 8px; border: 1px solid #eee; overflow: hidden; }
.forum-item { padding: 1rem; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s; }
.forum-item:last-child { border-bottom: none; }
.forum-item:hover { background-color: #f9f9f9; }
.forum-item h4 { margin: 0 0 5px 0; color: #0079d3; }
.forum-item p { margin: 0; font-size: 0.8rem; color: #666; }

/* --- MODAL STYLE (BARU) --- */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.6); z-index: 999;
  display: flex; justify-content: center; align-items: center; padding: 1rem;
}

.card-modal {
  background: white; padding: 2rem; border-radius: 15px;
  position: relative; max-width: 600px; width: 100%;
}

.close-btn {
  position: absolute; top: 10px; right: 15px; background: none; border: none;
  font-size: 1.5rem; cursor: pointer; color: #888;
}

/* BUSINESS CARD DESIGN */
.business-card {
  display: flex;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-radius: 15px; overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  color: white; min-height: 250px;
}

.card-left {
  flex: 1.5; padding: 2rem; display: flex; flex-direction: column; justify-content: center;
}

.card-avatar { width: 60px; height: 60px; border-radius: 50%; border: 2px solid white; margin-bottom: 1rem; }
.card-left h3 { margin: 0; font-size: 1.5rem; }
.card-role { color: #e67e22; font-weight: bold; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1rem; }
.card-bio { font-size: 0.8rem; color: #bdc3c7; margin-bottom: 1.5rem; line-height: 1.4; }
.card-socials div { font-size: 0.85rem; margin-bottom: 5px; display: flex; align-items: center; gap: 8px; }

.card-right {
  flex: 1; background: white; color: #333;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  padding: 1rem; position: relative;
}

.qr-label { font-weight: bold; margin-bottom: 10px; font-size: 0.8rem; letter-spacing: 2px; }
.qr-code { width: 120px; height: 120px; }
.logo-watermark { margin-top: 10px; font-weight: 900; color: #2c3e50; font-size: 1.2rem; }

/* MODAL ACTIONS */
.modal-actions { display: flex; gap: 1rem; margin-top: 1.5rem; justify-content: center; }
.share-btn { padding: 0.6rem 1.5rem; border: 1px solid #ccc; background: #f8f9fa; border-radius: 50px; cursor: pointer; font-weight: bold; }
.share-btn:hover { background: #e9ecef; }
.share-btn.download { background-color: #e67e22; color: white; border: none; }

/* RESPONSIVE MODAL */
@media (max-width: 600px) {
  .business-card { flex-direction: column; }
  .card-right { border-top: 1px dashed #ccc; }
}
</style>