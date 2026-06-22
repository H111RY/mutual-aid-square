<template>
  <div class="square-page">
    <!-- ====== 顶部导航 ====== -->
    <TopNavBar />

    <!-- ====== 分类 Tab ====== -->
    <CategoryTabs />

    <!-- ====== 置顶公告 ====== -->
    <NoticeBar />

    <!-- ====== 信息流列表 ====== -->
    <div class="feed-container">
      <!-- 骨架屏 -->
      <BaseSkeleton v-if="store.isLoading && store.posts.length === 0" variant="card" :count="3" />

      <!-- 真实列表 -->
      <template v-else-if="store.posts.length > 0">
        <PostCard
          v-for="post in store.posts"
          :key="post.id"
          :post="post"
          @like="store.toggleLike(post.id)"
          @expand="toggleExpand(post.id)"
          @detail="goDetail(post.id)"
          @comment="goComment(post.id)"
        />
      </template>

      <!-- 空状态 -->
      <EmptyState v-else :tab="store.tabs[store.currentTab].value" />

      <!-- 加载更多 -->
      <div
        v-if="store.posts.length > 0"
        ref="sentinelRef"
        class="load-sentinel"
      >
        <div class="load-more" v-if="store.isLoading">
          <span class="spinner"></span>
          <span>加载中...</span>
        </div>
        <div class="load-end" v-else-if="store.isEnd">
          —— 已经到底了 ——
        </div>
      </div>
    </div>

    <!-- ====== 悬浮发布按钮 ====== -->
    <FloatPublishBtn />
  </div>
</template>

<script setup>
import { onMounted, onActivated, watch, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSquareStore } from '@/stores/square';
import { useInfiniteScroll } from '@/composables/useInfiniteScroll';
import TopNavBar from './components/TopNavBar.vue';
import CategoryTabs from './components/CategoryTabs.vue';
import NoticeBar from './components/NoticeBar.vue';
import PostCard from './components/PostCard.vue';
import EmptyState from './components/EmptyState.vue';
import FloatPublishBtn from './components/FloatPublishBtn.vue';
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue';

const router = useRouter();
const store = useSquareStore();

// 哨兵元素 → 触发加载
const sentinelRef = ref(null);
useInfiniteScroll(() => {
  if (!store.isLoading && !store.isEnd) {
    store.fetchPosts(false);
  }
});

// Tab 切换时重置列表
watch(() => store.currentTab, () => {
  store.fetchPosts(true);
});

onMounted(() => {
  store.fetchNotices();
  store.fetchPosts(true);
});

// 从发布页返回时刷新
onActivated(() => {
  if (store.hasPublished) {
    store.hasPublished = false;
    store.fetchPosts(true);
  }
});

function toggleExpand(postId) {
  const post = store.posts.find(p => p.id === postId);
  if (post) post.isExpanded = !post.isExpanded;
}

function goDetail(id) {
  router.push(`/square/detail/${id}`);
}

function goComment(id) {
  router.push(`/square/detail/${id}?scrollTo=comment`);
}

function goPublish() {
  router.push('/square/publish');
}
</script>

<style scoped>
.square-page { min-height: 100vh; padding-bottom: 120px; }
.feed-container { padding: var(--space-4); max-width: var(--content-max); margin: 0 auto; }

.load-sentinel { min-height: 60px; }
.load-more {
  display: flex; align-items: center; justify-content: center;
  gap: var(--space-2); padding: var(--space-8);
  color: var(--text-muted); font-size: var(--text-base);
}
.load-end {
  text-align: center; padding: var(--space-8);
  color: var(--text-muted); font-size: var(--text-base);
}
.spinner {
  display: inline-block; width: 20px; height: 20px;
  border: 3px solid var(--border-light);
  border-top-color: var(--brand-400); border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
