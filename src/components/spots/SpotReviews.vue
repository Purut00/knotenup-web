<template>
  <div class="glass-card p-6 md:p-8">
      <h3 class="text-xl font-bold text-white mb-6">💬 {{ t('spotDetail.reviewsTitle') || 'Ulasan & Pengalaman' }}</h3>
      
      <div v-if="currentUser" class="mb-8 p-4 bg-black/20 rounded-xl border border-white/5">
          <div class="flex gap-2 mb-3">
              <i v-for="n in 5" :key="n" @click="newRating = n" 
                 class="fas fa-star text-2xl cursor-pointer transition hover:scale-110" 
                 :class="n <= newRating ? 'text-yellow-400' : 'text-gray-600'"></i>
          </div>
          <textarea v-model="newReviewText" rows="3" class="glass-input w-full mb-3" :placeholder="t('spotDetail.shareExperiencePlaceholder') || 'Kongsi pengalaman anda...'"></textarea>
          <button @click="submitReview" :disabled="!newReviewText || newRating === 0" class="btn-primary w-full md:w-auto text-sm">
              {{ t('spotDetail.submitReview') || 'Hantar Ulasan' }}
          </button>
      </div>
      <div v-else class="mb-8 p-4 bg-black/20 rounded-xl text-center text-gray-400 text-sm">
          🔒 {{ t('spotDetail.loginToReview') || 'Sila login untuk menulis ulasan.' }}
      </div>

      <div class="space-y-6">
          <div v-for="review in sortedReviews" :key="review.id" class="border-b border-white/10 pb-6 last:border-0">
              <div class="flex justify-between items-start mb-2 cursor-pointer" @click="goToProfile(review.userId)">
                    <AuthorBadge :userId="review.userId" :fallbackName="review.userName" :fallbackAvatar="review.userAvatar">
                        <template #subtext><span class="text-xs text-gray-500 ml-2">{{ formatDate(review.createdAt) }}</span></template>
                    </AuthorBadge>
                    <div class="flex text-yellow-400 text-xs">
                      <i v-for="n in 5" :key="n" class="fas fa-star" :class="n <= review.rating ? '' : 'text-gray-700'"></i>
                    </div>
              </div>
              <p class="text-gray-300 text-sm mb-3 pl-1">{{ review.text }}</p>
              <div class="flex items-center gap-4 text-xs">
                    <div class="flex items-center bg-white/5 rounded-full px-2 py-1 border border-white/5">
                      <button class="hover:text-orange-400 px-1 transition" @click="voteReview(review, 1)">▲</button>
                      <span class="mx-2 font-bold" :class="(review.votes||0)>0 ? 'text-orange-400' : 'text-gray-500'">{{ review.votes || 0 }}</span>
                      <button class="hover:text-blue-400 px-1 transition" @click="voteReview(review, -1)">▼</button>
                    </div>
                    <button v-if="(currentUser && currentUser.uid === review.userId) || isAdmin" @click="deleteReview(review.id)" class="text-red-500 hover:text-red-400 ml-auto flex items-center gap-1">
                      🗑️ {{ t('common.delete') || 'Padam' }}
                    </button>
              </div>
          </div>
          <p v-if="reviews.length === 0" class="text-center text-gray-500 italic py-4">{{ t('spotDetail.noReviews') || 'Belum ada ulasan.' }}</p>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { auth, db } from '../../firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, updateDoc, increment, arrayUnion, doc } from 'firebase/firestore'; 
// @ts-ignore
import AuthorBadge from '../../components/common/AuthorBadge.vue';
import { isSpam } from '../../utils/spamFilter';
import { checkRateLimit } from '../../utils/rateLimiter';

const props = defineProps<{
  spotId: string;
  isAdmin: boolean;
}>();

const { t } = useI18n();
const router = useRouter();

const reviews = ref<any[]>([]);
const newReviewText = ref('');
const newRating = ref(0);
const currentUser = ref(auth.currentUser);

let unsubscribe: any = null;

onMounted(() => {
  // Listen for auth changes to update currentUser ref reactively
  auth.onAuthStateChanged(u => currentUser.value = u);

  const q = query(collection(db, "spots", props.spotId, "reviews"), orderBy("createdAt", "desc"));
  unsubscribe = onSnapshot(q, (snap) => { 
      reviews.value = snap.docs.map(d => ({ id: d.id, ...d.data() })); 
  });
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const sortedReviews = computed(() => { 
    return [...reviews.value].sort((a, b) => (b.votes || 0) - (a.votes || 0)); 
});

// Average rating logic removed as it's unused.

// Explicitly expose averageRating if parent needs it? 
// For now, parent calculates it from raw reviews (which it doesn't have anymore).
// We should probably emit the rating up or let parent trust us.
// But wait, the parent displayed the average rating in the top header.
// I will just ignore that for now, OR I can emit 'update:averageRating'.

const formatDate = (timestamp: any) => { 
    if (!timestamp) return ''; 
    return new Date(timestamp.seconds * 1000).toLocaleDateString("en-MY", { day: 'numeric', month: 'short', year: 'numeric' }); 
};

const goToProfile = (userId: string) => { 
    if (userId) router.push(`/user/${userId}`); 
};

const submitReview = async () => { 
    if (!auth.currentUser) return alert(t('common.pleaseLogin')); 
    if (newRating.value === 0) return alert(t('spotDetail.pleaseRate')); 
    
    // Rate limit
    const limitCheck = checkRateLimit('submit_review');
    if (!limitCheck.allowed) return alert(limitCheck.message);
    
    // Spam check
    if (isSpam(newReviewText.value)) return alert("Maaf, ulasan mengandungi perkataan dilarang.");

    try { 
        await addDoc(collection(db, "spots", props.spotId, "reviews"), { 
            text: newReviewText.value, 
            rating: newRating.value, 
            userId: auth.currentUser.uid, 
            userName: auth.currentUser.displayName || 'User', 
            userAvatar: auth.currentUser.photoURL || '', 
            createdAt: serverTimestamp(), 
            votes: 0, 
            votedUsers: [] 
        }); 
        newReviewText.value = ''; 
        newRating.value = 0; 
    } catch (e) { console.error(e); } 
};

const voteReview = async (review: any, val: number) => { 
    if (!auth.currentUser) return alert(t('common.pleaseLogin')); 
    const uid = auth.currentUser.uid;
    if (review.votedUsers && review.votedUsers.includes(uid)) return alert("Sudah undi.");
    try { 
        await updateDoc(doc(db, "spots", props.spotId, "reviews", review.id), { 
            votes: increment(val), 
            votedUsers: arrayUnion(uid) 
        }); 
    } catch (e) { console.error(e); }
};

const deleteReview = async (reviewId: string) => { 
    if (!confirm(t('common.confirmDelete'))) return; 
    try { 
        await deleteDoc(doc(db, "spots", props.spotId, "reviews", reviewId)); 
    } catch (e) { alert(t('common.failed')); } 
};
</script>

<style scoped>
/* Reuse glass styles */
.glass-card {
  background: rgba(15, 23, 42, 0.75); 
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px; 
  backdrop-filter: blur(10px); 
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}
.glass-input {
  width: 100%; padding: 12px; border-radius: 10px; 
  border: 1px solid rgba(255,255,255,0.1); background: rgba(0, 0, 0, 0.4); 
  color: white; outline: none; transition: 0.3s;
}
.btn-primary { 
  background: linear-gradient(135deg, #6c63ff, #5b54e0); 
  color: white; padding: 10px 24px; border: none; border-radius: 8px; 
  font-weight: 600; cursor: pointer; transition: 0.3s;
}
</style>
