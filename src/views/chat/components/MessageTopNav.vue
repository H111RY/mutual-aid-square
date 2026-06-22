<template>
  <header class="msg-top-nav">
    <slot name="left">
      <BaseButton variant="ghost" size="sm" @click="$router.back()">← 返回</BaseButton>
    </slot>
    <h1 class="nav-title">{{ title }}</h1>
    <div class="nav-actions">
      <slot name="actions">
        <BaseButton
          variant="secondary"
          size="sm"
          round
          @click="store.toggleFontMode()"
          :aria-label="store.isLargeFont ? '切换标准字体' : '切换大字体'"
        >{{ store.isLargeFont ? '标准版' : 'A+ 大字版' }}</BaseButton>
      </slot>
    </div>
  </header>
</template>

<script setup>
import { useSquareStore } from '@/stores/square';
import BaseButton from '@/components/ui/BaseButton.vue';

defineProps({ title: { type: String, default: '消息' } });
const store = useSquareStore();
</script>

<style scoped>
.msg-top-nav {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  height: var(--header-height); padding: 0 var(--space-4);
  background: var(--bg-card); border-bottom: 1px solid var(--border-light);
  backdrop-filter: blur(8px);
}
.nav-title {
  font-size: var(--text-xl); font-weight: var(--font-bold); margin: 0;
  color: var(--text-primary);
}
.nav-actions { display: flex; align-items: center; gap: var(--space-2); }
</style>
