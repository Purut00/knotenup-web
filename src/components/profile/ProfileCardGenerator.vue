<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="card-modal-wrapper fade-up">
      <button class="close-btn" @click="close">✖</button>
      
      <!-- BUSINESS CARD -->
      <div v-if="type === 'business'" id="businessCard" class="standard-card business-card">
        <div class="bc-left-panel">
          <div class="bc-profile-header">
            <img :src="userData.photoURL || 'https://i.pravatar.cc/150'" class="bc-avatar-square" crossorigin="anonymous" />
            <div class="bc-texts">
               <h1 class="bc-name">{{ userData.name }}</h1>
               <div class="bc-role">{{ (userData.role || 'Member').toUpperCase() }}</div>
               <p v-if="userData.organizerDetails?.orgName" class="bc-company">{{ userData.organizerDetails.orgName }}</p>
               <p v-if="userData.organizerDetails?.ssmNo" class="bc-ssm">SSM: {{ userData.organizerDetails.ssmNo }}</p>
            </div>
          </div>
          <div class="bc-socials-list">
             <div class="bc-soc-row" v-if="userData.email">
                <img src="https://img.icons8.com/fluency/48/mail.png" /> {{ userData.email }}
             </div>
             <div class="bc-soc-row" v-if="userData.phone">
                <img src="https://img.icons8.com/fluency/48/whatsapp.png" /> {{ userData.phone }}
             </div>
             <div class="bc-soc-row" v-if="userData.instagram">
                <img src="https://img.icons8.com/fluency/48/instagram-new.png" /> {{ userData.instagram }}
             </div>
             <div class="bc-soc-row" v-if="userData.location">
                <img src="https://img.icons8.com/fluency/48/marker.png" /> {{ userData.location }}
             </div>
          </div>
        </div>
        <div class="bc-right-panel">
           <div class="qr-container">
             <div class="scan-text">SCAN ME</div>
             <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://knotenup.com/user/${userData.id}`" class="bc-qr" crossorigin="anonymous" />
             <div class="bc-brand">KNOTENUP</div>
           </div>
        </div>
      </div>

      <!-- EMERGENCY CARD -->
      <div v-else-if="type === 'emergency'" id="emergencyCard" class="standard-card emergency-card">
         <div class="ec-header">
            <h2>EMERGENCY CARD</h2>
            <span>ID: {{ userData.id?.substring(0,6).toUpperCase() }}</span>
         </div>
         <div class="ec-body">
            <div class="ec-main">
               <div class="ec-row">
                  <label>Name</label>
                  <strong>{{ userData.name }}</strong>
               </div>
               <div class="ec-grid">
                  <div class="ec-col">
                     <label>Blood Type</label>
                     <div class="blood-type">{{ privateData.bloodType || '-' }}</div>
                  </div>
                  <div class="ec-col" style="flex:2;">
                     <label>Primary Contact</label>
                     <strong>{{ privateData.emergencyContact || '-' }}</strong>
                  </div>
               </div>
               <div class="ec-row">
                  <label>Relationship</label>
                  <strong>{{ privateData.emergencyRelationship || '-' }}</strong>
               </div>
               <div class="ec-alert-box">
                  <label>Medical Conditions / Allergies</label>
                  <div style="font-size: 0.85rem; color: #333; line-height: 1.2;">
                     {{ privateData.medicalCondition || 'None' }}
                  </div>
               </div>
            </div>
            <div class="ec-side">
               <img :src="userData.photoURL || 'https://i.pravatar.cc/150'" class="ec-avatar" crossorigin="anonymous" />
               <div class="ec-qr-box">
                  <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://knotenup.com/emergency/${userData.id}`" crossorigin="anonymous">
               </div>
            </div>
         </div>
      </div>

      <!-- ACTIONS -->
      <div class="modal-actions">
         <button class="share-btn download" @click="downloadPDF" :disabled="isDownloading">
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

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 9999; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px); }
.card-modal-wrapper { position: relative; display: flex; flex-direction: column; align-items: center; }
.close-btn { position: absolute; top: -40px; right: 0; background: none; border: none; font-size: 2rem; color: white; cursor: pointer; }
.modal-actions { margin-top: 20px; }
.share-btn { padding: 12px 30px; border-radius: 50px; border: none; font-weight: bold; cursor: pointer; transition: 0.2s; }
.share-btn.download { background: #e67e22; color: white; box-shadow: 0 4px 15px rgba(230, 126, 34, 0.4); }
.share-btn.download:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(230, 126, 34, 0.6); }
.share-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

