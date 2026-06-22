<template>
  <nav class="bottom-tab-nav">
    <button
      :class="['tab-item', { active: currentTab === 'square' }]"
      @click="goSquare"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" class="tab-icon">
        <rect x="3" y="3" width="7" height="7" rx="1.5" :stroke="currentTab === 'square' ? 'var(--brand-500)' : 'var(--text-muted)'" stroke-width="2"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5" :stroke="currentTab === 'square' ? 'var(--brand-500)' : 'var(--text-muted)'" stroke-width="2"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5" :stroke="currentTab === 'square' ? 'var(--brand-500)' : 'var(--text-muted)'" stroke-width="2"/>
        <path d="M17 14V21M14 17.5H20" :stroke="currentTab === 'square' ? 'var(--brand-500)' : 'var(--text-muted)'" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span class="tab-label">互助广场</span>
    </button>

    <button
      :class="['tab-item', { active: currentTab === 'communicate' }]"
      @click="goCommunicate"
    >
      <div class="tab-icon-wrap">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" class="tab-icon">
          <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" :stroke="currentTab === 'communicate' ? 'var(--brand-500)' : 'var(--text-muted)'" stroke-width="2"/>
          <path d="M6 8H18M6 12H14M6 16H10" :stroke="currentTab === 'communicate' ? 'var(--brand-500)' : 'var(--text-muted)'" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span v-if="totalUnread > 0" class="tab-badge">{{ totalUnread > 99 ? '99+' : totalUnread }}</span>
      </div>
      <span class="tab-label">沟通广场</span>
    </button>

    <button
      :class="['tab-item', { active: currentTab === 'profile' }]"
      @click="goProfile"
    >
      <div class="tab-icon-wrap">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" class="tab-icon">
          <circle cx="12" cy="8" r="4" :stroke="currentTab === 'profile' ? 'var(--brand-500)' : 'var(--text-muted)'" stroke-width="2"/>
          <path d="M4 21C4 17 7.6 14 12 14C16.4 14 20 17 20 21" :stroke="currentTab === 'profile' ? 'var(--brand-500)' : 'var(--text-muted)'" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="tab-label">我的</span>
    </button>
  </nav>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useChatStore } from '@/stores/chat';
import { useGroupStore } from '@/stores/group';

const router = useRouter();
const route = useRoute();
const chatStore = useChatStore();
const groupStore = useGroupStore();

const currentTab = ref('square');

const totalUnread = computed(() =>
  chatStore.totalUnread + groupStore.totalGroupUnread
);

// Determine which tab is active based on current route
function updateCurrentTab() {
  if (route.path.startsWith('/square') || route.path === '/') {
    currentTab.value = 'square';
  } else if (
    route.path.startsWith('/communicate') ||
    route.path.startsWith('/messages') ||
    route.path.startsWith('/chat') ||
    route.path.startsWith('/group')
  ) {
    currentTab.value = 'communicate';
  } else if (route.path.startsWith('/profile')) {
    currentTab.value = 'profile';
  }
}

watch(() => route.path, updateCurrentTab, { immediate: true });

function goSquare() {
  if (currentTab.value !== 'square') {
    router.replace('/square');
  }
}

function goCommunicate() {
  if (currentTab.value !== 'communicate') {
    router.replace('/communicate');
  }
}

function goProfile() {
  if (currentTab.value !== 'profile') {
    router.replace('/profile');
  }
}
</script>

<style scoped>
.bottom-tab-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  display: flex;
  height: 64px;
  background: var(--bg-card);
  border-top: 1px solid var(--border-light);
  box-shadow: 0 -2px 12px rgba(0,0,0,0.06);
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: none;
  background: none;
  cursor: pointer;
  padding: var(--space-1) 0;
  font-family: inherit;
  transition: all var(--duration-fast);
  -webkit-tap-highlight-color: transparent;
  position: relative;
}
.tab-item:active { background: var(--gray-50); }

.tab-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-icon {
  display: block;
  transition: all var(--duration-fast);
}

.tab-label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--text-muted);
  transition: color var(--duration-fast);
}

.tab-item.active .tab-label {
  color: var(--brand-500);
  font-weight: var(--font-bold);
}

.tab-badge {
  position: absolute;
  top: -6px;
  right: -10px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: var(--red-500);
  color: #fff;
  font-size: 10px;
  font-weight: var(--font-bold);
  line-height: 16px;
  text-align: center;
  border-radius: var(--radius-full);
  border: 2px solid var(--bg-card);
}

/* Large font: scale icons and nav bar */
:global(.font-large) .bottom-tab-nav { height: 96px; }
:global(.font-large) .tab-label { font-size: var(--text-base); }
:global(.font-large) .tab-icon { width: 36px; height: 36px; }
:global(.font-large) .tab-badge { min-width: 22px; height: 22px; line-height: 22px; font-size: 14px; top: -8px; right: -12px; }
</style>
