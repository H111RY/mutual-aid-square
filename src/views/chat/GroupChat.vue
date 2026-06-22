<template>
  <div class="group-chat-page">
    <GroupHeader
      :group="store.groupInfo || {}"
      @settings="showSettings = true"
    />

    <!-- 群公告 -->
    <GroupNoticeBar
      :notice="store.groupInfo?.notice || ''"
      :can-edit="isOwner"
      @edit="editNotice"
    />

    <!-- 置顶消息 -->
    <template v-if="pinnedMessages.length > 0">
      <PinnedMessage
        v-for="pm in pinnedMessages"
        :key="pm.id"
        :msg="pm"
      />
    </template>

    <!-- 消息列表 -->
    <div class="msg-list" ref="listRef" @scroll="onScroll">
      <div v-if="!store.gmIsEnd" class="load-history" @click="loadMore">
        <span v-if="store.gmLoading">加载中...</span>
        <span v-else>点击加载更多</span>
      </div>

      <MessageBubble
        v-for="msg in store.groupMessages"
        :key="msg._localId || msg.id"
        :msg="msg"
        @retry="onRetry(msg)"
      />

      <div ref="bottomSentinel"></div>
    </div>

    <!-- 底部输入栏 -->
    <ChatInput
      :placeholder="isMuted ? '你已被禁言' : '输入群消息...'"
      @send-text="onSendText"
      @send-image="onSendImage"
      @start-voice="onStartVoice"
      @stop-voice="onStopVoice"
      @cancel-voice="onCancelVoice"
    />

    <!-- 录音提示 -->
    <transition name="fade">
      <div v-if="isRecording" class="recording-toast">
        <span class="rec-dot"></span>
        <span>正在录音... 松开发送</span>
      </div>
    </transition>

    <!-- 群成员抽屉 -->
    <GroupMemberDrawer
      v-if="showMembers"
      :members="store.members"
      :is-owner="isOwner"
      @close="showMembers = false"
      @kick="onKick"
      @ban="onBan"
      @set-admin="onSetAdmin"
    />

    <!-- 群设置弹窗 -->
    <Teleport to="body">
      <div v-if="showSettings" class="settings-mask" @click.self="showSettings = false">
        <div class="settings-panel">
          <h3 class="settings-title">群设置</h3>

          <div class="setting-item">
            <span>消息免打扰</span>
            <button
              :class="['toggle-btn', { on: isMuted }]"
              @click="toggleMute"
            >{{ isMuted ? '已开启' : '已关闭' }}</button>
          </div>

          <div class="setting-item">
            <span>我在本群的昵称</span>
            <input v-model="myNickname" class="nick-input" placeholder="输入昵称" />
          </div>

          <div class="setting-actions">
            <BaseButton variant="outline" @click="clearHistory">清空聊天记录</BaseButton>
            <BaseButton variant="outline" class="danger-btn" @click="handleLeave">退出群聊</BaseButton>
          </div>

          <BaseButton variant="ghost" @click="showSettings = false" style="margin-top:12px">关闭</BaseButton>
        </div>
      </div>
    </Teleport>

    <!-- 编辑公告弹窗 -->
    <Teleport to="body">
      <div v-if="showEditNotice" class="settings-mask" @click.self="showEditNotice = false">
        <div class="settings-panel">
          <h3 class="settings-title">编辑群公告</h3>
          <textarea v-model="noticeDraft" class="notice-textarea" rows="4" placeholder="输入群公告..."></textarea>
          <div class="notice-actions">
            <BaseButton variant="outline" @click="showEditNotice = false">取消</BaseButton>
            <BaseButton variant="primary" :loading="savingNotice" @click="saveNotice">保存</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGroupStore } from '@/stores/group';
import { useWebSocket } from '@/composables/useWebSocket';
import { useMessages } from '@/composables/useMessages';
import { Teleport } from 'vue';
import GroupHeader from './components/GroupHeader.vue';
import GroupNoticeBar from './components/GroupNoticeBar.vue';
import PinnedMessage from './components/PinnedMessage.vue';
import MessageBubble from './components/MessageBubble.vue';
import ChatInput from './components/ChatInput.vue';
import GroupMemberDrawer from './components/GroupMemberDrawer.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const route = useRoute();
const router = useRouter();
const store = useGroupStore();

const groupId = computed(() => route.params.groupId);
const listRef = ref(null);
const bottomSentinel = ref(null);
const isRecording = ref(false);
const showMembers = ref(false);
const showSettings = ref(false);
const showEditNotice = ref(false);
const isMuted = ref(false);
const myNickname = ref('');
const noticeDraft = ref('');
const savingNotice = ref(false);

const isOwner = computed(() => store.groupInfo?.owner_uid === 'me');
const pinnedMessages = computed(() => store.groupMessages.filter(m => m.is_pinned));

const { onScroll, scrollToBottomInstant } = useMessages(listRef, computed(() => store.groupMessages));

