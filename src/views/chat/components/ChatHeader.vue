<template>
  <header class="chat-header">
    <BaseButton variant="ghost" size="sm" @click="$router.back()">← 返回</BaseButton>
    <div class="header-center" @click="showProfile = true">
      <BaseAvatar :src="peer?.avatar" :name="peer?.nickname || '?'" size="md" />
      <div class="peer-info">
        <span class="peer-name">{{ peer?.nickname || '用户' }}</span>
        <span class="peer-building">{{ peer?.building || '' }}</span>
      </div>
    </div>
    <BaseButton variant="ghost" size="sm" @click="showReport = true" title="举报">⋯</BaseButton>

    <!-- 举报面板 -->
    <Teleport to="body">
      <ReportPanel v-if="showReport" @close="showReport = false" :target="reportTarget" />
    </Teleport>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Teleport } from 'vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAvatar from '@/components/ui/BaseAvatar.vue';
import ReportPanel from './ReportPanel.vue';

const props = defineProps({
  peer: { type: Object, default: () => ({}) },
  conversationId: { type: String, default: '' }
});

const showReport = ref(false);
const showProfile = ref(false);

const reportTarget = computed(() => ({
  type: 'user',
  id: props.conversationId,
  name: props.peer?.nickname || '用户'
}));
</script>

<style scoped>
.chat-header {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  height: var(--header-height); padding: 0 var(--space-4);
  background: var(--bg-card); border-bottom: 1px solid var(--border-light);
}
.header-center {
  display: flex; align-items: center; gap: var(--space-3); cursor: pointer;
}
.peer-info { display: flex; flex-direction: column; gap: 2px; }
.peer-name { font-size: var(--text-lg); font-weight: var(--font-semibold); }
.peer-building { font-size: var(--text-sm); color: var(--text-muted); }
</style>
