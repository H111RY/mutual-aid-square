<template>
  <div class="chat-list-page">
    <MessageTopNav title="私信" />

    <div v-if="store.convLoading && store.conversations.length === 0" class="loading-state">
      <BaseSkeleton variant="card" :count="3" />
    </div>

    <div v-else-if="store.conversations.length > 0" class="conv-list">
      <ConversationItem
        v-for="conv in store.conversations"
        :key="conv.id"
        :conv="conv"
        @click="goChat(conv)"
      />
    </div>

    <div v-else class="empty-wrapper">
      <BaseEmpty icon="💬" title="暂无私信" desc="在广场点击他人头像即可发起私信" />
      <BaseButton variant="primary" @click="$router.push('/square')" style="margin-top:16px">
        去广场看看
      </BaseButton>
    </div>

    <!-- 底部安全区 -->
    <div class="safe-bottom"></div>
  </div>
</template>

<script setup>
import { onMounted, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import { useChatStore } from '@/stores/chat';
import MessageTopNav from './components/MessageTopNav.vue';
import ConversationItem from './components/ConversationItem.vue';
import BaseEmpty from '@/components/ui/BaseEmpty.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue';

const router = useRouter();
const store = useChatStore();

onMounted(() => { store.fetchConversations(); });

onActivated(() => {
  // 每次回到列表都刷新
  store.fetchConversations();
});

function goChat(conv) {
  router.push(`/chat/${conv.id}`);
}
</script>

<style scoped>
.chat-list-page {
  min-height: 100vh; background: var(--bg-page);
  max-width: var(--content-max); margin: 0 auto;
}
.loading-state { padding: var(--space-4); }
.conv-list { background: var(--bg-card); border-radius: var(--radius-md); margin: var(--space-4); }
.empty-wrapper {
  display: flex; flex-direction: column; align-items: center;
  padding-top: 100px;
}
.safe-bottom { height: 60px; }
</style>
