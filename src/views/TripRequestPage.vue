<template>
  <div class="request-page">
    
    <div class="contour-lines"></div>
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <div class="container main-content" style="padding-top: 100px; padding-bottom: 3rem;">
      
      <div class="header-section mb-8 relative z-10 flex flex-col md:flex-row justify-between items-end gap-4">
        <div class="text-center md:text-left">
          <h1 class="text-3xl font-bold text-white mb-2">{{ t('request.title') || 'Permintaan Trip' }}</h1>
          <p class="text-gray-400 max-w-lg">
            {{ t('request.sub') || 'Tak jumpa trip yang sesuai? Minta organizer buatkan untuk anda!' }}
          </p>
        </div>
        
        <button class="btn-create-request" @click="showCreateModal = true">
          <span class="btn-content">
            <i class="fas fa-plus-circle text-xl"></i>
            <span class="text-sm font-bold ml-2 uppercase tracking-wide">{{ t('request.createBtn') || 'Buat Request' }}</span>
          </span>
          <div class="btn-glow"></div>
        </button>
      </div>

      <div class="filter-section mb-8 relative z-10">
        <div class="filter-container">
          
          <div class="search-row">
            <div class="search-wrapper-full">
               <i class="fas fa-search search-icon"></i>
               <input 
                 type="text" 
                 v-model="searchQuery"
                 class="search-input-full"
                 placeholder="Cari destinasi atau aktiviti..." 
               />
               <button class="btn-search-main">Cari</button>
            </div>
          </div>

          <div class="filters-row mt-4">
             
             <div class="select-wrapper">
                <i class="fas fa-layer-group select-icon text-purple-400"></i>
                <select v-model="filterCategory" class="custom-select">
                  <option value="">Semua Kategori</option>
                  <optgroup v-for="(group, gIndex) in ACTIVITY_CATEGORIES" :key="gIndex" :label="group.group">
                    <option v-for="(item, iIndex) in group.items" :key="iIndex" :value="item">
                      {{ item }}
                    </option>
                  </optgroup>
                </select>
             </div>

             <div class="select-wrapper">
                <i class="fas fa-map-marker-alt select-icon text-red-400"></i>
                <select v-model="filterState" class="custom-select">
                  <option value="">Semua Negeri</option>
                  <option v-for="state in MALAYSIA_STATES" :key="state" :value="state">{{ state }}</option>
                </select>
             </div>

             <div class="flex gap-2 shrink-0">
                <button 
                    v-if="searchQuery || filterCategory || filterState" 
                    class="btn-icon-glass" 
                    @click="resetFilters"
                    title="Reset Filter"
                >
                <i class="fas fa-undo"></i>
                </button>

                <button @click="fixOldData" class="btn-icon-glass" title="Fix Data Lama">
                <i class="fas fa-tools"></i>
                </button>
             </div>
          </div>
        </div>
      </div>

      <div class="content-area relative z-10">
        
        <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-gray-400">
          <div class="spinner mb-4"></div>
          <p>{{ t('common.loading') }}...</p>
        </div>
        
        <div v-else-if="filteredRequests.length === 0" class="empty-state glass-panel">
          <i class="fas fa-paper-plane text-4xl mb-4 opacity-30 text-gray-400"></i>
          <h3 class="text-lg font-bold text-gray-300">Tiada Permintaan Aktif</h3>
          <p class="text-gray-500 text-sm">Jadilah yang pertama meminta trip idaman!</p>
          <button @click="resetFilters" class="text-purple-400 underline mt-2">Reset Filter</button>
        </div>

        <div v-else class="request-grid">
          <div 
            v-for="req in filteredRequests" 
            :key="req.id" 
            class="request-card glass-card"
          >
            <div class="category-badge">
               {{ req.category || 'Umum' }}
            </div>

            <button v-if="isOwner(req.userId)" class="btn-delete-card" @click="deleteRequest(req.id)">
               <i class="fas fa-trash"></i>
            </button>

            <div class="card-body">
              
              <div class="user-row mb-3">
                 <img :src="req.userAvatar || 'https://i.pravatar.cc/150?img=3'" class="avatar-sm" />
                 <div class="user-meta">
                   <span class="username truncate">{{ req.userName }}</span>
                   <span class="time-ago">{{ formatDate(req.createdAt) }}</span>
                 </div>
              </div>

              <h3 class="req-title mb-2">Ke: {{ req.destination }}</h3>
              
              <div class="info-grid mb-3">
                 <div class="info-item">
                    <i class="fas fa-map-marker-alt text-red-400 w-5"></i> 
                    <span class="truncate">{{ req.location }}</span>
                 </div>
                 <div class="info-item">
                    <i class="fas fa-users text-blue-400 w-5"></i> 
                    <span>{{ req.pax }} Pax</span>
                 </div>
                 <div class="info-item">
                    <i class="fas fa-calendar-alt text-orange-400 w-5"></i> 
                    <span>{{ req.dateString }}</span>
                 </div>
                 <div class="info-item">
                    <i class="fas fa-wallet text-green-400 w-5"></i> 
                    <span class="text-green-300 font-bold">RM {{ req.budget }}</span>
                 </div>
              </div>

              <p class="req-desc line-clamp-2">"{{ req.note }}"</p>
            </div>

            <div class="card-footer">
               <button v-if="isOwner(req.userId)" 
                  class="btn-action btn-owner" 
                  :class="{'has-offers': req.offeredBy && req.offeredBy.length > 0}"
                  :disabled="!req.offeredBy || req.offeredBy.length === 0"
                  @click="viewOffers(req)"
               >
                  <span v-if="req.offeredBy && req.offeredBy.length > 0">
                      📨 Lihat {{ req.offeredBy.length }} Tawaran
                  </span>
                  <span v-else>
                      👤 Menunggu Tawaran...
                  </span>
               </button>

               <button v-else 
                  class="btn-action" 
                  :class="{ 
                    'btn-sent': hasOffered(req), 
                    'btn-purple': isCurrentUserOrganizer && !hasOffered(req),
                    'btn-disabled': !isCurrentUserOrganizer 
                  }"
                  :disabled="hasOffered(req) || !isCurrentUserOrganizer" 
                  @click="openOfferModal(req)"
               >
                  <span v-if="hasOffered(req)">✅ Tawaran Dihantar</span>
                  <span v-else-if="!isCurrentUserOrganizer">🔒 Organizer Sahaja</span>
                  <span v-else>🙋‍♂️ Accept Job</span>
               </button>
            </div>

          </div>
        </div>

      </div>
    </div>

    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="glass-modal fade-up">
        <div class="modal-header">
          <h3>📋 Cipta Permintaan</h3>
          <button class="close-btn" @click="showCreateModal = false">✖</button>
        </div>
        
        <div class="modal-body custom-scrollbar">
          
          <div class="form-group">
            <label>Jenis Aktiviti</label>
            <div class="select-wrapper-modal">
                <select v-model="newRequest.category" class="glass-input">
                    <option value="" disabled>Sila Pilih Kategori</option>
                    <optgroup v-for="(group, gIndex) in ACTIVITY_CATEGORIES" :key="gIndex" :label="group.group">
                        <option v-for="(item, iIndex) in group.items" :key="iIndex" :value="item">
                            {{ item }}
                        </option>
                    </optgroup>
                </select>
                <i class="fas fa-chevron-down select-arrow"></i>
            </div>
          </div>

          <div class="form-group">
            <label>Destinasi (Tempat Spesifik)</label>
            <input type="text" v-model="newRequest.destination" class="glass-input" placeholder="Cth: Pulau Perhentian Kecil" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Negeri</label>
              <div class="select-wrapper-modal">
                  <select v-model="newRequest.location" class="glass-input">
                      <option v-for="s in MALAYSIA_STATES" :key="s" :value="s">{{ s }}</option>
                  </select>
                  <i class="fas fa-chevron-down select-arrow"></i>
              </div>
            </div>
            <div class="form-group">
              <label>Tarikh</label>
              <input type="date" v-model="newRequest.date" class="glass-input" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Bajet (RM)</label>
              <input type="number" v-model="newRequest.budget" class="glass-input" placeholder="300" />
            </div>
            <div class="form-group">
              <label>Pax</label>
              <input type="number" v-model="newRequest.pax" class="glass-input" placeholder="5" />
            </div>
          </div>

          <div class="form-group">
            <label>Nota Tambahan</label>
            <textarea v-model="newRequest.note" class="glass-input" rows="3" placeholder="Ceritakan detail..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-submit-modal" @click="submitRequest" :disabled="submitting">
            {{ submitting ? 'Menghantar...' : '🚀 Hantar' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showOfferModal" class="modal-overlay" @click.self="showOfferModal = false">
      <div class="glass-modal fade-up">
        <div class="modal-header header-offer">
          <h3>🤝 Hantar Proposal</h3>
          <button class="close-btn" @click="showOfferModal = false">✖</button>
        </div>
        
        <div class="modal-body">
          <div class="offer-context">
             User: <strong>{{ selectedRequest?.userName }}</strong> <br>
             Destinasi: <strong>{{ selectedRequest?.destination }}</strong>
          </div>

          <div class="form-group mt-4">
            <label>Harga Tawaran (RM)</label>
            <input type="number" v-model="offerForm.price" class="glass-input" />
            <small class="text-gray-400">Bajet asal: RM {{ selectedRequest?.budget }}</small>
          </div>

          <div class="form-group">
            <label>Mesej</label>
            <textarea v-model="offerForm.message" class="glass-input" rows="3" placeholder="Saya boleh bawa trip ini..."></textarea>
          </div>
          
          <div class="form-group">
            <label>WhatsApp (Optional)</label>
            <input type="text" v-model="offerForm.contact" class="glass-input" placeholder="012-3456789" />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-submit-modal btn-green" @click="submitOffer" :disabled="submittingOffer">
            {{ submittingOffer ? 'Menghantar...' : 'Hantar Tawaran' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showViewOffersModal" class="modal-overlay" @click.self="showViewOffersModal = false">
      <div class="glass-modal fade-up modal-wide">
        <div class="modal-header header-view">
          <h3>📨 Senarai Tawaran</h3>
          <button class="close-btn" @click="showViewOffersModal = false">✖</button>
        </div>
        
        <div class="modal-body custom-scrollbar">
           <div v-if="loadingOffers" class="text-center text-white py-4">Memuatkan...</div>
           <div v-else-if="currentOffers.length === 0" class="text-center text-gray-400 py-4">Tiada tawaran lagi.</div>
           
           <div v-else class="offers-list">
             <div class="offer-card" v-for="offer in currentOffers" :key="offer.id">
                <div class="offer-top">
                   <div class="offer-user" @click="goToProfile(offer.organizerId)">
                      <img :src="offer.organizerAvatar || 'https://i.pravatar.cc/150'" class="avatar-sm">
                      <div>
                          <div class="font-bold text-white">{{ offer.organizerName }}</div>
                          <div class="text-xs text-gray-400">{{ formatDate(offer.createdAt) }}</div>
                      </div>
                   </div>
                   <div class="offer-price-tag">RM {{ offer.offeredPrice }}</div>
                </div>
                <div class="offer-msg">"{{ offer.message }}"</div>
                <div class="offer-actions">
                   <button class="btn-sm-glass" @click="openWhatsapp(offer)">📲 Chat</button>
                   <button class="btn-sm-glass btn-accept" @click="acceptOffer(offer)">✅ Terima</button>
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
import { 
  collection, addDoc, getDocs, deleteDoc, updateDoc, doc, getDoc, 
  query, orderBy, where, serverTimestamp, collectionGroup 
} from 'firebase/firestore'; // Added collectionGroup
import { onAuthStateChanged } from 'firebase/auth';
import { ACTIVITY_CATEGORIES, MALAYSIA_STATES } from '../constants/data'; 

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

// State baru untuk track offer pengguna semasa
const myOfferedRequestIds = ref<Set<string>>(new Set());

const offerForm = reactive({ price: null, message: '', contact: '' });
const searchQuery = ref('');
const filterCategory = ref('');
const filterState = ref(''); 

const newRequest = reactive({ 
  destination: '', location: 'Selangor', budget: null, pax: null, date: '', note: '', category: ''
});

const formatDate = (timestamp: any) => {
  if (!timestamp) return 'Baru saja';
  const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date();
  return date.toLocaleDateString("en-MY", { day: 'numeric', month: 'short' });
};

const isOwner = (reqUserId: string): boolean => {
  return auth.currentUser ? auth.currentUser.uid === reqUserId : false;
};

// LOGIC DIKEMASKINI: Cek local state juga
const hasOffered = (req: any): boolean => {
  const currentUser = auth.currentUser;
  if (!currentUser) return false;
  
  // 1. Cek local state (untuk immediate update) & fetch hasil collectionGroup
  if (myOfferedRequestIds.value.has(req.id)) return true;

  // 2. Fallback ke legacy array (jika ada data lama)
  if (req.offeredBy && req.offeredBy.includes(currentUser.uid)) return true;

  return false;
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
  } finally { loading.value = false; }
};

// FUNGSI BARU: Fetch Offers sendiri menggunakan Collection Group
// Ini perlu untuk tahu status 'Tawaran Dihantar' tanpa bergantung pada array parent yang tidak selamat
const fetchMyOffers = async (userId: string) => {
  try {
    const q = query(collectionGroup(db, 'offers'), where('organizerId', '==', userId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((docSnap) => {
      // Dapatkan ID parent (request ID) dari ref path
      const reqId = docSnap.ref.parent.parent?.id;
      if (reqId) {
        myOfferedRequestIds.value.add(reqId);
      }
    });
  } catch (e) {
    // Note: Jika console error "Requires Index", abaikan sementara atau buat index di Firebase Console
    console.log("CollectionGroup query perlu index. Jika error, status tawaran mungkin tak persist selepas refresh.");
  }
};

const fixOldData = async () => {
  if(!confirm("Ini akan update semua data lama jadi 'open'. Teruskan?")) return;
  loading.value = true;
  try {
    const q = query(collection(db, "trip_requests")); 
    const querySnapshot = await getDocs(q);
    const updates: Promise<void>[] = [];
    querySnapshot.forEach((docSnap) => {
       const data = docSnap.data();
       if (!data.status) {
         updates.push(updateDoc(doc(db, "trip_requests", docSnap.id), { status: 'open' }));
       }
    });
    await Promise.all(updates);
    alert(`Siap! Data dipulihkan.`);
    fetchRequests();
  } catch(e) { alert("Gagal update data."); } finally { loading.value = false; }
};

const checkOrganizerStatus = async (user: any) => {
  if (!user) { isCurrentUserOrganizer.value = false; return; }
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const isOrg = (userData.role === 'organizer' || userData.accountType === 'organizer');
      isCurrentUserOrganizer.value = isOrg;
      
      // Jika organizer, fetch offer history mereka
      if (isOrg) {
        fetchMyOffers(user.uid);
      }
    }
  } catch (e) { console.error(e); }
};

const filteredRequests = computed(() => {
  let result = requests.value;
  const today = new Date().toISOString().split('T')[0] || ''; 
  result = result.filter(r => {
    if (!r.dateString || r.dateString === 'Tarikh Bebas') return true;
    return r.dateString >= today;
  });

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(r => r.destination.toLowerCase().includes(query) || r.note.toLowerCase().includes(query));
  }
  
  if (filterCategory.value) result = result.filter(r => r.category === filterCategory.value);
  if (filterState.value) result = result.filter(r => r.location === filterState.value);

  return result;
});

const resetFilters = () => { searchQuery.value = ''; filterCategory.value = ''; filterState.value = ''; };

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
      location: newRequest.location,
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
    // 1. Tambah offer ke SUBCOLLECTION (Selamat)
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

    // SAFETY UPDATE: 
    // Kita BUANG 'updateDoc' ke parent (requestRef) di sini untuk elak 'Competitor Sabotage'.
    // Organizer tidak sepatutnya boleh tulis ke dokumen request milik user lain.
    // Jika perlu update count, sebaiknya guna Cloud Functions.
    
    // Update local state supaya butang bertukar jadi hijau serta-merta
    myOfferedRequestIds.value.add(selectedRequest.value.id);

    alert("Proposal berjaya dihantar!");
    showOfferModal.value = false;
    
    // Refresh bukan mandatori sebab kita dah update local state, tapi bagus untuk data sync
    // fetchRequests(); 
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
  if(!confirm(`Terima tawaran dari ${offer.organizerName}? Iklan akan ditutup.`)) return;
  const currentUser = auth.currentUser;
  if (!currentUser) return alert("Sila login semula.");

  try {
    const reqRef = doc(db, "trip_requests", selectedRequest.value.id);
    await updateDoc(reqRef, {
      status: 'accepted',
      acceptedOfferId: offer.id,
      acceptedOrganizerId: offer.organizerId,
      acceptedAt: serverTimestamp()
    });
    
    await addDoc(collection(db, "trips"), {
      title: `Private: ${selectedRequest.value.destination}`,
      destination: selectedRequest.value.destination,
      description: `Request User. Note: ${selectedRequest.value.note}`,
      startDate: selectedRequest.value.dateString || new Date().toISOString().split('T')[0],
      price: offer.offeredPrice,
      organizerId: offer.organizerId,
      organizerName: offer.organizerName,
      organizerAvatar: offer.organizerAvatar,
      participants: [currentUser.uid], 
      type: 'private',
      status: 'upcoming',
      createdAt: serverTimestamp()
    });

    alert("Deal confirm! Trip dimasukkan ke senarai.");
    showViewOffersModal.value = false;
    fetchRequests(); 
  } catch(e) { alert("Gagal menerima tawaran."); }
};
</script>

<style scoped>
/* --- BASE THEME (DARK) --- */
.request-page { 
  background-color: #0f172a; 
  min-height: 100vh; position: relative; overflow-x: hidden; color: white;
}

/* GLOWS */
.page-glow-purple {
  position: absolute; top: 0; left: 0; width: 50vw; height: 50vw;
  background: #6c63ff; filter: blur(150px); opacity: 0.15; pointer-events: none; border-radius: 50%;
}
.page-glow-orange {
  position: absolute; bottom: 0; right: 0; width: 50vw; height: 50vw;
  background: #ff8c42; filter: blur(150px); opacity: 0.1; pointer-events: none; border-radius: 50%;
}
.contour-lines {
  position: absolute; inset: 0; z-index: 0; opacity: 0.08;
  background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400' stroke='white' fill='none' stroke-width='2' opacity='0.5'/%3E%3C/svg%3E");
  background-size: cover; pointer-events: none;
}

.container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; position: relative; z-index: 2; }

