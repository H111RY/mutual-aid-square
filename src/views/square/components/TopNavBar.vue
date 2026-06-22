<template>
  <header class="top-nav">
    <h1 class="nav-title">互助广场</h1>
    <BaseButton
      variant="secondary"
      size="sm"
      round
      @click="store.toggleFontMode()"
      :aria-label="store.isLargeFont ? '切换标准字体' : '切换大字体'"
    >
      {{ store.isLargeFont ? '标准版 A' : 'A+ 大字版' }}
    </BaseButton>
  </header>
</template>

<script setup>
import { useSquareStore } from '@/stores/square';
import BaseButton from '@/components/ui/BaseButton.vue';
const store = useSquareStore();
</script>

<style scoped>
.top-nav {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  height: var(--header-height);
  padding: 0 var(--space-4);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
  backdrop-filter: blur(8px);
  max-width: var(--content-max); margin: 0 auto;
}
.nav-title {
  font-size: var(--text-2xl); font-weight: var(--font-bold);
  color: var(--text-primary); letter-spacing: 1px; margin: 0;
}
</style>
