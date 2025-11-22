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
        <router-link to="/directory" class="navbar-item">Direktori</router-link>
        <router-link to="/spots" class="navbar-item">Lokasi</router-link>
        <router-link v-if="currentUser" to="/profile" class="navbar-item user-name-link">
            {{ (currentUser.displayName) }}
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
            Logout
          </button>
        </div>

        <button v-else class="button-login" @click="showLogin = true">
          {{ t('navbar.login') }}
        </button>

      </div>
    </div>

    <LoginModal v-if="showLogin" @close="showLogin = false" />
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import LoginModal from './LoginModal.vue';
import { auth,db } from '../../firebaseConfig';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const { t } = useI18n();
const router = useRouter();
const showLogin = ref(false);
const currentUser = ref<User | null>(null);
const userRole = ref('user');

// Helper: Ambil nama depan sahaja supaya tak panjang sangat

onMounted(() => {
  // Kita tambah 'async' sebab nak baca database
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser.value = user;
      
      // 🔥 LOGIC BARU: Cek Role User dari Database 🔥
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          userRole.value = data.role || 'user'; // Ambil role dari DB
          console.log("User Role:", userRole.value); // Debugging
        }
      } catch (e) {
        console.error("Gagal baca role:", e);
      }

    } else {
      currentUser.value = null;
      userRole.value = 'user'; // Reset balik jadi user biasa
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
  box-sizing: border-box; /* Penting untuk padding */
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  height: 70px; /* Ketinggian Navbar */
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
  color: #007bff; /* Warna untuk link aktif */
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
  color:#155724;           /* Merah/Oren Shopee */
  letter-spacing: -1px;     /* Huruf rapat sikit macam logo */
  text-decoration: none;   /* Buang garis bawah */
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; /* Font kemas */
}

/* Optional: Kalau nak tambah kesan hover */
.navbar-brand a:hover .logo-text {
  opacity: 0.9;

}
.btn-create {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #e67e22; /* Warna Oren */
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: bold;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn-create:hover {
  background-color: #d35400;
}

.plus-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.button-logout {
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: #e74c3c; /* Merah */
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

/* --- RESPONSIVE NAVBAR --- */
@media (max-width: 768px) {
  .navbar-container {
    flex-direction: column;
    height: auto;
    padding: 1rem 0;
    gap: 1rem;
  }

  /* Menu Tengah: Scroll Tepi (Macam Instagram Story) */
  .navbar-menu {
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 5px;
    justify-content: flex-start; /* Mula dari kiri */
    padding-left: 1rem; /* Jarak sikit */
  }

  .navbar-right {
    width: 100%;
    justify-content: center; /* Centerkan butang login/create */
    flex-wrap: wrap; /* Kalau tak muat, turun bawah */
  }
}
</style>