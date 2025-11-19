import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider } from "firebase/auth";

// ⚠️ PENTING: Nanti anda perlu ganti kod ini dengan config dari Firebase Console anda sendiri.
// Buat masa ni, kita letak placeholder supaya kod tak error.
const firebaseConfig = {
  apiKey: "API_KEY_ANDA_DI_SINI",
  authDomain: "knotenup-web.firebaseapp.com",
  projectId: "knotenup-web",
  storageBucket: "knotenup-web.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Setup Providers (Google, FB, Apple)
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

export { auth, googleProvider, facebookProvider, appleProvider };