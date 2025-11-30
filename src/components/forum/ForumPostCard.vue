<template>
  <div class="forum-card" @click="goToDetail">
    
    <div class="content-section">
      
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

      <h3 class="post-title">{{ post.title }}</h3>
      <p class="post-excerpt">{{ post.content || post.excerpt }}</p>

      <div v-if="post.image" class="post-image-container">
        <img :src="post.image" alt="Post Image" />
      </div>

      <div class="action-bar">
        
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

        <button class="action-btn">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
          {{ post.commentCount || 0 }}
        </button>
        
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
.forum-card {
  display: flex;
  flex-direction: column; /* Ubah ke column supaya footer duduk bawah */
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px; /* Lebih bulat sikit */
  margin-bottom: 12px;
  cursor: pointer;
  transition: border 0.2s, box-shadow 0.2s;
  overflow: hidden;
}

.forum-card:hover {
  border-color: #898989;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.content-section {
  padding: 12px;
}

/* HEADER STYLE */
.post-header {
  margin-bottom: 10px;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #787c7e;
  margin-top: 2px;
}

.category-tag {
  font-weight: bold;
  color: #1c1c1c;
}

.dot { margin: 0 2px; }

/* BODY STYLE */
.post-title {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #222;
  line-height: 1.3;
}

.post-excerpt {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.4;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-image-container img {
  max-height: 300px;
  width: 100%;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
  border: 1px solid #eee;
}

/* FOOTER ACTION BAR */
.action-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

/* NEW VOTE PILL STYLE */
.vote-pill {
  display: flex;
  align-items: center;
  background-color: #f6f7f8;
  border-radius: 20px;
  padding: 2px 5px;
  border: 1px solid #eee;
}

.vote-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #878a8c;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vote-btn:hover { background-color: #e2e2e2; color: #e67e22; }
.vote-btn.up.active { color: #ff4500; }
.vote-btn.down.active { color: #7193ff; }

.vote-count {
  font-weight: bold;
  font-size: 12px;
  margin: 0 6px;
  color: #1a1a1b;
  min-width: 15px;
  text-align: center;
}

/* OTHER ACTION BUTTONS */
.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #f6f7f8; /* Background kelabu nipis */
  border: none;
  color: #878a8c;
  font-weight: 600;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 20px; /* Bentuk pill */
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:hover {
  background-color: #e2e2e2;
  color: #333;
}

.icon-sm { width: 18px; height: 18px; }
</style>