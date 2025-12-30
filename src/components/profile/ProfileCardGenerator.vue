<template>
  <div v-if="visible" class="fixed inset-0 bg-black/85 z-[9999] flex justify-center items-center backdrop-blur-[5px]" @click.self="close">
    <div class="relative flex flex-col items-center animate-fade-in-up">
      <button class="absolute -top-10 right-0 bg-transparent border-none text-[2rem] text-white cursor-pointer hover:text-slate-300 transition-colors" @click="close">✖</button>
      
      <!-- BUSINESS CARD -->
      <div v-if="type === 'business'" id="businessCard" class="w-[600px] h-[340px] bg-[#2c3e50] text-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex font-sans">
        <div class="flex-[2] p-[30px] flex flex-col justify-center gap-5">
          <div class="flex items-center gap-5 border-b border-white/10 pb-[15px]">
            <img :src="userData.avatar || userData.photoURL || 'https://i.pravatar.cc/150'" class="w-[90px] h-[90px] object-cover rounded-lg border-[3px] border-[#e67e22] bg-white" crossorigin="anonymous" />
            <div class="flex flex-col">
               <h1 class="text-[1.5rem] font-black m-0 leading-[1.1] text-white">{{ userData.name }}</h1>
               <div class="text-[#e67e22] text-[0.75rem] font-bold tracking-[1px] mt-[5px]">{{ (userData.role || 'Member').toUpperCase() }}</div>
               <p v-if="userData.organizerDetails?.orgName" class="text-[0.9rem] text-[#bdc3c7] mt-[5px] italic">{{ userData.organizerDetails.orgName }}</p>
               <p v-if="userData.organizerDetails?.ssmNo" class="text-[0.65rem] text-[#7f8c8d] m-0">SSM: {{ userData.organizerDetails.ssmNo }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-[10px]">
             <div class="flex items-center gap-[8px] text-[0.8rem] text-[#ecf0f1]" v-if="userData.email">
                <img src="https://img.icons8.com/fluency/48/mail.png" class="w-4 h-4 opacity-90" /> {{ userData.email }}
             </div>
             <div class="flex items-center gap-[8px] text-[0.8rem] text-[#ecf0f1]" v-if="userData.phone">
                <img src="https://img.icons8.com/fluency/48/whatsapp.png" class="w-4 h-4 opacity-90" /> {{ userData.phone }}
             </div>
             <div class="flex items-center gap-[8px] text-[0.8rem] text-[#ecf0f1]" v-if="userData.instagram">
                <img src="https://img.icons8.com/fluency/48/instagram-new.png" class="w-4 h-4 opacity-90" /> {{ userData.instagram }}
             </div>
             <div class="flex items-center gap-[8px] text-[0.8rem] text-[#ecf0f1]" v-if="userData.location">
                <img src="https://img.icons8.com/fluency/48/marker.png" class="w-4 h-4 opacity-90" /> {{ userData.location }}
             </div>
          </div>
        </div>
        <div class="flex-1 bg-white flex items-center justify-center relative -ml-5 [clip-path:polygon(15%_0,100%_0,100%_100%,0%_100%)]">
           <div class="flex flex-col items-center text-center ml-[15px]">
             <div class="text-[0.7rem] font-bold tracking-[2px] text-[#2c3e50] mb-[5px]">SCAN ME</div>
             <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://knotenup.com/user/${userData.id}`" class="w-[110px] h-[110px]" crossorigin="anonymous" />
             <div class="font-black text-[1.1rem] text-[#2c3e50] mt-[5px]">KNOTENUP</div>
           </div>
        </div>
      </div>

      <!-- EMERGENCY CARD -->
      <div v-else-if="type === 'emergency'" id="emergencyCard" class="w-[600px] h-[340px] bg-[#ecf0f1] border-4 border-[#c0392b] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col font-sans text-[#333]">
         <div class="bg-[#c0392b] text-white px-5 py-[10px] flex justify-between items-center h-[50px]">
            <h2 class="m-0 text-[1.2rem] tracking-[1px] font-bold">EMERGENCY CARD</h2>
            <span class="text-[0.8rem] opacity-80">ID: {{ userData.id?.substring(0,6).toUpperCase() }}</span>
         </div>
         <div class="flex p-5 h-[calc(100%-50px)]">
            <div class="flex-[2] flex flex-col justify-around pr-[10px]">
               <div class="border-b border-[#bdc3c7] pb-[5px] mb-[5px]">
                  <label class="text-[0.65rem] text-[#7f8c8d] block">Name</label>
                  <strong class="text-[1rem] text-[#2c3e50]">{{ userData.name }}</strong>
               </div>
               <div class="flex gap-[15px] mb-[5px]">
                  <div class="flex-1">
                     <label class="text-[0.65rem] text-[#7f8c8d] block">Blood Type</label>
                     <div class="text-[#c0392b] text-[1.4rem] font-black">{{ privateData.bloodType || '-' }}</div>
                  </div>
                  <div class="flex-[2]">
                     <label class="text-[0.65rem] text-[#7f8c8d] block">Primary Contact</label>
                     <strong class="text-[1rem] text-[#2c3e50]">{{ privateData.emergencyContact || '-' }}</strong>
                  </div>
               </div>
               <div class="border-b border-[#bdc3c7] pb-[5px] mb-[5px]">
                  <label class="text-[0.65rem] text-[#7f8c8d] block">Relationship</label>
                  <strong class="text-[1rem] text-[#2c3e50]">{{ privateData.emergencyRelationship || '-' }}</strong>
               </div>
               <div class="bg-[#fadbd8] p-[8px] rounded-[5px] border border-[#f5b7b1]">
                  <label class="text-[0.65rem] text-[#c0392b] font-bold block">Medical Conditions / Allergies</label>
                  <div class="text-[0.85rem] text-[#333] leading-[1.2]">
                     {{ privateData.medicalCondition || 'None' }}
                  </div>
               </div>
            </div>
            <div class="flex-[0.8] flex flex-col items-center border-l border-dashed border-[#bdc3c7] pl-[10px]">
               <img :src="userData.avatar || userData.photoURL || 'https://i.pravatar.cc/150'" class="w-20 h-20 rounded-[4px] border border-[#bdc3c7] object-cover mb-[10px]" crossorigin="anonymous" />
               <div class="w-20 h-20">
                  <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://knotenup.com/emergency/${userData.id}`" crossorigin="anonymous" class="w-20 h-20 opacity-80">
               </div>
            </div>
         </div>
      </div>

      <!-- ACTIONS -->
      <div class="mt-5">
         <button class="px-[30px] py-[12px] rounded-[50px] border-none font-bold cursor-pointer transition-all duration-200 bg-[#e67e22] text-white shadow-[0_4px_15px_rgba(230,126,34,0.4)] hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(230,126,34,0.6)] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none" @click="downloadPDF" :disabled="isDownloading">
            {{ isDownloading ? 'Generating...' : 'Download PDF' }}
         </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const props = defineProps<{
  visible: boolean;
  type: 'business' | 'emergency';
  userData: any;
  privateData: any;
}>();

const emit = defineEmits(['update:visible']);
const isDownloading = ref(false);

const close = () => emit('update:visible', false);

const downloadPDF = async () => {
  const elementId = props.type === 'business' ? 'businessCard' : 'emergencyCard';
  const element = document.getElementById(elementId);
  if (!element) return;
  
  isDownloading.value = true;
  try {
    const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: null,
        logging: false 
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ 
        orientation: 'landscape', 
        unit: 'px', 
        format: [canvas.width, canvas.height] 
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`Knotenup_${props.type}_${props.userData.name}.pdf`);
  } catch (error) { 
    console.error(error); 
    alert("Gagal memuat turun kad. Sila cuba lagi."); 
  } finally { 
    isDownloading.value = false; 
  }
};
</script>
