<template>
  <div
    v-if="msg"
    :class="['pinned-msg', { dismissed: isDismissed }]"
  >
    <span class="pin-icon">📌</span>
    <div class="pin-content">
      <span class="pin-sender">{{ msg.sender?.nickname || '群主' }}：</span>
      <span class="pin-text">{{ (msg.content || '').slice(0, 50) }}</span>
    </div>
    <button class="pin-dismiss" @click="isDismissed = true" title="不再显示">✕</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({ msg: { type: Object, required: true } });

const isDismissed = ref(false);
</script>

<style scoped>
.pinned-msg {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--amber-50); border-bottom: 1px solid var(--amber-500);
  transition: all var(--duration-normal);
}
.pinned-msg.dismissed {
  max-height: 0; padding-top: 0; padding-bottom: 0; overflow: hidden; border-bottom: none;
}
.pin-icon { font-size: 14px; flex-shrink: 0; }
.pin-content {
  flex: 1; min-width: 0; overflow: hidden; display: flex;
}
.pin-sender { font-size: var(--text-sm); font-weight: var(--font-semibold); flex-shrink: 0; }
.pin-text {
  font-size: var(--text-sm); color: var(--text-secondary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.pin-dismiss {
  min-width: var(--tap-min); min-height: var(--tap-min);
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; color: var(--text-muted); cursor: pointer;
  font-size: var(--text-sm); flex-shrink: 0;
}
</style>