/* --- HEADER BUTTON (UNGU) --- */
.btn-create-request {
  position: relative; background: transparent; border: none; padding: 0; cursor: pointer; display: flex; align-items: center;
}
.btn-content {
  position: relative; z-index: 2; display: flex; align-items: center;
  background: linear-gradient(135deg, #6c63ff, #5b54e0);
  color: white; padding: 12px 24px; border-radius: 50px;
  box-shadow: 0 4px 15px rgba(108, 99, 255, 0.4); transition: transform 0.2s;
}
.btn-create-request:hover .btn-content { transform: translateY(-2px); background: linear-gradient(135deg, #5b54e0, #4c46c0); }
.btn-glow {
  position: absolute; inset: 0; background: #6c63ff; filter: blur(15px); opacity: 0.5; z-index: 1; transition: opacity 0.3s;
}
.btn-create-request:hover .btn-glow { opacity: 0.8; }

/* --- FILTER SECTION (GLASS DARK) --- */
.filter-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px; padding: 1.5rem; backdrop-filter: blur(10px);
}
.filter-container { display: flex; flex-direction: column; gap: 8px; }

.search-row { width: 100%; }
.search-wrapper-full { position: relative; display: flex; width: 100%; align-items: center; }
.search-input-full {
  width: 100%; padding: 10px 100px 10px 44px;
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.2); color: white; outline: none; transition: 0.3s; font-size: 1rem;
}
.search-input-full:focus { border-color: #6c63ff; background: rgba(0,0,0,0.4); }
.search-icon { position: absolute; left: 16px; color: #94a3b8; font-size: 1.1rem; }
.btn-search-main {
  position: absolute; right: 4px; top: 4px; bottom: 4px;
  background: #6c63ff; color: white; border: none; padding: 0 20px;
  border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.3s;
}
.btn-search-main:hover { background: #5b54e0; }

.filters-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.select-wrapper { position: relative; flex: 1; min-width: 160px; }
.custom-select {
  width: 100%; appearance: none; padding: 10px 36px 10px 38px;
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.2); color: #e2e8f0; outline: none; cursor: pointer; transition: 0.3s;
}
.custom-select:hover { background: rgba(0,0,0,0.3); }
.custom-select:focus { border-color: #6c63ff; }
.select-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.select-wrapper::after {
  content: '▼'; font-size: 0.7rem; color: #94a3b8; position: absolute; right: 14px; top: 50%; transform: translateY(-50%); pointer-events: none;
}

/* FIX: Dark Options */
.custom-select option, .custom-select optgroup {
  background-color: #1e293b; color: white; padding: 10px;
}

.btn-icon-glass {
  width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
  border-radius: 10px; background: rgba(255, 255, 255, 0.1); color: #ccc; border: none; cursor: pointer;
}
.btn-icon-glass:hover { background: rgba(255, 255, 255, 0.2); color: white; }

/* --- REQUEST CARDS --- */
.request-grid {
  display: grid; 
  /* Grid Size = Same as Trip/Spot (minmax 260px) */
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); 
  gap: 24px;
}

.request-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px; overflow: hidden;
  backdrop-filter: blur(10px);
  display: flex; flex-direction: column; transition: 0.3s; position: relative;
  /* Fixed Height not enforced to prevent overflow, but min-height matches trip cards roughly */
  min-height: 280px; 
}
.request-card:hover { 
  transform: translateY(-5px); background: rgba(255, 255, 255, 0.06); border-color: #6c63ff; 
  box-shadow: 0 10px 30px rgba(108, 99, 255, 0.15);
}

/* FIX: Category Badge Left */
.category-badge {
  position: absolute; top: 12px; left: 12px; font-size: 0.65rem; 
  background: rgba(108, 99, 255, 0.2); color: #a78bfa; 
  padding: 3px 10px; border-radius: 20px; font-weight: bold; text-transform: uppercase;
}

/* FIX: Delete Button Right */
.btn-delete-card {
  position: absolute; top: 12px; right: 12px; width: 24px; height: 24px; 
  background: rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 50%; 
  display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; z-index: 2;
}
.btn-delete-card:hover { background: rgba(239, 68, 68, 0.4); }

.card-header {
  padding: 1.2rem; margin-top: 2rem; /* Add margin-top to clear badge */
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.user-row { display: flex; align-items: center; gap: 10px; }
.avatar-sm { width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); object-fit: cover; }
.user-meta { display: flex; flex-direction: column; width: 100%; overflow: hidden; }
.username { font-weight: 600; font-size: 0.9rem; color: white; }
.time-ago { font-size: 0.7rem; color: #94a3b8; }
.budget-pill { font-size: 0.9rem; color: #4ade80; font-weight: 800; background: rgba(74, 222, 128, 0.1); padding: 4px 10px; border-radius: 8px; }

.card-body { padding: 1.2rem; flex: 1; display: flex; flex-direction: column; }
.req-title { font-size: 1.1rem; color: white; font-weight: 700; line-height: 1.3; }

/* Info Grid (Icon + Text) */
.info-grid { 
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.85rem; color: #cbd5e1; 
}
.info-item { display: flex; align-items: center; overflow: hidden; white-space: nowrap; }

.req-desc { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; font-style: italic; }

.card-footer { padding: 1rem; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; margin-top: auto; }
.btn-action {
  width: 100%; padding: 8px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; border: none; cursor: pointer; transition: 0.2s;
}
.btn-purple { background: #6c63ff; color: white; }
.btn-purple:hover { background: #5b54e0; }
.btn-sent { background: #10b981; color: white; }
.btn-owner { background: rgba(255,255,255,0.1); color: #ccc; border: 1px solid rgba(255,255,255,0.1); }
.btn-owner.has-offers { background: #e67e22; color: white; border: none; animation: pulse 2s infinite; }
.btn-disabled { background: rgba(255,255,255,0.05); color: #666; cursor: not-allowed; }

@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.8; } 100% { opacity: 1; } }

.spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #6c63ff; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 3rem; display: flex; flex-direction: column; align-items: center; }

/* --- GLASS MODAL --- */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 9999;
  display: flex; justify-content: center; align-items: center; padding: 1rem; backdrop-filter: blur(5px);
}
.glass-modal {
  background: rgba(30, 41, 59, 0.95); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px; padding: 2rem; width: 100%; max-width: 500px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5); color: white; display: flex; flex-direction: column;
}
.modal-wide { max-width: 600px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.modal-header h3 { font-size: 1.3rem; margin: 0; color: white; }
.close-btn { background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; }

/* Modal Dropdown Wrapper */
.select-wrapper-modal { position: relative; width: 100%; }
.select-arrow { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }

.glass-input {
  width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.3); color: white; outline: none; font-size: 0.95rem; appearance: none; /* Hide default arrow */
}
.glass-input:focus { border-color: #6c63ff; }
.glass-input option, .glass-input optgroup { background-color: #1e293b; color: white; }

.btn-submit-modal {
  margin-top: 10px; padding: 12px; border: none; border-radius: 8px; width: 100%;
  background: linear-gradient(135deg, #6c63ff, #5b54e0); color: white; font-weight: bold; cursor: pointer;
}
.btn-submit-modal:hover { opacity: 0.9; }
.btn-green { background: linear-gradient(135deg, #10b981, #059669); }

/* Offer List */
.offer-card { background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.05); }
.offer-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.offer-user { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.offer-price-tag { font-weight: bold; color: #4ade80; font-size: 1.1rem; }
.offer-msg { background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; color: #cbd5e1; font-style: italic; font-size: 0.9rem; margin-bottom: 10px; }
.offer-actions { display: flex; gap: 10px; }
.btn-sm-glass { flex: 1; padding: 6px; background: rgba(255,255,255,0.1); border: none; border-radius: 6px; color: white; cursor: pointer; }
.btn-accept { background: #10b981; }

.custom-scrollbar { max-height: 60vh; overflow-y: auto; padding-right: 5px; }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #6c63ff; border-radius: 5px; }

@media (max-width: 768px) {
  .header-section { flex-direction: column; text-align: center; align-items: center; }
  .filters-row { flex-direction: column; }
  .select-wrapper { width: 100%; }
}
</style>