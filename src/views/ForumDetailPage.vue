<template>
  <div class="forum-detail-page">
    <div class="container">
      
      <div v-if="loading" class="loading-box">⏳ {{ t('common.loading') }}</div>

      <div v-else-if="!post" class="error-box">{{ t('forum.postNotFound') }}</div>

      <div v-else>
        <div class="main-post">
          <div class="vote-section">
            <button class="vote-btn" @click="votePost(1)">▲</button>
            <span class="score">{{ post.votes || 0 }}</span>
            <button class="vote-btn" @click="votePost(-1)">▼</button>
          </div>

          <div class="post-content">
            <div class="meta">
              <span class="tag">{{ post.category }}</span> • 
              <span class="author">{{ t('components.postedBy') }} {{ post.author }}</span> • 
              <span class="time">{{ formatDate(post.createdAt) }}</span>
            </div>
            
            <h1>{{ post.title }}</h1>
            <div class="body-text">{{ post.content }}</div>

            <div class="action-bar">
              <span>💬 {{ comments.length }} {{ t('forum.comments') }}</span>
              <span class="action-link" @click="copyLink">🔗 {{ t('forum.share') }}</span>
            </div>
          </div>
        </div>

        <div class="comment-section">
          
          <div class="comment-input-box">
            <h3>{{ t('forum.joinDiscussion') }}</h3>
            <textarea 
              v-model="mainCommentText" 
              rows="3" 
              :placeholder="auth.currentUser ? t('forum.writeComment') : t('forum.loginToComment')"
              :disabled="!auth.currentUser"
            ></textarea>
            <div class="input-actions">
              <button @click="submitComment(null)" class="btn-submit" :disabled="!auth.currentUser || !mainCommentText">
                {{ t('common.submit') }}
              </button>
            </div>
          </div>

          <div class="comments-list">
            <h3>{{ t('forum.discussionTitle') }} ({{ comments.length }})</h3>
            
            <div v-for="comment in rootComments" :key="comment.id" class="comment-thread">
              
              <div class="comment-item">
                <div class="comment-vote">
                  <button @click="voteComment(comment, 1)">▲</button>
                  <span>{{ comment.votes || 0 }}</span>
                  <button @click="voteComment(comment, -1)">▼</button>
                </div>

                <div class="comment-body-wrapper">
                  <div class="comment-meta">
                    <img :src="comment.userAvatar || 'https://i.pravatar.cc/150?img=3'" class="comment-avatar">
                    <strong>{{ comment.userName }}</strong>
                    <span class="dot">•</span>
                    <span class="time">{{ formatDate(comment.createdAt) }}</span>
                  </div>
                  
                  <p class="comment-text">{{ comment.text }}</p>
                  
                  <div class="comment-actions">
                    <button @click="toggleReplyBox(comment.id)">↩️ {{ t('forum.replyBtn') }}</button>
                  </div>

                  <div v-if="activeReplyId === comment.id" class="reply-input">
                    <textarea v-model="replyText" rows="2" :placeholder="t('forum.replyPlaceholder')"></textarea>
                    <div class="reply-btns">
                      <button class="btn-cancel-small" @click="activeReplyId = null">{{ t('common.cancel') }}</button>
                      <button class="btn-submit-small" @click="submitComment(comment.id)">{{ t('common.submit') }}</button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="replies-wrapper" v-if="getReplies(comment.id).length > 0">
                <div v-for="reply in getReplies(comment.id)" :key="reply.id" class="comment-item reply-item">
                   <div class="comment-vote">
                    <button @click="voteComment(reply, 1)">▲</button>
                    <span>{{ reply.votes || 0 }}</span>
                    <button @click="voteComment(reply, -1)">▼</button>
                  </div>

                  <div class="comment-body-wrapper">
                    <div class="comment-meta">
                      <img :src="reply.userAvatar || 'https://i.pravatar.cc/150?img=3'" class="comment-avatar">
                      <strong>{{ reply.userName }}</strong>
                      <span class="dot">•</span>
                      <span class="time">{{ formatDate(reply.createdAt) }}</span>
                    </div>
                    <p class="comment-text">{{ reply.text }}</p>
                  </div>
                </div>
              </div>

            </div>

            <p v-if="rootComments.length === 0" class="no-comments">
              {{ t('forum.noComments') }}
            </p>
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
  const docRef = doc(db, "forum_posts", postId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    post.value = { id: docSnap.id, ...docSnap.data() };
  }
  loading.value = false;

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
  
  const limitCheck = checkRateLimit('comment'); // 'comment' ialah nama kunci
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
    alert(t('forum.commentFailed') || "Error sending comment.");
  }
};

