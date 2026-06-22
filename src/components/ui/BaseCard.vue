<template>
  <article :class="['base-card', { 'card-hover': hover, 'card-flat': flat }]" v-bind="$attrs">
    <div v-if="$slots.header" class="card-header"><slot name="header" /></div>
    <div v-if="$slots.default" class="card-body"><slot /></div>
    <div v-if="$slots.footer" class="card-footer"><slot name="footer" /></div>
  </article>
</template>

<script setup>
defineProps({
  hover: { type: Boolean, default: false },
  flat:  { type: Boolean, default: false }
});
</script>

<style scoped>
.base-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.card-flat { box-shadow: none; border: 1px solid var(--border-light); }
.card-hover:hover { box-shadow: var(--shadow-md); }

.card-header { padding: var(--space-4); border-bottom: 1px solid var(--border-light); }
.card-body   { padding: var(--space-4); }
.card-footer { padding: var(--space-4); border-top: 1px solid var(--border-light); }
</style>
