<template>
  <div v-if="notice" class="notice-bar" :class="{ expanded: isExpanded }">
    <div class="notice-top" @click="isExpanded = !isExpanded">
      <span class="notice-icon">📢</span>
      <span class="notice-preview">{{ isExpanded ? notice : (notice || '').slice(0, 60) + '...' }}</span>
      <span class="notice-toggle">{{ isExpanded ? '收起' : '展开' }}</span>
    </div>
    <div v-if="isExpanded && canEdit" class="notice-edit">
      <BaseButton variant="primary" size="sm" @click="$emit('edit')">编辑公告</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BaseButton from '@/components/ui/BaseButton.vue';

defineProps({
  notice: { type: String, default: '' },
  canEdit: { type: Boolean, default: false }
});
defineEmits(['edit']);

const isExpanded = ref(false);
</script>

<style scoped>
.notice-bar {
  background: var(--amber-50); border-bottom: 1px solid var(--amber-500);
  padding: var(--space-2) var(--space-4); cursor: pointer;
}
.notice-top {
  display: flex; align-items: center; gap: var(--space-2);
}
.notice-icon { font-size: 16px; flex-shrink: 0; }
.notice-preview {
  flex: 1; font-size: var(--text-sm); color: var(--amber-700);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.notice-bar.expanded .notice-preview {
  white-space: normal; overflow: visible;
}
.notice-toggle {
  font-size: var(--text-xs); color: var(--brand-400); flex-shrink: 0;
}
.notice-edit { margin-top: var(--space-2); display: flex; justify-content: flex-end; }
</style>
