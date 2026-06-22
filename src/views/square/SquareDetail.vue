<template>
  <div class="detail-page">
    <header class="detail-header">
      <BaseButton variant="ghost" size="sm" @click="$router.back()">← 返回</BaseButton>
      <h1 class="header-title">帖子详情</h1>
      <div class="header-spacer"></div>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <template v-else-if="post">
      <PostCard
        :post="post"
        @like="store.toggleLike(post.id)"
      />

      <!-- 评论区 -->
      <section class="comment-section" ref="commentRef">
        <div class="comment-header">
          <h2 class="comment-title">评论 ({{ comments.length }})</h2>
          <BaseButton
            v-if="comments.length > 0"
            variant="ghost" size="sm"
            @click="showComments = !showComments"
          >{{ showComments ? '收起评论 ▲' : '展开评论 ▼' }}</BaseButton>
        </div>

        <div v-if="showComments" class="comment-list">
          <BaseEmpty v-if="comments.length === 0" icon="💬" desc="暂无评论，来第一个留言吧～" />
          <div v-for="c in comments" :key="c.id" class="comment-item">
            <BaseAvatar :src="c.author.avatar" :name="c.author.nickname" size="sm" />
            <div class="comment-body">
              <div class="comment-meta">
                <span class="comment-nickname">{{ c.author.nickname }}</span>
                <span class="comment-time">{{ c.timeAgo || '刚刚' }}</span>
              </div>
              <p class="comment-content">{{ c.content }}</p>
            </div>
          </div>
        </div>

        <!-- 评论输入 -->
        <div class="comment-input-bar">
          <input
            v-model="commentText"
            class="comment-input"
            placeholder="写下你的回复..."
            @keyup.enter="submitComment"
          />
          <button
            :class="['voice-btn', { active: voiceStatus === 'listening' }]"
            @click="toggleVoiceComment"
            :disabled="!voiceSupported"
            :title="voiceSupported ? '语音留言' : '浏览器不支持语音'"
          >{{ voiceStatus === 'listening' ? '🔴' : '🎤' }}</button>
          <BaseButton variant="primary" size="sm" :disabled="!commentText.trim()" @click="submitComment">
            发送
          </BaseButton>
        </div>
      </section>
    </template>

    <BaseEmpty v-else icon="📄" title="帖子不存在" desc="该帖子可能已被删除" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSquareStore } from '@/stores/square';
import { useVoiceInput } from '@/composables/useVoiceInput';
import PostCard from './components/PostCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAvatar from '@/components/ui/BaseAvatar.vue';
import BaseEmpty from '@/components/ui/BaseEmpty.vue';

const route = useRoute();
const store = useSquareStore();

const post = ref(null);
const comments = ref([]);
const commentText = ref('');
const showComments = ref(true);
const loading = ref(true);
const commentRef = ref(null);

const {
  status: voiceStatus,
  toggle: toggleVoiceComment
} = useVoiceInput({
  onResult: (fullText) => { commentText.value = fullText; }
});
const voiceSupported = computed(() => voiceStatus.value !== 'unsupported');

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
  if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
  return Math.floor(diff / 86400) + '天前';
};

onMounted(() => {
  const postData = store.getPostById(route.params.id);
  if (postData) {
    post.value = postData;
    comments.value = (postData.comments || []).map(c => ({ ...c, timeAgo: timeAgo(c.created_at) }));
  }
  loading.value = false;

  if (route.query.scrollTo === 'comment') {
    setTimeout(() => commentRef.value?.scrollIntoView({ behavior: 'smooth' }), 100);
  }
});

function submitComment() {
  if (!commentText.value.trim()) return;
  const content = commentText.value;
  commentText.value = '';
  const c = {
    id: 'c_' + Date.now(),
    content,
    author: { nickname: '我', avatar: '' },
    created_at: new Date().toISOString(),
    timeAgo: '刚刚'
  };
  comments.value.unshift(c);
  store.addComment(route.params.id, c);
}
</script>

<style scoped>
.detail-page { min-height: 100vh; background: var(--bg-page); padding-bottom: 100px; }

.detail-header {
  display: flex; align-items: center; justify-content: space-between;
  height: var(--header-height); padding: 0 var(--space-4);
  background: var(--bg-card); border-bottom: 1px solid var(--border-light);
  position: sticky; top: 0; z-index: 100;
}
.header-title { font-size: var(--text-xl); font-weight: var(--font-bold); margin: 0; }
.header-spacer { width: 60px; }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 80px; color: var(--text-muted); gap: var(--space-4); }
.spinner { width: 36px; height: 36px; border: 3px solid var(--border-light); border-top-color: var(--brand-400); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.comment-section { max-width: var(--content-max); margin: 0 auto; padding: 0 var(--space-4); }
.comment-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-4) 0; }
.comment-title { font-size: var(--text-xl); font-weight: var(--font-bold); margin: 0; }

.comment-list { background: var(--bg-card); border-radius: var(--radius-md); padding: var(--space-4); margin-bottom: var(--space-4); box-shadow: var(--shadow-xs); }
.comment-item { display: flex; gap: var(--space-4); padding: var(--space-3) 0; border-bottom: 1px solid var(--border-light); }
.comment-item:last-child { border-bottom: none; }
.comment-body { flex: 1; }
.comment-meta { margin-bottom: 4px; }
.comment-nickname { font-weight: var(--font-semibold); font-size: var(--text-base); margin-right: var(--space-2); }
.comment-time { font-size: var(--text-sm); color: var(--text-muted); }
.comment-content { font-size: var(--text-base); line-height: var(--leading-relaxed); margin: 0; }

.comment-input-bar { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-4); background: var(--bg-card); border-radius: var(--radius-md); box-shadow: var(--shadow-xs); }
.comment-input { flex: 1; padding: var(--space-2) var(--space-4); font-size: var(--text-base); border: 1px solid var(--border-normal); border-radius: var(--radius-full); min-height: var(--tap-min); outline: none; font-family: inherit; }
.comment-input:focus { border-color: var(--brand-400); }
.voice-btn { min-width: var(--tap-min); min-height: var(--tap-min); font-size: 22px; border-radius: 50%; background: var(--brand-50); border: none; cursor: pointer; }
.voice-btn.active { background: var(--red-50); }
.voice-btn:disabled { opacity: 0.3; }
</style>
