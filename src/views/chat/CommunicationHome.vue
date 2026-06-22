<template>
  <div class="comm-page" :class="{ 'large-font': store.isLargeFont }">
    <!-- ====== Header ====== -->
    <header class="comm-header">
      <h1 class="comm-title">沟通广场</h1>
      <BaseButton
        variant="secondary"
        size="sm"
        round
        @click="store.toggleFontMode()"
      >{{ store.isLargeFont ? '标准版 A' : 'A+ 大字版' }}</BaseButton>
    </header>

    <!-- ====== Summary Banner ====== -->
    <div class="summary-banner">
      <div class="summary-item">
        <div class="summary-icon chat-icon">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
            <path d="M4 22C4 17 7.6 14 12 14C16.4 14 20 17 20 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M16 4L20 8M20 4L16 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="summary-text">
          <span class="summary-num">{{ chatStore.totalUnread || 0 }}</span>
          <span class="summary-label">条未读私信</span>
        </div>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-item">
        <div class="summary-icon group-icon">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
            <circle cx="9" cy="7" r="3" stroke="currentColor" stroke-width="2"/>
            <circle cx="17" cy="8" r="3" stroke="currentColor" stroke-width="2"/>
            <path d="M3 20C3 16 5.7 14 9 14C12.3 14 15 16 15 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M13 20C13 17 14.8 15 17 15C19.2 15 21 17 21 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="summary-text">
          <span class="summary-num">{{ groupStore.totalGroupUnread || 0 }}</span>
          <span class="summary-label">条未读群聊</span>
        </div>
      </div>
    </div>

    <!-- ====== Quick Entry Cards ====== -->
    <div class="quick-cards">
      <BaseCard class="quick-card" @click.native="goChatList">
        <div class="quick-card-inner">
          <div class="quick-card-icon chat-bg">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" stroke="currentColor" stroke-width="2"/>
              <path d="M7 9H17M7 13H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="quick-card-info">
            <h3 class="quick-card-title">私信</h3>
            <p class="quick-card-desc">一对一安全私密沟通</p>
            <div class="quick-card-stats">
              <span>{{ chatStore.conversations.length || 0 }} 个会话</span>
              <UnreadBadge v-if="chatStore.totalUnread" :count="chatStore.totalUnread" />
            </div>
          </div>
          <span class="quick-card-arrow">→</span>
        </div>
      </BaseCard>

      <BaseCard class="quick-card" @click.native="goGroupList">
        <div class="quick-card-inner">
          <div class="quick-card-icon group-bg">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
              <rect x="2" y="2" width="20" height="16" rx="3" stroke="currentColor" stroke-width="2"/>
              <path d="M7 22L12 18H17L22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="quick-card-info">
            <h3 class="quick-card-title">楼栋群聊</h3>
            <p class="quick-card-desc">邻里圈层沟通阵地</p>
            <div class="quick-card-stats">
              <span>{{ groupStore.groups.length || 0 }} 个群聊</span>
              <UnreadBadge v-if="groupStore.totalGroupUnread" :count="groupStore.totalGroupUnread" />
            </div>
          </div>
          <span class="quick-card-arrow">→</span>
        </div>
      </BaseCard>
    </div>

    <!-- ====== Recent Conversations ====== -->
    <section class="section" v-if="chatStore.conversations.length > 0">
      <div class="section-header">
        <h2 class="section-title">最近私信</h2>
        <BaseButton variant="ghost" size="sm" @click="goChatList">全部 →</BaseButton>
      </div>
      <BaseCard flat class="list-card">
        <ConversationItem
          v-for="conv in chatStore.conversations.slice(0, 3)"
          :key="conv.id"
          :conv="conv"
          @click="goChat(conv)"
        />
      </BaseCard>
    </section>

    <section class="section" v-else>
      <div class="section-header">
        <h2 class="section-title">最近私信</h2>
      </div>
      <BaseCard flat class="list-card empty-list">
        <div class="empty-mini">
          <span class="empty-mini-icon">💬</span>
          <span>暂无私信，在互助广场点击他人头像即可发起</span>
          <BaseButton variant="primary" size="sm" @click="$router.push('/square')">去广场看看</BaseButton>
        </div>
      </BaseCard>
    </section>

    <!-- ====== Recent Groups ====== -->
    <section class="section" v-if="groupStore.groups.length > 0">
      <div class="section-header">
        <h2 class="section-title">我的群聊</h2>
        <BaseButton variant="ghost" size="sm" @click="goGroupList">全部 →</BaseButton>
      </div>
      <BaseCard flat class="list-card">
        <GroupItem
          v-for="g in groupStore.groups.slice(0, 3)"
          :key="g.id"
          :group="g"
          @click="goGroup(g)"
        />
      </BaseCard>
    </section>

    <section class="section" v-else>
      <div class="section-header">
        <h2 class="section-title">我的群聊</h2>
      </div>
      <BaseCard flat class="list-card empty-list">
        <div class="empty-mini">
          <span class="empty-mini-icon">🏢</span>
          <span>完成楼栋选择后，将自动加入楼栋专属群聊</span>
        </div>
      </BaseCard>
    </section>

    <!-- ====== Bottom Safe Area ====== -->
    <div class="safe-bottom"></div>
  </div>
