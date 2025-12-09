<template>
  <div class="legal-page">
    <div class="contour-lines"></div>
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <div class="container relative z-10" style="padding-top: 120px; padding-bottom: 80px;">
      <div class="glass-card p-8 md:p-12 fade-up">
        <h1 class="text-3xl font-bold text-white mb-2">Dasar Privasi (Privacy Policy)</h1>
        <p class="text-gray-400 mb-8 text-sm">Selaras dengan Akta Perlindungan Data Peribadi 2010 (PDPA).</p>

        <div class="legal-content text-gray-300 space-y-6">
          <section>
            <h3 class="text-xl font-semibold text-white mb-2">1. Pengumpulan Data</h3>
            <p>Kami mengumpul data berikut:</p>
            <ul class="list-disc pl-5 mt-2">
              <li><strong>Maklumat Asas:</strong> Nama, e-mel, nombor telefon, dan gambar profil.</li>
              <li><strong>Dokumen Verifikasi:</strong> Salinan Kad Pengenalan/Lesen (untuk Penganjur sahaja).</li>
              <li><strong>Data Teknikal:</strong> Alamat IP dan kuki (cookies).</li>
            </ul>
          </section>

          <section>
            <h3 class="text-xl font-semibold text-white mb-2">2. Tujuan Penggunaan</h3>
            <p>Data anda digunakan untuk:</p>
            <ul class="list-disc pl-5 mt-2">
              <li>Mengesahkan identiti Penganjur demi keselamatan komuniti.</li>
              <li>Membolehkan pengguna menghubungi penganjur untuk urusan trip.</li>
              <li>Kami <strong>TIDAK</strong> akan menjual data anda kepada pihak ketiga.</li>
            </ul>
          </section>

          <section>
            <h3 class="text-xl font-semibold text-white mb-2">3. Keselamatan Data</h3>
            <p>Dokumen sensitif (seperti MyKad) disimpan dalam pelayan yang selamat dengan akses terhad. Dokumen ini tidak dipaparkan secara umum. Kami menggalakkan penganjur memalang (cross) dokumen sebelum muat naik.</p>
          </section>

          <section>
            <h3 class="text-xl font-semibold text-white mb-2">4. Hak Anda</h3>
            <p>Anda berhak meminta akses, pembetulan, atau pemadaman data peribadi anda dengan menghubungi admin atau memadam akaun anda.</p>
          </section>
        </div>

        <div class="mt-8 pt-6 border-t border-white/10 text-center">
          <button @click="$router.push('/')" class="text-purple-400 hover:text-white transition">Kembali ke Laman Utama</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Sama seperti TermsPage.vue */
.legal-page { background-color: #0f172a; min-height: 100vh; position: relative; overflow-x: hidden; color: white; }
.glass-card { background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; backdrop-filter: blur(20px); }
.page-glow-purple { position: absolute; top: 0; left: 0; width: 60vw; height: 60vw; background: #6c63ff; filter: blur(150px); opacity: 0.15; border-radius: 50%; pointer-events: none; }
.page-glow-orange { position: absolute; bottom: 0; right: 0; width: 60vw; height: 60vw; background: #ff8c42; filter: blur(150px); opacity: 0.1; border-radius: 50%; pointer-events: none; }
.contour-lines { position: absolute; inset: 0; opacity: 0.08; background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400' stroke='white' fill='none' stroke-width='2' opacity='0.5'/%3E%3C/svg%3E"); background-size: cover; pointer-events: none; }
.fade-up { animation: fadeUp 0.6s ease-out; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>