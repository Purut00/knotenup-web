<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-section">
        <h3>KnotenUp</h3>
        <p>{{ $t('footer.description') }}</p>
      </div>
      <div class="footer-section">
        <h3>{{ $t('footer.quickLinks') }}</h3>
        <ul>
          <li><router-link to="/">{{ $t('navbar.home') }}</router-link></li>
          <li><router-link to="/trips">{{ $t('navbar.trips') }}</router-link></li>
          <li><router-link to="/forum">{{ $t('navbar.forum') }}</router-link></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>{{ $t('footer.contact') }}</h3>
        <p>Email: info@knotenup.com</p>
        </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; {{ currentYear }} KnotenUp. {{ $t('footer.allRightsReserved') }}</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
const currentYear = new Date().getFullYear();
</script>

<style scoped>
.footer {
  background-color: #2c3e50;
  color: #ecf0f1;
  padding-top: 2.5rem;
}

.footer-container {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-section {
  flex: 1;
  min-width: 250px;
  margin-bottom: 2rem;
}

.footer-section h3 {
  color: #ffffff;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
  display: inline-block;
}

.footer-section ul {
  list-style-type: none;
  padding: 0;
}

.footer-section ul li a {
  text-decoration: none;
  color: #ecf0f1;
  padding: 0.25rem 0;
  display: block;
}

.footer-section ul li a:hover {
  color: #3498db;
}

.footer-bottom {
  text-align: center;
  padding: 1rem;
  background-color: #233140;
  margin-top: 1rem;
}
</style>