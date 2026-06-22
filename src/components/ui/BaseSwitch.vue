<template>
  <label :class="['base-switch', { 'switch-disabled': disabled }]">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="switch-input"
      @change="$emit('update:modelValue', ($event.target).checked)"
    />
    <span :class="['switch-track', { on: modelValue }]">
      <span :class="['switch-thumb', { on: modelValue }]"></span>
    </span>
    <span v-if="$slots.default || label" class="switch-label"><slot>{{ label }}</slot></span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label:      { type: String, default: '' },
  disabled:   { type: Boolean, default: false }
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.base-switch {
  display: inline-flex; align-items: center; gap: var(--space-3); cursor: pointer;
  user-select: none; min-height: var(--tap-min);
}
.switch-disabled { opacity: 0.5; cursor: not-allowed; }
.switch-input { position: absolute; opacity: 0; width: 0; height: 0; }

.switch-track {
  width: 44px; height: 24px; border-radius: var(--radius-full);
  background: var(--gray-300); position: relative;
  transition: background var(--duration-fast);
  flex-shrink: 0;
}
.switch-track.on { background: var(--brand-400); }
.switch-thumb {
  position: absolute; top: 2px; left: 2px;
  width: 20px; height: 20px; border-radius: 50%;
  background: #fff; box-shadow: var(--shadow-sm);
  transition: transform var(--duration-fast) var(--ease-out);
}
.switch-thumb.on { transform: translateX(20px); }

.switch-label { font-size: var(--text-base); color: var(--text-primary); }
</style>
