<template>
  <label
    v-for="opt in options"
    :key="opt.value"
    :class="['base-radio', { 'radio-disabled': disabled || opt.disabled }]"
  >
    <input
      type="radio"
      :value="opt.value"
      :checked="modelValue === opt.value"
      :disabled="disabled || opt.disabled"
      :name="name"
      class="radio-input"
      @change="$emit('update:modelValue', opt.value)"
    />
    <span :class="['radio-circle', { checked: modelValue === opt.value }]">
      <span v-if="modelValue === opt.value" class="radio-dot"></span>
    </span>
    <span class="radio-label">{{ opt.label }}</span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  options:    { type: Array, required: true },
  name:       { type: String, default: '' },
  disabled:   { type: Boolean, default: false }
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.base-radio {
  display: inline-flex; align-items: center; gap: var(--space-2);
  cursor: pointer; min-height: var(--tap-min); user-select: none;
  padding: var(--space-1) 0;
}
.radio-disabled { opacity: 0.5; cursor: not-allowed; }
.radio-input { position: absolute; opacity: 0; width: 0; height: 0; }

.radio-circle {
  width: 20px; height: 20px; border-radius: 50%;
  border: 2px solid var(--border-normal); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: border-color var(--duration-fast);
}
.radio-circle.checked { border-color: var(--brand-400); }
.radio-dot {
  width: 10px; height: 10px; border-radius: 50%; background: var(--brand-400);
}
.radio-label { font-size: var(--text-base); color: var(--text-primary); }
</style>
