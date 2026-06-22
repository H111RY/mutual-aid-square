<template>
  <div class="profile-page" :class="{ 'large-font': squareStore.isLargeFont }">
    <!-- Header -->
    <header class="profile-top-bar">
      <h1 class="page-title">个人中心</h1>
      <BaseButton variant="secondary" size="sm" round @click="squareStore.toggleFontMode()">
        {{ squareStore.isLargeFont ? '标准版 A' : 'A+ 大字版' }}
      </BaseButton>
    </header>

    <div class="profile-content">
      <!-- 个人信息卡片 -->
      <ProfileHeader @edit-profile="editProfile" />

      <!-- 统计条 -->
      <UserStatBar :stats="userStore.stats" />

      <!-- 快捷入口宫格 -->
      <section class="section">
        <QuickEntryGrid :entries="quickEntries" @navigate="goRoute" />
      </section>

      <!-- 最近发布 -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">最近发布</h2>
          <BaseButton variant="ghost" size="sm" @click="goRoute('/profile/posts')">全部 →</BaseButton>
        </div>
        <BaseCard v-if="userStore.myPosts.length > 0" flat class="list-card">
          <div v-for="post in userStore.myPosts.slice(0, 3)" :key="post.id" class="recent-post-item" @click="goRoute(`/square/detail/${post.id}`)">
            <div class="rp-left">
              <span :class="['rp-badge', 'badge-' + post.category]">{{ categoryName(post.category) }}</span>
              <span class="rp-content">{{ (post.content || '').slice(0, 40) }}{{ (post.content || '').length > 40 ? '...' : '' }}</span>
            </div>
            <div class="rp-right">
              <span :class="['rp-status', 'status-' + post.status]">{{ statusName(post.status) }}</span>
              <span class="rp-time">{{ timeAgo(post.created_at) }}</span>
            </div>
          </div>
        </BaseCard>
        <BaseCard v-else flat class="list-card empty-card">
          <div class="empty-mini">
            <span class="empty-icon">📭</span>
            <span>还没有发布过内容</span>
            <BaseButton variant="primary" size="sm" @click="goRoute('/square/publish')">去广场发布</BaseButton>
          </div>
        </BaseCard>
      </section>

      <!-- 当前设置摘要 -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">设置概要</h2>
        </div>
        <BaseCard flat class="list-card">
          <div class="summary-row" @click="goRoute('/profile/preferences')">
            <span class="summary-icon">🔤</span>
            <span class="summary-label">大字模式</span>
            <span :class="['summary-val', { on: userStore.preferences.large_font }]">
              {{ userStore.preferences.large_font ? '已开启' : '已关闭' }}
            </span>
            <span class="summary-arrow">→</span>
          </div>
          <div class="summary-row" @click="goRoute('/profile/building')">
            <span class="summary-icon">🏢</span>
            <span class="summary-label">当前楼栋</span>
            <span class="summary-val">{{ app.user.building || '未绑定' }}</span>
            <span class="summary-arrow">→</span>
          </div>
          <div class="summary-row" @click="goRoute('/profile/settings')">
            <span class="summary-icon">🔔</span>
            <span class="summary-label">消息通知</span>
            <span class="summary-val">{{ notifSummary }}</span>
            <span class="summary-arrow">→</span>
          </div>
        </BaseCard>
      </section>

      <!-- 隐私说明 -->
      <footer class="privacy-footer">
        <p class="privacy-text">你的个人信息仅用于社区服务，不会公开给第三方</p>
        <p class="privacy-version">社区互助平台 v1.0.0</p>
      </footer>
    </div>

    <div class="safe-bottom"></div>
  </div>
</template>

