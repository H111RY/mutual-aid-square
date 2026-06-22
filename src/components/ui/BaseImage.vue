<template>
  <div :class="['base-image', { 'img-loading': loading, 'img-error': error }]" :style="wrapperStyle">
    <img
      v-show="!error"
      :src="src"
      :alt="alt"
      class="img-real"
      :style="imgStyle"
      loading="lazy"
      @load="onLoad"
      @error="onError"
    />
    <div v-if="loading" class="img-placeholder skeleton-shape"></div>
    <div v-if="error" class="img-fallback">
      <span class="fallback-icon">🖼</span>
      <span v-if="fallbackText" class="fallback-text">{{ fallbackText }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  src:       { type: String, required: true },
  alt:       { type: String, default: '' },
  ratio:     { type: String, default: '' },
  fit:       { type: String, default: 'cover' },
  radius:    { type: String, default: 'var(--radius-sm)' },
  fallbackText: { type: String, default: '' }
});

const loading = ref(true);
const error = ref(false);

const wrapperStyle = computed(() => ({
  aspectRatio: props.ratio || undefined,
  borderRadius: props.radius
}));
const imgStyle = computed(() => ({ objectFit: props.fit }));

function onLoad()  { loading.value = false; }
function onError() { loading.value = false; error.value = true; }
</script>

<style scoped>
.base-image {
  position: relative;
  overflow: hidden;
  background: var(--gray-200);
}
.img-real { width: 100%; height: 100%; display: block; }
.img-placeholder, .img-fallback {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
}
.img-fallback { background: var(--gray-100); flex-direction: column; gap: 4px; }
.fallback-icon { font-size: 28px; opacity: 0.5; }
.fallback-text { font-size: var(--text-xs); color: var(--text-muted); }

.skeleton-shape {
  background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
