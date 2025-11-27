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
             {{ displayName }}
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
const displayName = ref('Profile');

// Variable khas untuk handle dropdown supaya lebih stabil
const currentLang = ref(locale.value);

const getFirstName = (name: string | null | undefined): string => {
  if (!name) return 'Profile';
  return name.split(' ')[0] || 'Profile'; 
};

// 🔥 FUNGSI TUKAR BAHASA (FIXED) 🔥
const switchLanguage = () => {
  // 1. Update i18n locale
  locale.value = currentLang.value;
  // 2. Simpan dalam localStorage
  localStorage.setItem('user_lang', currentLang.value);
  // 3. (Optional) Log untuk check jika ada error
  console.log("Bahasa ditukar ke:", currentLang.value);
};

// 🔥 MONITOR PERUBAHAN 🔥
// Kalau locale berubah dari tempat lain (contoh: Profile page), dropdown navbar pun ikut berubah
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
      onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          userRole.value = data.role || 'user'; 
          const dbName = data.name || data.fullName; 
          displayName.value = getFirstName(dbName || user.displayName);
        }
      });
    } else {
      currentUser.value = null;
      userRole.value = 'user';
      displayName.value = 'Profile';
    }
  });
});

const handleLogout = async () => {
  await signOut(auth);
  router.push('/');
};
</script>

<style scoped lang="css">
.navbar {
  width: 100%;
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  padding: 0 2rem;
  box-sizing: border-box; 
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
  color: var(--text-primary);
  font-weight: 500;
  padding: 0.5rem;
}

.navbar-item:hover, .navbar-item.router-link-active {
  color: #007bff; 
  border-bottom: 2px solid #007bff;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.button-login {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.button-login:hover {
  background-color: #0056b3;
}

.logo-text {
  font-size: 1.3rem;       
  font-weight: 600;        
  color:#155724;           
  letter-spacing: -1px;    
  text-decoration: none;   
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
}

.navbar-brand a:hover .logo-text {
  opacity: 0.9;
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
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background-color: #f8f9fa;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  outline: none;
  transition: all 0.2s;
}

.lang-select:hover {
  border-color: #007bff;
  background-color: #fff;
}

.lang-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.1);
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
  }

  .navbar-right {
    width: 100%;
    justify-content: center; 
    flex-wrap: wrap; 
  }
}
</style>