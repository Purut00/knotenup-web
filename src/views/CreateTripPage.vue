<template>
  <div class="min-h-screen bg-slate-900 relative overflow-x-hidden text-white">
    
    <div class="absolute inset-0 z-0 opacity-10 pointer-events-none" style="background-image: url('data:image/svg+xml,...')"></div>
    <div class="absolute top-0 left-0 w-3/4 h-3/4 bg-purple-600/20 blur-[150px] rounded-full pointer-events-none"></div>
    <div class="absolute bottom-0 right-0 w-3/4 h-3/4 bg-orange-500/10 blur-[150px] rounded-full pointer-events-none"></div>

    <div class="container mx-auto px-6 pt-36 pb-20 relative z-10 max-w-4xl">
      
      <div class="text-center mb-10">
        <h1 class="text-4xl md:text-5xl font-bold mb-3">{{ t('createTrip.heroTitle') || 'Cipta Trip Baru' }}</h1>
        <p class="text-slate-400">"{{ t('createTrip.heroSub') || 'Bawa orang lain meneroka keindahan alam bersama anda.' }}"</p>
      </div>

      <!-- STEPPER -->
      <div class="flex items-center justify-center mb-10 relative z-10 hidden md:flex">
        <div class="flex flex-col items-center gap-2 transition-opacity duration-300" :class="{ 'opacity-100': currentStep >= 1, 'opacity-50': currentStep < 1 }">
          <div class="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold bg-slate-900 transition-colors"
               :class="currentStep > 1 ? 'border-purple-500 bg-purple-500 text-white' : (currentStep === 1 ? 'border-orange-500 text-orange-500' : 'border-purple-500 text-purple-500')">1</div>
          <span class="text-xs font-bold uppercase tracking-wider">{{ t('createTrip.step1') || 'Info Asas' }}</span>
        </div>
        <div class="w-16 h-0.5 mx-4 transition-all duration-300" :class="currentStep > 1 ? 'bg-gradient-to-r from-purple-500 to-orange-500' : 'bg-white/10'"></div>
        
        <div class="flex flex-col items-center gap-2 transition-opacity duration-300" :class="{ 'opacity-100': currentStep >= 2, 'opacity-50': currentStep < 2 }">
          <div class="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold bg-slate-900 transition-colors"
               :class="currentStep > 2 ? 'border-purple-500 bg-purple-500 text-white' : (currentStep === 2 ? 'border-orange-500 text-orange-500' : 'border-purple-500 text-purple-500')">2</div>
          <span class="text-xs font-bold uppercase tracking-wider">{{ t('createTrip.step2') || 'Logistik' }}</span>
        </div>
        <div class="w-16 h-0.5 mx-4 transition-all duration-300" :class="currentStep > 2 ? 'bg-gradient-to-r from-purple-500 to-orange-500' : 'bg-white/10'"></div>

        <div class="flex flex-col items-center gap-2 transition-opacity duration-300" :class="{ 'opacity-100': currentStep >= 3, 'opacity-50': currentStep < 3 }">
          <div class="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold bg-slate-900 transition-colors"
               :class="currentStep === 3 ? 'border-orange-500 text-orange-500' : 'border-purple-500 text-purple-500'">3</div>
          <span class="text-xs font-bold uppercase tracking-wider">{{ t('createTrip.step3') || 'Media' }}</span>
        </div>
      </div>

      <div class="bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 fade-up">
        
        <!-- STEP 1 -->
        <div v-if="currentStep === 1">
          <h2 class="text-2xl font-bold mb-6 border-b border-white/10 pb-4">{{ t('createTrip.section1Title') || 'Maklumat Trip' }}</h2>
          
          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.tripTitle') || 'Tajuk Trip' }}</label>
            <input type="text" v-model="form.title" class="glass-input" 
                   :placeholder="t('createTrip.placeholderTitle') || 'Cth: Hiking Gunung Kinabalu 3H2M'" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.category') || 'Kategori Aktiviti' }}</label>
              <div class="relative">
                  <select v-model="form.category" class="glass-input appearance-none">
                    <option disabled value="">Sila Pilih...</option>
                    <optgroup v-for="group in ACTIVITY_CATEGORIES" :key="group.group" :label="group.group">
                      <option v-for="item in group.items" :key="item" :value="item">{{ item }}</option>
                    </optgroup>
                  </select>
                  <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.level') || 'Tahap Kesukaran' }}</label>
              <div class="relative">
                  <select v-model="form.difficulty" class="glass-input appearance-none">
                    <option value="Easy">Mudah</option>
                    <option value="Moderate">Sederhana</option>
                    <option value="Hard">Sukar</option>
                  </select>
                  <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.locationType') || 'Lokasi' }}</label>
            <div class="flex gap-4">
               <label class="cursor-pointer px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2"
                      :class="{ 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20': locationType === 'malaysia' }">
                 <input type="radio" v-model="locationType" value="malaysia" hidden>
                 <span>Dalam Malaysia</span>
               </label>
               <label class="cursor-pointer px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2"
                      :class="{ 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20': locationType === 'overseas' }">
                 <input type="radio" v-model="locationType" value="overseas" hidden>
                 <span>Luar Negara</span>
               </label>
            </div>
          </div>

          <div v-if="locationType === 'malaysia'">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label class="block text-sm font-semibold text-slate-300 mb-2">Negeri (Wajib)</label>
                <div class="relative">
                    <select v-model="form.state" class="glass-input appearance-none" @change="resetSpotSelection">
                      <option disabled value="">Pilih Negeri...</option>
                      <option v-for="state in MALAYSIA_STATES" :key="state" :value="state">{{ state }}</option>
                    </select>
                    <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                </div>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-300 mb-2">Tempat Spesifik</label>
                <input type="text" v-model="form.placeName" class="glass-input" :placeholder="t('createTrip.specificPlace') || 'Cth: Taman Negara'" />
              </div>
            </div>

            <div class="p-4 rounded-xl border border-dashed border-slate-600 bg-slate-800/50 mb-6">
              <label class="flex justify-between items-center text-sm font-semibold text-slate-300 mb-2">
                 <span>🔗 Link ke Info Lokasi (Spot)</span>
                 <span v-if="autoDetected" class="text-green-400 text-xs font-bold animate-pulse">✨ Lokasi dikesan!</span>
              </label>
              
              <div class="relative">
                 <select v-model="form.spotId" @change="handleSpotChange" class="glass-input appearance-none" :disabled="!form.state">
                   <option value="">-- {{ form.state ? 'Pilih Lokasi di ' + form.state : 'Sila Pilih Negeri Dahulu' }} --</option>
                   <option v-for="spot in filteredSpots" :key="spot.id" :value="spot.id">{{ spot.name }} ({{ spot.height }}m)</option>
                 </select>
                 <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
              <p class="text-[10px] text-slate-400 mt-2 flex justify-between">
                <span>*Menghubungkan trip dengan info bukit memudahkan peserta.</span>
                <span v-if="form.state && filteredSpots.length === 0" class="text-orange-400">Tiada lokasi disenaraikan.</span>
              </p>
            </div>
          </div>

          <div v-else class="mb-6">
            <label class="block text-sm font-semibold text-slate-300 mb-2">Lokasi Penuh</label>
            <input type="text" v-model="form.overseasLocation" class="glass-input" placeholder="Cth: Mount Fuji, Japan" />
          </div>
        </div>

        <!-- STEP 2 -->
        <div v-if="currentStep === 2">
          <h2 class="text-2xl font-bold mb-6 border-b border-white/10 pb-4">{{ t('createTrip.section2Title') || 'Tarikh & Harga' }}</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.startDate') || 'Tarikh Mula' }}</label>
              <input type="date" v-model="form.startDate" class="glass-input" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.endDate') || 'Tarikh Tamat' }}</label>
              <input type="date" v-model="form.endDate" :min="form.startDate" class="glass-input" />
            </div>
          </div>
          
          <div class="inline-block bg-purple-500/20 text-purple-300 px-4 py-1 rounded-full text-sm font-bold mb-6">
            ⏳ Durasi: {{ computedDuration }}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.price') || 'Harga Per Pax' }} (RM)</label>
              <input type="number" v-model="form.price" class="glass-input" placeholder="0" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.slots') || 'Jumlah Slot' }}</label>
              <input type="number" v-model="form.maxSlots" class="glass-input" placeholder="20" />
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.groupLink') || 'Link WhatsApp Group' }}</label>
            <input type="text" v-model="form.groupLink" class="glass-input" placeholder="https://chat.whatsapp.com/..." />
            <span class="text-xs text-slate-500 mt-1 block">*Link ini hanya dipaparkan kepada peserta yang sah.</span>
          </div>
        </div>

        <!-- STEP 3 -->
        <div v-if="currentStep === 3">
          <h2 class="text-2xl font-bold mb-6 border-b border-white/10 pb-4">{{ t('createTrip.section3Title') || 'Galeri & Info Lanjut' }}</h2>

          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-300 mb-2">📸 Gambar Trip (Max 5)</label>
            <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 h-64">
               <div class="bg-white/5 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 hover:border-purple-500 transition-all bg-cover bg-center"
                    @click="triggerUpload(0)" :style="{ backgroundImage: `url(${previewImages[0]})` }">
                 <div v-if="!previewImages[0]" class="flex flex-col items-center text-slate-400">
                   <i class="fas fa-camera text-3xl mb-2 text-purple-400"></i>
                   <span>Cover Photo</span>
                 </div>
                 <input type="file" ref="fileInput0" @change="(e) => handleImageSelect(e, 0)" accept="image/*" hidden />
               </div>
               
               <div class="grid grid-cols-2 gap-4">
                 <div v-for="i in 4" :key="i" class="bg-white/5 border border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-500 text-slate-500 text-2xl bg-cover bg-center"
                      @click="triggerUpload(i)" :style="{ backgroundImage: `url(${previewImages[i]})` }">
                   <span v-if="!previewImages[i]">+</span>
                   <input type="file" :ref="'fileInput' + i" @change="(e) => handleImageSelect(e, i)" accept="image/*" hidden />
                 </div>
               </div>
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.desc') || 'Deskripsi Penuh' }}</label>
            <textarea v-model="form.description" rows="5" class="glass-input" placeholder="Tentatif, apa yang menarik..."></textarea>
          </div>

          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-1">⚠️ {{ t('createTrip.mandatory') || 'Wajib Bawa' }}</label>
              <input type="text" v-model="form.mandatory" class="glass-input" placeholder="Headlamp, Kasut Hiking..." />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-1">💡 {{ t('createTrip.tips') || 'Tips Extra' }}</label>
              <input type="text" v-model="form.tips" class="glass-input" placeholder="Bawa baju hujan..." />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-1">🎒 {{ t('createTrip.recommended') || 'Disyorkan' }}</label>
              <input type="text" v-model="form.recommended" class="glass-input" placeholder="Powerbank, Tongkat..." />
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-300 mb-2">{{ t('createTrip.includes') || 'Pakej Termasuk:' }}</label>
            <div class="flex flex-wrap gap-2">
              <div v-for="service in TRIP_SERVICES" :key="service" 
                   class="px-4 py-2 rounded-full border border-white/10 bg-white/5 cursor-pointer text-sm text-slate-300 hover:bg-white/10 transition-all select-none"
                   :class="{ 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20': form.includes.includes(service) }"
                   @click="toggleService(service)">
                {{ t('services.' + service) || service }}
              </div>
            </div>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="flex justify-between items-center mt-10">
           <button v-if="currentStep > 1" @click="prevStep" class="px-6 py-3 rounded-full border border-white/20 text-slate-300 font-bold hover:text-white hover:border-white transition-all">
             <i class="fas fa-arrow-left mr-2"></i> Kembali
           </button>
           <div v-else></div>

           <button v-if="currentStep < 3" @click="nextStep" class="bg-gradient-to-br from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-purple-600/30 hover:-translate-y-1 transition-all">
             Seterusnya <i class="fas fa-arrow-right ml-2"></i>
           </button>
           <button v-if="currentStep === 3" @click="submitForm" class="bg-gradient-to-br from-orange-500 to-red-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-500/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed" :disabled="isUploading || isCreating">
             {{ (isUploading || isCreating) ? 'Sedang Memproses...' : '🚀 Terbitkan Trip' }}
           </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ACTIVITY_CATEGORIES, TRIP_SERVICES, MALAYSIA_STATES } from '../constants/data';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore'; 
