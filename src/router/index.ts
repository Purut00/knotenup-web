import { createRouter, createWebHistory } from 'vue-router'
// ... (import komponen sedia ada dikekalkan - ringkasan kod)
// ... import HomePage, TripPage, dll ...
import HomePage from '../views/HomePage.vue'
import TripPage from '../views/TripPage.vue'
import ForumPage from '../views/ForumPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import CreateTripPage from '../views/CreateTripPage.vue';
import ForumCreatePostPage from '../views/ForumCreatePostPage.vue';
import EditProfilePage from '../views/EditProfilePage.vue';
import TripRequestPage from '../views/TripRequestPage.vue'
import TripDetailPage from '../views/TripDetailPage.vue';
import ForumDetailPage from '../views/ForumDetailPage.vue';
import AdminPage from '../views/AdminPage.vue';
import SearchResultsPage from '../views/SearchResultsPage.vue';
import ServicePage from '../views/ServicePage.vue';
import CreateServicePage from '../views/CreateServicePage.vue';
import OrganizerRegistrationPage from '../views/OrganizerRegistrationPage.vue';
import SpotsPage from '../views/SpotsPage.vue';
import SpotDetailPage from '../views/SpotDetailPage.vue';
import CreateSpotPage from '../views/CreateSpotPage.vue';
import ServiceDetailPage from '../views/ServiceDetailPage.vue';

// Import Firebase untuk cek role sebelum masuk page
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/trips', name: 'Trips', component: TripPage },
  { path: '/forum', name: 'Forum', component: ForumPage },
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
    component: CreateTripPage 
  },
  { path: '/forum/create', name: 'CreatePost', component: ForumCreatePostPage },
  { path: '/profile/edit', name: 'EditProfile', component: EditProfilePage },
  { path: '/requests', name: 'requests', component: TripRequestPage },
  { path: '/trips/:id', name: 'trip-detail', component: TripDetailPage },
  { path: '/forum/:id', name: 'forum-detail', component: ForumDetailPage },
  { path: '/forum/edit/:id', name: 'edit-post', component: ForumCreatePostPage },
  
  // 🔥 LALUAN ADMIN YANG DILINDUNGI 🔥
  { 
    path: '/admin', 
    name: 'admin', 
    component: AdminPage,
    meta: { requiresAdmin: true } // Tag khas untuk admin
  },
  
  { path: '/search', name: 'search', component: SearchResultsPage },
  { path: '/service', name: 'service', component: ServicePage },
  { path: '/create-service', name: 'create-service', component: CreateServicePage },
  { path: '/user/:id', name: 'public-profile', component: ProfilePage },
  { path: '/be-organizer', name: 'be-organizer', component: OrganizerRegistrationPage },
  { path: '/spots', name: 'spots', component: SpotsPage },
  { path: '/spots/:id', name: 'spot-detail', component: SpotDetailPage },
  { path: '/create-spot', name: 'create-spot', component: CreateSpotPage },
  { path: '/spots/edit/:id', name: 'edit-spot', component: CreateSpotPage },
  { path: '/service/:id', name: 'service-detail', component: ServiceDetailPage },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkActiveClass: 'router-link-active' 
})

// 🔥 GLOBAL GUARD: PENGAWAL KESELAMATAN ROUTER 🔥
router.beforeEach(async (to, from, next) => {
  // Tunggu Firebase Auth initialize dulu (elak user null masa refresh)
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
      // Cek role terus dari Firestore (bukan sekadar local storage)
      const userDoc = await getDoc(doc(db, "users", (currentUser as any).uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        next(); // Lulus, masuklah Boss
      } else {
        alert("⛔ AKSES DITOLAK: Anda bukan Admin.");
        next('/'); // Tendang balik ke home
      }
    } catch (e) {
      console.error("Security Check Error:", e);
      next('/');
    }
  } else {
    next(); // Laluan biasa
  }
});

export default router