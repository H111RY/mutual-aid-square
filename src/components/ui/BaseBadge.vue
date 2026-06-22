<template>
  <span :class="['base-badge', `badge-${color}`]" v-bind="$attrs">
    <slot />
  </span>
</template>

<script setup>
defineProps({
  color: { type: String, default: 'default' }
});
</script>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 12px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  line-height: 1.6;
  white-space: nowrap;
}

.badge-default   { background: var(--gray-100); color: var(--text-secondary); }
.badge-primary   { background: var(--brand-50); color: var(--brand-500); }
.badge-success   { background: var(--green-50); color: var(--green-500); }
.badge-danger    { background: var(--red-50);  color: var(--red-500); }
.badge-warning   { background: var(--amber-50); color: var(--amber-700); }
.badge-info      { background: var(--blue-50); color: var(--blue-500); }
.badge-purple    { background: var(--purple-50); color: var(--purple-500); }
.badge-orange    { background: var(--orange-50); color: var(--orange-500); }
.badge-brown     { background: var(--brown-50); color: var(--brown-500); }
.badge-cyan      { background: var(--cyan-50); color: var(--cyan-500); }
</style>
