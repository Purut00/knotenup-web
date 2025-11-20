import { createRouter, createWebHistory } from 'vue-router'
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

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/trips',
    name: 'Trips',
    component: TripPage
  },
  {
    path: '/forum',
    name: 'Forum',
    component: ForumPage
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
    component: CreateTripPage
  },
  {
    path: '/forum/create',
    name: 'CreatePost',
    component: ForumCreatePostPage
  },
  {
    path: '/profile/edit',
    name: 'EditProfile',
    component: EditProfilePage
  },
  {
    path: '/requests',
    name: 'requests',
    component: TripRequestPage
  },
  {
  path: '/trips/:id', // :id bermaksud ia boleh berubah-ubah
  name: 'trip-detail',
  component: TripDetailPage
  },
  {
  path: '/forum/:id',
  name: 'forum-detail',
  component: ForumDetailPage
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Ini akan menambah 'class' pada link navbar yang aktif
  linkActiveClass: 'router-link-active' 
})

export default router