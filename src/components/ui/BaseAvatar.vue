<template>
  <div :class="['base-avatar', `avatar-${size}`]" :style="avatarStyle">
    <img
      v-if="src"
      :src="src"
      :alt="alt || name"
      class="avatar-img"
      @error="onError"
    />
    <span v-else class="avatar-text">{{ initial }}</span>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  src:  { type: String, default: '' },
  name: { type: String, default: '' },
  alt:  { type: String, default: '' },
  size: { type: String, default: 'md' },
  bg:   { type: String, default: '' }
});

const imgError = ref(false);

const initial = computed(() => {
  if (props.name) return props.name.charAt(0);
  return '?';
});

const avatarStyle = computed(() => {
  if (!props.src || imgError.value) {
    return { background: props.bg || 'var(--brand-200)', color: 'var(--brand-700)' };
  }
  return {};
});

function onError() { imgError.value = true; }
</script>

<style scoped>
.base-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  overflow: hidden;
  flex-shrink: 0;
  font-weight: var(--font-bold);
  user-select: none;
}

.avatar-sm  { width: 36px; height: 36px; font-size: var(--text-sm); }
.avatar-md  { width: 52px; height: 52px; font-size: var(--text-xl); }
.avatar-lg  { width: 68px; height: 68px; font-size: var(--text-2xl); }
.avatar-xl  { width: 88px; height: 88px; font-size: var(--text-3xl); }

.avatar-img {
  width: 100%; height: 100%;
  object-fit: cover;
}
.avatar-text { line-height: 1; }
</style>
