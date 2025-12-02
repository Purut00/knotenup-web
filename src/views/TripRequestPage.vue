<template>
  <div class="request-page">
    
    <!-- HERO HEADER -->
    <div class="hero-header">
      <div class="hero-overlay">
        <h1 class="animate-up">{{ t('request.title') }}</h1>
        <p class="animate-up delay-1">{{ t('request.sub') }}</p>
        
        <button class="btn-hero animate-up delay-2" @click="showCreateModal = true">
          ➕ {{ t('request.createBtn') }}
        </button>
      </div>
    </div>

    <div class="content-container">
      
      <!-- FILTER & SEARCH BAR -->
      <div class="filter-bar animate-up delay-1">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input type="text" v-model="searchQuery" placeholder="Cari lokasi atau aktiviti..." class="search-input">
        </div>
        
        <div class="filter-options">
          <select v-model="filterCategory" class="filter-select">
            <option value="">Semua Kategori</option>
            <optgroup v-for="(group, gIndex) in ACTIVITY_CATEGORIES" :key="gIndex" :label="group.group">
              <option v-for="(item, iIndex) in group.items" :key="iIndex" :value="item">
                {{ item }}
              </option>
            </optgroup>
          </select>
          
          <select v-model="sortOption" class="filter-select">
            <option value="newest">Terkini</option>
            <option value="budget_low">Bajet: Rendah - Tinggi</option>
            <option value="budget_high">Bajet: Tinggi - Rendah</option>
          </select>

          <!-- 🔥 BUTANG FIX DATA (Temporary) 🔥 -->
          <button @click="fixOldData" class="btn-fix" title="Klik jika data lama hilang">
            🛠️ Fix Data
          </button>
        </div>
      </div>

      <!-- LOADING STATE -->
      <div v-if="loading" class="loading-box">
        <div class="spinner"></div>
        <p>{{ t('common.loading') }}</p>
      </div>

      <!-- GRID CONTENT -->
      <div v-else class="request-grid">
        
        <div v-if="filteredRequests.length === 0" class="empty-state">
          <p>Tiada permintaan aktif buat masa ini.</p>
          <!-- Helper message untuk developer -->
          <small style="display:block; margin-top:10px; color:#e74c3c;">
            (Jika data tak keluar, sila buka Console (F12) dan lihat jika ada error "Index" dari Firebase)
          </small>
          <button class="btn-text" @click="resetFilters">Reset Filter</button>
        </div>

        <div class="req-card" v-for="req in filteredRequests" :key="req.id">
          
          <div class="category-badge">
            {{ req.category || 'Umum' }}
          </div>

          <!-- Delete Button (Owner Only) -->
          <button v-if="isOwner(req.userId)" class="btn-delete" @click="deleteRequest(req.id)" title="Padam Request">
            🗑️
          </button>

          <div class="card-top">
            <div class="user-info">
              <img :src="req.userAvatar || 'https://i.pravatar.cc/150?img=3'" class="avatar">
              <div class="user-meta">
                <span class="name">{{ req.userName }}</span>
                <span class="time">{{ formatDate(req.createdAt) }}</span>
              </div>
            </div>
            <div class="budget-pill">
              RM {{ req.budget }}
            </div>
          </div>
          
          <div class="card-body">
            <h3 class="dest-title">Ke: {{ req.destination }}</h3>
            <div class="info-pills">
              <span>👥 {{ req.pax }} Pax</span>
              <span>📅 {{ req.dateString }}</span>
            </div>
            <p class="note-text">"{{ req.note }}"</p>
          </div>

          <div class="card-footer">
            
            <!-- BUTTON LOGIC -->
            <button v-if="isOwner(req.userId)" 
              class="btn-offer" 
              :class="req.offeredBy && req.offeredBy.length > 0 ? 'btn-view-offers' : 'btn-disabled'"
              :disabled="!req.offeredBy || req.offeredBy.length === 0"
              @click="viewOffers(req)"
            >
              <span v-if="req.offeredBy && req.offeredBy.length > 0">
                 📨 Lihat {{ req.offeredBy.length }} Tawaran
              </span>
              <span v-else>👤 Post Anda (Menunggu...)</span>
            </button>

            <button v-else 
              class="btn-offer" 
              :disabled="hasOffered(req) || !isCurrentUserOrganizer" 
              @click="openOfferModal(req)"
              :class="{ 
                'btn-sent': hasOffered(req), 
                'btn-disabled': !isCurrentUserOrganizer && !hasOffered(req) 
              }"
            >
              <span v-if="hasOffered(req)">✅ Tawaran Dihantar</span>
              <span v-else-if="!isCurrentUserOrganizer">🔒 Organizer Sahaja</span>
              <span v-else>🙋‍♂️ Accept Job</span>
            </button>

          </div>
        </div>

      </div>
    </div>

    <!-- MODAL 1: CREATE REQUEST -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modern-modal fade-up">
        <div class="modal-header">
          <h3>{{ t('request.modalTitle') }}</h3>
          <button class="close-btn" @click="showCreateModal = false">✖</button>
        </div>
        
        <div class="modal-body">
          <div class="input-wrap">
            <label>Jenis Aktiviti</label>
            <div class="category-scroll-container">
              <div class="category-grid">
                <template v-for="(group, gIndex) in ACTIVITY_CATEGORIES" :key="gIndex">
                   <div class="group-label">{{ group.group }}</div>
                   <div class="group-items">
                      <button 
                        v-for="(item, iIndex) in group.items" 
                        :key="iIndex"
                        :class="['cat-btn', { active: newRequest.category === item }]"
                        @click="newRequest.category = item"
                      >
                        {{ item }}
                      </button>
                   </div>
                </template>
              </div>
            </div>
          </div>

          <div class="input-wrap">
            <label>{{ t('createTrip.location') }}</label>
            <input type="text" v-model="newRequest.destination" class="clean-input" placeholder="Cth: Pulau Perhentian" />
          </div>

          <div class="grid-2">
            <div class="input-wrap">
              <label>{{ t('request.budget') }} (RM)</label>
              <input type="number" v-model="newRequest.budget" class="clean-input" placeholder="300" />
            </div>
            <div class="input-wrap">
              <label>{{ t('request.pax') }}</label>
              <input type="number" v-model="newRequest.pax" class="clean-input" placeholder="5" />
            </div>
          </div>

          <div class="input-wrap">
            <label>{{ t('createTrip.startDate') }}</label>
            <input type="date" v-model="newRequest.date" class="clean-input" />
            <small style="color: #888; font-size: 0.8em;">*Iklan akan hilang dari board selepas tarikh ini.</small>
          </div>

          <div class="input-wrap">
            <label>{{ t('request.note') }}</label>
            <textarea v-model="newRequest.note" class="clean-input" rows="3" placeholder="Nak pakej fullboard sekali snorkeling..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-submit" @click="submitRequest" :disabled="submitting">
            {{ submitting ? t('common.loading') : t('common.submit') }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 2: OFFER MODAL -->
    <div v-if="showOfferModal" class="modal-overlay" @click.self="showOfferModal = false">
      <div class="modern-modal fade-up">
        <div class="modal-header header-offer">
          <h3>🤝 Hantar Proposal</h3>
          <button class="close-btn" @click="showOfferModal = false">✖</button>
        </div>
        
        <div class="modal-body">
          <p class="offer-intro">
            Anda berminat untuk bawa <strong>{{ selectedRequest?.userName }}</strong> ke 
            <strong>{{ selectedRequest?.destination }}</strong>?
          </p>

          <div class="input-wrap">
            <label>Harga Tawaran Anda (RM)</label>
            <input type="number" v-model="offerForm.price" class="clean-input" placeholder="Contoh: 250" />
            <small class="hint">Bajet user: RM {{ selectedRequest?.budget }}</small>
          </div>

          <div class="input-wrap">
            <label>Mesej Kepada User</label>
            <textarea v-model="offerForm.message" class="clean-input" rows="3" placeholder="Hai! Saya ada trip pada tarikh tersebut. Pakej termasuk transport dan guide..."></textarea>
          </div>
          
           <div class="input-wrap">
            <label>No. WhatsApp (Optional)</label>
            <input type="text" v-model="offerForm.contact" class="clean-input" placeholder="012-3456789" />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-submit btn-offer-submit" @click="submitOffer" :disabled="submittingOffer">
            {{ submittingOffer ? 'Menghantar...' : 'Confirm & Hantar 🚀' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 3: VIEW OFFERS (Dengan Fungsi Accept) -->
    <div v-if="showViewOffersModal" class="modal-overlay" @click.self="showViewOffersModal = false">
      <div class="modern-modal fade-up modal-wide">
        <div class="modal-header header-view">
          <h3>📨 Pilih Tawaran Terbaik</h3>
          <button class="close-btn" @click="showViewOffersModal = false">✖</button>
        </div>
        
        <div class="modal-body bg-light">
           <div v-if="loadingOffers" class="loading-box-small">
             <div class="spinner"></div> Mengambil data...
           </div>

           <div v-else-if="currentOffers.length === 0" class="empty-list">
             Belum ada data tawaran.
           </div>

           <div v-else class="offers-list">
             <div class="offer-item" v-for="offer in currentOffers" :key="offer.id">
                <div class="offer-head">
                   <div class="offer-user clickable-profile" @click="goToProfile(offer.organizerId)" title="Lihat Profile Organizer">
                      <img :src="offer.organizerAvatar || 'https://i.pravatar.cc/150?img=5'" class="avatar-small">
                      <div>
                        <span class="offer-name">
                          {{ offer.organizerName }} 
                          <span class="icon-link">🔗</span>
                        </span>
                        <span class="offer-time">{{ formatDate(offer.createdAt) }}</span>
                      </div>
                   </div>
                   <div class="offer-price">
                     RM {{ offer.offeredPrice }}
                   </div>
                </div>
                
                <div class="offer-msg">"{{ offer.message }}"</div>
                
                <div class="offer-actions-grid">
                   <button class="btn-whatsapp" @click="openWhatsapp(offer)">
                     📲 Chat
                   </button>
                   <button class="btn-accept-offer" @click="acceptOffer(offer)">
                     ✅ Terima Tawaran Ini
                   </button>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, getDoc, query, orderBy, where, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ACTIVITY_CATEGORIES } from '../constants/data'; 

const { t } = useI18n();
const router = useRouter();

const showCreateModal = ref(false);
const showOfferModal = ref(false);
const showViewOffersModal = ref(false);

const loading = ref(true);
const submitting = ref(false);
const submittingOffer = ref(false);
const loadingOffers = ref(false);

const isCurrentUserOrganizer = ref(false);
const requests = ref<any[]>([]);
const currentOffers = ref<any[]>([]);
const selectedRequest = ref<any>(null);

const offerForm = reactive({ price: null, message: '', contact: '' });
const searchQuery = ref('');
const filterCategory = ref('');
const sortOption = ref('newest');

const newRequest = reactive({ 
  destination: '', budget: null, pax: null, date: '', note: '', category: ''
});

const formatDate = (timestamp: any) => {
  if (!timestamp) return 'Baru saja';
  const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date();
  return date.toLocaleDateString("en-MY", { day: 'numeric', month: 'short' });
};

const isOwner = (reqUserId: string): boolean => {
  return auth.currentUser ? auth.currentUser.uid === reqUserId : false;
};

const hasOffered = (req: any): boolean => {
  const currentUser = auth.currentUser;
  if (!currentUser || !req.offeredBy) return false;
  return req.offeredBy.includes(currentUser.uid);
};

const goToProfile = (userId: string) => {
  if(userId) {
    try { router.push({ name: 'Profile', params: { id: userId } }); } 
    catch (e) { router.push(`/profile/${userId}`); }
  }
};

const fetchRequests = async () => {
  loading.value = true;
  try {
    const q = query(
      collection(db, "trip_requests"), 
      where("status", "==", "open"),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const fetchedData: any[] = [];
    querySnapshot.forEach((doc) => { fetchedData.push({ id: doc.id, ...doc.data() }); });
    requests.value = fetchedData;
  } catch (e) { 
    console.error("Error fetching requests:", e); 
    // Console log ini akan keluar link index jika perlu
  } finally { loading.value = false; }
};

// 🔥 SCRIPT UTK PULIHKAN DATA LAMA 🔥
const fixOldData = async () => {
  if(!confirm("Ini akan update semua data lama jadi 'open'. Teruskan?")) return;
  loading.value = true;
  try {
    // Ambil SEMUA data (tanpa filter status)
    const q = query(collection(db, "trip_requests")); 
    const querySnapshot = await getDocs(q);
    
    const updates: Promise<void>[] = [];
    querySnapshot.forEach((docSnap) => {
       const data = docSnap.data();
       // Jika status tiada, set jadi 'open'
       if (!data.status) {
         updates.push(updateDoc(doc(db, "trip_requests", docSnap.id), { status: 'open' }));
       }
    });
    
    await Promise.all(updates);
    alert(`Siap! ${updates.length} data lama telah dipulihkan.`);
    fetchRequests(); // Refresh balik
  } catch(e) {
    console.error(e);
    alert("Gagal update data.");
  } finally {
    loading.value = false;
  }
};

const checkOrganizerStatus = async (user: any) => {
  if (!user) { isCurrentUserOrganizer.value = false; return; }
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      isCurrentUserOrganizer.value = (userData.role === 'organizer' || userData.accountType === 'organizer' || userData.isOrganizer === true);
    }
  } catch (e) { console.error(e); }
};

const filteredRequests = computed(() => {
  let result = requests.value;
  
  // 1. Filter Expired
  const today = new Date().toISOString().split('T')[0] || ''; 
  result = result.filter(r => {
    if (!r.dateString || r.dateString === 'Tarikh Bebas') return true;
    return r.dateString >= today;
  });

  // 2. Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(r => r.destination.toLowerCase().includes(query) || r.note.toLowerCase().includes(query));
  }
  // 3. Category
  if (filterCategory.value) result = result.filter(r => r.category === filterCategory.value);
  
  // 4. Sort
  if (sortOption.value === 'budget_low') result.sort((a, b) => a.budget - b.budget);
  else if (sortOption.value === 'budget_high') result.sort((a, b) => b.budget - a.budget);
  else result.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  return result;
});

