<template>
  <div class="forum-card" @click="goToDetail">>
    
    <div class="vote-section">
      <button 
        class="vote-btn up" 
        :class="{ active: userVote === 1 }" 
        @click="handleVote(1)"
      >
        ▲
      </button>
      
      <span class="vote-count" :class="{ positive: voteScore > 0, negative: voteScore < 0 }">
        {{ voteScore }}
      </span>
      
      <button 
        class="vote-btn down" 
        :class="{ active: userVote === -1 }" 
        @click="handleVote(-1)"
      >
        ▼
      </button>
    </div>

    <div class="content-section">
      
      <div class="post-meta">
        <span class="category-tag">{{ post.category }}</span>
        <span class="separator">•</span>
        <span class="author">Dikirim oleh <strong>{{ post.author }}</strong></span>
        <span class="separator">•</span>
        <span class="time">{{ post.timeAgo }}</span>
      </div>

      <h3 class="post-title">{{ post.title }}</h3>
      <p class="post-excerpt">{{ post.excerpt }}</p>

      <div v-if="post.image" class="post-image-container">
        <img :src="post.image" alt="Post Image" />
      </div>

      <div class="action-bar">
        <button class="action-btn">
          💬 {{ post.commentCount }} Komen
        </button>
        
        <button class="action-btn" @click="handleShare">
          🔗 Kongsi (Share)
        </button>
        
        <button class="action-btn">
          🔖 Simpan
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Terima data post dari parent
const props = defineProps<{
  post: any
}>();

// Logic Undian (Simulation)
const router = useRouter();
const voteScore = ref(props.post.votes);
const userVote = ref(0); // 0 = Neutral, 1 = Upvote, -1 = Downvote
const goToDetail = () => { router.push(`/forum/${props.post.id}`); };

const handleVote = (type: number) => {
  if (userVote.value === type) {
    // Kalau dah vote benda sama, kita cancel vote (toggle off)
    voteScore.value -= type;
    userVote.value = 0;
  } else {
    // Kalau tukar vote atau vote baru
    voteScore.value += type - userVote.value;
    userVote.value = type;
  }
};

// Logic Share
const handleShare = () => {
  // Copy link ke clipboard (Simulasi)
  navigator.clipboard.writeText(`https://knotenup.com/forum/${props.post.id}`);
  alert('Pautan post telah disalin! Boleh paste pada WhatsApp/Facebook.');
};
</script>

<style scoped>
.forum-card {
  display: flex;
  background: white;
  border: 1px solid #dae0e6; /* Warna border ala Reddit */
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: border 0.2s;
  cursor: pointer;
}

.forum-card:hover {
  border-color: #898989;
}

/* VOTE SECTION */
.vote-section {
  width: 40px;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 0.5rem;
  border-radius: 8px 0 0 8px;
  border-right: 1px solid #eee;
}

.vote-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #878a8c;
  padding: 2px 5px;
  font-weight: bold;
}

.vote-btn:hover { background-color: #e9ecef; border-radius: 4px; }
.vote-btn.up.active { color: #ff4500; } /* Reddit Orange */
.vote-btn.down.active { color: #7193ff; } /* Reddit Blue */

.vote-count {
  font-weight: bold;
  font-size: 0.9rem;
  margin: 5px 0;
}
.vote-count.positive { color: #ff4500; }
.vote-count.negative { color: #7193ff; }

/* CONTENT SECTION */
.content-section {
  padding: 0.8rem 1rem;
  flex-grow: 1;
}

.post-meta {
  font-size: 0.75rem;
  color: #787c7e;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.category-tag {
  background-color: #e1f5fe;
  color: #0288d1;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: bold;
  margin-right: 5px;
}

.separator { margin: 0 5px; }

.post-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #222;
}

.post-excerpt {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.5;
  margin-bottom: 0.8rem;
  display: -webkit-box;
  -webkit-line-clamp: 3; 
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-image-container img {
  max-width: 100%;
  border-radius: 8px;
  margin-bottom: 0.8rem;
  border: 1px solid #eee;
  max-height: 400px;
  object-fit: cover;
}

/* ACTION BAR */
.action-bar {
  display: flex;
  gap: 1rem;
}

.action-btn {
  background: none;
  border: none;
  color: #878a8c;
  font-weight: bold;
  font-size: 0.8rem;
  padding: 5px 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.action-btn:hover {
  background-color: #e9ecef;
}
</style>