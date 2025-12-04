<template>
  <div class="create-post-page">
    
    <!-- BACKGROUND LAYERS -->
    <div class="contour-lines"></div>
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <!-- MAIN CONTAINER -->
    <!-- FIX: Guna inline style untuk paksa padding-top (override CSS class yang degil) -->
    <div class="container relative z-10" style="padding-top: 100px; padding-bottom: 80px;">
      
      <div class="glass-form-container fade-up">
        <div class="header-section text-center mb-8">
            <h2 class="text-3xl font-bold text-white mb-2">
                {{ isEditing ? '✏️ Kemaskini Topik' : '✍️ Cipta Topik Baru' }}
            </h2>
            <p class="text-gray-400 text-sm">Kongsi pengalaman, soalan, atau tips menarik anda di sini.</p>
        </div>

        <!-- FORM -->
        <div class="form-content">
            
            <!-- TAJUK -->
            <div class="form-group">
                <label class="text-gray-300 font-semibold mb-2 block">Tajuk Perbincangan</label>
                <input 
                    type="text" 
                    v-model="form.title" 
                    class="glass-input" 
                    placeholder="Contoh: Trip ke Gunung Kinabalu 2024..." 
                />
            </div>

            <!-- KATEGORI -->
            <div class="form-group">
                <label class="text-gray-300 font-semibold mb-2 block">Kategori</label>
                <div class="select-wrapper">
                    <select v-model="form.category" class="glass-input">
                        <option disabled value="">- Sila Pilih Kategori -</option>
                        <optgroup v-for="group in ACTIVITY_CATEGORIES" :key="group.group" :label="group.group">
                            <option v-for="item in group.items" :key="item" :value="item">{{ item }}</option>
                        </optgroup>
                    </select>
                    <i class="fas fa-chevron-down select-arrow"></i>
                </div>
            </div>

            <!-- KANDUNGAN -->
            <div class="form-group">
                <label class="text-gray-300 font-semibold mb-2 block">Isi Kandungan</label>
                <textarea 
                    v-model="form.content" 
                    rows="8" 
                    class="glass-input" 
                    placeholder="Tulis butiran lanjut di sini..."
                ></textarea>
                <div class="text-right mt-1">
                    <small :class="wordCount > 500 ? 'text-red-400' : 'text-gray-500'">
                        {{ wordCount }} patah perkataan
                    </small>
                </div>
            </div>

            <!-- ACTIONS -->
            <div class="form-actions mt-8 flex gap-4">
                <button @click="$router.back()" class="btn-cancel">
                    Batal
                </button>
                <button @click="submitPost" class="btn-submit" :disabled="loading">
                    <span v-if="loading"><i class="fas fa-spinner fa-spin mr-2"></i> Memproses...</span>
                    <span v-else>{{ isEditing ? 'Simpan Perubahan' : 'Terbitkan Topik' }}</span>
                </button>
            </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
// import { useI18n } from 'vue-i18n'; // Optional: Boleh uncomment jika guna i18n
import { ACTIVITY_CATEGORIES } from '../constants/data';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { isSpam, getDetectedSpamWord } from '../utils/spamFilter';
import { checkRateLimit } from '../utils/rateLimiter';

// const { t } = useI18n(); 
const router = useRouter();
const route = useRoute();
const loading = ref(false);
const isEditing = ref(false);
const postId = route.params.id as string;

const form = reactive({ title: '', category: '', content: '' });

// Kira patah perkataan untuk UX
const wordCount = computed(() => {
    return form.content.trim().split(/\s+/).filter(word => word.length > 0).length;
});

