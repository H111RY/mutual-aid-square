<template>
  <div class="messages-page">
    <MessageTopNav title="消息中心" />

    <!-- Tab 切换 -->
    <div class="msg-tabs">
      <button
        :class="['msg-tab', { active: activeTab === 'chat' }]"
        @click="activeTab = 'chat'"
      >
        私信
        <UnreadBadge v-if="chatStore.totalUnread > 0" :count="chatStore.totalUnread" />
      </button>
      <button
        :class="['msg-tab', { active: activeTab === 'group' }]"
        @click="activeTab = 'group'"
      >
        群聊
        <UnreadBadge v-if="groupStore.totalGroupUnread > 0" :count="groupStore.totalGroupUnread" />
      </button>
    </div>

    <!-- 私信列表 -->
    <div v-if="activeTab === 'chat'" class="tab-content">
      <div v-if="chatStore.convLoading && chatStore.conversations.length === 0" class="loading-state">
        <BaseSkeleton variant="card" :count="3" />
      </div>
      <div v-else-if="chatStore.conversations.length > 0" class="conv-list">
        <ConversationItem
          v-for="conv in chatStore.conversations"
          :key="conv.id"
          :conv="conv"
          @click="goChat(conv)"
        />
      </div>
      <BaseEmpty v-else icon="💬" title="暂无私信" desc="在广场点击他人头像即可发起私信" />
    </div>

    <!-- 群聊列表 -->
    <div v-if="activeTab === 'group'" class="tab-content">
      <div v-if="groupStore.groupLoading && groupStore.groups.length === 0" class="loading-state">
        <BaseSkeleton variant="card" :count="3" />
      </div>
      <div v-else-if="groupStore.groups.length > 0" class="conv-list">
        <GroupItem
          v-for="g in groupStore.groups"
          :key="g.id"
          :group="g"
          @click="goGroup(g)"
        />
      </div>
      <BaseEmpty v-else icon="🏢" title="暂无群聊" desc="完成楼栋选择后自动加入楼栋群聊" />
    </div>

    <div class="safe-bottom"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useChatStore } from '@/stores/chat';
import { useGroupStore } from '@/stores/group';
import MessageTopNav from './components/MessageTopNav.vue';
import ConversationItem from './components/ConversationItem.vue';
import GroupItem from './components/GroupItem.vue';
import UnreadBadge from './components/UnreadBadge.vue';
import BaseEmpty from '@/components/ui/BaseEmpty.vue';
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue';

const router = useRouter();
const chatStore = useChatStore();
const groupStore = useGroupStore();

const activeTab = ref('chat');

onMounted(() => {
  chatStore.fetchConversations();
  groupStore.fetchGroups();
});

onActivated(() => {
  chatStore.fetchConversations();
  groupStore.fetchGroups();
});

function goChat(conv) { router.push(`/chat/${conv.id}`); }
function goGroup(group) { router.push(`/group/${group.id}`); }
</script>

<style scoped>
.messages-page {
  min-height: 100vh; background: var(--bg-page);
  max-width: var(--content-max); margin: 0 auto;
}

.msg-tabs {
  display: flex; background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
  position: sticky; top: var(--header-height); z-index: 99;
}
.msg-tab {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: var(--space-2);
  min-height: var(--tap-min); padding: var(--space-3); font-size: var(--text-lg);
  font-weight: var(--font-medium); color: var(--text-secondary);
  border-bottom: 3px solid transparent; cursor: pointer;
  transition: color var(--duration-fast); background: none; border-top: none;
  border-left: none; border-right: none; font-family: inherit;
}
.msg-tab.active {
  color: var(--brand-400); font-weight: var(--font-bold);
  border-bottom-color: var(--brand-400);
}

.tab-content { }
.loading-state { padding: var(--space-4); }
.conv-list { background: var(--bg-card); border-radius: var(--radius-md); margin: var(--space-4); }

.safe-bottom { height: 60px; }
</style>
