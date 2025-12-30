<template>
  <div class="w-full flex flex-col items-center">
    <div class="bg-white p-2 rounded-full flex w-full max-w-[600px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-gray-100">
      <input 
        type="text" 
        v-model="searchQuery" 
        :placeholder="placeholder" 
        @keyup.enter="triggerSearch"
        class="flex-1 border-none px-6 py-3 text-base outline-none rounded-l-full bg-transparent placeholder-slate-400 text-slate-700"
      />
      <button 
        @click="triggerSearch"
        class="bg-accent-500 text-white border-none px-8 text-base font-bold rounded-full cursor-pointer transition-colors duration-300 hover:bg-accent-600"
      >
        {{ t('common.search') }}
      </button>
    </div>
    
    <p v-if="searchScope" class="text-xs text-white mt-2 opacity-90 drop-shadow-md">
      {{ t('common.searchScope') }} {{ searchScope }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n'; // 1. Import

const { t } = useI18n(); // 2. Activate

// Menerima tetapan dari page luar
defineProps<{
  placeholder: string;
  searchScope?: string; 
}>();

// Setup event untuk hantar data keluar
const emit = defineEmits(['handle-search']);

const searchQuery = ref('');

const triggerSearch = () => {
  emit('handle-search', searchQuery.value);
};
</script>