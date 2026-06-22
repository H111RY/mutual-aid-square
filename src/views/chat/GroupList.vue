<template>
  <div class="group-list-page">
    <MessageTopNav title="楼栋群聊" />

    <div v-if="store.groupLoading && store.groups.length === 0" class="loading-state">
      <BaseSkeleton variant="card" :count="3" />
    </div>

    <div v-else-if="store.groups.length > 0" class="group-list">
      <GroupItem
        v-for="g in store.groups"
        :key="g.id"
        :group="g"
        @click="goGroup(g)"
      />
    </div>

    <div v-else class="empty-wrapper">
      <BaseEmpty icon="🏢" title="暂无群聊" desc="完成楼栋选择后，将自动加入楼栋专属群聊" />
      <BaseButton variant="primary" @click="$router.push('/square')" style="margin-top:16px">
        去完善信息
      </BaseButton>
    </div>

    <div class="safe-bottom"></div>
  </div>
</template>

<script setup>
import { onMounted, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import { useGroupStore } from '@/stores/group';
import MessageTopNav from './components/MessageTopNav.vue';
import GroupItem from './components/GroupItem.vue';
import BaseEmpty from '@/components/ui/BaseEmpty.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue';

const router = useRouter();
const store = useGroupStore();

onMounted(() => { store.fetchGroups(); });
onActivated(() => { store.fetchGroups(); });

function goGroup(group) {
  router.push(`/group/${group.id}`);
}
</script>

<style scoped>
.group-list-page {
  min-height: 100vh; background: var(--bg-page);
  max-width: var(--content-max); margin: 0 auto;
}
.loading-state { padding: var(--space-4); }
.group-list { background: var(--bg-card); border-radius: var(--radius-md); margin: var(--space-4); }
.empty-wrapper {
  display: flex; flex-direction: column; align-items: center;
  padding-top: 100px;
}
.safe-bottom { height: 60px; }
</style>
