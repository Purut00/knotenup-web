import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚠️ PENTING: Nanti anda perlu ganti kod ini dengan config dari Firebase Console anda sendiri.
// Buat masa ni, kita letak placeholder supaya kod tak error.
const firebaseConfig = {
  apiKey: "AIzaSyDjycGE-Pr8EtRAoX9cj-bNXuhtFKb-NyA",
  authDomain: "kpv6-4af4c.firebaseapp.com",
  projectId: "kpv6-4af4c",
  storageBucket: "kpv6-4af4c.firebasestorage.app",
  messagingSenderId: "959484978054",
  appId: "1:959484978054:web:59d7ab3f0d4a19dc45c207",
  measurementId: "G-QT0DF01NPH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Setup Providers (Google, FB, Apple)
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

export { auth, db, googleProvider, facebookProvider, appleProvider };