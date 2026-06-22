<template>
  <div :class="['base-divider', { 'divider-vertical': vertical }]">
    <div class="divider-line"></div>
    <span v-if="$slots.default" class="divider-text"><slot /></span>
    <div v-if="$slots.default" class="divider-line"></div>
  </div>
</template>

<script setup>
defineProps({ vertical: { type: Boolean, default: false } });
</script>

<style scoped>
.base-divider {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-4) 0; width: 100%;
}
.divider-vertical {
  flex-direction: column; width: auto; height: 100%; padding: 0 var(--space-2);
}
.divider-line {
  flex: 1; height: 1px; background: var(--border-light);
}
.divider-vertical .divider-line { width: 1px; height: auto; flex: 1; }
.divider-text {
  font-size: var(--text-sm); color: var(--text-muted); white-space: nowrap;
  flex-shrink: 0;
}
</style>
