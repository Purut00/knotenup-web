<template>
  <nav class="sticky top-0 z-50 w-full bg-glass backdrop-blur-md border-b border-white/30 shadow-sm transition-all duration-300">
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        
        <div class="flex-shrink-0 flex items-center">
          <router-link to="/" class="flex items-center gap-2 group">
            <span class="text-2xl font-bold text-dark tracking-tight group-hover:opacity-80 transition-opacity">
              KnotenUp<span class="text-base font-normal text-gray-600">.com</span>
            </span>
          </router-link>
        </div>

        <div class="hidden md:flex items-center space-x-10">
          <router-link to="/" class="nav-link">{{ t('navbar.home') }}</router-link>
          <router-link to="/trips" class="nav-link">{{ t('navbar.trips') }}</router-link>
          <router-link to="/forum" class="nav-link">{{ t('navbar.forum') }}</router-link>
          <router-link to="/service" class="nav-link">{{ t('navbar.services') }}</router-link>
          <router-link to="/spots" class="nav-link">{{ t('navbar.spots') }}</router-link>
          
          <router-link v-if="currentUser" to="/profile" class="nav-link font-semibold text-primary">
            {{ displayName || t('navbar.profile') }}
          </router-link>
        </div>

        <div class="hidden md:flex items-center space-x-4">
          <router-link v-if="userRole === 'organizer'" to="/create-trip" class="text-accent hover:text-orange-600 font-medium transition">
            {{ t('navbar.createTrip') }}
          </router-link>
          
          <router-link to="/requests" class="text-blue-600 hover:text-blue-800 font-medium transition">
            {{ t('navbar.requests') }}
          </router-link>

          <div class="flex items-center gap-3">
            <select v-model="currentLang" @change="switchLanguage" class="bg-gray-100 border-none rounded-full px-7 py-1 text-sm focus:ring-2 focus:ring-primary cursor-pointer">
              <option value="en">🇬🇧 EN</option>
              <option value="ms">🇲🇾 MY</option>
              <option value="zh-CN">🇨🇳 CN</option>
            </select>

            <button v-if="!currentUser" @click="showLogin = true" class="px-5 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all transform text-sm">
              {{ t('navbar.login') }}
            </button>

            <button v-else @click="handleLogout" class="px-4 py-1.5 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition text-sm font-medium">
              {{ t('navbar.logout') }}
            </button>
          </div>
        </div>

        <div class="md:hidden flex items-center">
          <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="text-gray-600 hover:text-primary focus:outline-none">
            <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-show="isMobileMenuOpen" class="md:hidden bg-white border-t border-gray-100 shadow-lg">
      <div class="px-4 pt-2 pb-6 space-y-2 flex flex-col">
        <router-link to="/" class="mobile-nav-link" @click="isMobileMenuOpen = false">{{ t('navbar.home') }}</router-link>
        <router-link to="/trips" class="mobile-nav-link" @click="isMobileMenuOpen = false">{{ t('navbar.trips') }}</router-link>
        <router-link to="/forum" class="mobile-nav-link" @click="isMobileMenuOpen = false">{{ t('navbar.forum') }}</router-link>
        <router-link to="/service" class="mobile-nav-link" @click="isMobileMenuOpen = false">{{ t('navbar.services') }}</router-link>
        <router-link to="/spots" class="mobile-nav-link" @click="isMobileMenuOpen = false">{{ t('navbar.spots') }}</router-link>

        <div class="border-t border-gray-100 my-2 pt-2">
          <div class="flex justify-between items-center mb-4">
             <span class="text-sm text-gray-500">Language</span>
              <select v-model="currentLang" @change="switchLanguage" class="bg-gray-100 border border-gray-300 text-gray-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer min-w-[100px]">
                <option value="en">🇬🇧 English</option>
                <option value="ms">🇲🇾 Malay</option>
                <option value="zh-CN">🇨🇳 Chinese</option>
              </select>
           </div>

           <button v-if="!currentUser" @click="showLogin = true; isMobileMenuOpen = false" class="w-full py-3 bg-primary text-white rounded-lg font-bold shadow-md">
              {{ t('navbar.login') }}
           </button>
           
           <div v-else class="space-y-3">
              <p class="text-gray-800 font-semibold">Hi, {{ displayName || 'User' }}</p>
              <button @click="handleLogout" class="w-full py-2 border border-red-500 text-red-500 rounded-lg">
                {{ t('navbar.logout') }}
              </button>
           </div>
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
const isMobileMenuOpen = ref(false); // State baru untuk mobile menu
const currentUser = ref<User | null>(null);
const userRole = ref('user');
const displayName = ref(''); 
const currentLang = ref(locale.value);

const getFirstName = (name: string | null | undefined): string | null => {
  if (!name) return null;
  return name.split(' ')[0] || null;
};

const switchLanguage = () => {
  locale.value = currentLang.value;
  localStorage.setItem('user_lang', currentLang.value);
};

watch(locale, (newVal) => {
  currentLang.value = newVal;
});

onMounted(() => {
  const savedLang = localStorage.getItem('user_lang');
  if (savedLang) {
    locale.value = savedLang;
    currentLang.value = savedLang;
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser.value = user;
      onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          userRole.value = data.role || 'user'; 
          const firestoreName = data.name || data.fullName;
          const finalName = firestoreName ? firestoreName : (user.displayName || '');
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
  isMobileMenuOpen.value = false; // Tutup menu bila logout
  router.push('/');
};
</script>

<style scoped>
/* Kita guna @apply Tailwind untuk custom class supaya code HTML tak serabut */
.nav-link {
  @apply text-gray-700 hover:text-primary font-medium transition-colors duration-200;
}

.nav-link.router-link-active {
  @apply text-primary font-bold;
}

.mobile-nav-link {
  @apply block py-2 px-3 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50;
}
</style>