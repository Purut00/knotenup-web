<template>
  <div class="forum-card glass-card-gray" @click="goToDetail">
    
    <div class="content-section">
      
      <!-- Header: Author & Meta -->
      <div class="post-header">
        <AuthorBadge 
           :userId="post.userId || post.authorId" 
           :fallbackName="post.author || post.userName"
           :fallbackAvatar="post.authorAvatar || post.userAvatar"
        >
           <template #subtext>
              <div class="header-meta">
                 <span class="category-tag">r/{{ post.category }}</span>
                 <span class="dot">•</span>
                 <span class="time-ago">{{ post.timeAgo }}</span>
              </div>
           </template>
        </AuthorBadge>
      </div>

      <!-- Title & Excerpt -->
      <h3 class="post-title">{{ post.title }}</h3>
      <p class="post-excerpt">{{ post.content || post.excerpt }}</p>

      <!-- Image -->
      <div v-if="post.image" class="post-image-container">
        <img :src="post.image" alt="Post Image" />
      </div>

      <!-- Footer: Actions -->
      <div class="action-bar">
        
        <!-- Vote Pill -->
        <div class="vote-pill" @click.stop>
          <button class="vote-btn up" :class="{ active: userVote === 1 }" @click="handleVote(1)">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4L3 15h6v5h6v-5h6z"/></svg>
          </button>
          
          <span class="vote-count" :class="{ positive: voteScore > 0, negative: voteScore < 0 }">
            {{ voteScore || 0 }}
          </span>
          
          <button class="vote-btn down" :class="{ active: userVote === -1 }" @click="handleVote(-1)">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20L21 9h-6V4h-6v5H3z"/></svg>
          </button>
        </div>

        <!-- Comments Btn -->
        <button class="action-btn">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
          {{ post.commentCount || 0 }}
        </button>
        
        <!-- Share Btn -->
        <button class="action-btn" @click.stop="handleShare">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>
          Share
        </button>
        
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AuthorBadge from '../common/AuthorBadge.vue';

const router = useRouter();
const props = defineProps<{ post: any }>();

const voteScore = ref(props.post.votes || 0);
const userVote = ref(0);

const goToDetail = () => {
  router.push(`/forum/${props.post.id}`);
};

const handleVote = (val: number) => {
  if (userVote.value === val) {
    voteScore.value -= val;
    userVote.value = 0;
  } else {
    voteScore.value += val - userVote.value;
    userVote.value = val;
  }
};

const handleShare = () => {
  alert("Link copied!");
};
</script>

<style scoped>
/* --- GRAY GLASS CARD --- */
.forum-card {
  display: flex;
  flex-direction: column;
  
  /* Gray Glass Effect (Kelabu Cair Lutsinar) */
  background: rgba(241, 245, 249, 0.85); /* Slate-100 dengan opacity */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  
  /* Border putih nipis untuk effect kaca */
  border: 1px solid rgba(255, 255, 255, 0.5);
  
  border-radius: 16px; /* Sudut bulat sama macam TripCard */
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03); /* Shadow lembut */
}

.forum-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  border-color: #94a3b8; /* Gelapkan border sikit bila hover */
}

.content-section {
  padding: 1.2rem; /* Padding selesa */
}

/* HEADER STYLE */
.post-header {
  margin-bottom: 12px;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #64748b; /* Slate-500 */
  margin-top: 2px;
}

.category-tag {
  font-weight: 600; /* Tak terlalu bold */
  color: #475569; /* Slate-600 */
}

.dot { margin: 0 2px; opacity: 0.5; }

/* BODY STYLE */
.post-title {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600; /* Font sederhana tebal */
  color: #1e293b; /* Slate-800 */
  line-height: 1.4;
}

.post-excerpt {
  font-size: 0.9rem;
  color: #475569; /* Slate-600 */
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-image-container img {
  max-height: 320px;
  width: 100%;
  object-fit: cover;
  border-radius: 12px; /* Radius smooth */
  margin-bottom: 12px;
  border: 1px solid rgba(0,0,0,0.05);
}

/* FOOTER ACTION BAR */
.action-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

/* VOTE PILL (Glassy inside Glass) */
.vote-pill {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.5); /* Putih pudar dalam kotak kelabu */
  border-radius: 20px;
  padding: 4px 8px;
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.vote-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.vote-btn:hover { background-color: rgba(0,0,0,0.05); color: #f97316; } /* Orange hover */
.vote-btn.up.active { color: #f97316; }
.vote-btn.down.active { color: #6366f1; }

.vote-count {
  font-weight: 600;
  font-size: 0.85rem;
  margin: 0 8px;
  color: #334155;
  min-width: 15px;
  text-align: center;
}
.vote-count.positive { color: #f97316; }
.vote-count.negative { color: #6366f1; }

/* ACTION BUTTONS */
.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: rgba(255, 255, 255, 0.5); /* Putih pudar */
  border: 1px solid transparent;
  color: #64748b;
  font-weight: 500;
  font-size: 0.8rem;
  padding: 6px 14px;
  border-radius: 20px; 
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.action-btn:hover {
  background-color: white;
  color: #334155;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  transform: translateY(-1px);
}

.icon-sm { width: 18px; height: 18px; }
</style>