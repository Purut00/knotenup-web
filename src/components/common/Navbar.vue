<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <router-link to="/">
          <span class="logo-text">KnotenUp<span style="font-size: 1rem; font-weight: normal;">.com</span></span>
        </router-link>
      </div>
      
      <div class="navbar-menu">
        <router-link to="/" class="navbar-item">{{ t('navbar.home') }}</router-link>
        <router-link to="/trips" class="navbar-item">{{ t('navbar.trips') }}</router-link>
        <router-link to="/forum" class="navbar-item">{{ t('navbar.forum') }}</router-link>
        
        <router-link to="/service" class="navbar-item">{{ t('navbar.services') }}</router-link>
        
        <router-link to="/spots" class="navbar-item">{{ t('navbar.spots') }}</router-link>
        
        <router-link v-if="currentUser" to="/profile" class="navbar-item user-name-link">
             {{ displayName ? displayName : t('navbar.profile') }}
        </router-link>
      </div>  

      <div class="navbar-right">
        
        <router-link 
          v-if="userRole === 'organizer'" 
          to="/create-trip" 
          class="navbar-item" 
          style="color: #e67e22;"
        >
          {{ t('navbar.createTrip') }}
        </router-link>

        <router-link to="/requests" class="navbar-item" style="color: #2980b9;">
          {{ t('navbar.requests') }}
        </router-link>

        <div v-if="currentUser" class="user-actions">
          <button @click="handleLogout" class="button-logout">
            {{ t('navbar.logout') }}
          </button>
        </div>

        <button v-else class="button-login" @click="showLogin = true">
          {{ t('navbar.login') }}
        </button>

        <div class="lang-wrapper">
          <select v-model="currentLang" @change="switchLanguage" class="lang-select">
            <option value="en">🇬🇧 EN</option>
            <option value="ms">🇲🇾 MY</option>
            <option value="zh-CN">🇨🇳 CN</option>
          </select>
        </div>
        
      </div>
    </div>

    <LoginModal v-if="showLogin" @close="showLogin = false" />
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import LoginModal from './LoginModal.vue';
import { auth, db } from '../../firebaseConfig';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; 

const { t, locale } = useI18n(); 
const router = useRouter();
const showLogin = ref(false);
const currentUser = ref<User | null>(null);
const userRole = ref('user');
const displayName = ref(''); // Biarkan kosong string mula-mula

const currentLang = ref(locale.value);

// Helper function: Return null jika tiada nama, supaya Template boleh guna t('navbar.profile')
const getFirstName = (name: string | null | undefined): string | null => {
  if (!name) return null;
  const first = name.split(' ')[0];
  return first || null;
};

// 🔥 FUNGSI TUKAR BAHASA 🔥
const switchLanguage = () => {
  locale.value = currentLang.value;
  localStorage.setItem('user_lang', currentLang.value);
};

// 🔥 MONITOR PERUBAHAN BAHASA 🔥
watch(locale, (newVal) => {
  currentLang.value = newVal;
});

onMounted(() => {
  // Load bahasa dari memory
  const savedLang = localStorage.getItem('user_lang');
  if (savedLang) {
    locale.value = savedLang;
    currentLang.value = savedLang;
  }

  // Auth Logic
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser.value = user;
      
      // 🔥 CCTV DATABASE (REAL-TIME UPDATE) 🔥
      onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          userRole.value = data.role || 'user'; 
          
          // --- LOGIK "FIRESTORE FIRST" ---
          const firestoreName = data.name || data.fullName;
          const finalName = firestoreName ? firestoreName : (user.displayName || ''); // Jika tiada nama, string kosong

          // Set nama. Jika null, template akan guna fallback t('navbar.profile')
          displayName.value = getFirstName(finalName) || '';
        }
      });
      
    } else {
      currentUser.value = null;
      userRole.value = 'user';
      displayName.value = '';
    }
  });
});

const handleLogout = async () => {
  await signOut(auth);
  router.push('/');
};
</script>

<style scoped lang="css">
/* --- 1. NAVBAR STYLES (STICKY & GLASS) --- */
.navbar {
  /* Positioning Logic untuk Sticky */
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000; /* Pastikan ia sentiasa di atas content lain */
  
  /* 🔥 GLASS EFFECT (Kaca) 🔥 */
  background: rgba(255, 255, 255, 0.85); /* Putih transparent */
  backdrop-filter: blur(12px);           /* Effect kabur belakang */
  -webkit-backdrop-filter: blur(12px);   /* Support untuk Safari */
  
  /* Border & Shadow lembut */
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
  
  /* Spacing */
  padding: 0 2rem;
  box-sizing: border-box; 
  transition: all 0.3s ease;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  height: 70px; 
}

.navbar-brand .logo {
  height: 40px;
  vertical-align: middle;
}

.navbar-menu {
  display: flex;
  gap: 2rem;
}

.navbar-item {
  text-decoration: none;
  color: #333; /* Warna gelap sikit untuk kontras atas glass */
  font-weight: 500;
  padding: 0.5rem;
  transition: color 0.2s ease;
}

/* Hover effect ikut tema sunset (purple/orange) sikit kalau nak, atau biru standard */
.navbar-item:hover, .navbar-item.router-link-active {
  color: #6c63ff; /* Guna purple theme sikit */
  /* border-bottom: 2px solid #6c63ff; (Optional: kalau nak garis bawah) */
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.button-login {
  padding: 0.5rem 1.2rem;
  background: linear-gradient(135deg, #6c63ff, #ff8c42); /* Ikut theme sunset sikit */
  color: white;
  border: none;
  border-radius: 50px; /* Lebih bulat (modern style) */
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(108, 99, 255, 0.3);
  transition: transform 0.2s;
}

.button-login:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(108, 99, 255, 0.4);
}

.logo-text {
  font-size: 1.3rem;       
  font-weight: 700;        
  color: #155724;           
  letter-spacing: -0.5px;    
  text-decoration: none;   
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
}

.navbar-brand a:hover .logo-text {
  opacity: 0.8;
}

.button-logout {
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: #e74c3c; 
  border: 1px solid #e74c3c;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.button-logout:hover {
  background-color: #e74c3c;
  color: white;
}

/* 🔥 STYLE DROPDOWN BAHASA 🔥 */
.lang-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.lang-select {
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(0,0,0,0.1);
  background-color: rgba(255,255,255,0.5); /* Semi-transparent */
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  outline: none;
  transition: all 0.2s;
}

.lang-select:hover {
  background-color: #fff;
  border-color: #6c63ff;
}

.lang-select:focus {
  border-color: #6c63ff;
  box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.2);
}

/* --- RESPONSIVE NAVBAR --- */
@media (max-width: 768px) {
  .navbar-container {
    flex-direction: column;
    height: auto;
    padding: 1rem 0;
    gap: 1rem;
  }

  .navbar-menu {
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 5px;
    justify-content: flex-start; 
    padding-left: 1rem; 
    /* Hide scrollbar */
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .navbar-menu::-webkit-scrollbar {
    display: none;
  }

  .navbar-right {
    width: 100%;
    justify-content: center; 
    flex-wrap: wrap; 
    padding-bottom: 0.5rem;
  }
}
</style>