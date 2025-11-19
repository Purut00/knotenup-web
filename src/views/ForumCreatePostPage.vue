<template>
  <div class="create-post-page">
    <div class="form-card">
      <h2>✍️ Cipta Topik Baru</h2>
      
      <div class="form-group">
        <label>Tajuk Topik</label>
        <input type="text" v-model="form.title" placeholder="Contoh: Di mana lokasi hiking terbaik untuk beginner?" />
      </div>

      <div class="form-group">
        <label>Kategori</label>
        <select v-model="form.category">
          <option disabled value="">Pilih Kategori</option>
          <optgroup v-for="group in ACTIVITY_CATEGORIES" :key="group.group" :label="group.group">
            <option v-for="item in group.items" :key="item" :value="item">{{ item }}</option>
          </optgroup>
        </select>
      </div>

      <div class="form-group">
        <label>Kandungan / Soalan</label>
        <textarea v-model="form.content" rows="6" placeholder="Tulis pertanyaan atau pengalaman anda di sini..."></textarea>
      </div>

      <div class="form-actions">
        <button @click="$router.back()" class="btn-cancel">Batal</button>
        <button @click="submitPost" class="btn-submit">Terbitkan</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ACTIVITY_CATEGORIES } from '../constants/data';

const router = useRouter();
const form = reactive({ title: '', category: '', content: '' });

const submitPost = () => {
  if(!form.title || !form.category) return alert("Sila isi tajuk dan kategori");
  alert("Topik berjaya diterbitkan!");
  router.push('/forum');
};
</script>

<style scoped>
.create-post-page { padding: 2rem; background: #dae0e6; min-height: 100vh; display: flex; justify-content: center; }
.form-card { background: white; padding: 2rem; width: 100%; max-width: 600px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
h2 { margin-bottom: 1.5rem; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 1rem; }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; font-weight: bold; margin-bottom: 0.5rem; }
input, select, textarea { width: 100%; padding: 0.8rem; border: 1px solid #ccc; border-radius: 4px; }
.form-actions { display: flex; justify-content: flex-end; gap: 1rem; }
.btn-cancel { background: none; border: 1px solid #ccc; padding: 0.6rem 1.5rem; border-radius: 20px; cursor: pointer; }
.btn-submit { background: #0079d3; color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 20px; font-weight: bold; cursor: pointer; }
</style>