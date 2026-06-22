<template>
  <div class="voice-recorder">
    <!--
      VoiceRecorder — 双路径容器
      路径 A（Web Speech）：圆形点击按钮，实时流式识别
      路径 B（Fallback）：长按说话 + 上滑取消 + 播放预览 + 上传进度
    -->

    <!-- ====== 路径 B：降级方案 ====== -->
    <VoiceFallback
      v-if="path === 'fallback'"
      :status="status"
      :duration="duration"
      :volume="volume"
      :current-lang="currentLang"
      :error-message="errorMessage"
      :dialects="dialects"
      :upload-progress="uploadProgress"
      :audio-url="audioUrl"
      :max-duration="maxDuration"
      @start="$emit('start')"
      @stop="$emit('stop')"
      @cancel="$emit('cancel')"
      @set-dialect="$emit('setDialect', $event)"
      @confirm="$emit('confirm')"
      @retry="$emit('retry')"
    />

    <!-- ====== 路径 A：Web Speech API（默认）====== -->
    <template v-else>
      <!-- 方言选择器 -->
      <div v-if="status === 'idle'" class="dialect-row">
        <span class="dialect-label">识别语言：</span>
        <div class="dialect-chips">
          <button
            v-for="d in dialects"
            :key="d.code"
            :class="['dialect-chip', { active: currentLang === d.code }]"
            @click="$emit('setDialect', d.code)"
          >{{ d.name }}</button>
        </div>
      </div>

      <!-- 麦克风主体区 -->
      <div class="mic-stage">
        <!-- 外圈波纹 -->
        <div v-if="status === 'listening'" class="ripple-container">
          <span class="ripple r1"></span>
          <span class="ripple r2"></span>
          <span class="ripple r3"></span>
        </div>

        <!-- 音量波形条 -->
        <div v-if="status === 'listening' && volume > 0" class="wave-bars">
          <span
            v-for="i in 12"
            :key="i"
            class="wave-bar"
            :style="{ height: barHeight(i) + 'px', animationDelay: (i * 0.06) + 's' }"
          ></span>
        </div>

        <!-- 中央按钮 -->
        <button
          :class="['mic-btn', 'state-' + status]"
          :disabled="status === 'unsupported' || status === 'processing'"
          @click="$emit('toggle')"
          :aria-label="buttonLabel"
        >
          <span v-if="status === 'processing'" class="mic-spinner"></span>
          <span v-else class="mic-icon">
            <svg viewBox="0 0 48 48" width="48" height="48" fill="none">
              <rect x="18" y="2" width="12" height="24" rx="6"
                :fill="status === 'listening' ? '#C62828' : '#4A90D9'"
                stroke="none" />
              <path
                d="M10 22C12 32 36 32 38 22"
                :stroke="status === 'listening' ? '#C62828' : '#4A90D9'"
                stroke-width="3" stroke-linecap="round" fill="none" />
              <line x1="24" y1="34" x2="24" y2="44"
                :stroke="status === 'listening' ? '#C62828' : '#999'"
                stroke-width="3" stroke-linecap="round" />
              <line x1="16" y1="44" x2="32" y2="44"
                :stroke="status === 'listening' ? '#C62828' : '#999'"
                stroke-width="3" stroke-linecap="round" />
            </svg>
          </span>
        </button>
      </div>

      <!-- 状态文字 + 计时 -->
      <div class="status-bar">
        <template v-if="status === 'listening'">
          <span class="rec-dot"></span>
          <span class="status-text recording">正在聆听... {{ formatTime(duration) }}</span>
        </template>
        <template v-else-if="status === 'processing'">
          <span class="status-text">正在识别语音...</span>
        </template>
        <template v-else-if="status === 'error'">
          <span class="status-text error">{{ errorMessage }}</span>
          <BaseButton variant="ghost" size="sm" @click="$emit('start')">重试</BaseButton>
        </template>
        <template v-else-if="status === 'unsupported'">
          <span class="status-text muted">您的浏览器不支持语音输入，请使用文字输入</span>
        </template>
        <template v-else>
          <span class="status-text muted">点击上方麦克风按钮开始说话</span>
        </template>
      </div>

      <!-- 实时识别文字 -->
      <div v-if="interimText || finalText" class="transcript">
        <p class="transcript-text">{{ finalText }}<span class="interim">{{ interimText }}</span><span v-if="status === 'listening'" class="cursor-blink">|</span></p>
        <BaseButton v-if="finalText && status === 'idle'" variant="ghost" size="sm" @click="$emit('clear')">清空</BaseButton>
      </div>

      <!-- 操作按钮 -->
      <div v-if="status === 'listening'" class="rec-actions">
        <BaseButton variant="outline" size="md" @click="$emit('stop')">结束录音</BaseButton>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import VoiceFallback from './VoiceFallback.vue';

