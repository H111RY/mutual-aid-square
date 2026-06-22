<template>
  <div class="my-posts-page" :class="{ 'large-font': squareStore.isLargeFont }">
    <!-- Header -->
    <header class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="header-title">我的发布</h1>
      <span class="header-spacer"></span>
    </header>

    <!-- 分类筛选 Tabs -->
    <div class="filter-tabs-wrapper">
      <div class="filter-tabs">
        <button
          v-for="cat in userStore.postCategories"
          :key="cat.value"
          :class="['filter-tab', { active: userStore.myPostsFilter === cat.value }]"
          @click="userStore.setMyPostsFilter(cat.value)"
        >{{ cat.name }}</button>
      </div>
    </div>

    <!-- 发布列表 -->
    <div class="posts-container">
      <template v-if="filteredPosts.length > 0">
        <div
          v-for="post in filteredPosts"
          :key="post.id"
          :class="['post-card', 'card-' + post.category]"
        >
          <div class="post-card-top">
            <div class="post-badges">
              <span :class="['post-type-badge', 'type-' + post.category]">{{ categoryName(post.category) }}</span>
              <span :class="['post-status-tag', 'tag-' + post.status]">
                <svg v-if="post.status === 'resolved'" viewBox="0 0 24 24" width="14" height="14" fill="none" class="check-icon">
                  <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ statusName(post.status) }}
              </span>
            </div>
            <span class="post-time">{{ timeAgo(post.created_at) }}</span>
          </div>
          <p class="post-content">{{ post.content }}</p>
          <div class="post-meta">
            <span>👁 {{ post.view_count || 0 }}</span>
            <span>💬 {{ post.comment_count || 0 }}</span>
          </div>
          <div class="post-actions">
            <BaseButton variant="ghost" size="sm" @click="editPost(post)">编辑</BaseButton>
            <BaseButton variant="ghost" size="sm" @click="markResolved(post)" v-if="post.status !== 'resolved'">
              标记已解决
            </BaseButton>
            <BaseButton variant="ghost" size="sm" class="btn-cancel-resolve" @click="cancelResolved(post)" v-if="post.status === 'resolved'">
              取消标记
            </BaseButton>
            <BaseButton variant="ghost" size="sm" class="btn-delete" @click="confirmDelete(post)">删除</BaseButton>
          </div>
        </div>
      </template>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <span class="empty-icon">📭</span>
        <h3 class="empty-title">还没有发布过内容</h3>
        <p class="empty-desc">去互助广场发布第一条求助或闲置信息吧</p>
        <BaseButton variant="primary" size="lg" @click="$router.push('/square/publish')">去发布</BaseButton>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <DeleteConfirm
      :visible="deleteVisible"
      title="确认删除"
      message="删除后不可恢复，确定删除？"
      :confirm-text="'确认删除'"
      @confirm="doDelete"
      @cancel="deleteVisible = false"
    />

    <!-- 已解决确认弹窗 -->
    <DeleteConfirm
      :visible="resolveVisible"
      title="标记已解决"
      :message="'确认将此需求标记为已解决？标记后将在广场置顶展示 24 小时'"
      :confirm-text="'确认标记'"
      icon="✅"
      @confirm="doResolve"
      @cancel="resolveVisible = false"
    />

    <div class="safe-bottom"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSquareStore } from '@/stores/square';
import { useUserStore } from '@/stores/user';
import { useAppStore } from '@/stores/app';
import BaseButton from '@/components/ui/BaseButton.vue';
import DeleteConfirm from './components/DeleteConfirm.vue';

const router = useRouter();
const squareStore = useSquareStore();
const userStore = useUserStore();
const app = useAppStore();

onMounted(() => {
  userStore.loadMyPosts();
});

const deleteVisible = ref(false);
const resolveVisible = ref(false);
const pendingPost = ref(null);

const filteredPosts = computed(() => {
  const f = userStore.myPostsFilter;
  if (f === 'all') return userStore.myPosts;
  return userStore.myPosts.filter(p => p.category === f);
});

function categoryName(cat) {
  const map = { help: '求助', idle: '闲置', chat: '交流', hospital: '医院便民', policy: '政策解读', anti_fraud: '防诈骗' };
  return map[cat] || cat;
}

function statusName(s) {
  const map = { unreplied: '未回复', replied: '已回复', resolved: '已解决' };
  return map[s] || s;
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
  if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
  if (diff < 604800) return Math.floor(diff / 86400) + '天前';
  const d = new Date(dateStr);
  return (d.getMonth() + 1) + '/' + d.getDate();
}

