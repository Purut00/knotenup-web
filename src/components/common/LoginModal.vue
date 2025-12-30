<template>
  <div class="fixed top-0 left-0 w-full h-full bg-black/60 z-[2000] flex justify-center items-start pt-[100px] px-4 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="relative w-full max-w-[400px] p-10 rounded-[20px] text-center bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
      <button class="absolute top-4 right-4 bg-black/5 w-8 h-8 rounded-full border-none flex items-center justify-center text-gray-500 hover:bg-black/10 hover:text-gray-800 transition-all cursor-pointer" @click="$emit('close')">✖</button>
      
      <div class="mb-8">
        <h2 class="m-0 mb-2 text-slate-700 font-bold text-2xl">{{ t('auth.modalTitle') || 'Selamat Datang' }}</h2>
        <p class="text-gray-500 text-sm">{{ t('auth.modalSub') || 'Log masuk untuk teruskan' }}</p>
      </div>

      <div class="flex flex-col gap-4">
        <button class="flex items-center justify-center gap-3 w-full p-3 rounded-full font-semibold text-base border border-black/10 bg-white text-gray-800 hover:bg-white hover:-translate-y-0.5 hover:shadow-lg transition-all" @click="loginWith('google')">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" class="w-5 h-5" />
          {{ t('auth.continueWith', { provider: 'Google' }) || 'Teruskan dengan Google' }}
        </button>
        
        <!-- Tambahan button lain jika perlu nanti -->
      </div>

      <p class="mt-8 text-xs text-gray-400">
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