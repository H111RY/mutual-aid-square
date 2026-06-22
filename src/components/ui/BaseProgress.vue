<template>
  <div :class="['progress-wrap', `progress-${variant}`]">
    <div class="progress-track">
      <div
        class="progress-fill"
        :style="{ width: clampedPercent + '%' }"
      >
        <div v-if="indeterminate" class="progress-indeterminate"></div>
      </div>
    </div>
    <span v-if="showPercent && !indeterminate" class="progress-text">{{ clampedPercent }}%</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  percent:      { type: Number, default: 0 },
  variant:      { type: String, default: 'primary' },
  showPercent:  { type: Boolean, default: false },
  indeterminate:{ type: Boolean, default: false }
});

const clampedPercent = computed(() => Math.min(100, Math.max(0, props.percent)));
</script>

<style scoped>
.progress-wrap { display: flex; align-items: center; gap: var(--space-3); width: 100%; }
.progress-track {
  flex: 1; height: 8px; border-radius: var(--radius-full);
  background: var(--gray-200); overflow: hidden;
}
.progress-fill {
  height: 100%; border-radius: var(--radius-full);
  transition: width 0.4s var(--ease-out);
}
.progress-primary .progress-fill { background: var(--brand-400); }
.progress-success .progress-fill { background: var(--green-500); }
.progress-danger  .progress-fill { background: var(--red-500); }
.progress-warning .progress-fill { background: var(--amber-500); }

.progress-indeterminate {
  width: 40%; height: 100%; border-radius: var(--radius-full);
  background: rgba(255,255,255,0.4);
  animation: indeterminate 1.4s ease-in-out infinite;
}
@keyframes indeterminate {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
}

.progress-text {
  font-size: var(--text-sm); font-weight: var(--font-semibold);
  color: var(--text-secondary); min-width: 36px; text-align: right;
}
</style>
