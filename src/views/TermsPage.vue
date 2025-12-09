<template>
  <div class="legal-page">
    <div class="contour-lines"></div>
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <div class="container relative z-10" style="padding-top: 120px; padding-bottom: 80px;">
      <div class="glass-card p-8 md:p-12 fade-up">
        <h1 class="text-3xl font-bold text-white mb-2">Terma & Syarat Penggunaan</h1>
        <p class="text-gray-400 mb-8 text-sm">Tarikh Berkuatkuasa: {{ new Date().toLocaleDateString() }}</p>

        <div class="legal-content text-gray-300 space-y-6">
          <section>
            <h3 class="text-xl font-semibold text-white mb-2">1. Pengenalan & Status Platform</h3>
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>Platform Pengiklanan:</strong> knotenup.com bertindak semata-mata sebagai perantara digital dan platform pengiklanan yang menghubungkan Penganjur (Organizer/Malim Gunung) dengan Peserta (User/Hiker).</li>
              <li><strong>Bukan Ejen Pelancongan:</strong> Kami BUKAN sebuah agensi pelancongan, pengendali pelancongan (tour operator), atau penyedia pengangkutan. Kami tidak memiliki, menjual, menguruskan, atau mengawal sebarang trip aktiviti luar yang disenaraikan.</li>
              <li><strong>Tiada Pegangan Wang:</strong> Platform tidak memproses atau memegang wang bayaran trip. Segala transaksi kewangan adalah urusan terus antara Peserta dan Penganjur.</li>
            </ul>
          </section>

          <section>
            <h3 class="text-xl font-semibold text-white mb-2">2. Tanggungjawab Penganjur</h3>
            <p>Jika anda mengiklankan trip, anda bersetuju bahawa:</p>
            <ul class="list-disc pl-5 space-y-2 mt-2">
              <li>Anda memiliki lesen/permit yang sah (lesen MOTAC/MGP) untuk menjalankan aktiviti.</li>
              <li>Anda bertanggungjawab sepenuhnya menguruskan permit hutan/taman negara bagi pihak peserta.</li>
              <li>Segala maklumat iklan adalah benar dan tidak mengelirukan.</li>
            </ul>
          </section>

          <section>
            <h3 class="text-xl font-semibold text-white mb-2">3. Tanggungjawab Peserta</h3>
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>Risiko Sendiri:</strong> Anda memahami bahawa aktiviti luar melibatkan risiko kecederaan. Penyertaan adalah atas risiko sendiri.</li>
              <li><strong>Uji Tuntas:</strong> Anda bertanggungjawab meminta bukti lesen daripada penganjur sebelum membuat pembayaran.</li>
            </ul>
          </section>

          <section>
            <h3 class="text-xl font-semibold text-white mb-2">4. Penafian Liabiliti</h3>
            <p>knotenup.com tidak akan bertanggungjawab ke atas sebarang kecederaan, kematian, kehilangan wang akibat penipuan (scam), atau pembatalan trip oleh penganjur.</p>
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
.legal-page { 
  background-color: #0f172a; 
  min-height: 100vh; position: relative; overflow-x: hidden; color: white;
}
.glass-card {
  background: rgba(30, 41, 59, 0.7); 
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px; backdrop-filter: blur(20px);
}
/* Background assets from other pages */
.page-glow-purple { position: absolute; top: 0; left: 0; width: 60vw; height: 60vw; background: #6c63ff; filter: blur(150px); opacity: 0.15; border-radius: 50%; pointer-events: none; }
.page-glow-orange { position: absolute; bottom: 0; right: 0; width: 60vw; height: 60vw; background: #ff8c42; filter: blur(150px); opacity: 0.1; border-radius: 50%; pointer-events: none; }
.contour-lines { position: absolute; inset: 0; opacity: 0.08; background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400' stroke='white' fill='none' stroke-width='2' opacity='0.5'/%3E%3C/svg%3E"); background-size: cover; pointer-events: none; }
.fade-up { animation: fadeUp 0.6s ease-out; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>