onMounted(async () => {
  // Kalau ada ID di URL, maksudnya kita nak EDIT
  if (postId) {
    isEditing.value = true;
    loading.value = true;
    try {
      const docSnap = await getDoc(doc(db, "forum_posts", postId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        form.title = data.title;
        form.category = data.category;
        form.content = data.content;
      } else {
        alert("Topik tidak dijumpai!");
        router.push('/forum');
      }
    } catch (e) {
      console.error("Error fetch:", e);
    } finally {
      loading.value = false;
    }
  }
});

const submitPost = async () => {
  if (!auth.currentUser) return alert("Sila log masuk untuk membuat hantaran.");

  // 1. RATE LIMIT CHECK
  const limitCheck = checkRateLimit('create_post'); 
  if (!limitCheck.allowed) {
    alert(limitCheck.message);
    return;
  }

  // 2. EMPTY FIELDS CHECK
  if(!form.title || !form.category || !form.content) return alert("Sila isi semua maklumat.");

  // 3. SPAM FILTER CHECK (PENTING: Check sebelum hantar ke DB!)
  const combinedText = `${form.title} ${form.content}`;
  if (isSpam(combinedText)) {
    const badWord = getDetectedSpamWord(combinedText);
    alert(`⚠️ MAAF: Post anda mengandungi perkataan yang dilarang ("${badWord}"). Sila patuhi etika komuniti.`);
    return; // Stop execution sini
  }

  // 4. DATABASE OPERATIONS
  loading.value = true;
  try {
    if (isEditing.value) {
      // MODE EDIT
      await updateDoc(doc(db, "forum_posts", postId), {
        title: form.title,
        category: form.category,
        content: form.content,
        updatedAt: serverTimestamp(),
        isEdited: true
      });
      alert("Topik berjaya dikemaskini!");
    } else {
      // MODE CREATE
      await addDoc(collection(db, "forum_posts"), {
        title: form.title,
        category: form.category,
        content: form.content,
        authorId: auth.currentUser.uid,
        author: auth.currentUser.displayName || 'Anonymous',
        authorAvatar: auth.currentUser.photoURL || '',
        createdAt: serverTimestamp(),
        votes: 0,
        commentCount: 0,
        views: 0
      });
      alert("Topik berjaya diterbitkan!");
    }
    
    router.push('/forum'); // Redirect balik ke forum

  } catch (error) {
    console.error("Error:", error);
    alert("Gagal memproses permintaan. Sila cuba lagi.");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* --- BASE THEME (DARK - MATCHING PROFILE PAGE) --- */
.create-post-page { 
  background-color: #0f172a; 
  min-height: 100vh; position: relative; overflow-x: hidden; color: white;
}

/* FIX: Pecahkan padding supaya tak kacau vertical padding */
.container { 
    max-width: 800px; 
    margin: 0 auto; 
    padding-left: 1.5rem; 
    padding-right: 1.5rem;
    /* Dulu ada 'padding: 0 1.5rem' di sini yang reset padding-top jadi 0. Sekarang dah buang. */
}

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

/* --- GLASS CONTAINER --- */
.glass-form-container {
  background: rgba(30, 41, 59, 0.7); 
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px; padding: 3rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}

.form-group { margin-bottom: 1.5rem; position: relative; }

/* GLASS INPUTS */
.glass-input {
  width: 100%; padding: 14px 16px; border-radius: 12px; 
  border: 1px solid rgba(255,255,255,0.1); background: rgba(15, 23, 42, 0.6);
  color: white; outline: none; transition: 0.3s; font-size: 1rem;
}
.glass-input:focus { 
    border-color: #6c63ff; 
    background: rgba(15, 23, 42, 0.8); 
    box-shadow: 0 0 0 4px rgba(108, 99, 255, 0.1);
}
.glass-input::placeholder { color: #64748b; }
.glass-input option, .glass-input optgroup { background-color: #1e293b; color: white; }

/* SELECT DROPDOWN STYLE */
.select-wrapper { position: relative; }
.select-arrow { 
    position: absolute; right: 15px; top: 50%; transform: translateY(-50%); 
    color: #94a3b8; pointer-events: none; transition: 0.3s;
}
.glass-input:focus + .select-arrow { color: #6c63ff; transform: translateY(-50%) rotate(180deg); }
select.glass-input { appearance: none; cursor: pointer; }

/* ACTIONS */
.form-actions { display: flex; justify-content: flex-end; }
.btn-submit { 
    flex: 2;
    background: linear-gradient(135deg, #6c63ff, #5b54e0); 
    color: white; padding: 14px 24px; border: none; border-radius: 12px; 
    font-weight: 600; font-size: 1rem; cursor: pointer; transition: 0.3s;
    box-shadow: 0 4px 15px rgba(108, 99, 255, 0.3);
}
.btn-submit:hover:not(:disabled) { 
    transform: translateY(-2px); 
    box-shadow: 0 8px 25px rgba(108, 99, 255, 0.5);
    background: linear-gradient(135deg, #7b72ff, #655ee6); 
}
.btn-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

.btn-cancel { 
    flex: 1;
    background: transparent; 
    border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; 
    padding: 14px 24px; border-radius: 12px; cursor: pointer; 
    font-weight: 600; transition: 0.3s;
}
.btn-cancel:hover { background: rgba(255,255,255,0.05); color: white; border-color: rgba(255,255,255,0.3); }

/* ANIMATION */
.fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

/* RESPONSIVE */
@media (max-width: 640px) {
    .glass-form-container { padding: 1.5rem; }
    .form-actions { flex-direction: column-reverse; }
    .btn-submit, .btn-cancel { width: 100%; }
}
</style>