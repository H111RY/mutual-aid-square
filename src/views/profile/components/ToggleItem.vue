<template>
  <label :class="['toggle-item', { 'toggle-disabled': disabled, 'toggle-forced': forced }]">
    <div class="toggle-info">
      <span v-if="icon" class="toggle-icon">{{ icon }}</span>
      <div class="toggle-text">
        <span class="toggle-label">{{ label }}</span>
        <span v-if="hint" class="toggle-hint">{{ hint }}</span>
      </div>
    </div>
    <div class="toggle-right">
      <span v-if="forcedHint" class="toggle-forced-hint">{{ forcedHint }}</span>
      <button
        type="button"
        role="switch"
        :aria-checked="modelValue"
        :class="['toggle-switch', { active: modelValue }]"
        :disabled="disabled"
        @click="toggle"
      >
        <span class="toggle-knob"></span>
      </button>
    </div>
  </label>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  icon: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  forced: { type: Boolean, default: false },
  forcedHint: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue']);

function toggle() {
  if (props.disabled) return;
  emit('update:modelValue', !props.modelValue);
}
</script>

<style scoped>
.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  min-height: var(--tap-comfortable);
  cursor: pointer;
  border-bottom: 1px solid var(--border-light);
  transition: background var(--duration-fast);
}
.toggle-item:last-child { border-bottom: none; }
.toggle-item:hover { background: var(--gray-50); }
.toggle-disabled { opacity: 0.5; cursor: not-allowed; }
.toggle-disabled:hover { background: transparent; }

.toggle-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}
.toggle-icon { font-size: var(--text-xl); flex-shrink: 0; }
.toggle-text { display: flex; flex-direction: column; gap: var(--space-1); }
.toggle-label {
  font-size: var(--text-base);
  color: var(--text-primary);
  font-weight: var(--font-medium);
}
.toggle-hint {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.toggle-right { display: flex; align-items: center; gap: var(--space-2); flex-shrink: 0; }
.toggle-forced-hint { font-size: var(--text-xs); color: var(--red-500); font-weight: var(--font-medium); }

.toggle-switch {
  position: relative;
  width: var(--space-12);
  height: var(--text-2xl);
  border-radius: var(--radius-full);
  border: none;
  background: var(--gray-300);
  cursor: pointer;
  transition: background var(--duration-fast);
  flex-shrink: 0;
}
.toggle-switch.active { background: var(--brand-400); }
.toggle-switch:disabled { cursor: not-allowed; }

.toggle-knob {
  position: absolute;
  top: var(--space-1);
  left: var(--space-1);
  width: var(--text-xl);
  height: var(--text-xl);
  border-radius: 50%;
  background: #fff;
  box-shadow: var(--shadow-sm);
  transition: transform var(--duration-fast);
}
.toggle-switch.active .toggle-knob { transform: translateX(calc(var(--space-12) - var(--text-xl) - var(--space-1) * 2)); }

/* large font */
:global(.font-large) .toggle-item { min-height: 64px; padding: var(--space-4); }
:global(.font-large) .toggle-switch { width: calc(var(--space-12) + var(--space-2)); height: calc(var(--text-2xl) + var(--space-1)); }
:global(.font-large) .toggle-knob { width: calc(var(--text-xl) + var(--space-1)); height: calc(var(--text-xl) + var(--space-1)); }
:global(.font-large) .toggle-switch.active .toggle-knob { transform: translateX(calc(var(--space-12) + var(--space-2) - (var(--text-xl) + var(--space-1)) - var(--space-1) * 2)); }
</style>
