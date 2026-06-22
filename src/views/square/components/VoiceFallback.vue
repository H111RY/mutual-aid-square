<template>
  <div class="voice-fallback">
    <!-- ====== 方言选择器（空闲时显示）====== -->
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

    <!-- ====== 状态 1: idle → 长按录音按钮 ====== -->
    <div v-if="status === 'idle'" class="stage">
      <p class="hint-text">按住下方按钮开始说话，松手结束</p>
      <div class="fallback-btn-wrap">
        <button
          class="fallback-btn"
          @mousedown="startPress"
          @mouseup="endPress"
          @mouseleave="endPress"
          @touchstart.prevent="startPress"
          @touchend="endPress"
          @touchcancel="endPress"
        >
          <svg viewBox="0 0 48 48" width="40" height="40" fill="none">
            <rect x="18" y="2" width="12" height="24" rx="6" fill="#4A90D9" />
            <path d="M10 22C12 32 36 32 38 22" stroke="#4A90D9" stroke-width="3" stroke-linecap="round" fill="none" />
            <line x1="24" y1="34" x2="24" y2="44" stroke="#999" stroke-width="3" stroke-linecap="round" />
            <line x1="16" y1="44" x2="32" y2="44" stroke="#999" stroke-width="3" stroke-linecap="round" />
          </svg>
          <span class="fallback-btn-text">按住 说话</span>
        </button>
      </div>
    </div>

    <!-- ====== 状态 2: listening → 录音中 + 上滑取消 ====== -->
    <div v-else-if="status === 'listening'" class="stage recording-stage">
      <!-- 上滑取消提示区 -->
      <div :class="['cancel-zone', { active: cancelIntent }]">
        <div class="cancel-icon-wrap">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
            <circle cx="12" cy="12" r="10" :stroke="cancelIntent ? '#fff' : '#999'" stroke-width="2" />
            <line x1="8" y1="8" x2="16" y2="16" :stroke="cancelIntent ? '#fff' : '#999'" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <span class="cancel-text">{{ cancelIntent ? '松开取消' : '上滑取消' }}</span>
      </div>

      <!-- 计时 + 波形 -->
      <div class="recording-info">
        <span class="rec-dot"></span>
        <span class="timer-text">{{ formatTime(duration) }} / {{ formatTime(maxDuration) }}</span>
      </div>

      <AudioVisualizer mode="record" :volume="volume" />

      <!-- 长按按钮（录音中可滑动） -->
      <div class="fallback-btn-wrap recording">
        <button
          class="fallback-btn is-recording"
          :class="{ cancelling: cancelIntent }"
          @touchmove.prevent="onTouchMove"
          @mousemove="onMouseMove"
          @touchend="endPress"
          @mouseup="endPress"
          @touchcancel="endPress"
          @mouseleave="endPress"
        >
          <svg viewBox="0 0 48 48" width="40" height="40" fill="none">
            <rect x="18" y="2" width="12" height="24" rx="6" fill="#C62828" />
            <path d="M10 22C12 32 36 32 38 22" stroke="#C62828" stroke-width="3" stroke-linecap="round" fill="none" />
            <line x1="24" y1="34" x2="24" y2="44" stroke="#C62828" stroke-width="3" stroke-linecap="round" />
            <line x1="16" y1="44" x2="32" y2="44" stroke="#C62828" stroke-width="3" stroke-linecap="round" />
          </svg>
          <span class="fallback-btn-text">松手 结束</span>
        </button>
      </div>

      <!-- 手动结束按钮 -->
      <BaseButton variant="outline" size="md" class="manual-stop-btn" @click="$emit('stop')">
        点击结束录音
      </BaseButton>
    </div>

    <!-- ====== 状态 3: preview → 播放预览 + 确认/重录 ====== -->
    <div v-else-if="status === 'preview'" class="stage preview-stage">
      <p class="hint-text green">录音完成，点击播放试听</p>

      <!-- 播放控件 -->
      <div class="playback-row">
        <button
          :class="['play-btn', { playing: localPlaying }]"
          @click="togglePlay"
          :aria-label="localPlaying ? '暂停' : '播放'"
        >
          <svg v-if="!localPlaying" viewBox="0 0 24 24" width="32" height="32" fill="none">
            <polygon points="6,2 20,12 6,22" fill="currentColor" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="32" height="32" fill="none">
            <rect x="5" y="2" width="5" height="20" rx="1" fill="currentColor" />
            <rect x="14" y="2" width="5" height="20" rx="1" fill="currentColor" />
          </svg>
        </button>
        <AudioVisualizer
          mode="playback"
          :audio-url="audioUrl"
          :playing="localPlaying"
          :duration="duration"
          @play-end="localPlaying = false"
        />
      </div>

      <!-- 隐藏的 audio 元素 -->
      <audio ref="audioRef" :src="audioUrl" @ended="localPlaying = false" @pause="localPlaying = false"></audio>

      <!-- 操作按钮组 -->
      <div class="preview-actions">
        <BaseButton variant="outline" size="md" @click="$emit('retry')">
          <span class="action-icon">🔄</span> 重新录音
        </BaseButton>
        <BaseButton variant="primary" size="md" @click="$emit('confirm')">
          <span class="action-icon">✅</span> 使用此录音
        </BaseButton>
      </div>
    </div>

    <!-- ====== 状态 4: uploading → 上传进度 ====== -->
    <div v-else-if="status === 'uploading'" class="stage uploading-stage">
      <div class="uploading-icon">
        <svg viewBox="0 0 48 48" width="48" height="48" fill="none">
          <circle cx="24" cy="24" r="20" stroke="var(--brand-200)" stroke-width="3" />
          <path d="M24 14V30" stroke="var(--brand-500)" stroke-width="3" stroke-linecap="round" />
          <polyline points="18,20 24,14 30,20" stroke="var(--brand-500)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <p class="hint-text">正在上传语音并识别...</p>
      <AudioVisualizer mode="progress" :progress="uploadProgress" />
    </div>

    <!-- ====== 状态 5: error → 错误提示 ====== -->
    <div v-if="status === 'error'" class="error-banner">
      <span class="error-icon">⚠️</span>
      <span>{{ errorMessage }}</span>
      <BaseButton variant="ghost" size="sm" @click="$emit('start')">重试</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import AudioVisualizer from './AudioVisualizer.vue';

