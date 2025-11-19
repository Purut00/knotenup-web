<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="login-card">
      <button class="close-btn" @click="$emit('close')">✖</button>
      
      <div class="header">
        <h2>Mula Pengembaraan</h2>
        <p>Masuk untuk akses penuh ke Trip & Forum.</p>
      </div>

      <div class="button-stack">
        <button class="social-btn google" @click="loginWith('google')">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" />
          Teruskan dengan Google
        </button>

        <button class="social-btn facebook" @click="loginWith('facebook')">
          <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="F" />
          Teruskan dengan Facebook
        </button>

        <button class="social-btn apple" @click="loginWith('apple')">
          <img src="https://www.svgrepo.com/show/445606/apple-logo.svg" alt="A" />
          Teruskan dengan Apple
        </button>
      </div>

      <p class="disclaimer">
        Dengan mendaftar, anda bersetuju dengan <a href="#">Terma</a> & <a href="#">Privasi</a> kami.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider, appleProvider } from "../../firebaseConfig";
import { useRouter } from "vue-router";

const emit = defineEmits(['close']);
const router = useRouter();

const loginWith = async (providerName: string) => {
  let provider;
  
  // Pilih Provider
  if (providerName === 'google') provider = googleProvider;
  else if (providerName === 'facebook') provider = facebookProvider;
  else if (providerName === 'apple') provider = appleProvider;
  else return;

  try {
    // 🔥 INI MAGIC DIA: Popup Firebase keluar sini
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    console.log("Berjaya login:", user.displayName);
    alert(`Selamat datang, ${user.displayName}!`);
    
    // Simpan info user (Sementara kita guna localStorage je dulu)
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', user.displayName || 'User');
    localStorage.setItem('userPhoto', user.photoURL || '');

    emit('close'); // Tutup modal
    router.push('/profile'); // Redirect ke profile

  } catch (error: any) {
    console.error("Login Error:", error);
    alert("Gagal log masuk. Pastikan API Key Firebase anda betul.");
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); z-index: 2000;
  display: flex; justify-content: center; align-items: center;
  padding: 1rem; backdrop-filter: blur(3px);
}

.login-card {
  background: white; width: 100%; max-width: 400px;
  padding: 2.5rem; border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  text-align: center; position: relative;
}

.close-btn {
  position: absolute; top: 15px; right: 15px;
  background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #999;
}

.header h2 { margin: 0 0 0.5rem 0; color: #2c3e50; }
.header p { color: #666; margin-bottom: 2rem; font-size: 0.95rem; }

.button-stack { display: flex; flex-direction: column; gap: 1rem; }

.social-btn {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  width: 100%; padding: 0.8rem; border-radius: 50px;
  font-weight: 600; font-size: 1rem; cursor: pointer;
  border: 1px solid #ddd; background: white; color: #333;
  transition: transform 0.1s, background 0.2s;
}

.social-btn:hover { background-color: #f7f7f7; transform: scale(1.02); }
.social-btn img { width: 20px; height: 20px; }

/* Warna spesifik sikit untuk nampak premium */
.social-btn.facebook { border-color: #1877F2; color: #1877F2; }
.social-btn.facebook:hover { background: #1877F2; color: white; }
.social-btn.apple { border-color: #000; color: #000; }
.social-btn.apple:hover { background: #000; color: white; }

.disclaimer { margin-top: 2rem; font-size: 0.75rem; color: #999; }
.disclaimer a { color: #555; text-decoration: underline; }
</style>