function editPost(post) {
  router.push(`/profile/posts/edit/${post.id}`);
}

function confirmDelete(post) {
  pendingPost.value = post;
  deleteVisible.value = true;
}

function doDelete() {
  if (pendingPost.value) {
    userStore.removeMyPost(pendingPost.value.id);
    app.showToast('已删除');
  }
  deleteVisible.value = false;
  pendingPost.value = null;
}

function markResolved(post) {
  pendingPost.value = post;
  resolveVisible.value = true;
}

function doResolve() {
  if (pendingPost.value) {
    userStore.updateMyPost(pendingPost.value.id, { status: 'resolved' });
    app.showToast('已标记为已解决，广场置顶 24 小时');
  }
  resolveVisible.value = false;
  pendingPost.value = null;
}

function cancelResolved(post) {
  userStore.updateMyPost(post.id, { status: 'replied' });
  app.showToast('已取消已解决标记');
}
</script>

<style scoped>
.my-posts-page {
  min-height: 100vh;
  background: var(--bg-page);
  max-width: var(--content-max);
  margin: 0 auto;
}

.page-header {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  height: var(--header-height);
  padding: 0 var(--space-4);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
}
.back-btn {
  width: var(--tap-min); height: var(--tap-min);
  display: flex; align-items: center; justify-content: center;
  border: none; background: none; cursor: pointer;
  color: var(--text-primary); border-radius: 50%;
}
.back-btn:active { background: var(--gray-100); }
.header-title { font-size: var(--text-xl); font-weight: var(--font-bold); margin: 0; }
.header-spacer { width: var(--tap-min); }

.filter-tabs-wrapper { overflow-x: auto; background: var(--bg-card); border-bottom: 1px solid var(--border-light); }
.filter-tabs {
  display: flex; gap: var(--space-1); padding: var(--space-2) var(--space-4);
  white-space: nowrap;
}
.filter-tab {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  border: 1px solid var(--border-light);
  background: var(--bg-card);
  font-family: inherit;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast);
  white-space: nowrap;
}
.filter-tab.active { background: var(--brand-400); color: #fff; border-color: var(--brand-400); }
.filter-tab:active { transform: scale(0.95); }

.posts-container { padding: var(--space-4); }

.post-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  padding: var(--space-4);
  margin-bottom: var(--space-3);
}
.card-hospital { background: #e3f2fd; border-color: #bbdefb; }
.card-policy { background: #e8f5e9; border-color: #c8e6c9; }
.card-anti_fraud { background: #fff3e0; border-color: #ffe0b2; }

.post-card-top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: var(--space-2);
}
.post-badges { display: flex; align-items: center; gap: var(--space-2); }
.post-type-badge {
  font-size: var(--text-xs); padding: 2px 8px; border-radius: var(--radius-sm);
  font-weight: var(--font-semibold);
}
.type-help { background: var(--amber-50); color: var(--amber-700); }
.type-idle { background: var(--green-50); color: var(--green-700); }
.type-chat { background: var(--blue-50); color: var(--blue-500); }
.type-hospital { background: #bbdefb; color: #0d47a1; }
.type-policy { background: #c8e6c9; color: #1b5e20; }
.type-anti_fraud { background: #ffe0b2; color: #e65100; }

.post-status-tag {
  font-size: var(--text-xs); font-weight: var(--font-medium);
  display: flex; align-items: center; gap: var(--space-1);
}
.tag-unreplied { color: var(--amber-500); }
.tag-replied { color: var(--blue-500); }
.tag-resolved { color: var(--green-500); }
.check-icon { flex-shrink: 0; }

.post-time { font-size: var(--text-xs); color: var(--text-muted); }

.post-content {
  font-size: var(--text-base); color: var(--text-primary);
  line-height: var(--leading-relaxed); margin: 0 0 var(--space-3);
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta { display: flex; gap: var(--space-4); font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--space-2); }

.post-actions {
  display: flex; gap: var(--space-1);
  padding-top: var(--space-2); border-top: 1px solid var(--border-light);
}
.btn-delete { color: var(--red-500) !important; }
.btn-cancel-resolve { color: var(--text-muted) !important; }

.empty-state {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-4);
  padding: var(--space-12) var(--space-4); text-align: center;
}
.empty-icon { font-size: var(--text-3xl); }
.empty-title { font-size: var(--text-xl); color: var(--text-primary); margin: 0; font-weight: var(--font-bold); }
.empty-desc { font-size: var(--text-base); color: var(--text-muted); margin: 0; }

.safe-bottom { height: var(--space-10); }
</style>
