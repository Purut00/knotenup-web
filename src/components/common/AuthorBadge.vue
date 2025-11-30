<template>
  <div class="author-badge">
    <img 
      :src="userData.avatar || fallbackAvatar || 'https://i.pravatar.cc/150?img=3'" 
      class="author-avatar" 
      alt="Avatar"
      @error="handleImgError"
    />
    
    <div class="author-meta">
      <span class="author-name" :class="{ 'is-organizer': userData.role === 'organizer' }">
        {{ userData.name }}
        <span v-if="userData.role === 'organizer'" class="org-tag">ORG</span>
      </span>
      
      <slot name="subtext"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Tambah props fallbackName & fallbackAvatar
const props = defineProps<{
  userId: string,
  fallbackName?: string,   // Nama asal dari komen (Backup)
  fallbackAvatar?: string  // Gambar asal dari komen (Backup)
}>();

const userData = ref({
  name: props.fallbackName || 'User', // Guna backup dulu sementara loading
  avatar: props.fallbackAvatar || '',
  role: 'user'
});

const fetchUser = async () => {
  if (!props.userId) return;

  try {
    const docSnap = await getDoc(doc(db, 'users', props.userId));
    
    if (docSnap.exists()) {
      // ✅ KES 1: User ada profile dalam Firestore (Dah edit profile)
      const data = docSnap.data();
      userData.value.name = data.name || data.fullName || props.fallbackName || 'User';
      userData.value.avatar = data.avatar || props.fallbackAvatar || '';
      userData.value.role = data.role || 'user';
    } else {
      // ⚠️ KES 2: User login Google tapi belum save profile (Guna data backup dari komen)
      userData.value.name = props.fallbackName || 'User Google';
      userData.value.avatar = props.fallbackAvatar || '';
    }
  } catch (e) {
    // Kalau error, kekalkan data backup
    console.error("Error fetch author:", e);
  }
};

const handleImgError = (e: any) => {
  e.target.src = 'https://i.pravatar.cc/150?img=3';
};

onMounted(fetchUser);
watch(() => props.userId, fetchUser);
</script>

<style scoped>
.author-badge { display: flex; gap: 10px; align-items: flex-start; }
.author-avatar { width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 1px solid #eee; }
.author-meta { display: flex; flex-direction: column; }
.author-name { font-weight: bold; font-size: 0.9rem; color: #2c3e50; display: flex; align-items: center; gap: 5px;}
.is-organizer { color: #e67e22; }
.org-tag { font-size: 0.6rem; background: #e67e22; color: white; padding: 1px 4px; border-radius: 3px; }
</style>