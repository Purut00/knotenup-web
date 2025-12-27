<template>
  <nav class="sticky top-0 z-50 w-full bg-slate-900/90 backdrop-blur-md border-b border-white/5 transition-all duration-300">
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        
        <div class="flex-shrink-0 flex items-center">
          <router-link to="/" class="flex items-center gap-2 group">
            <span class="text-2xl font-bold text-white tracking-tight group-hover:text-primary-400 transition-colors">
              KnotenUp<span class="text-primary-500">.com</span>
            </span>
          </router-link>
        </div>

        <div class="hidden md:flex items-center space-x-8">
          <router-link to="/" class="nav-link">{{ t('navbar.home') }}</router-link>
          <router-link to="/trips" class="nav-link">{{ t('navbar.trips') }}</router-link>
          <router-link to="/buddies" class="nav-link">{{ t('navbar.buddy') }}</router-link>
          <router-link to="/forum" class="nav-link">{{ t('navbar.forum') }}</router-link>
          <router-link to="/service" class="nav-link">{{ t('navbar.services') }}</router-link>
          <router-link to="/spots" class="nav-link">{{ t('navbar.spots') }}</router-link>
          <router-link v-if="currentUser" to="/profile" class="nav-link font-semibold text-primary-400">
            {{ displayName || t('navbar.profile') }}
          </router-link>
        </div>

        <div class="hidden md:flex items-center space-x-4">
          <router-link v-if="userRole === 'organizer'" to="/create-trip" class="btn btn-primary text-xs px-4 py-2">
            <i class="fas fa-plus mr-2"></i> {{ t('navbar.createTrip') }}
          </router-link>

          <router-link v-if="currentUser" to="/requests" class="btn btn-secondary text-xs px-4 py-2">
             {{ t('navbar.requests') }}
          </router-link>
          
          <div class="flex items-center gap-3">
            <div class="relative" v-if="currentUser">
              <button @click="toggleNotif" class="p-2 text-slate-400 hover:text-white transition relative focus:outline-none">
                <i class="fas fa-bell text-lg"></i>
                <span v-if="unreadCount > 0" class="absolute top-1 right-1 bg-accent-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                  {{ unreadCount }}
                </span>
              </button>
              
              <!-- Dropdown -->
              <div v-if="showNotifDropdown" class="absolute right-0 mt-3 w-80 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                 <div class="p-3 bg-slate-900 border-b border-white/5 flex justify-between items-center">
                   <span class="text-xs font-bold text-slate-400 uppercase tracking-wide">Notifikasi</span>
                   <button @click="showNotifDropdown = false" class="text-slate-500 hover:text-white"><i class="fas fa-times"></i></button>
                 </div>
                 <div class="max-h-80 overflow-y-auto">
                    <div v-if="notifications.length === 0" class="p-6 text-center text-slate-500 text-sm">
                      <i class="far fa-bell-slash text-2xl mb-2 block opacity-50"></i>
                      Tiada notifikasi baru.
                    </div>
                    <div v-for="notif in notifications" :key="notif.id" 
                        @click="markAsRead(notif.id)"
                        class="p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition"
                        :class="notif.isRead ? 'opacity-60' : 'bg-primary-900/20'">
                        <div class="flex gap-3">
                           <div class="mt-1">
                             <i :class="['fas', notif.type === 'success' ? 'fa-check-circle text-primary-500' : 'fa-info-circle text-blue-400']"></i>
                           </div>
                           <div>
                              <p class="text-sm text-slate-200 leading-snug">{{ notif.message }}</p>
                              <span class="text-[10px] text-slate-500 mt-1 block">Baru saja</span>
                           </div>
                        </div>
                    </div>
                 </div>
              </div>
            </div>

            <select v-model="currentLang" @change="switchLanguage" class="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:border-primary-500 cursor-pointer outline-none">
              <option value="en">🇬🇧 EN</option>
              <option value="ms">🇲🇾 MY</option>
              <option value="zh-CN">🇨🇳 CN</option>
            </select>

            <button v-if="!currentUser" @click="showLogin = true" class="btn btn-secondary text-xs px-5 py-2">
              {{ t('navbar.login') }}
            </button>

            <button v-else @click="handleLogout" class="text-slate-400 hover:text-red-400 text-sm font-medium transition ml-2">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>

        <!-- Mobile Menu Btn -->
        <div class="md:hidden flex items-center">
          <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="text-slate-300 hover:text-white focus:outline-none">
            <i :class="isMobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'" class="text-2xl"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-show="isMobileMenuOpen" class="md:hidden bg-slate-900 border-t border-white/10 shadow-lg">
      <div class="px-4 pt-2 pb-6 space-y-2 flex flex-col">
        <router-link to="/" class="mobile-nav-link" @click="isMobileMenuOpen = false">{{ t('navbar.home') }}</router-link>
        <router-link to="/trips" class="mobile-nav-link" @click="isMobileMenuOpen = false">{{ t('navbar.trips') }}</router-link>
        <router-link to="/buddies" class="mobile-nav-link" @click="isMobileMenuOpen = false">{{ t('navbar.buddy') }}</router-link>
        <router-link v-if="currentUser" to="/requests" class="mobile-nav-link" @click="isMobileMenuOpen = false">{{ t('navbar.requests') }}</router-link>
        <router-link to="/forum" class="mobile-nav-link" @click="isMobileMenuOpen = false">{{ t('navbar.forum') }}</router-link>
        <router-link to="/service" class="mobile-nav-link" @click="isMobileMenuOpen = false">{{ t('navbar.services') }}</router-link>

        <div class="border-t border-white/10 my-2 pt-4">
           <button v-if="!currentUser" @click="showLogin = true; isMobileMenuOpen = false" class="w-full btn btn-primary">
              {{ t('navbar.login') }}
           </button>
           
           <div v-else class="space-y-4">
              <div class="flex items-center justify-between bg-white/5 p-3 rounded-xl" @click="toggleNotif">
                <span class="text-slate-300 font-medium text-sm flex items-center gap-2"><i class="fas fa-bell"></i> Notifikasi</span>
                <span v-if="unreadCount > 0" class="bg-accent-500 text-white text-xs px-2 py-1 rounded-full font-bold">{{ unreadCount }}</span>
              </div>
              <button @click="handleLogout" class="w-full btn btn-outline border-red-500/50 text-red-400 hover:bg-red-500/10">
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
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import LoginModal from './LoginModal.vue';
import { auth, db } from '../../firebaseConfig'; 
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; 
import { useNotifications } from '../../composables/useNotifications';

