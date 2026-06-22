<template>
  <div class="notice-bar" v-if="store.notices.length > 0">
    <span class="notice-icon">📢</span>
    <div class="notice-scroll">
      <div
        class="notice-track"
        :style="{ animationDuration: store.notices.length * 4 + 's' }"
      >
        <span
          v-for="(notice, i) in [...store.notices, ...store.notices]"
          :key="i"
          class="notice-text"
        >{{ notice.content }}</span>
      </div>
    </div>
    <button class="notice-close" @click="store.dismissNotices()" aria-label="关闭公告">
      ✕
    </button>
  </div>
</template>

<script setup>
import { useSquareStore } from '@/stores/square';
const store = useSquareStore();
</script>

<style scoped>
.notice-bar {
  display: flex;
  align-items: center;
  min-height: var(--tap-min);
  margin: var(--space-3) var(--space-4) 0;
  padding: var(--space-2) var(--space-4);
  background: var(--amber-50);
  border-left: 4px solid var(--amber-500);
  max-width: var(--content-max);
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
  box-sizing: border-box;
}

.notice-icon {
  font-size: var(--text-lg);
  flex-shrink: 0;
  margin-right: var(--space-2);
}

.notice-scroll {
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.notice-track {
  display: flex;
  gap: 48px;
  animation: scroll-left linear infinite;
  white-space: nowrap;
}

.notice-text {
  font-size: var(--text-sm);
  color: #8D6E00;
  white-space: nowrap;
}

.notice-close {
  min-width: var(--tap-min);
  min-height: var(--tap-min);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: var(--text-base);
  flex-shrink: 0;
  border: none;
  background: none;
  cursor: pointer;
}

@keyframes scroll-left {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>