const props = defineProps({
  status:       { type: String, default: 'idle' },
  duration:     { type: Number, default: 0 },
  volume:       { type: Number, default: 0 },
  currentLang:  { type: String, default: 'zh-CN' },
  errorMessage: { type: String, default: '' },
  dialects:     { type: Array, default: () => [] },
  uploadProgress: { type: Number, default: 0 },
  audioUrl:     { type: String, default: '' },
  maxDuration:  { type: Number, default: 60 }
});

const emit = defineEmits(['toggle', 'start', 'stop', 'cancel', 'setDialect', 'confirm', 'retry']);

const cancelIntent = ref(false);
const localPlaying = ref(false);
const audioRef = ref(null);
const startY = ref(0);
const cancelThreshold = 80;

function startPress(e) {
  cancelIntent.value = false;
  if (e.touches) startY.value = e.touches[0].clientY;
  else startY.value = e.clientY;
  emit('start');
}

function endPress(e) {
  if (cancelIntent.value) {
    emit('cancel');
  } else {
    emit('stop');
  }
  cancelIntent.value = false;
}

function onTouchMove(e) {
  const diff = startY.value - e.touches[0].clientY;
  cancelIntent.value = diff > cancelThreshold;
}

function onMouseMove(e) {
  if (!e.buttons) return;
  const diff = startY.value - e.clientY;
  cancelIntent.value = diff > cancelThreshold;
}

function togglePlay() {
  if (!audioRef.value) return;
  if (localPlaying.value) {
    audioRef.value.pause();
    localPlaying.value = false;
  } else {
    audioRef.value.play().catch(() => {});
    localPlaying.value = true;
  }
}

watch(() => props.status, (s) => {
  if (s !== 'preview') {
    localPlaying.value = false;
    if (audioRef.value) { audioRef.value.pause(); }
  }
});