import { isSpam } from '../utils/spamFilter';
import { useStorage } from '../composables/useStorage'; 
import { useTrips } from '../composables/useTrips';

const { t } = useI18n(); 
const router = useRouter();
const { uploadMultipleImages, uploading: isUploading } = useStorage();
const { createTrip, loading: isCreating } = useTrips();

const currentStep = ref(1);
const locationType = ref('malaysia');
const autoDetected = ref(false);

const previewImages = ref<string[]>(Array.from({ length: 5 }).map(() => ''));
const rawFiles = ref<(File | null)[]>(Array.from({ length: 5 }).map(() => null));
const spots = ref<any[]>([]); 

const form = reactive({
  title: '', category: '', difficulty: 'Moderate', 
  state: '', placeName: '', overseasLocation: '', 
  spotId: '', spotName: '', 
  startDate: '', endDate: '',   
  price: null, maxSlots: null, groupLink: '', description: '',
  tips: '', mandatory: '', recommended: '', includes: [] as string[]
});

onMounted(async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "spots"));
    spots.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      state: doc.data().state,
      height: doc.data().height
    }));
  } catch (error) { console.error("Error spots:", error); }
});

const filteredSpots = computed(() => {
  if (!form.state) return [];
  return spots.value.filter(s => s.state === form.state);
});

