<template>
  <div class="min-h-screen bg-slate-900 text-white relative overflow-x-hidden">
    
    <!-- BACKGROUND LAYERS -->
    <div class="absolute inset-0 z-0 opacity-[0.08] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' viewBox=\'0 0 1000 1000\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400\' stroke=\'white\' fill=\'none\' stroke-width=\'2\' opacity=\'0.5\'/%3E%3C/svg%3E')] bg-cover"></div>
    <div class="absolute top-0 left-0 w-[60vw] h-[60vw] bg-[#6c63ff] blur-[150px] opacity-15 pointer-events-none rounded-full z-0"></div>
    <div class="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-[#ff8c42] blur-[150px] opacity-10 pointer-events-none rounded-full z-0"></div>

    <!-- MAIN CONTAINER -->
    <div class="container mx-auto px-6 relative z-10 max-w-[900px] pt-[150px] pb-20">
      
      <!-- LOADING STATE -->
      <div v-if="loading" class="text-center py-20 animate-fade-in-up">
        <div class="inline-block px-8 py-6 bg-[#1e293b]/70 border border-white/10 rounded-2xl backdrop-blur-xl shadow-xl">
            <i class="fas fa-spinner fa-spin text-3xl text-purple-400 mb-3 block text-center"></i>
            <p class="text-gray-300">⏳ {{ t('common.loading') }}</p>
        </div>
      </div>

      <!-- ERROR STATE -->
      <div v-else-if="!post" class="text-center py-20 animate-fade-in-up">
        <div class="inline-block px-8 py-6 bg-[#1e293b]/70 border border-red-500/30 rounded-2xl backdrop-blur-xl shadow-xl">
            <i class="fas fa-exclamation-triangle text-3xl text-red-400 mb-3 block text-center"></i>
            <p class="text-red-300">{{ t('forum.postNotFound') }}</p>
            <button @click="$router.push('/forum')" class="mt-4 bg-transparent border border-white/20 text-[#94a3b8] px-4 py-1.5 rounded-lg text-sm cursor-pointer transition hover:text-white hover:border-white">Kembali ke Forum</button>
        </div>
      </div>

      <!-- CONTENT -->
      <div v-else class="animate-fade-in-up">
        
        <!-- MAIN POST CARD -->
        <div class="bg-[#1e293b]/70 border border-white/10 rounded-2xl backdrop-blur-xl shadow-xl mb-6 flex overflow-hidden relative"> 
          
          <!-- VOTE SIDEBAR -->
          <div class="w-[50px] bg-black/20 flex flex-col items-center pt-6 border-r border-white/5">
            <button class="bg-transparent border-none cursor-pointer text-xl text-slate-500 transition hover:text-white hover:scale-110" @click="votePost(1)">▲</button>
            <span class="font-bold my-2 text-base" :class="post.votes > 0 ? 'text-orange-400' : (post.votes < 0 ? 'text-blue-400' : 'text-gray-400')">
                {{ post.votes || 0 }}
            </span>
            <button class="bg-transparent border-none cursor-pointer text-xl text-slate-500 transition hover:text-white hover:scale-110" @click="votePost(-1)">▼</button>
          </div>

          <!-- POST BODY -->
          <div class="p-5 md:p-6 w-full"> 
            
            <!-- META HEADER -->
            <div class="flex items-center flex-wrap gap-2 text-[0.85rem] text-slate-400 mb-3">
              <span class="bg-[#6c63ff]/20 text-[#a5b4fc] px-2.5 py-[2px] rounded-[20px] font-semibold border border-[#6c63ff]/30">{{ post.category }}</span>
              <span class="text-slate-600">•</span>
              
              <div class="flex items-center gap-2">
                 <span class="text-gray-500 hidden sm:inline">{{ t('components.postedBy') }}</span>
                 <AuthorBadge 
                    :userId="post.userId || post.authorId" 
                    :fallbackName="post.author || post.userName"
                    :fallbackAvatar="post.authorAvatar || post.userAvatar"
                 />
              </div>
              
              <span class="text-slate-600">•</span>
              <span class="text-gray-500 text-xs">{{ formatDate(post.createdAt) }}</span>
            </div>
            
            <!-- TITLE -->
            <h1 class="text-xl md:text-2xl font-bold text-white mb-3 mt-1 leading-tight">{{ post.title }}</h1>
            
            <!-- BODY TEXT -->
            <div class="text-gray-200 leading-snug mb-6 whitespace-pre-line text-sm">
                {{ post.content }}
            </div>

            <!-- ACTION BAR -->
            <div class="pt-3 border-t border-white/10 flex gap-6 text-xs md:text-sm font-semibold text-gray-400">
              <span class="flex items-center gap-2"><i class="fas fa-comment-alt"></i> {{ comments.length }} {{ t('forum.comments') }}</span>
              <button class="flex items-center gap-2 hover:text-white transition bg-transparent border-none cursor-pointer" @click="copyLink">
                <i class="fas fa-share"></i> {{ t('forum.share') }}
              </button>
            </div>
          </div>
        </div>

        <!-- COMMENTS SECTION -->
        <div class="bg-[#1e293b]/70 border border-white/10 rounded-2xl backdrop-blur-xl shadow-xl p-5 md:p-6">
          
          <!-- COMMENT INPUT -->
          <div class="mb-8 relative z-20">
            <h3 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                💬 {{ t('forum.joinDiscussion') }}
            </h3>
            <div class="relative">
                <textarea 
                  v-model="mainCommentText" 
                  rows="2" 
                  class="w-full bg-[#0f172a]/60 border border-white/10 text-white p-3 rounded-xl outline-none transition duration-300 text-sm focus:border-[#6c63ff] focus:bg-[#0f172a]/80" 
                  :placeholder="auth.currentUser ? t('forum.writeComment') : t('forum.loginToComment')"
                  :disabled="!auth.currentUser"
                ></textarea>
                <div class="mt-2 flex justify-end">
                  <button 
                    @click="submitComment(null)" 
                    class="py-1.5 px-4 text-sm bg-gradient-to-br from-[#6c63ff] to-[#5b54e0] text-white rounded-lg font-semibold cursor-pointer transition transform hover:-translate-y-0.5 border-none disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none" 
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

            <div v-else class="space-y-4"> 
                <!-- COMMENT LOOP -->
                <div v-for="comment in rootComments" :key="comment.id">
                    <!-- COMMENT ITEM -->
                    <div class="flex gap-3">
                        <!-- VOTE (Compact) -->
                        <div class="flex flex-col items-center gap-0.5 pt-1 min-w-[20px]">
                            <button @click="voteComment(comment, 1)" class="bg-transparent border-none cursor-pointer text-slate-500 text-xs hover:text-orange-400 transition">▲</button>
                            <span class="text-[11px] font-bold text-gray-500">{{ comment.votes || 0 }}</span>
                            <button @click="voteComment(comment, -1)" class="bg-transparent border-none cursor-pointer text-slate-500 text-xs hover:text-blue-400 transition">▼</button>
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
                                <button @click="toggleReplyBox(comment.id)" class="text-[11px] font-bold text-gray-500 hover:text-white transition flex items-center gap-1 bg-transparent border-none cursor-pointer">
                                    <i class="fas fa-reply"></i> {{ t('forum.replyBtn') }}
                                </button>
                            </div>

                            <!-- REPLY INPUT -->
                            <div v-if="activeReplyId === comment.id" class="mt-2 pl-3 border-l-2 border-purple-500/50 animate-fade-in">
                                <textarea v-model="replyText" rows="2" class="w-full bg-[#0f172a]/60 border border-white/10 text-white p-3 rounded-xl outline-none transition duration-300 text-xs focus:border-[#6c63ff] focus:bg-[#0f172a]/80" :placeholder="t('forum.replyPlaceholder')"></textarea>
                                <div class="flex gap-2 mt-2 justify-end">
                                    <button class="bg-transparent border border-white/20 text-[#94a3b8] px-3 py-1 rounded-md text-xs cursor-pointer hover:text-white hover:border-white" @click="activeReplyId = null">{{ t('common.cancel') }}</button>
                                    <button class="bg-[#6c63ff] text-white px-3 py-1 rounded-md text-xs cursor-pointer border-none" @click="submitComment(comment.id)">{{ t('common.submit') }}</button>
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
                                <button @click="voteComment(reply, 1)" class="bg-transparent border-none cursor-pointer text-slate-500 text-[10px] hover:text-orange-400 transition">▲</button>
                                <span class="text-[10px] font-bold text-gray-500">{{ reply.votes || 0 }}</span>
                                <button @click="voteComment(reply, -1)" class="bg-transparent border-none cursor-pointer text-slate-500 text-[10px] hover:text-blue-400 transition">▼</button>
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