<template>
  <div :class="['input-group', { 'has-error': error }]">
    <label v-if="label" :for="inputId" class="input-label">{{ label }}</label>
    <div class="input-wrap">
      <span v-if="$slots.prefix" class="input-prefix"><slot name="prefix" /></span>
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="['input-field', inputClass]"
        v-bind="$attrs"
        @input="onInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      <span v-if="$slots.suffix" class="input-suffix"><slot name="suffix" /></span>
    </div>
    <p v-if="error" class="input-error">{{ error }}</p>
    <p v-else-if="hint" class="input-hint">{{ hint }}</p>
  </div>
</template>

<script setup>
let id = 0;
const inputId = `input-${++id}`;

defineProps({
  modelValue:  { type: [String, Number], default: '' },
  type:        { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  label:       { type: String, default: '' },
  hint:        { type: String, default: '' },
  error:       { type: String, default: '' },
  disabled:    { type: Boolean, default: false },
  readonly:    { type: Boolean, default: false },
  inputClass:  { type: String, default: '' }
});
const emit = defineEmits(['update:modelValue', 'blur', 'focus']);

function onInput(e) { emit('update:modelValue', e.target.value); }
</script>

<style scoped>
.input-group { display: flex; flex-direction: column; gap: 6px; }
.input-label { font-size: var(--text-sm); font-weight: var(--font-semibold); color: var(--text-secondary); }
.input-wrap {
  display: flex; align-items: center;
  border: 1px solid var(--border-normal);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  overflow: hidden;
  transition: border-color var(--duration-fast);
}
.input-wrap:focus-within { border-color: var(--brand-400); box-shadow: 0 0 0 3px var(--brand-100); }
.has-error .input-wrap { border-color: var(--red-500); }
.has-error .input-wrap:focus-within { box-shadow: 0 0 0 3px var(--red-50); }

.input-field {
  flex: 1; border: none; outline: none;
  padding: 10px var(--space-3);
  font-size: var(--text-base); font-family: inherit;
  line-height: var(--leading-normal);
  color: var(--text-primary);
  background: transparent;
  min-height: var(--tap-min);
}
.input-field::placeholder { color: var(--text-muted); }
.input-field:disabled { background: var(--gray-50); color: var(--text-muted); }

.input-prefix, .input-suffix {
  display: flex; align-items: center; padding: 0 var(--space-3);
  color: var(--text-muted); font-size: var(--text-base);
}
.input-hint  { font-size: var(--text-xs); color: var(--text-muted); margin: 0; }
.input-error { font-size: var(--text-xs); color: var(--red-500); margin: 0; }
</style>
