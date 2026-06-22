<template>
  <div :class="['message-row', { mine: isMine }]">
    <!-- 对方头像 -->
    <BaseAvatar
      v-if="!isMine"
      :src="msg.sender?.avatar"
      :name="msg.sender?.nickname || '?'"
      size="sm"
      class="msg-avatar"
    />

    <div :class="['msg-content', { mine: isMine }]">
      <!-- 昵称 + 时间 -->
      <div v-if="!isMine" class="msg-sender">
        <span class="sender-name">{{ msg.sender?.nickname || '用户' }}</span>
        <span class="sender-building" v-if="msg.sender?.building">{{ msg.sender.building }}</span>
      </div>

      <!-- 消息体 -->
      <TextBubble v-if="msg.msg_type === 'text'" :msg="msg" :mine="isMine" @retry="$emit('retry', msg)" />
      <ImageBubble v-else-if="msg.msg_type === 'image'" :msg="msg" :mine="isMine" />
      <VoiceBubble v-else-if="msg.msg_type === 'voice'" :msg="msg" :mine="isMine" />
      <!-- 系统消息 -->
      <div v-else-if="msg.msg_type === 'system'" class="system-msg">{{ msg.content }}</div>
    </div>

    <!-- 自己头像 -->
    <BaseAvatar
      v-if="isMine"
      :src="msg.sender?.avatar"
      :name="msg.sender?.nickname || '我'"
      size="sm"
      class="msg-avatar"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import BaseAvatar from '@/components/ui/BaseAvatar.vue';
import TextBubble from './TextBubble.vue';
import ImageBubble from './ImageBubble.vue';
import VoiceBubble from './VoiceBubble.vue';

const props = defineProps({ msg: { type: Object, required: true } });
defineEmits(['retry']);

const isMine = computed(() => props.msg.sender_uid === 'me' || props.msg.sender?.uid === 'me');
</script>

<style scoped>
.message-row {
  display: flex; align-items: flex-start; gap: var(--space-2);
  padding: var(--space-1) var(--space-4); margin-bottom: var(--space-2);
}
.message-row.mine { flex-direction: row-reverse; }

.msg-avatar { flex-shrink: 0; width: var(--tap-min); height: var(--tap-min); }

.msg-content { flex: 0 1 auto; }
.msg-content.mine { display: flex; flex-direction: column; align-items: flex-end; }

.msg-sender {
  display: flex; align-items: center; gap: var(--space-1);
  padding: 0 var(--space-1); margin-bottom: 2px;
}
.sender-name { font-size: var(--text-sm); font-weight: var(--font-semibold); color: var(--text-secondary); }
.sender-building { font-size: var(--text-xs); color: var(--text-muted); }

.system-msg {
  text-align: center; padding: var(--space-2) var(--space-4);
  font-size: var(--text-xs); color: var(--text-muted);
  background: var(--gray-100); border-radius: var(--radius-full);
  max-width: 320px; margin: 0 auto;
}
</style>