const props = defineProps({
  // 路径标识
  path:          { type: String, default: 'webspeech' },
  // 公共
  status:        { type: String, default: 'idle' },
  duration:      { type: Number, default: 0 },
  volume:        { type: Number, default: 0 },
  interimText:   { type: String, default: '' },
  finalText:     { type: String, default: '' },
  currentLang:   { type: String, default: 'zh-CN' },
  errorMessage:  { type: String, default: '' },
  dialects:      { type: Array, default: () => [] },
  // 降级专属
  uploadProgress: { type: Number, default: 0 },
  audioUrl:      { type: String, default: '' },
  maxDuration:   { type: Number, default: 60 }
});

defineEmits(['toggle', 'start', 'stop', 'cancel', 'setDialect', 'clear', 'confirm', 'retry']);

const buttonLabel = computed(() => {
  if (props.status === 'listening') return '点击结束录音';
  if (props.status === 'processing') return '正在处理中...';
  return '点击开始说话';
});

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${sec}秒`;
}

function barHeight(i) {
  const base = props.volume * 0.5;
  const wave = Math.sin(Date.now() / 300 + i * 0.7) * 0.5 + 0.5;
  return Math.max(4, base * wave);
}
</script>

<style scoped>
.voice-recorder {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-4);
  gap: var(--space-5);
}

/* ── 方言选择器 ── */
.dialect-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  justify-content: center;
}
.dialect-label { font-size: var(--text-sm); color: var(--text-muted); }
.dialect-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.dialect-chip {
  padding: 4px 14px;
  font-size: var(--text-xs);
  border: 1px solid var(--border-normal);
  border-radius: var(--radius-full);
  background: var(--bg-card);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast);
  font-family: inherit;
}
.dialect-chip:hover { border-color: var(--brand-400); color: var(--brand-400); }
.dialect-chip.active {
  background: var(--brand-50);
  border-color: var(--brand-400);
  color: var(--brand-500);
  font-weight: var(--font-semibold);
}

/* ── 麦克风舞台 ── */
.mic-stage {
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 波纹 */
.ripple-container {
  position: absolute;
  inset: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ripple {
  position: absolute;
  width: 60px; height: 60px;
  border-radius: 50%;
  border: 3px solid var(--red-500);
  opacity: 0;
}
.r1 { animation: ripple 2s ease-out infinite; }
.r2 { animation: ripple 2s ease-out 0.7s infinite; }
.r3 { animation: ripple 2s ease-out 1.4s infinite; }
@keyframes ripple {
  0%   { width: 60px; height: 60px; opacity: 0.6; }
  100% { width: 200px; height: 200px; opacity: 0; }
}

/* 波形条 */
.wave-bars {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
.wave-bar {
  width: 6px;
  border-radius: 3px;
  background: var(--brand-300);
  transition: height 0.1s ease;
  min-height: 4px;
}

/* 中央按钮 */
.mic-btn {
  position: relative;
  z-index: 2;
  width: 120px; height: 120px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  transition: all var(--duration-normal) var(--ease-out);
  outline: none;
}
.mic-btn:hover:not(:disabled) {
  transform: scale(1.04);
  box-shadow: 0 6px 32px rgba(74,144,217,0.25);
}
.mic-btn:active:not(:disabled) { transform: scale(0.96); }
.mic-btn:disabled { cursor: not-allowed; opacity: 0.6; }

.mic-btn.state-listening {
  background: var(--red-50);
  box-shadow: 0 4px 32px rgba(198,40,40,0.25);
  animation: micPulse 2s infinite;
}
@keyframes micPulse {
  0%, 100% { box-shadow: 0 4px 24px rgba(198,40,40,0.15); }
  50%      { box-shadow: 0 4px 48px rgba(198,40,40,0.35); }
}

.mic-btn.state-processing { background: var(--amber-50); }
.mic-btn.state-error     { background: var(--gray-100); }

.mic-icon svg {
  display: block;
  transition: transform var(--duration-fast);
}
.state-listening .mic-icon svg { transform: scale(1.08); }

.mic-spinner {
  width: 48px; height: 48px;
  border: 4px solid var(--gray-200);
  border-top-color: var(--brand-400);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── 状态栏 ── */
.status-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 32px;
  flex-wrap: wrap;
  justify-content: center;
}
.rec-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--red-500);
  animation: blink 1s infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.3; }
}
.status-text {
  font-size: var(--text-base);
  color: var(--text-secondary);
}
.status-text.recording { color: var(--red-500); font-weight: var(--font-medium); }
.status-text.error     { color: var(--red-500); }
.status-text.muted     { color: var(--text-muted); }

/* ── 实时文字 ── */
.transcript {
  width: 100%;
  max-width: 520px;
  padding: var(--space-4) var(--space-5);
  background: var(--gray-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  min-height: 80px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.transcript-text {
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
.interim { color: var(--text-muted); font-style: italic; }
.cursor-blink {
  color: var(--brand-400);
  font-weight: var(--font-bold);
  animation: blink 0.8s infinite;
}

.rec-actions {
  display: flex;
  gap: var(--space-3);
}
</style>
