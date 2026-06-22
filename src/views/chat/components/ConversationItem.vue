<template>
  <div
    :class="['conversation-item', { unread: conv.unread_count > 0 }]"
    @click="$emit('click', conv)"
  >
    <BaseAvatar :src="conv.peer?.avatar" :name="conv.peer?.nickname || '?'" size="lg" />
    <div class="conv-info">
      <div class="conv-top">
        <span class="conv-name">{{ conv.peer?.nickname || '用户' }}</span>
        <span class="conv-building">{{ conv.peer?.building || '' }}</span>
        <span class="conv-time">{{ conv.timeText }}</span>
      </div>
      <div class="conv-bottom">
        <span class="conv-preview">{{ conv.lastPreview || '暂无消息' }}</span>
        <UnreadBadge :count="conv.unread_count || 0" />
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseAvatar from '@/components/ui/BaseAvatar.vue';
import UnreadBadge from './UnreadBadge.vue';

defineProps({ conv: { type: Object, required: true } });
defineEmits(['click']);
</script>

<style scoped>
.conversation-item {
  display: flex; align-items: center; gap: var(--space-4);
  padding: var(--space-4); cursor: pointer;
  border-bottom: 1px solid var(--border-light);
  transition: background var(--duration-fast);
}
.conversation-item:active { background: var(--gray-50); }
.conversation-item.unread { background: var(--brand-50); }

.conv-info { flex: 1; min-width: 0; }
.conv-top { display: flex; align-items: center; gap: var(--space-2); margin-bottom: 4px; }
.conv-name { font-size: var(--text-lg); font-weight: var(--font-semibold); }
.conv-building { font-size: var(--text-sm); color: var(--text-muted); flex: 1; }
.conv-time { font-size: var(--text-xs); color: var(--text-muted); flex-shrink: 0; }

.conv-bottom { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); }
.conv-preview {
  font-size: var(--text-sm); color: var(--text-secondary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
</style>
