<template>
  <div class="forum-card" @click="goToDetail">
    
    <div class="vote-section" @click.stop>
      <button class="vote-btn up" :class="{ active: userVote === 1 }" @click="handleVote(1)">
        <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4L3 15h6v5h6v-5h6z"/></svg>
      </button>
      
      <span class="vote-count" :class="{ positive: voteScore > 0, negative: voteScore < 0 }">
        {{ voteScore || 0 }}
      </span>
      
      <button class="vote-btn down" :class="{ active: userVote === -1 }" @click="handleVote(-1)">
        <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20L21 9h-6V4h-6v5H3z"/></svg>
      </button>
    </div>

    <div class="content-section">
      
      <div class="post-meta">
        <span class="category-tag" v-if="post.category">r/{{ post.category }}</span>
        <span class="meta-text">Posted by u/{{ post.author }} {{ post.timeAgo }}</span>
      </div>

      <h3 class="post-title">{{ post.title }}</h3>
      
      <p class="post-excerpt">{{ post.content || post.excerpt }}</p>

      <div v-if="post.image" class="post-image-container">
        <img :src="post.image" alt="Post Image" />
      </div>

      <div class="action-bar">
        
        <button class="action-btn">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
          {{ post.commentCount || 0 }} Comments
        </button>
        
        <button class="action-btn" @click.stop="handleShare">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>
          Share
        </button>
        
        <button class="action-btn">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
          Save
        </button>
      
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const props = defineProps<{ post: any }>();

const voteScore = ref(props.post.votes || 0);
const userVote = ref(0);

const goToDetail = () => {
  router.push(`/forum/${props.post.id}`);
};

const handleVote = (val: number) => {
  // Logic vote (frontend simulation)
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
  background: white;
  border: 1px solid #ccc; /* Border nipis macam Reddit */
  border-radius: 4px; /* Radius sikit je */
  margin-bottom: 10px; /* Jarak antara post */
  cursor: pointer;
  transition: border 0.2s;
}

.forum-card:hover {
  border-color: #898989; /* Highlight bila hover */
}

/* VOTE SECTION (Kiri) */
.vote-section {
  width: 40px;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 8px;
  border-right: 1px solid #eee; /* Garis pemisah */
}

.vote-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #878a8c;
  padding: 2px;
  border-radius: 4px;
}

.vote-btn:hover { background-color: #e9ecef; }
.vote-btn.up.active { color: #ff4500; } /* Reddit Orange */
.vote-btn.down.active { color: #7193ff; } /* Reddit Blue */

.icon { width: 24px; height: 24px; } /* Saiz arrow */
.vote-count { font-weight: bold; font-size: 12px; margin: 4px 0; color: #1a1a1b; }

/* CONTENT SECTION (Kanan) */
.content-section {
  padding: 8px 16px 8px 8px; /* Reddit padding */
  flex-grow: 1;
}

.post-meta {
  font-size: 12px;
  color: #787c7e;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.category-tag {
  font-weight: bold;
  color: #1c1c1c;
}
.meta-text { color: #787c7e; }

.post-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #222;
  line-height: 22px;
}

.post-excerpt {
  font-size: 14px;
  color: #1c1c1c;
  line-height: 21px;
  margin-bottom: 10px;
  
  /* Line Clamp */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Action Icons (Footer) */
.action-bar {
  display: flex;
  gap: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #878a8c;
  font-weight: 700;
  font-size: 12px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
}

.action-btn:hover {
  background-color: #e8e8e8;
}

.icon-sm { width: 20px; height: 20px; }
</style>