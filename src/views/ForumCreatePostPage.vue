<template>
  <div class="min-h-screen bg-[#0f172a] relative overflow-x-hidden text-white">
    
    <!-- BACKGROUND LAYERS -->
    <div class="absolute inset-0 z-0 opacity-[0.08] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' viewBox=\'0 0 1000 1000\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,500 Q250,300 500,500 T1000,500 M0,600 Q250,400 500,600 T1000,600 M0,400 Q250,200 500,400 T1000,400\' stroke=\'white\' fill=\'none\' stroke-width=\'2\' opacity=\'0.5\'/%3E%3C/svg%3E')] bg-cover"></div>
    <div class="absolute top-0 left-0 w-[60vw] h-[60vw] bg-[#6c63ff] blur-[150px] opacity-15 pointer-events-none rounded-full"></div>
    <div class="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-[#ff8c42] blur-[150px] opacity-10 pointer-events-none rounded-full"></div>

    <!-- MAIN CONTAINER -->
    <div class="container mx-auto px-6 pt-[100px] pb-20 relative z-10 max-w-[800px]">
      
      <div class="bg-[#1e293b]/70 border border-white/10 rounded-[24px] p-12 max-sm:p-6 backdrop-blur-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-fade-in-up">
        <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-white mb-2">
                {{ isEditing ? t('createPostPage.editTitle') : t('createPostPage.createTitle') }}
            </h2>
            <p class="text-gray-400 text-sm">{{ t('createPostPage.sub') }}</p>
        </div>

        <!-- FORM -->
        <div>
            
            <!-- TAJUK -->
            <div class="mb-6 relative">
                <label class="text-gray-300 font-semibold mb-2 block">{{ t('createPostPage.titleLabel') }}</label>
                <input 
                    type="text" 
                    v-model="form.title" 
                    class="w-full p-[14px] px-[16px] rounded-[12px] border border-white/10 bg-[#0f172a]/60 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-[#0f172a]/80 focus:shadow-[0_0_0_4px_rgba(108,99,255,0.1)] placeholder-slate-500"
                    :placeholder="t('createPostPage.titlePlaceholder')" 
                />
            </div>

            <!-- KATEGORI -->
            <div class="mb-6 relative">
                <label class="text-gray-300 font-semibold mb-2 block">{{ t('createPostPage.categoryLabel') }}</label>
                <div class="relative">
                    <select v-model="form.category" class="w-full p-[14px] px-[16px] rounded-[12px] border border-white/10 bg-[#0f172a]/60 text-white outline-none transition duration-300 text-base cursor-pointer appearance-none focus:border-[#6c63ff] focus:bg-[#0f172a]/80 focus:shadow-[0_0_0_4px_rgba(108,99,255,0.1)]">
                        <option disabled value="">{{ t('createPostPage.categoryPlaceholder') }}</option>
                        <optgroup v-for="group in ACTIVITY_CATEGORIES" :key="group.group" :label="group.group" class="bg-[#1e293b] text-white">
                            <option v-for="item in group.items" :key="item" :value="item" class="bg-[#1e293b] text-white">{{ item }}</option>
                        </optgroup>
                    </select>
                    <i class="fas fa-chevron-down absolute right-[15px] top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition duration-300"></i>
                </div>
            </div>

            <!-- KANDUNGAN -->
            <div class="mb-6 relative">
                <label class="text-gray-300 font-semibold mb-2 block">{{ t('createPostPage.contentLabel') }}</label>
                <textarea 
                    v-model="form.content" 
                    rows="8" 
                    class="w-full p-[14px] px-[16px] rounded-[12px] border border-white/10 bg-[#0f172a]/60 text-white outline-none transition duration-300 text-base focus:border-[#6c63ff] focus:bg-[#0f172a]/80 focus:shadow-[0_0_0_4px_rgba(108,99,255,0.1)] placeholder-slate-500"
                    :placeholder="t('createPostPage.contentPlaceholder')"
                ></textarea>
                <div class="text-right mt-1">
                    <small :class="wordCount > 500 ? 'text-red-400' : 'text-gray-500'">
                        {{ wordCount }} {{ t('createPostPage.wordCount') }}
                    </small>
                </div>
            </div>

            <!-- ACTIONS -->
            <div class="mt-8 flex gap-4 justify-end max-sm:flex-col-reverse">
                <button @click="$router.back()" class="flex-1 bg-transparent border border-white/10 text-[#94a3b8] p-[14px_24px] rounded-[12px] font-semibold cursor-pointer transition duration-300 hover:bg-white/5 hover:text-white hover:border-white/30 max-sm:w-full">
                    {{ t('createPostPage.cancel') }}
                </button>
                <button @click="submitPost" class="flex-[2] bg-gradient-to-br from-[#6c63ff] to-[#5b54e0] text-white p-[14px_24px] border-none rounded-[12px] font-semibold text-base cursor-pointer transition duration-300 shadow-[0_4px_15px_rgba(108,99,255,0.3)] hover:enabled:-translate-y-[2px] hover:enabled:shadow-[0_8px_25px_rgba(108,99,255,0.5)] hover:enabled:bg-gradient-to-br hover:from-[#7b72ff] hover:to-[#655ee6] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none max-sm:w-full" :disabled="loading">
                    <span v-if="loading"><i class="fas fa-spinner fa-spin mr-2"></i> {{ t('createPostPage.processing') }}</span>
                    <span v-else>{{ isEditing ? t('createPostPage.save') : t('createPostPage.publish') }}</span>
                </button>
            </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n'; 
