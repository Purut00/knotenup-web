import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import router from './router' // <-- Import router kita

// Import fail-fail terjemahan kita
import ms from './locales/ms.json'
import en from './locales/en.json'
import zhCN from './locales/zh-CN.json'


// 1. Setup I18n (Dwi-bahasa)
const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'en', // Guna bahasa terakhir atau 'ms'
  fallbackLocale: 'en',
  messages: {
    ms: ms,
    en: en,
    'zh-CN': zhCN
  }
})

// 2. Cipta App
const app = createApp(App)

// 3. Beritahu App untuk guna Router dan I18n
app.use(router)
app.use(i18n)

// 4. "Mount" App
app.mount('#app')