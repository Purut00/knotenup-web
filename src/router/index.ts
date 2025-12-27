import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
//import TripPage from '../views/TripPage.vue'
//import ForumPage from '../views/ForumPage.vue'
//import ProfilePage from '../views/ProfilePage.vue'
//import CreateTripPage from '../views/CreateTripPage.vue';
//import ForumCreatePostPage from '../views/ForumCreatePostPage.vue';
//import EditProfilePage from '../views/EditProfilePage.vue';
//import TripRequestPage from '../views/TripRequestPage.vue'
//import TripDetailPage from '../views/TripDetailPage.vue';
//import ForumDetailPage from '../views/ForumDetailPage.vue';
//import AdminPage from '../views/AdminPage.vue';
//import SearchResultsPage from '../views/SearchResultsPage.vue';
//import ServicePage from '../views/ServicePage.vue';
//import CreateServicePage from '../views/CreateServicePage.vue';
//import OrganizerRegistrationPage from '../views/OrganizerRegistrationPage.vue';
//import SpotsPage from '../views/SpotsPage.vue';
//import SpotDetailPage from '../views/SpotDetailPage.vue';
//import CreateSpotPage from '../views/CreateSpotPage.vue';
//import ServiceDetailPage from '../views/ServiceDetailPage.vue';
//import CreateBuddyPage from '../views/CreateBuddyPage.vue';
//import BuddyPage from '../views/BuddyPage.vue';

