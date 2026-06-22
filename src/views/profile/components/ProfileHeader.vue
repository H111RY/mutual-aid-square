<template>
  <div class="profile-header-card" :class="{ 'large-font': store.isLargeFont }">
    <div class="header-top">
      <div class="avatar-wrap">
        <img v-if="app.user.avatar" :src="app.user.avatar" class="avatar-img" alt="头像" />
        <span v-else class="avatar-placeholder">{{ avatarInitial }}</span>
      </div>
      <div class="header-info">
        <h2 class="header-nickname">{{ app.user.nickname || '社区成员' }}</h2>
        <span class="header-building">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" class="building-icon">
            <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" stroke-width="2"/>
            <rect x="8" y="10" width="8" height="12" stroke="currentColor" stroke-width="2"/>
          </svg>
          {{ app.user.building || '未绑定楼栋' }}
        </span>
      </div>
      <BaseButton variant="ghost" size="sm" @click="$emit('edit-profile')">编辑</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAppStore } from '@/stores/app';
import { useSquareStore } from '@/stores/square';
import BaseButton from '@/components/ui/BaseButton.vue';

const app = useAppStore();
const store = useSquareStore();

defineEmits(['edit-profile']);

const avatarInitial = computed(() => {
  const name = app.user.nickname || '社';
  return name.charAt(0);
});
</script>

<style scoped>
.profile-header-card {
  background: linear-gradient(135deg, var(--brand-50), #e8f0fe);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  border: 1px solid var(--brand-100);
}
.header-top {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}
.avatar-wrap {
  width: var(--space-12); height: var(--space-12);
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--brand-400);
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-placeholder {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: #fff;
}
.header-info { flex: 1; min-width: 0; }
.header-nickname {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1);
}
.header-building {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
.building-icon { flex-shrink: 0; }
</style>