const ws = useWebSocket({ url: '/ws/group' });

onMounted(async () => {
  store.setCurrentGroup(groupId.value);
  await Promise.all([
    store.fetchGroupInfo(groupId.value),
    store.fetchGroupMessages(groupId.value, true),
    store.fetchMembers(groupId.value)
  ]);
  isMuted.value = store.groupInfo?.is_muted || false;

  ws.connect();
  ws.onMessage((data) => {
    if (data.type === 'group_message') {
      store.receiveGroupMessage(data.payload);
    }
  });

  scrollToBottomInstant();
});

onUnmounted(() => { ws.disconnect(); });

/* ── 消息 ── */
function onSendText(text) {
  store.sendGm(groupId.value, { msg_type: 'text', content: text });
}
function onSendImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    store.sendGm(groupId.value, {
      msg_type: 'image',
      content: e.target.result,
      extra: { thumb: e.target.result, original: e.target.result }
    });
  };
  reader.readAsDataURL(file);
}
function onStartVoice() { isRecording.value = true; }
function onStopVoice() { isRecording.value = false; store.sendGm(groupId.value, { msg_type: 'voice', content: '', extra: { duration: 5 } }); }
function onCancelVoice() { isRecording.value = false; }
function onRetry(msg) { /* 简化处理 */ }
function loadMore() { store.fetchGroupMessages(groupId.value, false); }

/* ── 群管理 ── */
async function toggleMute() {
  isMuted.value = !isMuted.value;
  await store.toggleGroupMute(groupId.value, isMuted.value);
}

function onKick(uid) { store.kickGroupMember(groupId.value, uid); showMembers.value = false; }
function onBan({ uid, duration }) { store.banGroupMember(groupId.value, uid, duration); showMembers.value = false; }
function onSetAdmin({ uid, isAdmin }) { showMembers.value = false; }

function clearHistory() {
  if (confirm('确定清空本地聊天记录？')) {
    store.groupMessages.value = [];
    showSettings.value = false;
  }
}

async function handleLeave() {
  if (confirm('确定退出群聊？退出后需重新申请加入。')) {
    await store.leaveCurrentGroup(groupId.value);
    router.replace('/group');
  }
}

function editNotice() {
  noticeDraft.value = store.groupInfo?.notice || '';
  showEditNotice.value = true;
}

async function saveNotice() {
  savingNotice.value = true;
  try {
    await store.setGroupNotice(groupId.value, noticeDraft.value);
    if (store.groupInfo) store.groupInfo.notice = noticeDraft.value;
    showEditNotice.value = false;
  } catch { alert('保存失败'); }
  finally { savingNotice.value = false; }
}
</script>

<style scoped>
.group-chat-page {
  display: flex; flex-direction: column;
  height: 100vh; background: var(--bg-page);
  max-width: var(--content-max); margin: 0 auto;
}

.msg-list {
  flex: 1; overflow-y: auto; padding: var(--space-3) 0;
  -webkit-overflow-scrolling: touch;
}

.load-history {
  text-align: center; padding: var(--space-4);
  font-size: var(--text-sm); color: var(--brand-400); cursor: pointer;
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

/* 设置弹窗 */
.settings-mask {
  position: fixed; inset: 0; z-index: 9999;
  background: var(--bg-overlay);
  display: flex; align-items: flex-end; justify-content: center;
}
.settings-panel {
  width: 100%; max-width: var(--content-max);
  background: var(--bg-card); border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--space-6);
  max-height: 80vh; overflow-y: auto;
}
.settings-title {
  font-size: var(--text-xl); font-weight: var(--font-bold);
  margin: 0 0 var(--space-4); text-align: center;
}

.setting-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-3) 0; border-bottom: 1px solid var(--border-light);
  font-size: var(--text-base);
}
.toggle-btn {
  min-height: var(--tap-min); padding: var(--space-1) var(--space-4);
  border-radius: var(--radius-full); border: none;
  font-size: var(--text-sm); cursor: pointer; font-family: inherit;
  background: var(--gray-200); color: var(--text-secondary);
}
.toggle-btn.on { background: var(--brand-400); color: #fff; }
.nick-input {
  width: 160px; padding: var(--space-1) var(--space-3);
  font-size: var(--text-base); border: 1px solid var(--border-light);
  border-radius: var(--radius-sm); outline: none; font-family: inherit;
}

.setting-actions { display: flex; gap: var(--space-3); margin-top: var(--space-4); }
.danger-btn { color: var(--red-500) !important; border-color: var(--red-500) !important; }

/* 公告编辑 */
.notice-textarea {
  width: 100%; padding: var(--space-3); font-size: var(--text-base); font-family: inherit;
  border: 1px solid var(--border-light); border-radius: var(--radius-sm);
  outline: none; resize: none; margin-bottom: var(--space-4); box-sizing: border-box;
}
.notice-actions { display: flex; justify-content: flex-end; gap: var(--space-3); }
</style>