<script setup>
import { computed, onMounted, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import { useSquareStore } from '@/stores/square';
import { useAppStore } from '@/stores/app';
import { useUserStore } from '@/stores/user';
import { useChatStore } from '@/stores/chat';
import { useGroupStore } from '@/stores/group';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import ProfileHeader from './components/ProfileHeader.vue';
import UserStatBar from './components/UserStatBar.vue';
import QuickEntryGrid from './components/QuickEntryGrid.vue';

const router = useRouter();
const squareStore = useSquareStore();
const app = useAppStore();
const userStore = useUserStore();
const chatStore = useChatStore();
const groupStore = useGroupStore();

const quickEntries = computed(() => [
  { key: 'posts', icon: '📋', label: '我的发布', route: '/profile/posts' },
  { key: 'settings', icon: '🔔', label: '消息设置', route: '/profile/settings' },
  { key: 'building', icon: '🏢', label: '楼栋切换', route: '/profile/building' },
  { key: 'preferences', icon: '⚙️', label: '基础设置', route: '/profile/preferences' },
  { key: 'guide', icon: '📖', label: '使用指南', route: '/profile/guide' },
  { key: 'feedback', icon: '💬', label: '意见反馈', route: '/profile/feedback' }
]);

const notifSummary = computed(() => {
  const s = userStore.notificationSettings;
  const parts = [];
  if (s.do_not_disturb) parts.push('免打扰');
  if (s.voice_notify) parts.push('语音播报');
  return parts.length > 0 ? parts.join('/') : '全部通知';
});

function goRoute(path) { router.push(path); }
function editProfile() { /* placeholder */ }

function categoryName(cat) {
  const map = { help: '求助', idle: '闲置', chat: '交流', hospital: '医院便民', policy: '政策解读', anti_fraud: '防诈骗' };
  return map[cat] || cat || '互助';
}

function statusName(s) {
  const map = { unreplied: '未回复', replied: '已回复', resolved: '已解决' };
  return map[s] || s || '';
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

onMounted(() => {
  userStore.loadMyPosts();
});

onActivated(() => {
  userStore.loadMyPosts();
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--bg-page);
  max-width: var(--content-max);
  margin: 0 auto;
}

.profile-top-bar {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  height: var(--header-height);
  padding: 0 var(--space-4);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
  backdrop-filter: blur(8px);
}
.page-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
}

.profile-content {
  padding: var(--space-4);
  display: flex; flex-direction: column; gap: var(--space-4);
}

.section { display: flex; flex-direction: column; gap: var(--space-2); }
.section-header {
  display: flex; align-items: center; justify-content: space-between;
}
.section-title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
  padding-left: var(--space-2);
  border-left: 3px solid var(--brand-400);
}

.list-card { overflow: hidden; }
.empty-card { padding: var(--space-4); }

.recent-post-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: background var(--duration-fast);
  gap: var(--space-3);
}
.recent-post-item:last-child { border-bottom: none; }
.recent-post-item:hover { background: var(--gray-50); }

.rp-left { display: flex; align-items: center; gap: var(--space-2); min-width: 0; flex: 1; }
.rp-badge {
  font-size: var(--text-xs); padding: 2px 8px; border-radius: var(--radius-sm);
  font-weight: var(--font-semibold); flex-shrink: 0;
}
.badge-help { background: var(--amber-50); color: var(--amber-700); }
.badge-idle { background: var(--green-50); color: var(--green-700); }
.badge-chat { background: var(--blue-50); color: var(--blue-500); }
.badge-hospital { background: #e3f2fd; color: #0d47a1; }
.badge-policy { background: #e8f5e9; color: #1b5e20; }
.badge-anti_fraud { background: #fff3e0; color: #e65100; }
.rp-content {
  font-size: var(--text-sm); color: var(--text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.rp-right { display: flex; flex-direction: column; align-items: flex-end; gap: var(--space-1); flex-shrink: 0; }
.rp-status { font-size: var(--text-xs); font-weight: var(--font-medium); }
.status-unreplied { color: var(--amber-500); }
.status-replied { color: var(--blue-500); }
.status-resolved { color: var(--green-500); }
.rp-time { font-size: var(--text-xs); color: var(--text-muted); }

.summary-row {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-light);
  cursor: pointer; transition: background var(--duration-fast);
  min-height: var(--tap-comfortable);
}
.summary-row:last-child { border-bottom: none; }
.summary-row:hover { background: var(--gray-50); }
.summary-icon { font-size: var(--text-xl); flex-shrink: 0; }
.summary-label { font-size: var(--text-base); color: var(--text-primary); flex: 1; font-weight: var(--font-medium); }
.summary-val { font-size: var(--text-sm); color: var(--text-muted); }
.summary-val.on { color: var(--green-500); font-weight: var(--font-semibold); }
.summary-arrow { font-size: 16px; color: var(--text-muted); }

.empty-mini {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-3);
  padding: var(--space-6) 0; text-align: center; color: var(--text-muted);
}
.empty-icon { font-size: var(--text-3xl); }

.privacy-footer {
  text-align: center; padding: var(--space-4) 0;
}
.privacy-text { font-size: var(--text-xs); color: var(--text-muted); margin: 0 0 var(--space-1); }
.privacy-version { font-size: var(--text-xs); color: var(--gray-400); margin: 0; }

.safe-bottom { height: var(--space-12); }

/* Large font */
.large-font .entry-item { min-height: var(--tap-comfortable); }
.large-font .section-title { font-size: var(--text-xl); }
</style>
