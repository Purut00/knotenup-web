<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="login-card glass-modal">
      <button class="close-btn" @click="$emit('close')">✖</button>
      
      <div class="header">
        <h2>{{ t('auth.modalTitle') || 'Selamat Datang' }}</h2>
        <p>{{ t('auth.modalSub') || 'Log masuk untuk teruskan' }}</p>
      </div>

      <div class="button-stack">
        <button class="social-btn google" @click="loginWith('google')">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" />
          {{ t('auth.continueWith', { provider: 'Google' }) || 'Teruskan dengan Google' }}
        </button>
        
        <!-- Tambahan button lain jika perlu nanti -->
      </div>

      <p class="disclaimer">
        {{ t('auth.disclaimer') || 'Dengan log masuk, anda bersetuju dengan Terma & Syarat kami.' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider, appleProvider, db } from "../../firebaseConfig";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const { t } = useI18n();
const emit = defineEmits(['close']);
const router = useRouter();

const loginWith = async (providerName: string) => {
  let provider;
  if (providerName === 'google') provider = googleProvider;
  else if (providerName === 'facebook') provider = facebookProvider;
  else if (providerName === 'apple') provider = appleProvider;
  else return;

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Simpan User ke Firestore
    await saveUserToDB(user);

    // alert(`Welcome, ${user.displayName}!`); // Optional: Boleh buang kalau tak nak kacau
    emit('close'); 
    router.push('/profile'); 

  } catch (error: any) {
    console.error("Login Error:", error);
    alert("Login failed.");
  }
};

// Fungsi Simpan ke Database
const saveUserToDB = async (user: any) => {
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // User Baru: Cipta dokumen
      await setDoc(userRef, {
        name: user.displayName || 'User',
        email: user.email,
        avatar: user.photoURL || '',
        role: 'user', // Default role
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    } else {
      // User Lama: Update masa login
      await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    }
  } catch (e) {
    console.error("Error saving user:", e);
  }
};
</script>

<style scoped>
/* OVERLAY: Gelapkan belakang */
.modal-overlay { 
  position: fixed; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  background: rgba(0,0,0,0.6); /* Gelap sikit */
  z-index: 2000; 
  
  display: flex; 
  justify-content: center; 
  /* TUKAR: align-items center -> flex-start supaya boleh tolak ke bawah */
  align-items: flex-start; 
  
  /* PENTING: Tolak modal ke bawah (jarak dari atas) */
  padding-top: 100px; 
  padding-left: 1rem;
  padding-right: 1rem;
  backdrop-filter: blur(5px); /* Blur background belakang modal */
}

/* KAD LOGIN (GLASS EFFECT) */
.login-card { 
  width: 100%; 
  max-width: 400px; 
  padding: 2.5rem; 
  border-radius: 20px; 
  text-align: center; 
  position: relative; 
  
  /* 🔥 GLASS EFFECT SETTING 🔥 */
  background: rgba(255, 255, 255, 0.9); /* Putih lutsinar */
  backdrop-filter: blur(15px);           /* Blur content belakang kad */
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.5); /* Border halus */
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2); /* Shadow lembut */
}

.close-btn { 
  position: absolute; 
  top: 15px; 
  right: 15px; 
  background: rgba(0,0,0,0.05); /* Bulatan pudar */
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none; 
  font-size: 1rem; 
  cursor: pointer; 
  color: #666; 
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover { background: rgba(0,0,0,0.1); color: #333; }

.header h2 { margin: 0 0 0.5rem 0; color: #2c3e50; font-weight: 700; }
.header p { color: #666; margin-bottom: 2rem; font-size: 0.95rem; }

.button-stack { display: flex; flex-direction: column; gap: 1rem; }

.social-btn { 
  display: flex; align-items: center; justify-content: center; gap: 12px; 
  width: 100%; padding: 0.8rem; border-radius: 50px; 
  font-weight: 600; font-size: 1rem; cursor: pointer; 
  border: 1px solid rgba(0,0,0,0.1); 
  background: white; 
  color: #333; 
  transition: transform 0.1s, box-shadow 0.2s; 
}
.social-btn:hover { 
  background-color: #fff; 
  transform: translateY(-2px); 
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.social-btn img { width: 20px; height: 20px; }

.disclaimer { margin-top: 2rem; font-size: 0.75rem; color: #999; }
</style>