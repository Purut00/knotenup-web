<template>
  <div class="flex gap-2.5 items-start">
    <img 
      :src="userData.avatar || fallbackAvatar || 'https://i.pravatar.cc/150?img=3'" 
      class="w-[35px] h-[35px] rounded-full object-cover border border-gray-100" 
      alt="Avatar"
      @error="handleImgError"
    />
    
    <div class="flex flex-col">
      <span 
        class="font-bold text-sm text-slate-700 flex items-center gap-1.5"
        :class="{ 'text-accent-500': userData.role === 'organizer' }"
      >
        {{ userData.name }}
        <span v-if="userData.role === 'organizer'" class="text-[0.6rem] bg-accent-500 text-white px-1 py-[1px] rounded-[3px]">ORG</span>
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