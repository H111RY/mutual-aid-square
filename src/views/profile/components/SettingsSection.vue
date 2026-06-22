<template>
  <section class="settings-section">
    <h3 v-if="title" class="section-title">{{ title }}</h3>
    <p v-if="desc" class="section-desc">{{ desc }}</p>
    <div class="section-body">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  desc: { type: String, default: '' }
});
</script>

<style scoped>
.settings-section {
  margin-bottom: var(--space-4);
}
.section-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1);
  padding-left: var(--space-3);
  border-left: 3px solid var(--brand-400);
}
.section-desc {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0 0 var(--space-3);
  padding-left: calc(var(--space-3) + 3px);
}
.section-body {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  overflow: hidden;
}
</style>
