<template>
  <div class="chat-input-bar">
    <!-- 图片发送按钮 -->
    <label class="input-action-btn" title="发送图片">
      📷
      <input
        type="file"
        accept="image/*"
        hidden
        @change="onFileSelect"
      />
    </label>

    <!-- 文字输入 -->
    <textarea
      ref="textRef"
      v-model="text"
      class="msg-textarea"
      :placeholder="placeholder"
      rows="1"
      @keydown.enter.exact.prevent="sendText"
      @input="autoResize"
    ></textarea>

    <!-- 语音录制按钮 -->
    <button
      :class="['input-action-btn voice-btn', { recording: isRecording }]"
      :title="isRecording ? '松开发送 上滑取消' : '按住说话'"
      @mousedown="startRecord"
      @mouseup="stopRecord"
      @mouseleave="cancelRecord"
      @touchstart.prevent="startRecord"
      @touchend.prevent="stopRecord"
      @touchmove="onTouchMove"
    >{{ isRecording ? '🔴' : '🎤' }}</button>

    <!-- 发送按钮 -->
    <button
      v-if="text.trim()"
      class="send-btn"
      @click="sendText"
      :disabled="!text.trim()"
    >发送</button>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';

const emit = defineEmits(['send-text', 'send-image', 'start-voice', 'stop-voice', 'cancel-voice']);

defineProps({ placeholder: { type: String, default: '输入消息...' } });

const text = ref('');
const isRecording = ref(false);
const textRef = ref(null);
let touchStartY = 0;

function autoResize() {
  nextTick(() => {
    const el = textRef.value;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  });
}

function sendText() {
  const val = text.value.trim();
  if (!val) return;
  emit('send-text', val);
  text.value = '';
  nextTick(() => {
    const el = textRef.value;
    if (el) el.style.height = 'auto';
  });
}

function onFileSelect(e) {
  const file = e.target.files?.[0];
  if (file) emit('send-image', file);
  e.target.value = '';
}

function startRecord(e) {
  isRecording.value = true;
  touchStartY = e.touches ? e.touches[0].clientY : e.clientY;
  emit('start-voice');
}

function stopRecord(e) {
  if (!isRecording.value) return;
  isRecording.value = false;
  const endY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
  if (touchStartY - endY > 80) {
    emit('cancel-voice');
  } else {
    emit('stop-voice');
  }
}

function cancelRecord() {
  if (!isRecording.value) return;
  isRecording.value = false;
  emit('cancel-voice');
}

function onTouchMove(e) {
  if (!isRecording.value) return;
  const delta = touchStartY - e.touches[0].clientY;
  // 上滑超过 80px 显示取消提示（外部通过样式控制）
  emit('cancel-voice', delta > 80);
}
</script>

<style scoped>
.chat-input-bar {
  display: flex; align-items: flex-end; gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--bg-card); border-top: 1px solid var(--border-light);
  position: sticky; bottom: 0; z-index: 50;
}

.input-action-btn {
  min-width: var(--tap-min); min-height: var(--tap-min);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; border-radius: 50%;
  background: var(--gray-100); border: none; cursor: pointer;
  transition: background var(--duration-fast);
  flex-shrink: 0;
}
.input-action-btn:active { background: var(--gray-200); }
.input-action-btn.voice-btn.recording {
  background: var(--red-50); animation: pulse-rec 1.2s ease-in-out infinite;
}
@keyframes pulse-rec { 0%, 100% { box-shadow: 0 0 0 0 rgba(198,40,40,0.3); } 50% { box-shadow: 0 0 0 10px rgba(198,40,40,0); } }

.msg-textarea {
  flex: 1; min-height: var(--tap-min); max-height: 120px;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-base); font-family: inherit; line-height: var(--leading-normal);
  border: 1px solid var(--border-light); border-radius: var(--radius-md);
  resize: none; outline: none; background: var(--gray-50);
}
.msg-textarea:focus { border-color: var(--brand-400); background: var(--bg-card); }

.send-btn {
  min-width: 56px; min-height: var(--tap-min);
  padding: 0 var(--space-4); font-size: var(--text-base); font-weight: var(--font-semibold);
  background: var(--brand-400); color: #fff; border: none; border-radius: var(--radius-md);
  cursor: pointer; flex-shrink: 0;
}
.send-btn:active { background: var(--brand-500); }
</style>