onUnmounted(() => {
  if (audioRef.value) { audioRef.value.pause(); audioRef.value = null; }
});

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${sec}秒`;
}
</script>

<style scoped>
.voice-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-4);
  gap: var(--space-4);
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
  padding: 4px 14px; font-size: var(--text-xs);
  border: 1px solid var(--border-normal); border-radius: var(--radius-full);
  background: var(--bg-card); color: var(--text-secondary);
  cursor: pointer; transition: all var(--duration-fast); font-family: inherit;
}
.dialect-chip:hover { border-color: var(--brand-400); color: var(--brand-400); }
.dialect-chip.active {
  background: var(--brand-50); border-color: var(--brand-400);
  color: var(--brand-500); font-weight: var(--font-semibold);
}

/* ── 通用舞台 ── */
.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
}
.hint-text {
  font-size: var(--text-base); color: var(--text-muted);
  text-align: center; margin: 0;
}
.hint-text.green { color: var(--green-600); font-weight: var(--font-medium); }

/* ── 长按按钮 ── */
.fallback-btn-wrap {
  display: flex; align-items: center; justify-content: center;
}
.fallback-btn-wrap.recording { margin-bottom: var(--space-2); }

.fallback-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 3px solid var(--brand-300);
  background: var(--bg-card);
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: all var(--duration-fast);
  font-family: inherit;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}
.fallback-btn:hover {
  transform: scale(1.03);
  border-color: var(--brand-400);
  box-shadow: 0 6px 32px rgba(74,144,217,0.25);
}
.fallback-btn:active {
  transform: scale(0.96);
  background: var(--brand-50);
}

.fallback-btn-text {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--brand-500);
  letter-spacing: 2px;
}

/* 录音中状态 */
.fallback-btn.is-recording {
  border-color: var(--red-400);
  background: var(--red-50);
  box-shadow: 0 4px 32px rgba(198,40,40,0.25);
  animation: fallbackPulse 2s infinite;
}
.fallback-btn.is-recording .fallback-btn-text {
  color: var(--red-500);
}
.fallback-btn.cancelling {
  border-color: var(--red-600);
  background: var(--red-100);
  transform: scale(0.9);
}

@keyframes fallbackPulse {
  0%, 100% { box-shadow: 0 4px 24px rgba(198,40,40,0.15); }
  50%      { box-shadow: 0 4px 48px rgba(198,40,40,0.35); }
}

/* ── 上滑取消 ── */
.cancel-zone {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
  background: var(--gray-100);
  transition: all var(--duration-fast);
}
.cancel-zone.active {
  background: var(--red-500);
  transform: scale(1.05);
}
.cancel-zone.active .cancel-text { color: #fff; font-weight: var(--font-bold); }
.cancel-icon-wrap { display: flex; align-items: center; justify-content: center; }
.cancel-text {
  font-size: var(--text-sm); color: var(--text-muted);
  transition: color var(--duration-fast);
}

/* ── 录音信息 ── */
.recording-info {
  display: flex; align-items: center; gap: var(--space-2);
}
.rec-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--red-500); animation: blink 1s infinite;
}
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
.timer-text {
  font-size: var(--text-lg); font-weight: var(--font-semibold);
  color: var(--red-500); font-variant-numeric: tabular-nums;
}

.manual-stop-btn {
  margin-top: var(--space-2);
}

/* ── 预览状态 ── */
.preview-stage { gap: var(--space-5); }

.playback-row {
  display: flex; align-items: center; gap: var(--space-4);
  width: 100%; max-width: 420px;
}

.play-btn {
  width: 56px; height: 56px; min-width: 56px;
  border-radius: 50%; border: none;
  background: var(--brand-400); color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all var(--duration-fast);
  box-shadow: 0 2px 12px rgba(74,144,217,0.3);
}
.play-btn:hover { background: var(--brand-500); transform: scale(1.05); }
.play-btn.playing { background: var(--amber-500); }

.preview-actions {
  display: flex; gap: var(--space-3); flex-wrap: wrap; justify-content: center;
}
.action-icon { font-size: 16px; }

/* ── 上传状态 ── */
.uploading-stage { gap: var(--space-4); }
.uploading-icon { animation: uploadBounce 1s ease-in-out infinite; }
@keyframes uploadBounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}

/* ── 错误 ── */
.error-banner {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--red-50); border-radius: var(--radius-md);
  font-size: var(--text-base); color: var(--red-600);
  width: 100%; justify-content: center; flex-wrap: wrap;
}
.error-icon { font-size: 18px; }
</style>