const resetFilters = () => { searchQuery.value = ''; filterCategory.value = ''; sortOption.value = 'newest'; };

const setDefaultCategory = () => {
  if (ACTIVITY_CATEGORIES?.[0]?.items?.[0]) newRequest.category = ACTIVITY_CATEGORIES[0].items[0] || '';
};

onMounted(() => { 
  fetchRequests(); 
  setDefaultCategory();
  onAuthStateChanged(auth, (user) => { checkOrganizerStatus(user); });
});

const submitRequest = async () => {
  const user = auth.currentUser; 
  if (!user) return alert("Sila login untuk buat request.");
  if (!newRequest.destination || !newRequest.budget) return alert("Sila isi destinasi dan bajet.");

  submitting.value = true;
  try {
    await addDoc(collection(db, "trip_requests"), {
      userId: user.uid, 
      userName: user.displayName || 'User',
      userAvatar: user.photoURL || '',
      destination: newRequest.destination,
      budget: newRequest.budget,
      pax: newRequest.pax || 1,
      dateString: newRequest.date || 'Tarikh Bebas',
      note: newRequest.note,
      category: newRequest.category, 
      offeredBy: [], 
      status: 'open',
      createdAt: serverTimestamp()
    });
    alert("Request berjaya dihantar!");
    showCreateModal.value = false;
    newRequest.destination = ''; newRequest.budget = null; newRequest.note = '';
    setDefaultCategory();
    fetchRequests();
  } catch (e) { alert("Gagal menghantar request."); } finally { submitting.value = false; }
};

