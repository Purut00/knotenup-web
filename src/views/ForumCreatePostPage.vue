<template>
  <div class="create-post-page">
    <div class="form-card">
      <h2>✍️ {{ isEditing ? 'Kemaskini Topik' : t('forum.createPost') }}</h2>
      
      <div class="form-group">
        <label>{{ t('createTrip.tripTitle') }}</label>
        <input type="text" v-model="form.title" placeholder="Tajuk topik..." />
      </div>

      <div class="form-group">
        <label>{{ t('createTrip.category') }}</label>
        <select v-model="form.category">
          <option disabled value="">Pilih Kategori</option>
          <optgroup v-for="group in ACTIVITY_CATEGORIES" :key="group.group" :label="group.group">
            <option v-for="item in group.items" :key="item" :value="item">{{ item }}</option>
          </optgroup>
        </select>
      </div>

      <div class="form-group">
        <label>Kandungan</label>
        <textarea v-model="form.content" rows="6" placeholder="Tulis sesuatu..."></textarea>
      </div>

      <div class="form-actions">
        <button @click="$router.back()" class="btn-cancel">{{ t('common.cancel') }}</button>
        <button @click="submitPost" class="btn-submit" :disabled="loading">
          {{ loading ? t('common.loading') : (isEditing ? 'Kemaskini' : t('common.submit')) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ACTIVITY_CATEGORIES } from '../constants/data';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';

const { t } = useI18n();
const router = useRouter();
const route = useRoute(); // Untuk baca ID dari URL
const loading = ref(false);
const isEditing = ref(false); // Flag Edit Mode
const postId = route.params.id as string;

const form = reactive({ title: '', category: '', content: '' });

onMounted(async () => {
  // Kalau ada ID di URL, maksudnya kita nak EDIT
  if (postId) {
    isEditing.value = true;
    loading.value = true;
    try {
      const docSnap = await getDoc(doc(db, "forum_posts", postId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Isi borang dengan data sedia ada
        form.title = data.title;
        form.category = data.category;
        form.content = data.content;
      }
    } catch (e) {
      console.error("Error fetch:", e);
    } finally {
      loading.value = false;
    }
  }
});

const submitPost = async () => {
  if (!auth.currentUser) return alert("Sila login.");
  if(!form.title || !form.category || !form.content) return alert("Sila isi semua.");

  loading.value = true;

  try {
    if (isEditing.value) {
      // MODE EDIT: Update doc sedia ada
      await updateDoc(doc(db, "forum_posts", postId), {
        title: form.title,
        category: form.category,
        content: form.content,
        updatedAt: serverTimestamp() // Rekod masa update
      });
      alert("Topik berjaya dikemaskini!");
    } else {
      // MODE CREATE: Buat doc baru
      await addDoc(collection(db, "forum_posts"), {
        title: form.title,
        category: form.category,
        content: form.content,
        authorId: auth.currentUser.uid,
        author: auth.currentUser.displayName || 'Anonymous',
        authorAvatar: auth.currentUser.photoURL || '',
        createdAt: serverTimestamp(),
        votes: 0,
        commentCount: 0
      });
      alert("Topik berjaya diterbitkan!");
    }
    router.push('/forum');

  } catch (error) {
    console.error("Error:", error);
    alert("Gagal.");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* CSS KEKAL SAMA */
.create-post-page { padding: 2rem; background: #dae0e6; min-height: 100vh; display: flex; justify-content: center; }
.form-card { background: white; padding: 2rem; width: 100%; max-width: 600px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
h2 { margin-bottom: 1.5rem; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 1rem; }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; font-weight: bold; margin-bottom: 0.5rem; }
input, select, textarea { width: 100%; padding: 0.8rem; border: 1px solid #ccc; border-radius: 4px; }
.form-actions { display: flex; justify-content: flex-end; gap: 1rem; }
.btn-cancel { background: none; border: 1px solid #ccc; padding: 0.6rem 1.5rem; border-radius: 20px; cursor: pointer; }
.btn-submit { background: #0079d3; color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 20px; font-weight: bold; cursor: pointer; }
.btn-submit:disabled { background-color: #ccc; cursor: not-allowed; }
</style>