const { t, locale } = useI18n(); 
const router = useRouter();
const showLogin = ref(false);
const isMobileMenuOpen = ref(false); 
const currentUser = ref<User | null>(null);
const userRole = ref('user');
const displayName = ref(''); 
const currentLang = ref(locale.value);

const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotifications();
const showNotifDropdown = ref(false);

const toggleNotif = () => {
  if (currentUser.value) {
    if (!showNotifDropdown.value) fetchNotifications(currentUser.value.uid);
    showNotifDropdown.value = !showNotifDropdown.value;
  }
};

const switchLanguage = () => {
  locale.value = currentLang.value;
  localStorage.setItem('user_lang', currentLang.value);
};

watch(locale, (newVal) => { currentLang.value = newVal; });

onMounted(() => {
  const savedLang = localStorage.getItem('user_lang');
  if (savedLang) { locale.value = savedLang; currentLang.value = savedLang; }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser.value = user;
      fetchNotifications(user.uid);
      onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          userRole.value = data.role || 'user'; 
          displayName.value = (data.name || data.fullName || user.displayName || '').split(' ')[0];
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
  isMobileMenuOpen.value = false; 
  router.push('/');
};
</script>

<style scoped>
.nav-link {
  @apply text-slate-400 hover:text-white font-medium transition-colors duration-200 text-sm tracking-wide;
}
.nav-link.router-link-active {
  @apply text-primary-400 font-bold;
}
.mobile-nav-link {
  @apply block py-3 px-4 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5;
}
</style>