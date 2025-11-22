<template>
  <footer class="footer">
    <div class="container">
      
      <div class="footer-grid">
        
        <div class="footer-col">
          <h2 class="footer-logo">KnotenUp</h2>
          <p class="footer-desc">{{ t('footer.desc') }}</p>
        </div>

        <div class="footer-col">
          <h3>{{ t('footer.quickLinks') }}</h3>
          <ul>
            <li><router-link to="/">{{ t('navbar.home') }}</router-link></li>
            <li><router-link to="/trips">{{ t('navbar.trips') }}</router-link></li>
            <li><router-link to="/directory">{{ t('directory.title') }}</router-link></li>
            <li><router-link to="/forum">{{ t('navbar.forum') }}</router-link></li>
            <li><router-link to="/requests">{{ t('navbar.requests') }}</router-link></li>
          </ul>
        </div>

        <div class="footer-col">
          <h3>{{ t('footer.support') }}</h3>
          <ul>
            <li><a href="#">Syarat & Terma</a></li>
            <li><a href="#">Polisi Privasi</a></li>
            <li><a href="#">Pusat Bantuan</a></li>
            <li><a href="#">Hubungi Admin</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h3>{{ t('footer.contact') }}</h3>
          <div class="social-icons">
            <a href="#" target="_blank"><img src="https://cdn.simpleicons.org/facebook/white" alt="FB"></a>
            <a href="#" target="_blank"><img src="https://cdn.simpleicons.org/instagram/white" alt="IG"></a>
            <a href="#" target="_blank"><img src="https://cdn.simpleicons.org/tiktok/white" alt="TT"></a>
            <a href="#" target="_blank"><img src="https://cdn.simpleicons.org/youtube/white" alt="YT"></a>
          </div>
          <p class="contact-email">admin@knotenup.com</p>
        </div>

      </div>

      <div class="footer-bottom">
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

<style scoped>
.footer {
  background-color: #2c3e50;
  color: #ecf0f1;
  padding-top: 4rem;
  margin-top: auto; /* Tolak footer ke bawah jika page pendek */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* GRID LAYOUT */
.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr; /* Kolum 1 besar sikit */
  gap: 2rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid #34495e;
}

/* COLUMN STYLES */
.footer-col h2.footer-logo {
  color: #e67e22; /* Warna Oren Shopee/Theme */
  font-size: 2rem;
  margin: 0 0 1rem 0;
  font-weight: 900;
  letter-spacing: -1px;
}

.footer-col h3 {
  color: #fff;
  font-size: 1.1rem;
  margin-bottom: 1.2rem;
  font-weight: bold;
  text-transform: uppercase;
}

.footer-desc {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #bdc3c7;
  max-width: 300px;
}

/* LINKS */
.footer-col ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-col ul li {
  margin-bottom: 0.8rem;
}

.footer-col ul li a {
  text-decoration: none;
  color: #bdc3c7;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.footer-col ul li a:hover {
  color: #e67e22; /* Hover jadi oren */
  padding-left: 5px; /* Gerak sikit */
}

/* SOCIAL ICONS */
.social-icons {
  display: flex;
  gap: 15px;
  margin-bottom: 1rem;
}

.social-icons img {
  width: 24px;
  height: 24px;
  transition: transform 0.2s;
  opacity: 0.8;
}

.social-icons a:hover img {
  transform: scale(1.2);
  opacity: 1;
}

.contact-email {
  color: #bdc3c7;
  font-size: 0.9rem;
}

/* BOTTOM COPYRIGHT */
.footer-bottom {
  padding: 1.5rem 0;
  text-align: center;
  color: #7f8c8d;
  font-size: 0.85rem;
}

/* RESPONSIVE MOBILE */
@media (max-width: 900px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr; /* 2 Kolum per baris */
  }
}

@media (max-width: 600px) {
  .footer-grid {
    grid-template-columns: 1fr; /* 1 Kolum memanjang */
    text-align: center;
  }
  
  .footer-desc {
    margin: 0 auto; /* Centerkan teks description */
  }

  .social-icons {
    justify-content: center;
  }
  
  /* Centerkan list items */
  .footer-col ul li a:hover {
    padding-left: 0; 
    color: #e67e22;
  }
}
</style>