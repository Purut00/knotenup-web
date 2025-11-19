<template>
  <div class="search-wrapper">
    <div class="search-box">
      <input 
        type="text" 
        v-model="searchQuery" 
        :placeholder="placeholder" 
        @keyup.enter="triggerSearch"
      />
      <button @click="triggerSearch">Cari</button>
    </div>
    <p v-if="searchScope" class="scope-text">Carian dalam: {{ searchScope }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Menerima tetapan dari page luar
defineProps<{
  placeholder: string;
  searchScope?: string; // Optional: Teks untuk beritahu user skop carian
}>();

// Setup event untuk hantar data keluar
const emit = defineEmits(['handle-search']);

const searchQuery = ref('');

const triggerSearch = () => {
  // Hantar text carian kepada page induk
  emit('handle-search', searchQuery.value);
};
</script>

<style scoped>
.search-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.search-box {
  background: white;
  padding: 0.5rem;
  border-radius: 50px;
  display: flex;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  border: 1px solid #eee;
}

.search-box input {
  flex: 1;
  border: none;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  outline: none;
  border-radius: 50px 0 0 50px;
  background: transparent;
}

.search-box button {
  background-color: #e67e22;
  color: white;
  border: none;
  padding: 0 2rem;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: background 0.3s;
}

.search-box button:hover {
  background-color: #d35400;
}

.scope-text {
  font-size: 0.8rem;
  color: #fff; /* Putih sebab selalunya duduk atas gambar banner */
  margin-top: 0.5rem;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}
</style>