const deleteRequest = async (id: string) => {
  if(!confirm("Anda pasti mahu memadam request ini?")) return;
  try { await deleteDoc(doc(db, "trip_requests", id)); fetchRequests(); } catch(e) { alert("Gagal memadam."); }
};

const openOfferModal = (req: any) => {
  if (!isCurrentUserOrganizer.value) return alert("Maaf, hanya Organizer berdaftar boleh membuat tawaran.");
  if (!auth.currentUser) return alert("Sila login sebagai Organizer untuk offer.");
  selectedRequest.value = req;
  offerForm.price = req.budget; offerForm.message = ''; offerForm.contact = '';
  showOfferModal.value = true;
};

const submitOffer = async () => {
  if (!offerForm.price || !offerForm.message) return alert("Sila isi harga dan mesej.");
  const user = auth.currentUser;
  if (!user || !selectedRequest.value) return;

  submittingOffer.value = true;
  try {
    const offersRef = collection(db, "trip_requests", selectedRequest.value.id, "offers");
    await addDoc(offersRef, {
      organizerId: user.uid,
      organizerName: user.displayName || 'Organizer',
      organizerAvatar: user.photoURL || '',
      offeredPrice: offerForm.price,
      message: offerForm.message,
      contact: offerForm.contact,
      createdAt: serverTimestamp(),
      status: 'pending' 
    });
    const requestRef = doc(db, "trip_requests", selectedRequest.value.id);
    await updateDoc(requestRef, { offeredBy: arrayUnion(user.uid) });

    alert("Proposal berjaya dihantar!");
    showOfferModal.value = false;
    fetchRequests();
  } catch (e) { console.error(e); alert("Gagal menghantar tawaran."); } finally { submittingOffer.value = false; }
};

