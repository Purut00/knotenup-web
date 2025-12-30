<template>
  <div class="language-switcher">
    <select v-model="locale" @change="onLocaleChange" class="p-[0.4rem] border border-[#ccc] rounded-[5px] bg-[#f9f9f9] text-black">
      <option value="ms">Bahasa Melayu</option>
      <option value="en">English</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { watch } from 'vue';

const { locale } = useI18n();

// Fungsi untuk menukar bahasa
const onLocaleChange = (event: Event) => {
  const newLocale = (event.target as HTMLSelectElement).value;
  locale.value = newLocale;
};

// Simpan pilihan bahasa dalam localStorage
watch(locale, (newLocale) => {
  localStorage.setItem('locale', newLocale);
});
</script>