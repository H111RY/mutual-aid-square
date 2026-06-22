<template>
  <header class="group-header">
    <BaseButton variant="ghost" size="sm" @click="$router.back()">← 返回</BaseButton>
    <div class="header-center" @click="showInfo = !showInfo">
      <div class="group-avatar-sm">🏢</div>
      <div class="group-info-sm">
        <span class="group-name">{{ group?.name || '群聊' }}</span>
        <span class="group-count">{{ group?.member_count || 0 }} 人</span>
      </div>
    </div>
    <div class="header-actions">
      <BaseButton variant="ghost" size="sm" @click="showMembers = true" title="成员">👥</BaseButton>
      <BaseButton variant="ghost" size="sm" @click="$emit('settings')" title="设置">⋯</BaseButton>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import BaseButton from '@/components/ui/BaseButton.vue';

defineProps({ group: { type: Object, default: () => ({}) } });
defineEmits(['settings']);

const showInfo = ref(false);
const showMembers = ref(false);
</script>

<style scoped>
.group-header {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  height: var(--header-height); padding: 0 var(--space-3);
  background: var(--bg-card); border-bottom: 1px solid var(--border-light);
}
.header-center { display: flex; align-items: center; gap: var(--space-3); cursor: pointer; }
.group-avatar-sm {
  width: 36px; height: 36px; border-radius: var(--radius-sm);
  background: var(--brand-50); display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
}
.group-info-sm { display: flex; flex-direction: column; gap: 1px; }
.group-name { font-size: var(--text-lg); font-weight: var(--font-semibold); }
.group-count { font-size: var(--text-xs); color: var(--text-muted); }

.header-actions { display: flex; align-items: center; gap: var(--space-1); }
</style>