const voteComment = async (comment: any, val: number) => {
  if (!auth.currentUser) return alert(t('forum.loginToVote'));
  comment.votes = (comment.votes || 0) + val;
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
/* CSS KEKAL SAMA */
.forum-detail-page { background-color: #dae0e6; min-height: 100vh; padding: 2rem 0; }
.container { max-width: 800px; margin: 0 auto; padding: 0 1rem; }
.main-post { background: white; border-radius: 4px; display: flex; overflow: hidden; border: 1px solid #ccc; margin-bottom: 1rem; }
.vote-section { width: 40px; background: #f8f9fa; display: flex; flex-direction: column; align-items: center; padding-top: 10px; border-right: 1px solid #eee; }
.vote-btn { background: none; border: none; cursor: pointer; font-size: 1.2rem; color: #878a8c; font-weight: bold; }
.vote-btn:hover { color: #e67e22; background: #eee; border-radius: 4px; }
.score { font-weight: bold; margin: 5px 0; font-size: 0.9rem; }
.post-content { padding: 1rem; flex: 1; }
.meta { font-size: 0.75rem; color: #787c7e; margin-bottom: 0.5rem; }
.tag { background: #e1f5fe; color: #0288d1; padding: 2px 8px; border-radius: 10px; font-weight: bold; }
h1 { margin: 0 0 1rem 0; font-size: 1.4rem; color: #222; }
.body-text { font-size: 1rem; line-height: 1.6; color: #1c1c1c; margin-bottom: 2rem; white-space: pre-line; }
.action-bar { border-top: 1px solid #eee; padding-top: 0.5rem; display: flex; gap: 1rem; color: #878a8c; font-weight: bold; font-size: 0.8rem; }
.action-link { cursor: pointer; } .action-link:hover { text-decoration: underline; }
.comment-section { background: white; border-radius: 4px; border: 1px solid #ccc; padding: 1.5rem; }
.comment-input-box { margin-bottom: 2rem; }
.comment-input-box h3 { margin-top: 0; font-size: 1rem; color: #555; }
textarea { width: 100%; padding: 0.8rem; border: 1px solid #ccc; border-radius: 4px; font-family: inherit; resize: vertical; min-height: 80px; }
.input-actions { display: flex; justify-content: flex-end; margin-top: 0.5rem; }
.btn-submit { background: #2c3e50; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 20px; font-weight: bold; cursor: pointer; }
.btn-submit:disabled { background: #ccc; cursor: not-allowed; }
.comment-thread { margin-bottom: 1.5rem; border-bottom: 1px solid #f0f0f0; padding-bottom: 1rem; }
.comment-item { display: flex; gap: 10px; }
.comment-vote { display: flex; flex-direction: column; align-items: center; margin-top: 5px; }
.comment-vote button { border: none; background: none; cursor: pointer; color: #888; font-size: 0.8rem; }
.comment-vote button:hover { color: #e67e22; }
.comment-vote span { font-size: 0.8rem; font-weight: bold; }
.comment-body-wrapper { flex: 1; }
.comment-meta { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; margin-bottom: 5px; }
.comment-avatar { width: 25px; height: 25px; border-radius: 50%; object-fit: cover; }
.time { color: #999; font-size: 0.75rem; }
.dot { color: #ccc; }
.comment-text { font-size: 0.95rem; line-height: 1.4; margin-bottom: 0.5rem; color: #333; }
.comment-actions button { border: none; background: none; color: #888; font-weight: bold; font-size: 0.8rem; cursor: pointer; padding: 0; }
.comment-actions button:hover { text-decoration: underline; color: #333; }
.reply-input { margin-top: 10px; margin-left: 10px; border-left: 2px solid #eee; padding-left: 10px; }
.reply-btns { display: flex; gap: 10px; margin-top: 5px; }
.btn-submit-small { background: #2c3e50; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
.btn-cancel-small { background: transparent; border: 1px solid #ccc; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
.replies-wrapper { margin-left: 35px; margin-top: 10px; border-left: 2px solid #f0f0f0; padding-left: 10px; }
.reply-item { margin-bottom: 10px; }
.no-comments { text-align: center; color: #888; font-style: italic; margin-top: 2rem; }
.loading-box, .error-box { text-align: center; padding: 3rem; font-size: 1.2rem; }
</style>