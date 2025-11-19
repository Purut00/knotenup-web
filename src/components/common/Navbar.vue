<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <router-link to="/">
          <span class="logo-text">KnotenUp</span>
        </router-link>
      </div>
      
      <div class="navbar-menu">
        <router-link to="/" class="navbar-item">{{ $t('navbar.home') }}</router-link>
        <router-link to="/trips" class="navbar-item">{{ $t('navbar.trips') }}</router-link>
        <router-link to="/forum" class="navbar-item">{{ $t('navbar.forum') }}</router-link>
        <router-link to="/profile" class="navbar-item">{{ $t('navbar.profile') }}</router-link>
      </div>
      
      <div class="navbar-right">
        <LanguageSwitcher />
        
        <router-link to="/create-trip" class="btn-create">
          <span class="plus-icon">+</span> Cipta Trip
        </router-link>

        <button class="button-login">{{ $t('navbar.login') }}</button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import LanguageSwitcher from './LanguageSwitcher.vue';
</script>

<style scoped>
.navbar {
  width: 100%;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 2rem;
  box-sizing: border-box; /* Penting untuk padding */
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  height: 70px; /* Ketinggian Navbar */
}

.navbar-brand .logo {
  height: 40px;
  vertical-align: middle;
}

.navbar-menu {
  display: flex;
  gap: 2rem;
}

.navbar-item {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 0.5rem;
}

.navbar-item:hover, .navbar-item.router-link-active {
  color: #007bff; /* Warna untuk link aktif */
  border-bottom: 2px solid #007bff;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.button-login {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.button-login:hover {
  background-color: #0056b3;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}
.btn-create {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #e67e22; /* Warna Oren */
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: bold;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn-create:hover {
  background-color: #d35400;
}

.plus-icon {
  font-size: 1.2rem;
  line-height: 1;
}

</style>