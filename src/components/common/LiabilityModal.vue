<template>
  <div v-if="visible" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" @click.self="cancel">
    <div class="bg-slate-900 border border-red-500/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative fade-up">
      
      <!-- Icons -->
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500/50 pulse-ring">
          <i class="fas fa-exclamation-triangle text-3xl text-red-500"></i>
        </div>
      </div>

      <!-- Title -->
      <h2 class="text-2xl font-bold text-white text-center mb-2">Penafian & Amaran Risiko</h2>
      <p class="text-xs text-red-400 text-center uppercase tracking-widest font-bold mb-6">Sila Baca & Fahamkan</p>

      <!-- Content -->
      <div class="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10 text-sm text-slate-300 leading-relaxed mb-6 max-h-[40vh] overflow-y-auto custom-scrollbar">
        
        <p>
          <strong class="text-white block mb-1">1. KnotenUp.com Hanyalah Medium Promosi</strong>
          Kami menyediakan platform untuk komuniti berkongsi aktiviti. Kami <strong>tidak mengambil sebarang caj atau komisen</strong> daripada transaksi anda.
        </p>

        <p>
          <strong class="text-white block mb-1">2. Tiada Tanggungjawab Liabiliti</strong>
          KnotenUp.com <strong>tidak akan bertanggungjawab</strong> ke atas sebarang kemalangan, kecederaan, kematian, kerugian harta benda, atau penipuan yang berlaku hasil daripada penggunaan platform ini.
        </p>

        <div v-if="context === 'create'" class="bg-purple-500/10 border-l-4 border-purple-500 p-3 rounded-r-lg">
          <strong class="text-purple-300 block mb-1">Untuk Penganjur (Creator):</strong>
          Anda bertanggungjawab sepenuhnya ke atas maklumat yang dipaparkan. Pastikan aktiviti anda selamat dan mematuhi undang-undang.
        </div>

        <div v-else class="bg-orange-500/10 border-l-4 border-orange-500 p-3 rounded-r-lg">
          <strong class="text-orange-300 block mb-1">Untuk Peserta:</strong>
          Sila semak kredibiliti penganjur sebelum membuat sebarang pembayaran. Anda menyertai aktiviti ini atas risiko anda sendiri.
        </div>

      </div>

      <!-- Terms Link -->
      <div class="text-center mb-6">
        <a href="/terms" target="_blank" class="text-xs text-blue-400 hover:text-blue-300 underline">
          Baca Syarat & Terma Penuh
        </a>
      </div>

      <!-- Actions -->
      <div class="grid grid-cols-2 gap-4">
        <button @click="cancel" class="py-3 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white font-semibold transition-all">
          Batal
        </button>
        <button @click="proceed" class="py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold hover:shadow-lg hover:shadow-red-600/30 transition-all transform hover:-translate-y-1">
          Saya Faham & Teruskan
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  context: 'create' | 'join'; // 'create' for forms, 'join' for contact buttons
}>();

const emit = defineEmits(['update:visible', 'proceed']);

const cancel = () => {
  emit('update:visible', false);
};

const proceed = () => {
  emit('update:visible', false);
  emit('proceed');
};
</script>

<style scoped>
.fade-up { animation: fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

.pulse-ring {
  box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  animation: pulse-red 2s infinite;
}
@keyframes pulse-red {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
</style>
