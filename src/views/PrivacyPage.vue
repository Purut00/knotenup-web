<template>
  <div class="min-h-screen bg-slate-900 relative overflow-x-hidden text-white">
    <div class="absolute inset-0 z-0 opacity-[0.08] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' viewBox=\'0 0 1000 1000\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400\' stroke=\'white\' fill=\'none\' stroke-width=\'2\' opacity=\'0.5\'/%3E%3C/svg%3E')] bg-cover"></div>
    <div class="absolute top-0 left-0 w-[60vw] h-[60vw] bg-[#6c63ff] blur-[150px] opacity-15 pointer-events-none rounded-full"></div>
    <div class="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-[#ff8c42] blur-[150px] opacity-10 pointer-events-none rounded-full"></div>

    <div class="container mx-auto px-6 pt-[120px] pb-20 relative z-10">
      <div class="bg-[#1e293b]/70 border border-white/10 rounded-2xl p-8 md:p-12 backdrop-blur-[20px] animate-fade-in-up">
        <h1 class="text-3xl font-bold text-white mb-2">Dasar Privasi (Privacy Policy)</h1>
        <p class="text-gray-400 mb-8 text-sm">Selaras dengan Akta Perlindungan Data Peribadi 2010 (PDPA).</p>

        <div class="text-gray-300 space-y-6">
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
          <button @click="$router.push('/')" class="text-purple-400 hover:text-white transition bg-transparent border-none cursor-pointer">Kembali ke Laman Utama</button>
        </div>
      </div>
    </div>
  </div>
</template>