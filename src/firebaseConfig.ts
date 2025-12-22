import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider, 
 // connectAuthEmulator 
} from "firebase/auth";
import { 
  getFirestore, 
  //connectFirestoreEmulator 
} from "firebase/firestore";
import { 
  getStorage, 
  //connectStorageEmulator 
} from "firebase/storage";

// 🔥 1. IMPORT APP CHECK
import { 
  initializeAppCheck, 
  ReCaptchaV3Provider 
} from "firebase/app-check"; 

const firebaseConfig = {
apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔥 2. INITIALIZE APP CHECK (THE SECURITY SHIELD)
// Semak jika kod berjalan di browser (bukan server-side rendering)
if (typeof window !== "undefined") {
  
  // Untuk Localhost Testing supaya tak kena block
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    // Ini akan print "Debug Token" di console browser. 
    // Copy token itu dan letak di Firebase Console > App Check > Apps > Manage Debug Tokens
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    console.log("🛡️ App Check: Running in Debug Mode");
  }

  try {
    initializeAppCheck(app, {
      // ⚠️ GANTI 'MASUKKAN_SITE_KEY_RECAPTCHA_V3_DISINI' DENGAN KEY ANDA
      provider: new ReCaptchaV3Provider('6Ldu9SYsAAAAAH8yG6B4s50JguN5c8NpWO6OBQ8S'),
      
      // Auto refresh token supaya user tak kena kick out
      isTokenAutoRefreshEnabled: true 
    });
    console.log("🛡️ App Check: Activated");
  } catch (e) {
    console.error("🛡️ App Check Error:", e);
  }
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Connect to Emulators (Optional - kalau anda guna untuk development)
// if (location.hostname === "localhost") {
//   connectAuthEmulator(auth, "http://127.0.0.1:9099");
//   connectFirestoreEmulator(db, "127.0.0.1", 8080);
//   connectStorageEmulator(storage, "127.0.0.1", 9199);
// }

// Setup Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

export { auth, db, storage, googleProvider, facebookProvider, appleProvider };