// Import Firebase untuk cek role sebelum masuk page
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const routes = [
  {
    path: '/',
    name: 'Home',
    meta: { title: 'Home - KnotenUp' },
    component: HomePage
  },
  {
    path: '/trips',
    name: 'Trips',
    meta: { title: 'Cari Trip - KnotenUp' },
    component: () => import('../views/TripPage.vue')
  },
  {
    path: '/forum',
    name: 'Forum',
    meta: { title: 'Komuniti - KnotenUp' },
    component: () => import('../views/ForumPage.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    meta: { requiresAuth: true, title: 'Profil Saya' },
    component: () => import('../views/ProfilePage.vue')
  },
  {
    path: '/create-trip',
    name: 'CreateTrip',
    meta: { requiresAuth: true, title: 'Buat Trip Baru' },
    component: () => import('../views/CreateTripPage.vue')
  },
  {
    path: '/forum/create',
    name: 'CreatePost',
    meta: { requiresAuth: true, title: 'Tulis Post' },
    component: () => import('../views/ForumCreatePostPage.vue')
  },
  {
    path: '/profile/edit',
    name: 'EditProfile',
    meta: { requiresAuth: true, title: 'Edit Profil' },
    component: () => import('../views/EditProfilePage.vue')
  },
  {
    path: '/requests',
    name: 'requests',
    meta: { requiresAuth: true, title: 'Requests Saya' },
    component: () => import('../views/TripRequestPage.vue')
  },
  {
    path: '/trips/:id',
    name: 'trip-detail',
    meta: { title: 'Detail Trip - KnotenUp' },
    component: () => import('../views/TripDetailPage.vue')
  },
  {
    path: '/forum/:id',
    name: 'forum-detail',
    meta: { title: 'Perbincangan - KnotenUp' },
    component: () => import('../views/ForumDetailPage.vue')
  },
  {
    path: '/forum/edit/:id',
    name: 'edit-post',
    meta: { requiresAuth: true, title: 'Edit Post' },
    component: () => import('../views/ForumCreatePostPage.vue')
  },
  {
    path: '/admin',
    name: 'admin',
    meta: { requiresAdmin: true, title: 'Admin Panel' },
    component: () => import('../views/AdminPage.vue')
  },
  {
    path: '/search',
    name: 'search',
    meta: { title: 'Carian - KnotenUp' },
    component: () => import('../views/SearchResultsPage.vue')
  },
  {
    path: '/service',
    name: 'service',
    meta: { title: 'Servis & Guide - KnotenUp' },
    component: () => import('../views/ServicePage.vue')
  },
  {
    path: '/create-service',
    name: 'create-service',
    meta: { requiresAuth: true, title: 'Tawarkan Servis' },
    component: () => import('../views/CreateServicePage.vue')
  },
  {
    path: '/user/:id',
    name: 'public-profile',
    meta: { requiresAuth: true, title: 'Profil Pengguna' },
    component: () => import('../views/ProfilePage.vue')
  },
  {
    path: '/be-organizer',
    name: 'be-organizer',
    meta: { requiresAuth: true, title: 'Daftar Organizer' },
    component: () => import('../views/OrganizerRegistrationPage.vue')
  },
  {
    path: '/spots',
    name: 'spots',
    meta: { title: 'Lokasi & Spot - KnotenUp' },
    component: () => import('../views/SpotsPage.vue')
  },
  {
    path: '/spots/:id',
    name: 'spot-detail',
    meta: { title: 'Info Spot - KnotenUp' },
    component: () => import('../views/SpotDetailPage.vue')
  },
  {
    path: '/create-spot',
    name: 'create-spot',
    meta: { requiresAuth: true, title: 'Tambah Spot Baru' },
    component: () => import('../views/CreateSpotPage.vue')
  },
  {
    path: '/spots/edit/:id',
    name: 'edit-spot',
    meta: { requiresAuth: true, title: 'Edit Spot' },
    component: () => import('../views/CreateSpotPage.vue')
  },
  {
    path: '/service/:id',
    name: 'service-detail',
    meta: { title: 'Info Servis' },
    component: () => import('../views/ServiceDetailPage.vue')
  },
  {
    path: '/terms',
    name: 'Terms',
    meta: { title: 'Terma & Syarat' },
    component: () => import('../views/TermsPage.vue')
  },
  {
    path: '/privacy',
    name: 'Privacy',
    meta: { title: 'Privasi Polisi' },
    component: () => import('../views/PrivacyPage.vue')
  },
  {
    path: '/create-buddy',
    name: 'CreateBuddy',
    meta: { requiresAuth: true, title: 'Cari Buddy - KnotenUp' }, // Wajib login
    component: () => import('../views/CreateBuddyPage.vue')
  },
  {
    path: '/buddies',
    name: 'Buddies',
    meta: { title: 'Senarai Buddy - KnotenUp' },
    component: () => import('../views/BuddyPage.vue')
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkActiveClass: 'router-link-active'
})

// 🔥 GLOBAL GUARD: PENGAWAL KESELAMATAN ROUTER 🔥
// FIX: Tukar 'from' kepada '_from' untuk elak error "declared but never read"
router.beforeEach(async (to, _from, next) => {
  // 1. Update Title dynamically
  const defaultTitle = 'KnotenUp - Platform Hikers Malaysia';
  document.title = (to.meta.title as string) || defaultTitle;

  // Update Meta Description if generic (Simple implementation)
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', (to.meta.description as string) || 'Temui rakan hiking, trip menarik, dan lokasi best di Malaysia bersama KnotenUp.');
  }

  // Tunggu Firebase Auth initialize dulu
  const currentUser = await new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  // 1. Jika perlukan login tapi tak login
  if ((requiresAuth || requiresAdmin) && !currentUser) {
    // alert("Sila log masuk dahulu."); // Disable alert for smoother UX, just redirect
    next('/');
    return;
  }

  // 2. Jika perlukan ADMIN, cek database live
  if (requiresAdmin && currentUser) {
    try {
      const userDoc = await getDoc(doc(db, "users", (currentUser as any).uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        next();
      } else {
        alert("⛔ AKSES DITOLAK: Anda bukan Admin.");
        next('/');
      }
    } catch (e) {
      console.error("Security Check Error:", e);
      next('/');
    }
  } else {
    next();
  }
});

export default router