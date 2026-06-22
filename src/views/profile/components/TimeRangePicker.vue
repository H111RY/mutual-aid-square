<template>
  <div class="time-range-picker">
    <div class="picker-label">{{ label }}</div>
    <div class="picker-controls">
      <select :value="start" class="time-select" @change="$emit('update:start', $event.target.value)">
        <option v-for="t in timeOptions" :key="t" :value="t">{{ t }}</option>
      </select>
      <span class="picker-sep">至</span>
      <select :value="end" class="time-select" @change="$emit('update:end', $event.target.value)">
        <option v-for="t in timeOptions" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>
    <p v-if="hint" class="picker-hint">{{ hint }}</p>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, default: '免打扰时段' },
  start: { type: String, default: '22:00' },
  end: { type: String, default: '07:00' },
  hint: { type: String, default: '' }
});

defineEmits(['update:start', 'update:end']);

const timeOptions = [];
for (let h = 0; h < 24; h++) {
  const hh = String(h).padStart(2, '0');
  timeOptions.push(`${hh}:00`, `${hh}:30`);
}
</script>

<style scoped>
.time-range-picker {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-light);
}
.time-range-picker:last-child { border-bottom: none; }

.picker-label {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}
.picker-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.time-select {
  flex: 1;
  height: var(--tap-comfortable);
  padding: 0 var(--space-4);
  font-size: var(--text-lg);
  font-family: inherit;
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  background: var(--gray-50);
  border: 2px solid var(--border-normal);
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: center;
  appearance: none;
  -webkit-appearance: none;
}
.time-select:focus {
  border-color: var(--brand-400);
  outline: none;
}
.picker-sep {
  font-size: var(--text-lg);
  color: var(--text-muted);
  font-weight: var(--font-medium);
  flex-shrink: 0;
}
.picker-hint {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin: var(--space-2) 0 0;
}
</style>
