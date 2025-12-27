<template>
  <footer class="bg-slate-900 border-t border-white/5 pt-16 mt-auto text-slate-300">
    <div class="container-std">
      
      <!-- Footer Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-white/5">
        
        <!-- Logo Col -->
        <div class="flex flex-col gap-4">
          <h2 class="text-3xl font-display font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent w-fit mb-0">
            KnotenUp
          </h2>
          <p class="text-sm leading-relaxed text-slate-400 max-w-xs">
            {{ t('footer.desc') }}
          </p>
        </div>

        <!-- Links Col -->
        <div>
          <h3 class="text-white font-bold uppercase tracking-wider text-sm mb-4">{{ t('footer.quickLinks') }}</h3>
          <ul class="space-y-2 text-sm">
            <li><router-link to="/" class="hover:text-primary-400 transition-colors">{{ t('navbar.home') }}</router-link></li>
            <li><router-link to="/trips" class="hover:text-primary-400 transition-colors">{{ t('navbar.trips') }}</router-link></li>
            <li><router-link to="/service" class="hover:text-primary-400 transition-colors">{{ t('directory.title') }}</router-link></li>
            <li><router-link to="/forum" class="hover:text-primary-400 transition-colors">{{ t('navbar.forum') }}</router-link></li>
            <li><router-link to="/requests" class="hover:text-primary-400 transition-colors">{{ t('navbar.requests') }}</router-link></li>
          </ul>
        </div>

        <!-- Support Col -->
        <div>
          <h3 class="text-white font-bold uppercase tracking-wider text-sm mb-4">{{ t('footer.support') }}</h3>
          <ul class="space-y-2 text-sm">
            <li><router-link to="/terms" class="hover:text-primary-400 transition-colors">{{ t('footer.terms') || 'Terma & Syarat' }}</router-link></li>
            <li><router-link to="/privacy" class="hover:text-primary-400 transition-colors">{{ t('footer.privacy') || 'Dasar Privasi' }}</router-link></li>
            <li><a href="#" class="hover:text-primary-400 transition-colors">{{ t('footer.help') }}</a></li>
            <li><a href="#" class="hover:text-primary-400 transition-colors">{{ t('footer.contactAdmin') }}</a></li>
          </ul>
        </div>

        <!-- Contact Col -->
        <div>
          <h3 class="text-white font-bold uppercase tracking-wider text-sm mb-4">{{ t('footer.contact') }}</h3>
          <div class="flex gap-4 mb-4">
            <a href="#" target="_blank" class="hover:scale-110 transition-transform opacity-70 hover:opacity-100">
               <img src="https://cdn.simpleicons.org/facebook/white" alt="FB" class="w-5 h-5">
            </a>
            <a href="#" target="_blank" class="hover:scale-110 transition-transform opacity-70 hover:opacity-100">
               <img src="https://cdn.simpleicons.org/instagram/white" alt="IG" class="w-5 h-5">
            </a>
            <a href="#" target="_blank" class="hover:scale-110 transition-transform opacity-70 hover:opacity-100">
               <img src="https://cdn.simpleicons.org/tiktok/white" alt="TT" class="w-5 h-5">
            </a>
          </div>
          <p class="text-sm text-slate-400">admin@knotenup.com</p>
        </div>

      </div>

      <!-- Copyright -->
      <div class="py-6 text-center text-xs text-slate-600">
        <p>&copy; {{ currentYear }} KnotenUp. {{ t('footer.rights') }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const currentYear = new Date().getFullYear();
</script>