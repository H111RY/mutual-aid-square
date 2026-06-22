<template>
  <nav class="tab-nav" aria-label="内容分类">
    <div class="tab-scroll">
      <button
        v-for="(tab, index) in store.tabs"
        :key="tab.value"
        :class="['tab-btn', { active: store.currentTab === index }]"
        @click="store.switchTab(index)"
      >
        {{ tab.name }}
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useSquareStore } from '@/stores/square';
const store = useSquareStore();
</script>

<style scoped>
.tab-nav {
  position: sticky;
  top: var(--header-height);
  z-index: 99;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
}

.tab-scroll {
  display: flex;
  justify-content: center;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 0 var(--space-4);
  max-width: var(--content-max);
  margin: 0 auto;
}

.tab-scroll::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  flex-shrink: 0;
  position: relative;
  min-height: var(--tap-min);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  white-space: nowrap;
  transition: color var(--duration-fast);
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
  border-bottom: 3px solid transparent;
}

.tab-btn:hover {
  color: var(--brand-500);
}

.tab-btn.active {
  color: var(--brand-500);
  font-weight: var(--font-bold);
  border-bottom-color: var(--brand-500);
}
</style>
