<template>
  <div :class="['checkbox-group', { 'group-inline': inline }]">
    <label
      v-for="opt in options"
      :key="opt.value"
      :class="['base-checkbox', { 'checkbox-disabled': disabled || opt.disabled }]"
    >
      <input
        type="checkbox"
        :value="opt.value"
        :checked="(modelValue || []).includes(opt.value)"
        :disabled="disabled || opt.disabled"
        class="checkbox-input"
        @change="onToggle(opt.value)"
      />
      <span :class="['checkbox-box', { checked: (modelValue || []).includes(opt.value) }]">
        <span v-if="(modelValue || []).includes(opt.value)" class="checkbox-mark">✓</span>
      </span>
      <span class="checkbox-label">{{ opt.label }}</span>
    </label>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options:    { type: Array, required: true },
  inline:     { type: Boolean, default: false },
  disabled:   { type: Boolean, default: false }
});
const emit = defineEmits(['update:modelValue']);

function onToggle(val) {
  const arr = [...props.modelValue];
  const idx = arr.indexOf(val);
  if (idx === -1) arr.push(val);
  else arr.splice(idx, 1);
  emit('update:modelValue', arr);
}
</script>

<style scoped>
.checkbox-group { display: flex; flex-direction: column; gap: var(--space-2); }
.checkbox-group.group-inline { flex-direction: row; flex-wrap: wrap; gap: var(--space-4); }

.base-checkbox {
  display: inline-flex; align-items: center; gap: var(--space-2);
  cursor: pointer; min-height: var(--tap-min); user-select: none;
}
.checkbox-disabled { opacity: 0.5; cursor: not-allowed; }
.checkbox-input { position: absolute; opacity: 0; width: 0; height: 0; }

.checkbox-box {
  width: 20px; height: 20px; border-radius: 4px;
  border: 2px solid var(--border-normal); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--duration-fast);
}
.checkbox-box.checked { background: var(--brand-400); border-color: var(--brand-400); }
.checkbox-mark { color: #fff; font-size: 13px; font-weight: var(--font-bold); line-height: 1; }

.checkbox-label { font-size: var(--text-base); color: var(--text-primary); }
</style>