.fade-up { animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* --- CARD STYLES --- */
.standard-card { width: 600px; height: 340px; background: white; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); overflow: hidden; display: flex; font-family: 'Helvetica Neue', sans-serif; color: #333; }
.business-card { background: #2c3e50; color: white; }

/* Business Card Internals */
.bc-left-panel { flex: 2; padding: 30px; display: flex; flex-direction: column; justify-content: center; gap: 20px; }
.bc-profile-header { display: flex; align-items: center; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; }
.bc-avatar-square { width: 90px; height: 90px; object-fit: cover; border-radius: 8px; border: 3px solid #e67e22; background: #fff; }
.bc-texts { display: flex; flex-direction: column; }
.bc-name { font-size: 1.5rem; font-weight: 800; margin: 0; line-height: 1.1; color: white; }
.bc-role { color: #e67e22; font-size: 0.75rem; font-weight: bold; letter-spacing: 1px; margin-top: 5px; }
.bc-company { font-size: 0.9rem; color: #bdc3c7; margin: 5px 0 0 0; font-style: italic; }
.bc-ssm { font-size: 0.65rem; color: #7f8c8d; margin: 0; }
.bc-socials-list { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.bc-soc-row { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: #ecf0f1; }
.bc-soc-row img { width: 16px; height: 16px; opacity: 0.9; }
.bc-right-panel { flex: 1; background: white; display: flex; align-items: center; justify-content: center; position: relative; clip-path: polygon(15% 0, 100% 0, 100% 100%, 0% 100%); margin-left: -20px; }
.qr-container { display: flex; flex-direction: column; align-items: center; text-align: center; margin-left: 15px; }
.scan-text { font-size: 0.7rem; font-weight: bold; letter-spacing: 2px; color: #2c3e50; margin-bottom: 5px; }
.bc-qr { width: 110px; height: 110px; }
.bc-brand { font-weight: 900; font-size: 1.1rem; color: #2c3e50; margin-top: 5px; }

/* Emergency Card Internals */
.emergency-card { background: #ecf0f1; border: 4px solid #c0392b; flex-direction: column; }
.ec-header { background: #c0392b; color: white; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; height: 50px; }
.ec-header h2 { margin: 0; font-size: 1.2rem; letter-spacing: 1px; }
.ec-header span { font-size: 0.8rem; opacity: 0.8; }
.ec-body { display: flex; padding: 20px; height: calc(100% - 50px); }
.ec-main { flex: 2; display: flex; flex-direction: column; justify-content: space-around; padding-right: 10px; }
.ec-side { flex: 0.8; display: flex; flex-direction: column; align-items: center; border-left: 1px dashed #bdc3c7; padding-left: 10px; }
.ec-row { border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 5px; }
.ec-row label { font-size: 0.65rem; color: #7f8c8d; display: block; }
.ec-row strong { font-size: 1rem; color: #2c3e50; }
.ec-grid { display: flex; gap: 15px; margin-bottom: 5px; }
.ec-col label { font-size: 0.65rem; color: #7f8c8d; display: block; }
.blood-type { color: #c0392b; font-size: 1.4rem; font-weight: 900; }
.ec-alert-box { background: #fadbd8; padding: 8px; border-radius: 5px; border: 1px solid #f5b7b1; }
.ec-alert-box label { font-size: 0.65rem; color: #c0392b; font-weight: bold; display: block; }
.ec-avatar { width: 80px; height: 80px; border-radius: 4px; border: 1px solid #bdc3c7; object-fit: cover; margin-bottom: 10px; }
.ec-qr-box img { width: 80px; height: 80px; opacity: 0.8; }
</style>
