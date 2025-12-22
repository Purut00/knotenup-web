<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { KNOTENUP_SYSTEM_INSTRUCTION } from '../../constants/aiPrompts';
import { db } from '../../firebaseConfig'; // Import database
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const isOpen = ref(false);
const messages = ref<{role: 'user'|'model', text: string}[]>([]);
const userInput = ref('');
const isLoading = ref(false);
const chatContainer = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

// Fungsi untuk cari trip dalam database (Simple Search)
const fetchRelatedTrips = async (_keyword: string) => {
  try {
    // Kita cari trip yang 'status' == 'open' (atau ikut field database anda)
    // Nota: Firestore tak ada 'LIKE' search, jadi kita tarik 5 trip terkini je sebagai cadangan
    // Kalau nak power, kena buat filter client-side sikit
    const tripsRef = collection(db, 'trips');
    const q = query(
      tripsRef, 
      orderBy('createdAt', 'desc'), // Ambil yang paling baru
      limit(5) // Jimat read quota, ambil 5 je
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return "Tiada trip aktif dijumpai.";

    // Format data jadi teks ringkas supaya AI faham
    const tripsData = snapshot.docs.map(doc => {
      const d = doc.data();
      return `- Tajuk: ${d.title}, Kategori: ${d.category}, Lokasi: ${d.location}, Harga: RM${d.price || d.cost}, Tarikh: ${d.startDate || d.date}`;
    }).join('\n');

    return tripsData;

  } catch (error) {
    console.error("Error fetching trips:", error);
    return "Gagal mendapatkan data trip.";
  }
};

const sendMessage = async () => {
  if (!userInput.value.trim()) return;
  
  const question = userInput.value;
  messages.value.push({ role: 'user', text: question });
  userInput.value = '';
  isLoading.value = true;
  scrollToBottom();

  const key = import.meta.env.VITE_GEMINI_API_KEY;

  try {
    if (!key) throw new Error("API Key Missing");

    // 1. CEK KEYWORD (Adakah user tanya pasal trip?)
    const keywords = ['trip', 'hiking', 'camping', 'gunung', 'bukit', 'pantai', 'join', 'event', 'aktiviti'];
    const isAskingAboutTrip = keywords.some(word => question.toLowerCase().includes(word));
    
    let contextData = "";
    
    if (isAskingAboutTrip) {
      // Jika ya, kita fetch data dulu!
      const trips = await fetchRelatedTrips(question);
      contextData = `\n\n[DATA TRIP TERKINI DI DATABASE]:\n${trips}\n\n(Sila jawab berdasarkan senarai di atas jika relevan)`;
    }

    // 2. HANTAR KE GEMINI (Prompt + Data Trip + Soalan User)
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const fullPrompt = `${KNOTENUP_SYSTEM_INSTRUCTION}${contextData}\n\nUser: ${question}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();

    messages.value.push({ role: 'model', text: response });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    messages.value.push({ 
      role: 'model', 
      text: "Maaf, saya pening sikit. Boleh tanya semula?" 
    });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};
</script>

<template>
  <div class="fixed bottom-6 right-6 z-[100] flex flex-col items-end font-sans">
    
    <transition name="scale-up">
      <div v-if="isOpen" class="bg-white w-80 sm:w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col mb-4 border border-gray-200 overflow-hidden ring-1 ring-black/5">
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
          <div class="flex items-center gap-3">
            <div class="bg-white/20 p-2 rounded-full">
               <span class="text-xl">🤖</span>
            </div>
            <div>
              <h3 class="font-bold text-sm">KnotenUp Assistant</h3>
              <p class="text-[10px] opacity-90 flex items-center gap-1">
                <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button @click="isOpen = false" class="hover:bg-white/20 p-1.5 rounded-lg transition">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 text-sm scroll-smooth">
          <div v-if="messages.length === 0" class="text-center text-gray-400 mt-10 px-6">
            <div class="text-4xl mb-3">👋</div>
            <p class="mb-2 text-gray-600 font-medium">Hai! Saya bot AI KnotenUp.</p>
            <p class="text-xs">Boleh tanya: "Ada trip hiking tak minggu ni?"</p>
          </div>

          <div v-for="(msg, index) in messages" :key="index" 
               class="flex w-full" 
               :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
            <div :class="[
              'max-w-[85%] px-4 py-3 shadow-sm text-sm leading-relaxed',
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm'
            ]">
              <span class="whitespace-pre-wrap">{{ msg.text }}</span>
            </div>
          </div>
          
          <div v-if="isLoading" class="flex justify-start">
             <div class="bg-gray-200 text-gray-500 px-4 py-2 rounded-full text-xs animate-pulse">
               Sedang semak database...
             </div>
          </div>
        </div>

        <div class="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
          <input 
            v-model="userInput" 
            @keyup.enter="sendMessage" 
            type="text"
            style="color: #000000 !important;" 
            class="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm !text-black text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder:text-gray-400"
            placeholder="Tanya soalan..." 
          />
          <button 
            @click="sendMessage" 
            :disabled="isLoading || !userInput.trim()"
            class="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
            <i class="fas fa-paper-plane text-xs"></i>
          </button>
        </div>
      </div>
    </transition>

    <button 
      v-if="!isOpen" 
      @click="isOpen = true" 
      class="group relative bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-[100]">
       <i class="fas fa-comment-alt text-xl"></i>
    </button>
  </div>
</template>

<style scoped>
input[type="text"] {
  color: black !important;
  -webkit-text-fill-color: black !important;
}
.scale-up-enter-active, .scale-up-leave-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.scale-up-enter-from, .scale-up-leave-to { opacity: 0; transform: translateY(20px) scale(0.95); }
</style>