<template>
  <div class="empty-state">
    <div v-if="icon" class="empty-icon">{{ icon }}</div>
    <h2 v-if="title" class="empty-title">{{ title }}</h2>
    <p v-if="desc" class="empty-desc">{{ desc }}</p>
    <slot name="action" />
  </div>
</template>

<script setup>
defineProps({
  icon:  { type: String, default: '' },
  title: { type: String, default: '' },
  desc:  { type: String, default: '' }
});
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-6);
  text-align: center;
}
.empty-icon { font-size: 56px; margin-bottom: var(--space-6); opacity: 0.5; }
.empty-title { font-size: var(--text-xl); color: var(--text-secondary); margin: 0 0 var(--space-2); font-weight: var(--font-semibold); }
.empty-desc  { font-size: var(--text-base); color: var(--text-muted); margin: 0; line-height: var(--leading-relaxed); }
</style>
