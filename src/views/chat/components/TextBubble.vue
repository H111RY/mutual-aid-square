<template>
  <div :class="['text-bubble', { mine }]">
    <p class="bubble-text">{{ msg.content }}</p>
    <span v-if="mine && msg._status === 'sending'" class="status-icon sending">⏳</span>
    <span v-else-if="mine && msg._status === 'failed'" class="status-icon failed" @click="$emit('retry')" title="重新发送">⚠️</span>
  </div>
</template>

<script setup>
defineProps({
  msg: { type: Object, required: true },
  mine: { type: Boolean, default: false }
});
defineEmits(['retry']);
</script>

<style scoped>
.text-bubble {
  display: inline-block; position: relative;
  max-width: 75%; padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--bg-card); color: var(--text-primary);
  box-shadow: var(--shadow-xs); word-break: break-word;
}
.text-bubble.mine {
  background: var(--brand-400); color: #fff;
}
.bubble-text {
  margin: 0; font-size: var(--text-base); line-height: var(--leading-relaxed);
  white-space: pre-wrap;
}
.status-icon {
  position: absolute; bottom: -4px; right: -20px;
  font-size: 14px; cursor: default;
}
.status-icon.failed { cursor: pointer; color: var(--red-500); }
</style>