const viewOffers = async (req: any) => {
  selectedRequest.value = req;
  showViewOffersModal.value = true;
  loadingOffers.value = true;
  currentOffers.value = [];
  try {
    const offersRef = collection(db, "trip_requests", req.id, "offers");
    const q = query(offersRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const offers: any[] = [];
    snapshot.forEach(doc => offers.push({ id: doc.id, ...doc.data() }));
    currentOffers.value = offers;
  } catch(e) { console.error(e); } finally { loadingOffers.value = false; }
};

const openWhatsapp = (offer: any) => {
  if (!offer.contact) return alert("Organizer ini tidak menyertakan nombor telefon.");
  const cleanPhone = offer.contact.replace(/\D/g, ''); 
  const finalPhone = cleanPhone.startsWith('0') ? '6' + cleanPhone : cleanPhone;
  const text = `Hai ${offer.organizerName}, saya terima tawaran anda untuk trip ke ${selectedRequest.value.destination}.`;
  window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`, '_blank');
};

const acceptOffer = async (offer: any) => {
  if(!confirm(`Adakah anda pasti mahu menerima tawaran dari ${offer.organizerName}? Iklan ini akan ditutup dan trip baru akan dijadualkan.`)) return;
  
  const currentUser = auth.currentUser;
  if (!currentUser) return alert("Sila login semula.");

  try {
    // 1. Update status Request -> 'accepted' (Supaya hilang dari Board)
    const reqRef = doc(db, "trip_requests", selectedRequest.value.id);
    await updateDoc(reqRef, {
      status: 'accepted',
      acceptedOfferId: offer.id,
      acceptedOrganizerId: offer.organizerId,
      acceptedAt: serverTimestamp()
    });
    
    // 2. Update status Offer -> 'accepted'
    const offerRef = doc(db, "trip_requests", selectedRequest.value.id, "offers", offer.id);
    await updateDoc(offerRef, { status: 'accepted' });

    // 3. 🔥 NEW: Auto-Create Trip dalam collection 'trips' 🔥
    // Ini memastikan trip muncul dalam "Upcoming Trips" kedua-dua pihak
    await addDoc(collection(db, "trips"), {
      title: `Private Trip: ${selectedRequest.value.destination}`,
      destination: selectedRequest.value.destination,
      description: `Trip ini berasal dari request user. Note: ${selectedRequest.value.note}`,
      startDate: selectedRequest.value.dateString || new Date().toISOString().split('T')[0],
      price: offer.offeredPrice,
      
      // Organizer Info
      organizerId: offer.organizerId,
      organizerName: offer.organizerName,
      organizerAvatar: offer.organizerAvatar,
      
      // Participants (User yang request automatik jadi peserta)
      participants: [currentUser.uid], 
      
      // Meta Data
      type: 'private', // Tag sebagai private supaya tak perlu masuk public feed (optional)
      status: 'upcoming',
      sourceRequestId: selectedRequest.value.id,
      createdAt: serverTimestamp()
    });

    alert("🎉 Tahniah! Deal confirm. Trip ini telah dimasukkan ke dalam senarai 'Upcoming Trips' anda dan Organizer.");
    showViewOffersModal.value = false;
    fetchRequests(); 
    
  } catch(e) {
    console.error(e);
    alert("Gagal menerima tawaran. Sila cuba lagi.");
  }
};
</script>

<style scoped>
/* BASE STYLES */
.request-page { background-color: #f8f9fa; min-height: 100vh; padding-bottom: 4rem; }
.hero-header {
  height: 300px;
  background-image: url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000');
  background-size: cover; background-position: center; position: relative; z-index: 0; overflow: hidden;
  display: flex; align-items: center; justify-content: center; text-align: center; margin-bottom: 2rem; 
}
.hero-overlay {
  background: rgba(0,0,0,0.5); padding: 3rem; width: 100%; height: 100%;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
}
.hero-overlay h1 { font-size: 3rem; color: white; margin: 0 0 10px 0; font-weight: 800; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
.hero-overlay p { color: rgba(255,255,255,0.9); font-size: 1.2rem; margin-bottom: 2rem; }
.btn-hero {
  background: #27ae60; color: white; border: none; padding: 1rem 2.5rem;
  border-radius: 50px; font-weight: bold; cursor: pointer; font-size: 1rem;
  box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4); transition: transform 0.2s;
}
.btn-hero:hover { transform: translateY(-3px); background: #219150; }

.content-container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; position: relative; z-index: 10; }
.filter-bar {
  background: white; padding: 1rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  margin-top: -40px; margin-bottom: 2rem; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between;
}
.search-wrap { flex-grow: 1; display: flex; align-items: center; background: #f1f3f5; border-radius: 8px; padding: 0 10px; }
.search-icon { font-size: 1.2rem; color: #888; margin-right: 8px; }
.search-input { border: none; background: transparent; padding: 12px; width: 100%; outline: none; font-size: 1rem; }
.filter-options { display: flex; gap: 10px; align-items: center; }
.filter-select { padding: 10px 15px; border: 1px solid #ddd; border-radius: 8px; outline: none; background: white; cursor: pointer; }

/* FIX DATA BTN */
.btn-fix { background: #95a5a6; color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; }
.btn-fix:hover { background: #7f8c8d; }

.request-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
.req-card {
  background: white; border-radius: 16px; overflow: visible;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05); transition: transform 0.2s; border: 1px solid #f0f0f0;
  display: flex; flex-direction: column; position: relative;
}
.req-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0,0,0,0.1); }

.category-badge {
  position: absolute; top: -10px; left: 15px; background: #34495e; color: white;
  padding: 4px 14px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 2;
}

.btn-delete {
  position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.8); border: none;
  width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s; z-index: 2;
}
.btn-delete:hover { background: #ff7675; color: white; }

.card-top { padding: 1.5rem 1.2rem 1rem 1.2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f9f9f9; margin-top: 5px; }
.user-info { display: flex; align-items: center; gap: 10px; }
.avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #eee; }
.user-meta { display: flex; flex-direction: column; }
.name { font-weight: bold; font-size: 0.9rem; color: #2c3e50; }
.time { font-size: 0.75rem; color: #95a5a6; }
.budget-pill { background: #e8f5e9; color: #27ae60; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 0.85rem; }
.card-body { padding: 1.5rem; flex-grow: 1; }
.dest-title { margin: 0 0 10px 0; font-size: 1.3rem; color: #2c3e50; }
.info-pills { display: flex; gap: 10px; margin-bottom: 1rem; }
.info-pills span { background: #f8f9fa; color: #666; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; border: 1px solid #eee; }
.note-text { font-style: italic; color: #7f8c8d; line-height: 1.5; font-size: 0.95rem; }
.card-footer { padding: 1.2rem; background: #fcfcfc; border-top: 1px solid #f0f0f0; }

/* BUTTONS */
.btn-offer { width: 100%; padding: 0.8rem; background: #3498db; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
.btn-offer:hover:not(.btn-disabled) { background: #2980b9; }

.btn-sent { background: #27ae60 !important; color: white !important; opacity: 0.8; }
.btn-disabled { background: #ddd; color: #999; cursor: default; }

.btn-view-offers { background: #2c3e50 !important; color: white !important; border: 2px solid #2c3e50; }
.btn-view-offers:hover { background: #1a252f !important; }

/* MODAL STYLES */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modern-modal { background: white; border-radius: 16px; width: 100%; max-width: 500px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
.modal-wide { max-width: 600px; }
.modal-header { padding: 1.5rem; background: #2c3e50; color: white; display: flex; justify-content: space-between; align-items: center; }
.close-btn { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; }
.modal-body { padding: 2rem; max-height: 70vh; overflow-y: auto; }
.modal-footer { padding: 1.5rem; background: #f9f9f9; text-align: right; }
.bg-light { background: #f8f9fa; }

/* VIEW OFFERS LIST STYLES */
.offer-item { background: white; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; border: 1px solid #eee; box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
.offer-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.offer-user { display: flex; gap: 10px; align-items: center; }
.clickable-profile { cursor: pointer; transition: opacity 0.2s; }
.clickable-profile:hover { opacity: 0.8; }
.icon-link { font-size: 0.8rem; margin-left: 5px; }

.avatar-small { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.offer-name { font-weight: bold; display: block; color: #2c3e50; }
.offer-time { font-size: 0.75rem; color: #95a5a6; }
.offer-price { font-size: 1.2rem; font-weight: bold; color: #27ae60; background: #e8f5e9; padding: 5px 10px; border-radius: 8px; }
.offer-msg { background: #f9f9f9; padding: 10px; border-radius: 8px; color: #555; font-style: italic; margin-bottom: 15px; border-left: 3px solid #3498db; }
.offer-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.btn-whatsapp { background: #25D366; color: white; border: none; padding: 10px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; width: 100%; justify-content: center; }
.btn-accept-offer { background: #2c3e50; color: white; border: none; padding: 10px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; transition: background 0.2s; }
.btn-accept-offer:hover { background: #1a252f; }

/* OTHER UTILS */
.loading-box, .empty-state, .loading-box-small, .empty-list { text-align: center; color: #999; }
.loading-box, .empty-state { padding: 4rem; width: 100%; grid-column: 1/-1; }
.loading-box-small { padding: 2rem; }
.empty-list { padding: 2rem; }

.btn-text { background: none; border: 1px solid #ccc; padding: 5px 15px; margin-top: 10px; cursor: pointer; border-radius: 4px; }
.spinner { width: 40px; height: 40px; border: 4px solid #eee; border-top: 4px solid #e67e22; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px auto; }
@keyframes spin { to { transform: rotate(360deg); } }
.animate-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(30px); }
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
@keyframes slideUp { to { opacity: 1; transform: translateY(0); } }

/* COMMON FORM STYLES */
.category-scroll-container { max-height: 200px; overflow-y: auto; padding-right: 5px; margin-bottom: 5px; border: 1px solid #eee; padding: 10px; border-radius: 8px; }
.category-grid { display: flex; flex-direction: column; gap: 15px; }
.group-label { font-size: 0.8rem; font-weight: bold; color: #95a5a6; text-transform: uppercase; margin-bottom: 5px; }
.group-items { display: flex; flex-wrap: wrap; gap: 8px; }
.cat-btn { background: #f1f3f5; border: 1px solid transparent; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; color: #555; }
.cat-btn:hover { background: #e9ecef; }
.cat-btn.active { background: #2c3e50; color: white; border-color: #2c3e50; box-shadow: 0 2px 8px rgba(44, 62, 80, 0.3); }
.input-wrap { margin-bottom: 1rem; }
.input-wrap label { display: block; font-size: 0.85rem; font-weight: bold; color: #555; margin-bottom: 5px; }
.clean-input { width: 100%; padding: 0.8rem; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 1rem; outline: none; transition: border 0.2s; }
.clean-input:focus { border-color: #e67e22; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.btn-submit { background: #e67e22; color: white; border: none; padding: 0.8rem 2rem; border-radius: 50px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
.btn-submit:disabled { background: #ccc; }

.header-offer { background: #e67e22 !important; }
.header-view { background: #34495e !important; }
.offer-intro { margin-bottom: 1.5rem; color: #555; line-height: 1.5; background: #fff8e1; padding: 10px; border-radius: 8px; font-size: 0.9rem; }
.hint { color: #888; font-size: 0.8rem; margin-top: 5px; display: block; }
.btn-offer-submit { background: #27ae60 !important; width: 100%; }
.btn-offer-submit:hover { background: #219150 !important; }

@media (max-width: 768px) {
  .hero-header { height: 250px; }
  .filter-bar { flex-direction: column; align-items: stretch; margin-top: 0; }
  .filter-options { justify-content: space-between; }
  .filter-select { flex-grow: 1; }
  .request-grid { grid-template-columns: 1fr; }
}
</style>