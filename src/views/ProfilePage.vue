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
             <a v-if="user.whatsapp" :href="'https://wa.me/' + user.whatsapp" target="_blank" title="WhatsApp">
               <img src="https://cdn.simpleicons.org/whatsapp/25D366" alt="WA" />
             </a>
             <a v-if="user.facebook" :href="'https://facebook.com/' + user.facebook" target="_blank" title="Facebook">
               <img src="https://cdn.simpleicons.org/facebook/1877F2" alt="FB" />
             </a>
             <a v-if="user.instagram" :href="'https://instagram.com/' + user.instagram" target="_blank" title="Instagram">
               <img src="https://cdn.simpleicons.org/instagram/E4405F" alt="IG" />
             </a>
             <a v-if="user.tiktok" :href="'https://tiktok.com/@' + user.tiktok" target="_blank" title="TikTok">
               <img src="https://cdn.simpleicons.org/tiktok/000000" alt="TT" />
             </a>
             <a v-if="user.youtube" :href="'https://youtube.com/' + user.youtube" target="_blank" title="YouTube">
               <img src="https://cdn.simpleicons.org/youtube/FF0000" alt="YT" />
             </a>
          </div>

          <div class="stats-row">
            <span><strong>{{ user.stats.joined }}</strong> {{ t('profile.tripsJoined') }}</span>
            <span><strong>{{ user.stats.organized }}</strong> {{ t('profile.tripsOrganized') }}</span>
            <span><strong>{{ user.stats.posts }}</strong> {{ t('profile.posts') }}</span>
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="btn-card" @click="showCard = true">🪪 {{ t('profile.myCard') }}</button>
          <button class="btn-edit" @click="$router.push('/profile/edit')">⚙️ {{ t('profile.editProfile') }}</button>
        </div>
      </div>
    </div>

    <div class="tabs-container">
      <button class="tab-btn" :class="{ active: activeTab === 'upcoming' }" @click="activeTab = 'upcoming'">
        📅 {{ t('profile.tabUpcoming') }}
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">
        📜 {{ t('profile.tabHistory') }}
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'forum' }" @click="activeTab = 'forum'">
        💬 {{ t('profile.tabPosts') }}
      </button>
    </div>

    <div class="content-area">
      <div v-if="activeTab === 'upcoming'" class="tab-panel">
        <h2>{{ t('profile.tabUpcoming') }}</h2>
        <div class="trip-list">
           <p style="color: #777; font-style: italic;">Tiada trip akan datang.</p>
        </div>
      </div>
      <div v-if="activeTab === 'history'" class="tab-panel">
        <h2>{{ t('profile.tabHistory') }}</h2>
        <p>Sejarah kosong.</p>
      </div>
      <div v-if="activeTab === 'forum'" class="tab-panel">
        <h2>{{ t('profile.tabPosts') }}</h2>
        <p>Belum ada post.</p>
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
            <p class="card-bio">{{ user.bio || 'Mari mengembara bersama saya!' }}</p>
            
            <div class="card-socials">
              <div v-if="user.whatsapp" class="social-row">
                <img src="https://cdn.simpleicons.org/whatsapp/white" class="card-icon"/> {{ user.whatsapp }}
              </div>
              <div v-if="user.facebook" class="social-row">
                <img src="https://cdn.simpleicons.org/facebook/white" class="card-icon"/> /{{ user.facebook }}
              </div>
              <div v-if="user.instagram" class="social-row">
                <img src="https://cdn.simpleicons.org/instagram/white" class="card-icon"/> @{{ user.instagram }}
              </div>
              <div v-if="user.tiktok" class="social-row">
                <img src="https://cdn.simpleicons.org/tiktok/white" class="card-icon"/> @{{ user.tiktok }}
              </div>
              <div v-if="user.youtube" class="social-row">
                <img src="https://cdn.simpleicons.org/youtube/white" class="card-icon"/> {{ user.youtube }}
              </div>
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
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const { t } = useI18n();
const activeTab = ref('upcoming');
const showCard = ref(false);

const user = reactive({
  name: 'Loading...',
  bio: '',
  avatar: 'https://i.pravatar.cc/300?img=3',
  whatsapp: '',
  facebook: '',
  instagram: '',
  tiktok: '',
  youtube: '',
  // 👇 STRUKTUR BARU: Stats (Default 0)
  stats: {
    joined: 0,
    organized: 0,
    posts: 0
  }
});

onMounted(() => {
  onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Merge data dari DB ke variable user
          Object.assign(user, data);
          
          // Nota: Nanti kita akan buat fungsi asing untuk Kira (Count) trip & forum
          // Buat masa ini, dia akan kekal 0 melainkan kita simpan nombor dalam DB
        } else {
          user.name = currentUser.displayName || 'User';
          user.avatar = currentUser.photoURL || 'https://i.pravatar.cc/300?img=3';
        }
      } catch (e) {
        console.error("Error reading doc:", e);
      }
    }
  });
});

const shareCard = () => {
  navigator.clipboard.writeText(`https://knotenup.com/user/${user.name}`);
  alert("Link Profil disalin!");
};
</script>

<style scoped>
/* CSS KEKAL SAMA (Copy dari yang tadi) */
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
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; display: flex; justify-content: center; align-items: center; padding: 1rem; backdrop-filter: blur(5px); }
.card-modal { background: white; padding: 0; border-radius: 15px; position: relative; max-width: 650px; width: 100%; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
.close-btn { position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #fff; z-index: 10; text-shadow: 0 2px 5px rgba(0,0,0,0.5); }
.modal-actions { padding: 1.5rem; display: flex; justify-content: center; background: #f9f9f9; }
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