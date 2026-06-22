<template>
  <span v-if="count > 0" :class="['unread-badge', { large: count > 99 }]">
    {{ count > 99 ? '99+' : count }}
  </span>
</template>

<script setup>
defineProps({ count: { type: Number, default: 0 } });
</script>

<style scoped>
.unread-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: var(--text-lg); height: var(--text-lg); padding: 0 var(--space-1);
  background: var(--red-500); color: #fff;
  font-size: var(--text-xs); font-weight: var(--font-bold); line-height: 1;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}
.unread-badge.large { min-width: var(--text-xl); height: var(--text-xl); font-size: var(--text-xs); }
</style>
