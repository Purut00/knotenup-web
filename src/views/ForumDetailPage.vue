<template>
  <div class="forum-detail-page">
    
    <!-- BACKGROUND LAYERS -->
    <div class="contour-lines"></div>
    <div class="page-glow-purple"></div>
    <div class="page-glow-orange"></div>

    <!-- MAIN CONTAINER (Hardcoded Padding Fix Kekal) -->
    <div class="container relative z-10" style="padding-top: 150px; padding-bottom: 80px;">
      
      <!-- LOADING STATE -->
      <div v-if="loading" class="text-center py-20 fade-up">
        <div class="glass-card inline-block px-8 py-6">
            <i class="fas fa-spinner fa-spin text-3xl text-purple-400 mb-3"></i>
            <p class="text-gray-300">⏳ {{ t('common.loading') }}</p>
        </div>
      </div>

      <!-- ERROR STATE -->
      <div v-else-if="!post" class="text-center py-20 fade-up">
        <div class="glass-card inline-block px-8 py-6 border-red-500/30 border">
            <i class="fas fa-exclamation-triangle text-3xl text-red-400 mb-3"></i>
            <p class="text-red-300">{{ t('forum.postNotFound') }}</p>
            <button @click="$router.push('/forum')" class="mt-4 btn-cancel-small">Kembali ke Forum</button>
        </div>
      </div>

      <!-- CONTENT -->
      <div v-else class="fade-up">
        
        <!-- MAIN POST CARD -->
        <div class="glass-card mb-6 flex overflow-hidden relative"> <!-- mb-8 -> mb-6 (padat) -->
          
          <!-- VOTE SIDEBAR -->
          <div class="vote-section">
            <button class="vote-btn" @click="votePost(1)">▲</button>
            <span class="score" :class="post.votes > 0 ? 'text-orange-400' : (post.votes < 0 ? 'text-blue-400' : 'text-gray-400')">
                {{ post.votes || 0 }}
            </span>
            <button class="vote-btn" @click="votePost(-1)">▼</button>
          </div>

          <!-- POST BODY -->
          <div class="post-content p-5 md:p-6 w-full"> <!-- Padding dikurangkan sikit -->
            
            <!-- META HEADER -->
            <div class="meta-header mb-3">
              <span class="category-badge">{{ post.category }}</span>
              <span class="divider">•</span>
              
              <div class="flex items-center gap-2">
                 <span class="text-gray-500 hidden sm:inline">{{ t('components.postedBy') }}</span>
                 <AuthorBadge 
                    :userId="post.userId || post.authorId" 
                    :fallbackName="post.author || post.userName"
                    :fallbackAvatar="post.authorAvatar || post.userAvatar"
                 />
              </div>
              
              <span class="divider">•</span>
              <span class="text-gray-500 text-xs">{{ formatDate(post.createdAt) }}</span>
            </div>
            
            <!-- TITLE (Saiz dikurangkan sedikit supaya seimbang) -->
            <h1 class="text-xl md:text-2xl font-bold text-white mb-3 mt-1 leading-tight">{{ post.title }}</h1>
            
            <!-- BODY TEXT (UPDATED: text-sm, leading-snug for compactness) -->
            <div class="body-text text-gray-200 leading-snug mb-6 whitespace-pre-line text-sm">
                {{ post.content }}
            </div>

            <!-- ACTION BAR -->
            <div class="action-bar pt-3 border-t border-white/10 flex gap-6 text-xs md:text-sm font-semibold text-gray-400">
              <span class="flex items-center gap-2"><i class="fas fa-comment-alt"></i> {{ comments.length }} {{ t('forum.comments') }}</span>
              <button class="action-link flex items-center gap-2 hover:text-white transition" @click="copyLink">
                <i class="fas fa-share"></i> {{ t('forum.share') }}
              </button>
            </div>
          </div>
        </div>

        <!-- COMMENTS SECTION -->
        <div class="glass-card p-5 md:p-6">
          
          <!-- COMMENT INPUT -->
          <div class="mb-8 relative z-20">
            <h3 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                💬 {{ t('forum.joinDiscussion') }}
            </h3>
            <div class="relative">
                <textarea 
                  v-model="mainCommentText" 
                  rows="2" 
                  class="glass-input w-full text-sm" 
                  :placeholder="auth.currentUser ? t('forum.writeComment') : t('forum.loginToComment')"
                  :disabled="!auth.currentUser"
                ></textarea>
                <div class="mt-2 flex justify-end">
                  <button 
                    @click="submitComment(null)" 
                    class="btn-submit py-1.5 px-4 text-sm" 
                    :disabled="!auth.currentUser || !mainCommentText"
                  >
                    {{ t('common.submit') }} <i class="fas fa-paper-plane ml-1"></i>
                  </button>
                </div>
            </div>
          </div>

          <!-- COMMENTS LIST -->
          <div>
            <h3 class="text-base font-semibold text-gray-300 mb-4 border-b border-white/10 pb-2 flex justify-between items-center">
                <span>{{ t('forum.discussionTitle') }}</span>
                <span class="text-xs bg-white/10 px-2 py-1 rounded text-gray-400">{{ comments.length }}</span>
            </h3>
            
            <div v-if="rootComments.length === 0" class="text-center py-6">
               <div class="text-4xl mb-2">🦗</div>
               <p class="text-gray-500 italic text-sm">{{ t('forum.noComments') }}</p>
            </div>

            <div v-else class="space-y-4"> <!-- space-y-6 -> space-y-4 (lebih rapat) -->
                <!-- COMMENT LOOP -->
                <div v-for="comment in rootComments" :key="comment.id" class="comment-thread">
                    <!-- COMMENT ITEM -->
                    <div class="flex gap-3">
                        <!-- VOTE (Compact) -->
                        <div class="flex flex-col items-center gap-0.5 pt-1 min-w-[20px]">
                            <button @click="voteComment(comment, 1)" class="vote-arrow hover:text-orange-400 text-xs">▲</button>
                            <span class="text-[11px] font-bold text-gray-500">{{ comment.votes || 0 }}</span>
                            <button @click="voteComment(comment, -1)" class="vote-arrow hover:text-blue-400 text-xs">▼</button>
                        </div>
                        
                        <!-- BODY -->
                        <div class="flex-1">
                            <div class="flex items-center flex-wrap gap-2 mb-1">
                                <AuthorBadge 
                                    :userId="comment.userId"
                                    :fallbackName="comment.userName"
                                    :fallbackAvatar="comment.userAvatar"
                                />
                                <span class="text-[11px] text-gray-600">• {{ formatDate(comment.createdAt) }}</span>
                            </div>
                            
                            <!-- Comment Text Compact -->
                            <p class="text-gray-300 text-sm leading-snug mb-1">{{ comment.text }}</p>
                            
                            <div class="flex items-center gap-3">
                                <button @click="toggleReplyBox(comment.id)" class="text-[11px] font-bold text-gray-500 hover:text-white transition flex items-center gap-1">
                                    <i class="fas fa-reply"></i> {{ t('forum.replyBtn') }}
                                </button>
                            </div>

                            <!-- REPLY INPUT -->
                            <div v-if="activeReplyId === comment.id" class="mt-2 pl-3 border-l-2 border-purple-500/50 fade-in">
                                <textarea v-model="replyText" rows="2" class="glass-input w-full text-xs" :placeholder="t('forum.replyPlaceholder')"></textarea>
                                <div class="flex gap-2 mt-2 justify-end">
                                    <button class="btn-cancel-small text-xs" @click="activeReplyId = null">{{ t('common.cancel') }}</button>
                                    <button class="btn-submit-small text-xs" @click="submitComment(comment.id)">{{ t('common.submit') }}</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- REPLIES LOOP -->
                    <div v-if="getReplies(comment.id).length > 0" class="mt-2 pl-8 md:pl-10 space-y-3 ml-1 border-l border-white/5 relative">
                        <div v-for="reply in getReplies(comment.id)" :key="reply.id" class="flex gap-3 relative mt-3">
                            <!-- Connector Line -->
                            <div class="absolute -left-[30px] top-3 w-5 h-[1px] bg-white/10"></div>

                            <!-- VOTE -->
                             <div class="flex flex-col items-center gap-0.5 pt-1 min-w-[16px]">
                                <button @click="voteComment(reply, 1)" class="vote-arrow hover:text-orange-400 text-[10px]">▲</button>
                                <span class="text-[10px] font-bold text-gray-500">{{ reply.votes || 0 }}</span>
                                <button @click="voteComment(reply, -1)" class="vote-arrow hover:text-blue-400 text-[10px]">▼</button>
                            </div>

                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-0.5">
                                    <AuthorBadge 
                                        :userId="reply.userId"
                                        :fallbackName="reply.userName"
                                        :fallbackAvatar="reply.userAvatar"
                                    />
                                    <span class="text-[10px] text-gray-600">• {{ formatDate(reply.createdAt) }}</span>
                                </div>
                                <p class="text-gray-400 text-sm leading-snug">{{ reply.text }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { isSpam } from '../utils/spamFilter';
import { checkRateLimit } from '../utils/rateLimiter';
import AuthorBadge from '../components/common/AuthorBadge.vue'; 

const { t } = useI18n();
const route = useRoute();
const postId = route.params.id as string;

const post = ref<any>(null);
const comments = ref<any[]>([]);
const loading = ref(true);

const mainCommentText = ref('');
const replyText = ref('');
const activeReplyId = ref<string | null>(null);

const rootComments = computed(() => comments.value.filter(c => !c.parentId));
const getReplies = (parentId: string) => comments.value.filter(c => c.parentId === parentId);

const formatDate = (timestamp: any) => {
  if (!timestamp) return '';
  return new Date(timestamp.seconds * 1000).toLocaleDateString("en-MY", {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
};

onMounted(async () => {
  try {
    const docRef = doc(db, "forum_posts", postId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      post.value = { id: docSnap.id, ...docSnap.data() };
    }
  } catch (e) {
    console.error("Error fetching post", e);
  } finally {
    loading.value = false;
  }

  const commentsRef = collection(db, "forum_posts", postId, "comments");
  const q = query(commentsRef, orderBy("createdAt", "asc"));

  onSnapshot(q, (snapshot) => {
    comments.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  });
});

const submitComment = async (parentId: string | null) => {
  if (!auth.currentUser) return;
  
  const limitCheck = checkRateLimit('comment');
  if (!limitCheck.allowed) {
    alert(limitCheck.message);
    return;
  }
  
  const text = parentId ? replyText.value : mainCommentText.value;
  if (!text.trim()) return;

  if (isSpam(text)) {
    alert("⚠️ Komen ditolak: Mengandungi perkataan yang dilarang/spam.");
    return;
  }

  try {
    await addDoc(collection(db, "forum_posts", postId, "comments"), {
      text: text,
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'User',
      userAvatar: auth.currentUser.photoURL || '',
      createdAt: serverTimestamp(),
      votes: 0,
      parentId: parentId
    });

    await updateDoc(doc(db, "forum_posts", postId), {
      commentCount: increment(1)
    });

    mainCommentText.value = '';
    replyText.value = '';
    activeReplyId.value = null;

  } catch (e) {
    console.error("Error comment:", e);
    alert(t('forum.commentFailed') || "Gagal hantar komen.");
  }
};

const voteComment = async (comment: any, val: number) => {
  if (!auth.currentUser) return alert(t('forum.loginToVote'));
  const commentRef = doc(db, "forum_posts", postId, "comments", comment.id);
  await updateDoc(commentRef, { votes: increment(val) });
};

const votePost = async (val: number) => {
  if (!auth.currentUser) return alert(t('forum.loginToVote'));
  post.value.votes += val;
  const postRef = doc(db, "forum_posts", postId);
  await updateDoc(postRef, { votes: increment(val) });
};

const toggleReplyBox = (id: string) => {
  if (!auth.currentUser) return alert(t('forum.loginToReply'));
  activeReplyId.value = activeReplyId.value === id ? null : id;
};

const copyLink = () => {
  navigator.clipboard.writeText(window.location.href);
  alert(t('forum.linkCopied'));
}
</script>

<style scoped>
/* --- BASE THEME (DARK) --- */
.forum-detail-page { 
  background-color: #0f172a; 
  min-height: 100vh; position: relative; overflow-x: hidden; color: white;
}
.container { max-width: 900px; margin: 0 auto; padding-left: 1.5rem; padding-right: 1.5rem; }

/* GLOWS */
.page-glow-purple {
  position: absolute; top: 0; left: 0; width: 60vw; height: 60vw;
  background: #6c63ff; filter: blur(150px); opacity: 0.15; pointer-events: none; border-radius: 50%;
}
.page-glow-orange {
  position: absolute; bottom: 0; right: 0; width: 60vw; height: 60vw;
  background: #ff8c42; filter: blur(150px); opacity: 0.1; pointer-events: none; border-radius: 50%;
}
.contour-lines {
  position: absolute; inset: 0; z-index: 0; opacity: 0.08;
  background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400' stroke='white' fill='none' stroke-width='2' opacity='0.5'/%3E%3C/svg%3E");
  background-size: cover; pointer-events: none;
}

/* --- GLASS COMPONENTS --- */
.glass-card {
  background: rgba(30, 41, 59, 0.7); 
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px; 
  backdrop-filter: blur(20px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.glass-input {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255,255,255,0.1);
  color: white; padding: 12px; border-radius: 10px;
  outline: none; transition: 0.3s;
}
.glass-input:focus {
  border-color: #6c63ff; background: rgba(15, 23, 42, 0.8);
}

/* VOTE SECTION */
.vote-section { 
  width: 50px; background: rgba(0,0,0,0.2); 
  display: flex; flex-direction: column; align-items: center; padding-top: 1.5rem; 
  border-right: 1px solid rgba(255,255,255,0.05);
}
.vote-btn { background: none; border: none; cursor: pointer; font-size: 1.2rem; color: #64748b; transition: 0.2s; }
.vote-btn:hover { color: #fff; transform: scale(1.1); }
.score { font-weight: bold; margin: 8px 0; font-size: 1rem; }
.vote-arrow { background: none; border: none; cursor: pointer; color: #64748b; font-size: 0.9rem; transition: 0.2s; }

/* POST CONTENT */
.meta-header { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 0.85rem; color: #94a3b8; }
.category-badge { background: rgba(108, 99, 255, 0.2); color: #a5b4fc; padding: 2px 10px; border-radius: 20px; font-weight: 600; border: 1px solid rgba(108, 99, 255, 0.3); }
.divider { color: #475569; }

/* BUTTONS */
.btn-submit { 
  background: linear-gradient(135deg, #6c63ff, #5b54e0); 
  color: white; padding: 8px 20px; border: none; border-radius: 8px; 
  font-weight: 600; cursor: pointer; transition: 0.3s;
}
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(108, 99, 255, 0.3); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-submit-small { background: #6c63ff; color: white; padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; border: none; }
.btn-cancel-small { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }
.btn-cancel-small:hover { color: white; border-color: white; }

/* ANIMATION */
.fade-up { animation: fadeUp 0.6s ease-out; }
.fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

</style>