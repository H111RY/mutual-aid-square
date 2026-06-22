<template>
  <div class="chat-conv-page">
    <ChatHeader :peer="peer" :conversation-id="convId" />

    <!-- 需求确认卡片 -->
    <DemandConfirm
      v-if="showDemandCard && demandCard"
      :card="demandCard"
      @submit="onDemandSubmit"
      @cancel="showDemandCard = false"
    />

    <!-- 消息列表 -->
    <div class="msg-list" ref="listRef" @scroll="onScroll">
      <!-- 加载历史 -->
      <div v-if="!store.msgIsEnd" class="load-history" @click="loadMore">
        <span v-if="store.msgLoading">加载中...</span>
        <span v-else>点击加载更多</span>
      </div>

      <div v-if="store.messages.length === 0 && !store.msgLoading" class="empty-chat">
        <BaseEmpty icon="💬" desc="开始聊天吧～" />
        <p class="privacy-hint">你的楼栋号和昵称将对对方可见，请放心交流</p>
      </div>

      <MessageBubble
        v-for="msg in store.messages"
        :key="msg._localId || msg.id"
        :msg="msg"
        @retry="onRetry(msg)"
      />

      <div ref="bottomSentinel"></div>
    </div>

    <!-- 底部输入栏 -->
    <ChatInput
      placeholder="输入消息..."
      @send-text="onSendText"
      @send-image="onSendImage"
      @start-voice="onStartVoice"
      @stop-voice="onStopVoice"
      @cancel-voice="onCancelVoice"
    />

    <!-- 录音状态提示 -->
    <transition name="fade">
      <div v-if="isRecording" class="recording-toast">
        <span class="rec-dot"></span>
        <span>正在录音... 松开发送</span>
      </div>
    </transition>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      hidden
      @change="onFileSelected"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useChatStore } from '@/stores/chat';
import { useWebSocket } from '@/composables/useWebSocket';
import { useMessages } from '@/composables/useMessages';
import { createConversation } from '@/api/chat';
import ChatHeader from './components/ChatHeader.vue';
import ChatInput from './components/ChatInput.vue';
import MessageBubble from './components/MessageBubble.vue';
import DemandConfirm from './components/DemandConfirm.vue';
import BaseEmpty from '@/components/ui/BaseEmpty.vue';

const route = useRoute();
const store = useChatStore();

const convId = computed(() => route.params.conversationId);
const isNewChat = computed(() => route.params.conversationId?.startsWith('new_'));
const targetUserId = computed(() => route.params.userId || route.params.conversationId?.replace('new_', ''));

const listRef = ref(null);
const bottomSentinel = ref(null);
const fileInput = ref(null);
const isRecording = ref(false);

const { onScroll, scrollToBottomInstant } = useMessages(listRef, computed(() => store.messages));

/* ── 会话信息 ── */
const peer = computed(() => {
  const conv = store.conversations.find(c => c.id === convId.value);
  return conv?.peer || {};
});

const showDemandCard = ref(false);
const demandCard = ref(null);

/* ── WebSocket ── */
const ws = useWebSocket();

onMounted(async () => {
  // 如果是新建会话
  if (isNewChat.value) {
    try {
      const res = await createConversation(targetUserId.value);
      const newConvId = res.id || res.conversation_id;
      // 替换路由
      history.replaceState(null, '', `/chat/${newConvId}`);
    } catch { /* 降级：使用原有 ID */ }
  }

  store.setCurrentConv(convId.value);
  store.fetchMessages(convId.value, true);
  store.readConversation(convId.value);

  // WebSocket
  ws.connect();
  ws.onMessage((data) => {
    if (data.type === 'new_message') {
      store.receiveMessage(data.payload);
    }
  });

  scrollToBottomInstant();
});

onUnmounted(() => { ws.disconnect(); });

/* ── 发送文字 ── */
function onSendText(text) {
  store.sendMsg(convId.value, { msg_type: 'text', content: text });
}

/* ── 发送图片 ── */
function onSendImage(file) {
  // 使用 ImageUploader 的压缩逻辑简化为直接读取
  const reader = new FileReader();
  reader.onload = (e) => {
    store.sendMsg(convId.value, {
      msg_type: 'image',
      content: e.target.result,
      extra: { thumb: e.target.result, original: e.target.result, width: 0, height: 0 }
    });
  };
  reader.readAsDataURL(file);
}

function onFileSelected(e) {
  const file = e.target.files?.[0];
  if (file) onSendImage(file);
  e.target.value = '';
}

/* ── 语音 ── */
function onStartVoice() { isRecording.value = true; }
function onStopVoice() {
  isRecording.value = false;
  // 模拟语音录制完成
  store.sendMsg(convId.value, {
    msg_type: 'voice',
    content: '',
    extra: { duration: 5 }
  });
}
function onCancelVoice() { isRecording.value = false; }

/* ── 重试 ── */
function onRetry(msg) {
  store.retryMsg(convId.value, msg._localId);
}

/* ── 需求确认卡片 ── */
function onDemandSubmit(data) {
  store.sendMsg(convId.value, {
    msg_type: 'demand_card',
    content: JSON.stringify(data),
    extra: data
  });
  showDemandCard.value = false;
}

/* ── 加载更多 ── */
function loadMore() {
  store.fetchMessages(convId.value, false);
}
</script>

<style scoped>
.chat-conv-page {
  display: flex; flex-direction: column;
  height: 100vh; background: var(--bg-page);
  max-width: var(--content-max); margin: 0 auto;
}

.msg-list {
  flex: 1; overflow-y: auto;
  padding: var(--space-3) 0;
  -webkit-overflow-scrolling: touch;
}

.load-history {
  text-align: center; padding: var(--space-4);
  font-size: var(--text-sm); color: var(--brand-400); cursor: pointer;
}

.empty-chat {
  display: flex; flex-direction: column; align-items: center;
  padding-top: var(--space-10);
}
.privacy-hint {
  font-size: var(--text-sm); color: var(--text-muted);
  background: var(--gray-50); padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full); margin-top: var(--space-4);
}

/* 录音提示 */
.recording-toast {
  position: fixed; top: var(--header-height); left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-2) var(--space-5);
  background: var(--red-500); color: #fff;
  border-radius: var(--radius-full); font-size: var(--text-base);
  z-index: 200; box-shadow: var(--shadow-lg);
}
.rec-dot {
  width: 10px; height: 10px; background: #fff; border-radius: 50%;
  animation: blink 0.6s ease-in-out infinite;
}
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
