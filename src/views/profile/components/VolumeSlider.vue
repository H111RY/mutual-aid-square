<template>
  <div class="volume-slider-item">
    <div class="slider-info">
      <span v-if="icon" class="slider-icon">{{ icon }}</span>
      <div class="slider-text">
        <span class="slider-label">{{ label }}</span>
        <span class="slider-value">{{ modelValue }}</span>
      </div>
    </div>
    <div class="slider-control">
      <input
        type="range"
        :min="min"
        :max="max"
        :value="modelValue"
        class="volume-range"
        @input="$emit('update:modelValue', Number($event.target.value))"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Number, default: 50 },
  label: { type: String, required: true },
  icon: { type: String, default: '' },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.volume-slider-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-light);
}
.volume-slider-item:last-child { border-bottom: none; }

.slider-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.slider-icon { font-size: var(--text-xl); flex-shrink: 0; }
.slider-text {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
}
.slider-label {
  font-size: var(--text-base);
  color: var(--text-primary);
  font-weight: var(--font-medium);
}
.slider-value {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--brand-500);
  min-width: var(--tap-min);
  text-align: right;
}

.slider-control { padding: 0; }
.volume-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--gray-200);
  outline: none;
  cursor: pointer;
}
.volume-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: var(--text-2xl);
  height: var(--text-2xl);
  border-radius: 50%;
  background: var(--brand-400);
  border: 3px solid #fff;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}
.volume-range::-moz-range-thumb {
  width: var(--text-2xl);
  height: var(--text-2xl);
  border-radius: 50%;
  background: var(--brand-400);
  border: 3px solid #fff;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}

/* large font */
:global(.font-large) .volume-range { height: var(--space-4); }
:global(.font-large) .volume-range::-webkit-slider-thumb { width: var(--space-10); height: var(--space-10); }
:global(.font-large) .volume-range::-moz-range-thumb { width: var(--space-10); height: var(--space-10); }
</style>
