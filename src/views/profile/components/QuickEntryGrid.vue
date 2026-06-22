<template>
  <div class="quick-entry-grid">
    <button v-for="entry in entries" :key="entry.key" class="entry-item" @click="$emit('navigate', entry.route)">
      <span class="entry-icon">{{ entry.icon }}</span>
      <span class="entry-label">{{ entry.label }}</span>
      <span v-if="entry.badge && entry.badge > 0" class="entry-badge">{{ entry.badge > 99 ? '99+' : entry.badge }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  entries: {
    type: Array,
    required: true
    // { key, icon, label, route, badge }
  }
});

defineEmits(['navigate']);
</script>

<style scoped>
.quick-entry-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}
.entry-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-2);
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: inherit;
  transition: all var(--duration-fast);
  min-height: var(--tap-comfortable);
}
.entry-item:hover { border-color: var(--brand-200); background: var(--brand-50); }
.entry-item:active { transform: scale(0.96); }

.entry-icon { font-size: var(--text-3xl); }
.entry-label {
  font-size: var(--text-base);
  color: var(--text-primary);
  font-weight: var(--font-medium);
  text-align: center;
}
.entry-badge {
  position: absolute;
  top: var(--space-1);
  right: var(--space-1);
  min-width: var(--text-xl);
  height: var(--text-xl);
  padding: 0 var(--space-1);
  background: var(--red-500);
  color: #fff;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  line-height: var(--text-xl);
  text-align: center;
  border-radius: var(--radius-full);
}

/* large font */
:global(.font-large) .entry-item { min-height: 120px; }
:global(.font-large) .entry-icon { font-size: var(--text-3xl); }
:global(.font-large) .entry-badge { min-width: 28px; height: 28px; line-height: 28px; }

@media (max-width: 360px) {
  .quick-entry-grid { grid-template-columns: repeat(3, 1fr); gap: var(--space-2); }
}
</style>
