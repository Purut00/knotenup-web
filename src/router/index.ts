import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
//import TripPage from '../views/TripPage.vue'
//import ForumPage from '../views/ForumPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
//import CreateTripPage from '../views/CreateTripPage.vue';
//import ForumCreatePostPage from '../views/ForumCreatePostPage.vue';
//import EditProfilePage from '../views/EditProfilePage.vue';
//import TripRequestPage from '../views/TripRequestPage.vue'
//import TripDetailPage from '../views/TripDetailPage.vue';
//import ForumDetailPage from '../views/ForumDetailPage.vue';
import AdminPage from '../views/AdminPage.vue';
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
    component: HomePage
  },
  {
    path: '/trips',
    name: 'Trips',
    component: () => import('../views/TripPage.vue')
  },
  {
    path: '/forum',
    name: 'Forum',
    component:  () => import('../views/ForumPage.vue')  
  },
  {
    path: '/profile',
    name: 'Profile',
    meta: { requiresAuth: true },
    component: ProfilePage
  },
  {
    path: '/create-trip',
    name: 'CreateTrip',
    meta: { requiresAuth: true },
    component: () => import('../views/CreateTripPage.vue')
  },
  {
    path: '/forum/create',
    name: 'CreatePost',
    meta: { requiresAuth: true },
    component: () => import('../views/ForumCreatePostPage.vue')
  },
  {
    path: '/profile/edit',
    name: 'EditProfile',
    meta: { requiresAuth: true },
    component: () => import('../views/EditProfilePage.vue')
  },
  {
    path: '/requests',
    name: 'requests',
    meta: { requiresAuth: true },
    component: () => import('../views/TripRequestPage.vue')
  },
  {
    path: '/trips/:id', 
    name: 'trip-detail',
    component: () => import('../views/TripDetailPage.vue')
  },
  {
    path: '/forum/:id',
    name: 'forum-detail',
    component: () => import('../views/ForumDetailPage.vue')
  },
  {
    path: '/forum/edit/:id',
    name: 'edit-post',
    meta: { requiresAuth: true },
    component: () => import('../views/ForumCreatePostPage.vue')
  },
  {
    path: '/admin',
    name: 'admin',
    meta: { requiresAdmin: true },
    component: AdminPage,
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('../views/SearchResultsPage.vue')
  },
  { 
    path: '/service', 
    name: 'service', 
    component: () => import('../views/ServicePage.vue')
  },
  { 
    path: '/create-service', 
    name: 'create-service', 
    meta: { requiresAuth: true },
    component: () => import('../views/CreateServicePage.vue')
  },
  {
    path: '/user/:id', 
    name: 'public-profile',
    meta: { requiresAuth: true },
    component: () => import('../views/ProfilePage.vue')
  },
  {
    path: '/be-organizer',
    name: 'be-organizer',
    meta: { requiresAuth: true },
    component: () => import('../views/OrganizerRegistrationPage.vue')
  },
  { 
    path: '/spots',  
    name: 'spots', 
    component: () => import('../views/SpotsPage.vue')
  },
  { 
    path: '/spots/:id', 
    name: 'spot-detail', 
    component: () => import('../views/SpotDetailPage.vue')
  },
  { 
    path: '/create-spot', 
    name: 'create-spot', 
    meta: { requiresAuth: true },
    component: () => import('../views/CreateSpotPage.vue')
  },
  { 
    path: '/spots/edit/:id', 
    name: 'edit-spot', 
    meta: { requiresAuth: true },
    component: () => import('../views/CreateSpotPage.vue')
  },
  {
    path: '/service/:id',
    name: 'service-detail',
    component: () => import('../views/ServiceDetailPage.vue')
  },
  { 
    path: '/terms', 
    name: 'Terms', 
    component: () => import('../views/TermsPage.vue') 
  },
  { 
    path: '/privacy', 
    name: 'Privacy', 
    component: () => import('../views/PrivacyPage.vue') 
  },
  {
    path: '/create-buddy',
    name: 'CreateBuddy',
    meta: { requiresAuth: true }, // Wajib login
    component: () => import('../views/CreateBuddyPage.vue')
  },
  {
    path: '/buddies',
    name: 'Buddies',
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
    alert("Sila log masuk dahulu.");
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