</template>

<script setup>
import { onMounted, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import { useSquareStore } from '@/stores/square';
import { useChatStore } from '@/stores/chat';
import { useGroupStore } from '@/stores/group';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import UnreadBadge from './components/UnreadBadge.vue';
import ConversationItem from './components/ConversationItem.vue';
import GroupItem from './components/GroupItem.vue';

const router = useRouter();
const store = useSquareStore();
const chatStore = useChatStore();
const groupStore = useGroupStore();

onMounted(() => {
  chatStore.fetchConversations();
  groupStore.fetchGroups();
});

onActivated(() => {
  chatStore.fetchConversations();
  groupStore.fetchGroups();
});

function goChatList() { router.push('/chat'); }
function goGroupList() { router.push('/group'); }
function goChat(conv) { router.push(`/chat/${conv.id}`); }
function goGroup(group) { router.push(`/group/${group.id}`); }
</script>

<style scoped>
.comm-page {
  min-height: 100vh;
  background: var(--bg-page);
  max-width: var(--content-max);
  margin: 0 auto;
}

/* ── Header ── */
.comm-header {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  height: var(--header-height);
  padding: 0 var(--space-4);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
  backdrop-filter: blur(8px);
}
.comm-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
  letter-spacing: 1px;
}

/* ── Summary Banner ── */
.summary-banner {
  display: flex;
  margin: var(--space-4);
  padding: var(--space-4);
  background: linear-gradient(135deg, var(--brand-50), #e8f0fe);
  border-radius: var(--radius-lg);
  border: 1px solid var(--brand-100);
}
.summary-item {
  flex: 1;
  display: flex; align-items: center; gap: var(--space-3);
}
.summary-icon {
  width: var(--tap-comfortable); height: var(--tap-comfortable);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.chat-icon { background: var(--brand-100); color: var(--brand-500); }
.group-icon { background: #e8f5e9; color: #388e3c; }

.summary-text { display: flex; flex-direction: column; }
.summary-num {
  font-size: var(--text-3xl); font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: 1.1;
}
.summary-label { font-size: var(--text-sm); color: var(--text-muted); }

.summary-divider {
  width: 1px;
  background: var(--brand-200);
  margin: 0 var(--space-3);
  flex-shrink: 0;
}

/* ── Quick Cards ── */
.quick-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  padding: 0 var(--space-4);
  margin-bottom: var(--space-4);
}
.quick-card {
  cursor: pointer;
  transition: transform var(--duration-fast), box-shadow var(--duration-fast);
}
.quick-card:hover { transform: translateY(-2px); }
.quick-card:active { transform: scale(0.98); }

.quick-card-inner {
  display: flex; align-items: center; gap: var(--space-3);
}
.quick-card-icon {
  width: var(--tap-comfortable); height: var(--tap-comfortable);
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.chat-bg { background: var(--brand-50); color: var(--brand-500); }
.group-bg { background: #e8f5e9; color: #388e3c; }

.quick-card-info { flex: 1; min-width: 0; }
.quick-card-title {
  font-size: var(--text-lg); font-weight: var(--font-bold);
  margin: 0 0 var(--space-1);
}
.quick-card-desc {
  font-size: var(--text-xs); color: var(--text-muted); margin: 0 0 var(--space-1);
}
.quick-card-stats {
  display: flex; align-items: center; gap: var(--space-2);
  font-size: var(--text-sm); color: var(--text-secondary);
}
.quick-card-arrow {
  font-size: var(--text-base); color: var(--text-muted);
}

/* ── Sections ── */
.section {
  margin-bottom: var(--space-4);
  padding: 0 var(--space-4);
}
.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: var(--space-2);
}
.section-title {
  font-size: var(--text-lg); font-weight: var(--font-bold);
  margin: 0; color: var(--text-primary);
  padding-left: var(--space-2);
  border-left: 3px solid var(--brand-400);
}
.list-card { overflow: hidden; }

.empty-list { padding: var(--space-4); }
.empty-mini {
  display: flex; flex-direction: column; align-items: center;
  gap: var(--space-3); padding: var(--space-6) 0;
  text-align: center; color: var(--text-muted);
  font-size: var(--text-base);
}
.empty-mini-icon { font-size: var(--text-3xl); }

/* ── Bottom ── */
.safe-bottom { height: var(--space-10); }

/* Large font: component-level overrides for 2x scale */
.large-font .quick-card { min-height: 100px; }
.large-font .section-title { font-size: var(--text-xl); }
.large-font .summary-banner { flex-wrap: wrap; }

@media (max-width: 640px) {
  .quick-cards { grid-template-columns: 1fr; }
  .summary-banner { flex-direction: column; gap: var(--space-3); }
  .summary-divider { width: auto; height: 1px; margin: 0; }
}
</style>
