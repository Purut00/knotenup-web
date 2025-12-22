<template>
  <div class="create-buddy-page">
    
    <div class="contour-lines"></div>
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <div class="container pt-32 pb-20">
      
      <div class="text-center mb-10 relative z-10">
        <h1 class="text-4xl font-bold text-white mb-2">Cari Geng Hiking (Buddy) 🥾</h1>
        <p class="text-gray-400">"Tak perlu guide, cuma perlukan kawan. Jom tong-tong minyak!"</p>
      </div>

      <div class="glass-form-card relative z-10 fade-up max-w-2xl mx-auto">
        
        <h2 class="section-title">Info Trip Santai</h2>
        
        <div class="form-group">
          <label>Lokasi / Gunung</label>
          <input 
            type="text" 
            v-model="form.location" 
            class="glass-input" 
            placeholder="Cth: Gunung Datuk, Rembau" 
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Tarikh</label>
            <input type="date" v-model="form.date" class="glass-input" />
          </div>
          <div class="form-group">
            <label>Masa Jumpa (Tayar Golek)</label>
            <input type="time" v-model="form.time" class="glass-input" />
          </div>
        </div>

        <div class="form-row mt-4">
          <div class="form-group">
            <label>Jangkaan Pace (Kelajuan)</label>
            <div class="select-wrapper">
                <select v-model="form.pace" class="glass-input">
                  <option value="Santai (Bergambar)">Santai (Banyak Bergambar)</option>
                  <option value="Sederhana">Sederhana (Training)</option>
                  <option value="Laju (Pewai)">Laju / Trail Run</option>
                </select>
                <i class="fas fa-chevron-down select-arrow"></i>
            </div>
          </div>
          <div class="form-group">
             <label>Status Transport (Carpool)</label>
             <div class="select-wrapper">
                <select v-model="form.carpool" class="glass-input">
                  <option value="Sendiri">Saya gerak sendiri</option>
                  <option value="Driver">Saya bawa kereta (Ada kosong)</option>
                  <option value="Passenger">Saya cari tumpang (Tong-tong minyak)</option>
                </select>
                <i class="fas fa-chevron-down select-arrow"></i>
            </div>
          </div>
        </div>

        <div class="form-group mt-4">
          <label>Link WhatsApp Group / Personal</label>
          <input 
            type="text" 
            v-model="form.whatsappLink" 
            class="glass-input" 
            placeholder="https://chat.whatsapp.com/..." 
          />
          <small class="text-gray-400 mt-1 block text-xs">
             *Link ini akan dipaparkan kepada sesiapa yang berminat.
          </small>
        </div>

        <div class="form-group mt-4">
           <label>Nota Tambahan (Optional)</label>
           <textarea v-model="form.notes" rows="3" class="glass-input" placeholder="Cth: Kita jumpa kat Petronas, pastu gerak sekali..."></textarea>
        </div>

        <div class="mt-6 p-4 rounded-lg bg-red-900/20 border border-red-500/30">
           <label class="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" v-model="form.declaration" class="mt-1 w-5 h-5 accent-red-500" />
              <span class="text-sm text-gray-300">
                <strong>PENAFIAN & TANGGUNGJAWAB:</strong> Saya faham ini adalah trip persendirian ("Open Trip") tanpa guide rasmi. Saya bertanggungjawab sepenuhnya atas keselamatan diri sendiri dan rakan yang saya bawa. Platform ini hanya medium pencarian kawan.
              </span>
           </label>
        </div>

        <div class="form-actions mt-8 flex justify-end">
           <button @click="submitForm" class="btn-submit" :disabled="loading || !form.declaration">
             {{ loading ? 'Sedang Publish...' : '🚀 Publish Open Trip' }}
           </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 

const router = useRouter();
const loading = ref(false);

const form = reactive({
  location: '',
  date: '',
  time: '',
  pace: 'Santai (Bergambar)',
  carpool: 'Sendiri',
  whatsappLink: '',
  notes: '',
  declaration: false
});

const submitForm = async () => {
  if (!auth.currentUser) { alert("Sila login dulu!"); return; }
  if (!form.location || !form.date || !form.whatsappLink) {
    alert("Sila isi maklumat wajib (Lokasi, Tarikh, Link WhatsApp).");
    return;
  }

  loading.value = true;

  try {
    await addDoc(collection(db, 'buddies'), {
      ...form,
      hostId: auth.currentUser.uid,
      hostName: auth.currentUser.displayName || 'Hiker',
      hostAvatar: auth.currentUser.photoURL || '',
      createdAt: serverTimestamp(),
      status: 'active' // active, full, expired
    });

    alert("Trip Buddy berjaya di-publish!");
    router.push('/forum'); // Atau redirect ke page senarai buddy nanti
  } catch (error) {
    console.error("Error:", error);
    alert("Gagal mencipta trip.");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* REUSE STYLE DARI CreateTripPage.vue SUPAYA TEMA SAMA */
.create-buddy-page { 
  background-color: #0f172a; 
  min-height: 100vh; position: relative; overflow-x: hidden; color: white;
}
.container { max-width: 800px; margin: 0 auto; padding: 0 1.5rem; position: relative; z-index: 2; }

/* GLOWS */
.page-glow-purple {
  position: absolute; top: 0; left: 0; width: 60vw; height: 60vw;
  background: #6c63ff; filter: blur(150px); opacity: 0.15; pointer-events: none; border-radius: 50%;
}
.page-glow-orange {
  position: absolute; bottom: 0; right: 0; width: 60vw; height: 60vw;
  background: #ff8c42; filter: blur(150px); opacity: 0.1; pointer-events: none; border-radius: 50%;
}
.contour-lines {
  position: absolute; inset: 0; z-index: 0; opacity: 0.08;
  background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400' stroke='white' fill='none' stroke-width='2' opacity='0.5'/%3E%3C/svg%3E");
  background-size: cover; pointer-events: none;
}

/* GLASS CARD */
.glass-form-card {
  background: rgba(30, 41, 59, 0.6); 
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px; padding: 2.5rem;
  backdrop-filter: blur(15px);
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}

.section-title { font-size: 1.5rem; color: white; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; font-weight: 700; }

.form-group { margin-bottom: 1.2rem; }
.form-group label { display: block; font-size: 0.9rem; color: #cbd5e1; margin-bottom: 8px; font-weight: 600; }

.glass-input {
  width: 100%; padding: 12px; border-radius: 10px; 
  border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3);
  color: white; outline: none; transition: 0.3s; font-size: 1rem;
}
.glass-input:focus { border-color: #6c63ff; background: rgba(0,0,0,0.5); }
.glass-input option { background-color: #1e293b; color: white; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.select-wrapper { position: relative; }
.select-arrow { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
.glass-input { appearance: none; }

.btn-submit {
  background: linear-gradient(135deg, #e67e22, #d35400); color: white;
  border: none; padding: 12px 30px; border-radius: 50px; font-weight: 700;
  cursor: pointer; box-shadow: 0 4px 15px rgba(230, 126, 34, 0.4); transition: 0.2s;
  width: 100%;
}
.btn-submit:hover { transform: translateY(-2px); }
.btn-submit:disabled { background: #555; cursor: not-allowed; transform: none; box-shadow: none; opacity: 0.7; }

@media (max-width: 768px) {
  .form-row { grid-template-columns: 1fr; gap: 0; }
  .container { padding-top: 100px; }
}
</style>