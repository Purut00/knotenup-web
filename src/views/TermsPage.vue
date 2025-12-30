<template>
  <div class="min-h-screen bg-slate-900 relative overflow-x-hidden text-white">
    
    <div class="absolute inset-0 z-0 opacity-[0.08] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' viewBox=\'0 0 1000 1000\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400\' stroke=\'white\' fill=\'none\' stroke-width=\'2\' opacity=\'0.5\'/%3E%3C/svg%3E')] bg-cover"></div>
    <div class="absolute top-0 left-0 w-[60vw] h-[60vw] bg-[#6c63ff] blur-[150px] opacity-15 pointer-events-none rounded-full"></div>
    <div class="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-[#ff8c42] blur-[150px] opacity-10 pointer-events-none rounded-full"></div>

    <div class="container mx-auto px-6 pt-[120px] pb-20 relative z-10">
      <div class="bg-[#1e293b]/70 border border-white/10 rounded-2xl p-8 md:p-12 backdrop-blur-[20px] animate-fade-in-up">
        <h1 class="text-3xl font-bold text-white mb-2">Terma & Syarat Penggunaan</h1>
        <p class="text-gray-400 mb-8 text-sm">Tarikh Berkuatkuasa: {{ new Date().toLocaleDateString() }}</p>

        <div class="text-gray-300 space-y-6">
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
          <button @click="$router.push('/')" class="text-purple-400 hover:text-white transition bg-transparent border-none cursor-pointer">Kembali ke Laman Utama</button>
        </div>
      </div>
    </div>
  </div>
</template>