<template>
  <div class="textarea-group">
    <label v-if="label" :for="textareaId" class="textarea-label">{{ label }}</label>
    <textarea
      :id="textareaId"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :class="['textarea-field', textareaClass]"
      v-bind="$attrs"
      @input="onInput"
      @blur="$emit('blur', $event)"
    ></textarea>
    <div v-if="showCount || maxlength" class="textarea-footer">
      <span v-if="maxlength" class="textarea-count">{{ currentLength }}/{{ maxlength }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

let uid = 0;
const textareaId = `textarea-${++uid}`;

const props = defineProps({
  modelValue:  { type: String, default: '' },
  placeholder: { type: String, default: '' },
  label:       { type: String, default: '' },
  disabled:    { type: Boolean, default: false },
  rows:        { type: Number, default: 4 },
  maxlength:   { type: Number, default: 0 },
  showCount:   { type: Boolean, default: false },
  textareaClass: { type: String, default: '' }
});
const emit = defineEmits(['update:modelValue', 'blur']);

const currentLength = computed(() => (props.modelValue || '').length);

function onInput(e) { emit('update:modelValue', e.target.value); }
</script>

<style scoped>
.textarea-group { display: flex; flex-direction: column; gap: 6px; }
.textarea-label { font-size: var(--text-sm); font-weight: var(--font-semibold); color: var(--text-secondary); }
.textarea-field {
  width: 100%; padding: var(--space-3) var(--space-4);
  font-size: var(--text-base); font-family: inherit;
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
  border: 1px solid var(--border-normal);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  outline: none; resize: vertical;
  transition: border-color var(--duration-fast);
}
.textarea-field:focus { border-color: var(--brand-400); box-shadow: 0 0 0 3px var(--brand-100); }
.textarea-field::placeholder { color: var(--text-muted); }
.textarea-field:disabled { background: var(--gray-50); color: var(--text-muted); }

.textarea-footer { display: flex; justify-content: flex-end; }
.textarea-count { font-size: var(--text-xs); color: var(--text-muted); }
</style>