import { ACTIVITY_CATEGORIES } from '../constants/data';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { isSpam, getDetectedSpamWord } from '../utils/spamFilter';
import { checkRateLimit } from '../utils/rateLimiter';
import { getEffectiveUserProfile } from '../utils/userProfile';

const { t } = useI18n(); 
const router = useRouter();
const route = useRoute();
const loading = ref(false);
const isEditing = ref(false);
const postId = route.params.id as string;

const form = reactive({ title: '', category: '', content: '' });

// Kira patah perkataan untuk UX
const wordCount = computed(() => {
    return form.content.trim().split(/\s+/).filter(word => word.length > 0).length;
});

onMounted(async () => {
  // Kalau ada ID di URL, maksudnya kita nak EDIT
  if (postId) {
    isEditing.value = true;
    loading.value = true;
    try {
      const docSnap = await getDoc(doc(db, "forum_posts", postId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        form.title = data.title;
        form.category = data.category;
        form.content = data.content;
      } else {
        alert(t('createPostPage.alerts.notFound'));
        router.push('/forum');
      }
    } catch (e) {
      console.error("Error fetch:", e);
    } finally {
      loading.value = false;
    }
  }
});

const submitPost = async () => {
  if (!auth.currentUser) return alert(t('createPostPage.alerts.login'));

  // 1. RATE LIMIT CHECK
  const limitCheck = checkRateLimit('create_post'); 
  if (!limitCheck.allowed) {
    alert(limitCheck.message);
    return;
  }

  // 2. EMPTY FIELDS CHECK
  if(!form.title || !form.category || !form.content) return alert(t('createPostPage.alerts.fillAll'));

  // 3. SPAM FILTER CHECK (PENTING: Check sebelum hantar ke DB!)
  const combinedText = `${form.title} ${form.content}`;
  if (isSpam(combinedText)) {
    const badWord = getDetectedSpamWord(combinedText);
    alert(t('createPostPage.alerts.spam', { word: badWord }));
    return; // Stop execution sini
  }

  // 4. DATABASE OPERATIONS
  loading.value = true;
  try {
    if (isEditing.value) {
      // MODE EDIT
      await updateDoc(doc(db, "forum_posts", postId), {
        title: form.title,
        category: form.category,
        content: form.content,
        updatedAt: serverTimestamp(),
        isEdited: true
      });
      alert(t('createPostPage.alerts.updateSuccess'));
    } else {
      // MODE CREATE
      // Get effective profile (Firestore > Auth)
      const userProfile = await getEffectiveUserProfile(auth.currentUser);

      await addDoc(collection(db, "forum_posts"), {
        title: form.title,
        category: form.category,
        content: form.content,
        authorId: auth.currentUser.uid,
        author: userProfile.name,
        authorAvatar: userProfile.avatar,
        createdAt: serverTimestamp(),
        votes: 0,
        commentCount: 0,
        views: 0
      });
      alert(t('createPostPage.alerts.publishSuccess'));
    }
    
    router.push('/forum'); // Redirect balik ke forum

  } catch (error) {
    console.error("Error:", error);
    alert(t('createPostPage.alerts.error'));
  } finally {
    loading.value = false;
  }
};
</script>