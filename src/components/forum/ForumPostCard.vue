<template>
  <div 
    class="flex flex-col bg-slate-100/85 backdrop-blur-md border border-white/50 rounded-2xl mb-4 cursor-pointer transition-all duration-300 overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:-translate-y-[3px] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] hover:border-slate-400"
    @click="goToDetail"
  >
    
    <div class="p-5">
      
      <!-- Header: Author & Meta -->
      <div class="mb-3">
        <AuthorBadge 
           :userId="post.userId || post.authorId" 
           :fallbackName="post.author || post.userName"
           :fallbackAvatar="post.authorAvatar || post.userAvatar"
        >
           <template #subtext>
              <div class="flex items-center gap-1.5 text-xs text-slate-500 mt-[2px]">
                 <span class="font-semibold text-slate-600">r/{{ post.category }}</span>
                 <span class="opacity-50">•</span>
                 <span>{{ post.timeAgo }}</span>
              </div>
           </template>
        </AuthorBadge>
      </div>

      <!-- Title & Excerpt -->
      <h3 class="m-0 mb-2 text-[1.1rem] font-semibold text-slate-800 leading-snug">{{ post.title }}</h3>
      <p class="text-sm text-slate-600 leading-relaxed mb-3 line-clamp-3">{{ post.content || post.excerpt }}</p>

      <!-- Image -->
      <div v-if="post.image" class="mb-3">
        <img 
            :src="post.image" 
            alt="Post Image" 
            class="w-full max-h-[320px] object-cover rounded-xl border border-black/5"
        />
      </div>

      <!-- Footer: Actions -->
      <div class="flex items-center gap-3 mt-1">
        
        <!-- Vote Pill -->
        <div class="flex items-center bg-white/50 rounded-[20px] px-2 py-1 border border-white/20 shadow-sm" @click.stop>
          <button 
            class="bg-transparent border-none cursor-pointer text-slate-400 p-1 rounded-full flex items-center justify-center transition-all hover:bg-black/5 hover:text-orange-500" 
            :class="{ 'text-orange-500': userVote === 1 }"
            @click="handleVote(1)"
          >
            <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4L3 15h6v5h6v-5h6z"/></svg>
          </button>
          
          <span 
            class="font-semibold text-[0.85rem] mx-2 text-slate-700 min-w-[15px] text-center"
            :class="{ 'text-orange-500': voteScore > 0, 'text-indigo-500': voteScore < 0 }"
          >
            {{ voteScore || 0 }}
          </span>
          
          <button 
            class="bg-transparent border-none cursor-pointer text-slate-400 p-1 rounded-full flex items-center justify-center transition-all hover:bg-black/5 hover:text-indigo-500"
            :class="{ 'text-indigo-500': userVote === -1 }"
            @click="handleVote(-1)"
          >
            <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20L21 9h-6V4h-6v5H3z"/></svg>
          </button>
        </div>

        <!-- Comments Btn -->
        <button class="flex items-center gap-1.5 bg-white/50 text-slate-500 font-medium text-xs px-3.5 py-1.5 rounded-[20px] border border-transparent shadow-sm cursor-pointer transition-all hover:bg-white hover:text-slate-700 hover:shadow-md hover:-translate-y-px">
          <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
          {{ post.commentCount || 0 }}
        </button>
        
        <!-- Share Btn -->
        <button class="flex items-center gap-1.5 bg-white/50 text-slate-500 font-medium text-xs px-3.5 py-1.5 rounded-[20px] border border-transparent shadow-sm cursor-pointer transition-all hover:bg-white hover:text-slate-700 hover:shadow-md hover:-translate-y-px" @click.stop="handleShare">
          <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>
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