watch(() => form.title, (newTitle) => {
  if (!newTitle || newTitle.length < 4) return;
  const lowerTitle = newTitle.toLowerCase();
  const foundSpot = spots.value.find(s => lowerTitle.includes(s.name.toLowerCase()));
  if (foundSpot) {
     form.state = foundSpot.state; 
     form.spotId = foundSpot.id;   
     form.spotName = foundSpot.name;
     form.placeName = foundSpot.name;
     autoDetected.value = true;
     setTimeout(() => autoDetected.value = false, 3000);
  }
});

const resetSpotSelection = () => { form.spotId = ''; form.spotName = ''; };
const handleSpotChange = () => {
  const selected = spots.value.find(s => s.id === form.spotId);
  if (selected) { form.spotName = selected.name; form.placeName = selected.name; }
  else form.spotName = '';
};

const computedDuration = computed(() => {
  if (!form.startDate || !form.endDate) return '-';
  const start = new Date(form.startDate);
  const end = new Date(form.endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);
  if (diffDays < 0) return "Invalid"; 
  if (diffDays === 0) return "Day Trip";
  return `${diffDays + 1}H ${diffDays}M`;
});

const toggleService = (service: string) => {
  if (form.includes.includes(service)) form.includes = form.includes.filter(i => i !== service);
  else form.includes.push(service);
};

