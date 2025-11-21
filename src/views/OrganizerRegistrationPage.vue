<template>
  <div class="reg-page">
    <div class="form-card">
      <h2>🏆 Daftar Sebagai Organizer</h2>
      <p class="sub-text">Tingkatkan akaun anda untuk mula menganjurkan trip.</p>

      <div class="form-body">
        
        <div class="form-group">
          <label>Nama Organisasi / Jenama</label>
          
          <div class="checkbox-wrapper">
            <input type="checkbox" v-model="useProfileName" @change="syncName" id="useProfile">
            <label for="useProfile" class="sm-label">Guna nama profil saya ({{ currentUserName }})</label>
          </div>

          <input type="text" v-model="form.orgName" :disabled="useProfileName" placeholder="Cth: Abang Mat Guide Services" />
        </div>

        <div class="form-group">
          <label>No. Pendaftaran Perniagaan (SSM) - <small>Jika ada</small></label>
          <input type="text" v-model="form.ssm" placeholder="Cth: 20230100XXXX" />
        </div>

        <div class="form-group">
          <label>No. Lesen Malim / Permit Guide - <small>Jika ada</small></label>
          <input type="text" v-model="form.license" placeholder="Cth: MG-12345" />
        </div>

        <div class="tnc-box">
          <label class="checkbox-container">
            <input type="checkbox" v-model="form.agreed">
            <span class="text">
              Saya mengesahkan maklumat ini benar. Saya faham bahawa KnotenUp hanyalah medium promosi.
            </span>
          </label>
        </div>

        <button class="btn-submit" :disabled="!form.agreed || loading" @click="submitUpgrade">
          {{ loading ? 'Sedang Proses...' : 'Aktifkan Akaun Organizer' }}
        </button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const router = useRouter();
const loading = ref(false);
const useProfileName = ref(false);
const currentUserName = ref('');

const form = reactive({
  orgName: '',
  ssm: '',
  license: '',
  agreed: false
});

onMounted(() => {
  if(auth.currentUser) {
    currentUserName.value = auth.currentUser.displayName || '';
  }
});

const syncName = () => {
  if (useProfileName.value) {
    form.orgName = currentUserName.value;
  } else {
    form.orgName = '';
  }
};

const submitUpgrade = async () => {
  if (!auth.currentUser) return;
  if (!form.orgName) return alert("Sila letak nama organisasi/guide.");

  loading.value = true;

  try {
    const userRef = doc(db, "users", auth.currentUser.uid);
    
    await updateDoc(userRef, {
      role: 'organizer',
      // Simpan data extra dalam object organizerDetails
      organizerDetails: {
        orgName: form.orgName,
        ssm: form.ssm,
        license: form.license,
        verifiedAt: new Date()
      }
    });

    alert("Tahniah! Akaun anda telah dinaik taraf.");
    window.location.href = "/profile"; 

  } catch (e) {
    console.error(e);
    alert("Gagal menaik taraf.");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.reg-page { background: #f4f6f8; min-height: 100vh; padding: 2rem; display: flex; justify-content: center; align-items: center; }
.form-card { background: white; padding: 2.5rem; border-radius: 12px; width: 100%; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
h2 { color: #2c3e50; text-align: center; margin-bottom: 0.5rem; }
.sub-text { text-align: center; color: #777; margin-bottom: 2rem; font-size: 0.9rem; }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; font-weight: bold; margin-bottom: 0.5rem; color: #333; font-size: 0.9rem; }
.form-group input { width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 6px; }
.form-group input:focus { border-color: #e67e22; outline: none; }
.form-group input:disabled { background-color: #eee; color: #888; }

.checkbox-wrapper { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.sm-label { font-weight: normal !important; font-size: 0.8rem !important; margin: 0 !important; cursor: pointer; }

.tnc-box { background: #fff8e1; padding: 1rem; border-radius: 6px; border: 1px solid #ffe0b2; margin-bottom: 1.5rem; }
.checkbox-container { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
.checkbox-container input { width: auto; margin-top: 4px; }
.checkbox-container .text { font-size: 0.8rem; color: #5d4037; line-height: 1.4; }

.btn-submit { width: 100%; padding: 1rem; background: #e67e22; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 1rem; }
.btn-submit:hover { background: #d35400; }
.btn-submit:disabled { background: #ccc; cursor: not-allowed; }
</style>