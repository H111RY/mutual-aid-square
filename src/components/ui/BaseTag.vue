<template>
  <span
    :class="['base-tag', `tag-${color}`, `tag-${size}`, {
      'tag-clickable': clickable,
      'tag-removable': removable,
      'tag-round': round
    }]"
    @click="clickable && $emit('click', $event)"
  >
    <slot />
    <button
      v-if="removable"
      class="tag-remove-btn"
      @click.stop="$emit('remove', $event)"
      aria-label="移除"
    >&times;</button>
  </span>
</template>

<script setup>
defineProps({
  color:     { type: String, default: 'default' },
  size:      { type: String, default: 'md' },
  round:     { type: Boolean, default: false },
  clickable: { type: Boolean, default: false },
  removable: { type: Boolean, default: false }
});
defineEmits(['click', 'remove']);
</script>

<style scoped>
.base-tag {
  display: inline-flex; align-items: center; gap: 4px;
  font-weight: var(--font-medium); white-space: nowrap; user-select: none;
  transition: all var(--duration-fast);
}
.tag-sm { padding: 2px 10px; font-size: var(--text-xs); border-radius: 4px; }
.tag-md { padding: 4px 14px; font-size: var(--text-sm); border-radius: 6px; }
.tag-lg { padding: 6px 18px; font-size: var(--text-base); border-radius: 8px; }

.tag-round { border-radius: var(--radius-full); }
.tag-clickable { cursor: pointer; }
.tag-clickable:active { transform: scale(0.96); }

.tag-default   { background: var(--gray-100); color: var(--text-secondary); }
.tag-primary   { background: var(--brand-50); color: var(--brand-600); }
.tag-success   { background: var(--green-50); color: var(--green-600); }
.tag-danger    { background: var(--red-50);  color: var(--red-600); }
.tag-warning   { background: var(--amber-50); color: var(--amber-700); }
.tag-info      { background: var(--blue-50); color: var(--blue-600); }
.tag-purple    { background: var(--purple-50); color: var(--purple-600); }

.tag-clickable.tag-primary:hover { background: var(--brand-100); }
.tag-clickable.tag-success:hover { background: var(--green-100); }

.tag-remove-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; border-radius: 50%;
  border: none; background: rgba(0,0,0,0.1); color: inherit;
  font-size: 12px; line-height: 1; cursor: pointer; padding: 0; margin-left: 2px;
}
.tag-remove-btn:hover { background: rgba(0,0,0,0.2); }
</style>
