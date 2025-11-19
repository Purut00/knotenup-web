<template>
  <div class="language-switcher">
    <select v-model="locale" @change="onLocaleChange" class="locale-select">
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

<style scoped>
.locale-select {
  padding: 0.4rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}
</style>