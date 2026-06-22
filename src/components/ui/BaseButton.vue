<template>
  <button
    :class="[
      'base-btn',
      `btn-${variant}`,
      `btn-${size}`,
      { 'btn-block': block, 'btn-loading': loading, 'btn-round': round }
    ]"
    :disabled="disabled || loading"
    :type="nativeType"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="btn-spinner"></span>
    <slot v-if="$slots.icon && !loading" name="icon" />
    <span v-if="$slots.default" class="btn-text"><slot /></span>
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  size:    { type: String, default: 'md' },
  block:   { type: Boolean, default: false },
  round:   { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  disabled:{ type: Boolean, default: false },
  nativeType: { type: String, default: 'button' }
});
defineEmits(['click']);
</script>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: inherit;
  font-weight: var(--font-semibold);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  outline: none;
  user-select: none;
  white-space: nowrap;
  position: relative;
}
.base-btn:focus-visible { box-shadow: 0 0 0 3px var(--brand-200); }
.base-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* Sizes */
.btn-sm { padding: 6px 16px; font-size: var(--text-sm); min-height: 36px; border-radius: var(--radius-sm); }
.btn-md { padding: 10px 24px; font-size: var(--text-base); min-height: var(--tap-min); border-radius: var(--radius-md); }
.btn-lg { padding: 14px 32px; font-size: var(--text-lg); min-height: var(--tap-comfortable); border-radius: var(--radius-md); }

/* Variants */
.btn-primary { background: var(--brand-400); color: #fff; }
.btn-primary:hover:not(:disabled) { background: var(--brand-500); }
.btn-primary:active:not(:disabled) { background: var(--brand-600); transform: scale(0.98); }

.btn-secondary { background: var(--brand-50); color: var(--brand-500); }
.btn-secondary:hover:not(:disabled) { background: var(--brand-100); }
.btn-secondary:active:not(:disabled) { background: var(--brand-200); }

.btn-outline { background: transparent; border-color: var(--border-normal); color: var(--text-secondary); }
.btn-outline:hover:not(:disabled) { border-color: var(--brand-400); color: var(--brand-400); }
.btn-outline:active:not(:disabled) { background: var(--brand-50); }

.btn-danger { background: var(--red-500); color: #fff; }
.btn-danger:hover:not(:disabled) { background: var(--red-700); }
.btn-danger:active:not(:disabled) { transform: scale(0.98); }

.btn-ghost { background: transparent; color: var(--text-secondary); }
.btn-ghost:hover:not(:disabled) { background: var(--gray-100); }
.btn-ghost:active:not(:disabled) { background: var(--gray-200); }

/* Block */
.btn-block { width: 100%; }

/* Round */
.btn-round { border-radius: var(--radius-full); }

/* Loading */
.btn-loading { pointer-events: none; }
.btn-spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
