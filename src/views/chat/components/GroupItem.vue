<template>
  <div
    :class="['group-item', { unread: group.unread_count > 0 }]"
    @click="$emit('click', group)"
  >
    <div class="group-avatar">
      <span class="group-avatar-icon">🏢</span>
    </div>
    <div class="group-info">
      <div class="group-top">
        <span class="group-name">{{ group.name }}</span>
        <span v-if="group.is_muted" class="mute-icon">🔕</span>
        <span class="group-time">{{ group.timeText }}</span>
      </div>
      <div class="group-bottom">
        <span class="group-preview">{{ group.lastPreview || '暂无消息' }}</span>
        <UnreadBadge v-if="!group.is_muted" :count="group.unread_count || 0" />
        <span v-else class="muted-count">{{ group.unread_count || 0 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import UnreadBadge from './UnreadBadge.vue';

defineProps({ group: { type: Object, required: true } });
defineEmits(['click']);
</script>

<style scoped>
.group-item {
  display: flex; align-items: center; gap: var(--space-4);
  padding: var(--space-4); cursor: pointer;
  border-bottom: 1px solid var(--border-light);
  transition: background var(--duration-fast);
}
.group-item:active { background: var(--gray-50); }
.group-item.unread { background: var(--brand-50); }

.group-avatar {
  width: 48px; height: 48px; border-radius: var(--radius-md);
  background: var(--brand-50); display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.group-avatar-icon { font-size: 24px; }

.group-info { flex: 1; min-width: 0; }
.group-top { display: flex; align-items: center; gap: var(--space-2); margin-bottom: 4px; }
.group-name { font-size: var(--text-lg); font-weight: var(--font-semibold); }
.mute-icon { font-size: 14px; }
.group-time { font-size: var(--text-xs); color: var(--text-muted); margin-left: auto; flex-shrink: 0; }

.group-bottom { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); }
.group-preview {
  font-size: var(--text-sm); color: var(--text-secondary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.muted-count { font-size: var(--text-xs); color: var(--text-muted); }
</style>