const triggerUpload = (index: number) => {
  const input = document.querySelectorAll('input[type=file]')[index] as HTMLInputElement;
  if(input) input.click();
};

const handleImageSelect = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    rawFiles.value[index] = file;
    const reader = new FileReader();
    reader.onload = (e) => { if (e.target?.result) previewImages.value[index] = e.target.result as string; };
    reader.readAsDataURL(file);
  }
};

const nextStep = () => { if (currentStep.value < 3) currentStep.value++; window.scrollTo(0,0); };
const prevStep = () => { if (currentStep.value > 1) currentStep.value--; window.scrollTo(0,0); };

const submitForm = async () => {
  if (!auth.currentUser) return alert(t('auth.loginRequired') || "Sila login.");
  if (isSpam(`${form.title} ${form.description}`)) return alert("Input dilarang.");

  try {
    const uploadedUrls = await uploadMultipleImages(rawFiles.value, `trips/${auth.currentUser.uid}_${Date.now()}`);
    const finalLoc = locationType.value === 'malaysia' ? `${form.placeName}, ${form.state}` : form.overseasLocation;
    
    // Create Trip using Composable
    await createTrip({
      ...form,
      location: finalLoc,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      duration: computedDuration.value, 
      images: uploadedUrls, 
      image: uploadedUrls[0] || '',
      price: Number(form.price),
      maxSlots: Number(form.maxSlots),
      currentSlots: 0,
      status: 'open',
      organizerId: auth.currentUser.uid,
      organizerName: auth.currentUser.displayName || 'Organizer',
      organizerImage: auth.currentUser.photoURL || '',
      spotId: form.spotId || null,
      spotName: form.spotName || null
    });
    
    alert("Trip berjaya diterbitkan!");
    router.push('/trips');

  } catch (error) {
    console.error("Error:", error);
    alert("Gagal mencipta trip.");
  }
};
</script>

<style scoped>
.glass-input {
  @apply w-full p-3 rounded-xl border border-white/10 bg-slate-900/50 text-white outline-none transition-all duration-300;
}
.glass-input:focus {
  @apply border-purple-500 bg-slate-900/80;
}
.glass-input option, .glass-input optgroup {
  @apply bg-slate-800 text-white;
}
.fade-up { animation: fadeUp 0.6s ease-out; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>