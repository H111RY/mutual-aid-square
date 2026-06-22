<template>
  <div class="demo-page">
    <!-- ====== 顶部导航 ====== -->
    <header class="demo-header">
      <BaseButton variant="ghost" size="sm" @click="$router.push('/square')">← 返回广场</BaseButton>
      <h1 class="demo-title">语音输入演示</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- ====== 演示说明 ====== -->
    <div class="demo-intro">
      <BaseCard flat>
        <div class="intro-grid">
          <div class="intro-item">
            <span class="intro-num">1</span>
            <span>选择下方识别语言（支持普通话、粤语等6种方言）</span>
          </div>
          <div class="intro-item">
            <span class="intro-num">2</span>
            <span>点击中央麦克风按钮开始说话（Web Speech）或长按录音（降级模式）</span>
          </div>
          <div class="intro-item">
            <span class="intro-num">3</span>
            <span>说话内容实时显示，点击按钮或松手结束</span>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- ====== 语音录制区 ====== -->
    <BaseCard class="voice-stage-card">
      <VoiceRecorder
        :path="voicePath"
        :status="voiceStatus"
        :duration="duration"
        :volume="volume"
        :interim-text="interimText"
        :final-text="finalText"
        :current-lang="currentLang"
        :error-message="errorMessage"
        :dialects="dialects"
        :upload-progress="uploadProgress"
        :audio-url="audioUrl"
        :max-duration="maxDuration"
        @toggle="toggleVoice"
        @start="startVoice"
        @stop="stopVoice"
        @set-dialect="setDialect"
        @clear="clearVoice"
        @cancel="cancelFallbackRecording"
        @confirm="confirmAndRecognize"
        @retry="retryRecording"
      />
    </BaseCard>

    <!-- ====== 状态面板 ====== -->
    <div class="debug-panel">
      <BaseCard flat>
        <template #header><h3 class="panel-title">状态调试面板</h3></template>
        <div class="debug-grid">
          <div class="debug-item">
            <span class="debug-label">识别路径</span>
            <BaseBadge :color="pathBadgeColor">{{ pathLabel }}</BaseBadge>
          </div>
          <div class="debug-item">
            <span class="debug-label">状态</span>
            <BaseBadge :color="statusColor">{{ voiceStatus }}</BaseBadge>
          </div>
          <div class="debug-item">
            <span class="debug-label">录音时长</span>
            <span class="debug-value">{{ duration }}s / {{ maxDuration }}s</span>
          </div>
          <div class="debug-item">
            <span class="debug-label">音量</span>
            <div class="volume-bar-wrap">
              <div class="volume-bar-fill" :style="{ width: volume + '%' }"></div>
            </div>
          </div>
          <div class="debug-item">
            <span class="debug-label">识别语言</span>
            <span class="debug-value">{{ currentLang }}</span>
          </div>
          <div class="debug-item">
            <span class="debug-label">最终文字长度</span>
            <span class="debug-value">{{ finalText.length }} 字</span>
          </div>
          <div class="debug-item" v-if="voicePath === 'fallback'">
            <span class="debug-label">上传进度</span>
            <span class="debug-value">{{ uploadProgress }}%</span>
          </div>
          <div class="debug-item" v-if="voicePath === 'fallback'">
            <span class="debug-label">音频预览</span>
            <span class="debug-value">{{ audioUrl ? '就绪' : '无' }}</span>
          </div>
          <div class="debug-item">
            <span class="debug-label">浏览器支持</span>
            <BaseBadge :color="voiceStatus === 'unsupported' ? 'danger' : 'success'">
              {{ voiceStatus === 'unsupported' ? '不支持' : '支持' }}
            </BaseBadge>
          </div>
        </div>

        <!-- 预览音频播放器（降级模式） -->
        <div v-if="audioUrl && voicePath === 'fallback'" class="debug-audio">
          <span class="debug-label">音频回放：</span>
          <audio :src="audioUrl" controls style="width:100%;max-width:300px;height:32px"></audio>
        </div>

        <div v-if="errorMessage" class="debug-error">
          <strong>错误：</strong>{{ errorMessage }}
        </div>

        <div v-if="finalText" class="debug-final">
          <strong>最终识别结果：</strong>
          <p>{{ finalText }}</p>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useVoiceInput } from '@/composables/useVoiceInput';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import VoiceRecorder from './components/VoiceRecorder.vue';

const {
  status: voiceStatus,
  duration,
  volume,
  interimText,
  finalText,
  currentLang,
  errorMessage,
  dialects,
  path: voicePath,
  uploadProgress,
  audioUrl,
  maxDuration,
  toggle: toggleVoice,
  start: startVoice,
  stop: stopVoice,
  setDialect,
  clearText: clearVoice,
  confirmAndRecognize,
  retryRecording,
  cancelFallbackRecording
} = useVoiceInput({
  lang: 'zh-CN',
  onResult: (text) => { /* 演示模式 */ },
  onInterim: (text) => { /* 演示模式 */ },
  onError: (msg) => { /* 演示模式 */ }
});

const pathLabel = computed(() => {
  switch (voicePath.value) {
    case 'webspeech': return 'Web Speech';
    case 'fallback': return '降级录音';
    default: return '未知';
  }
});

const pathBadgeColor = computed(() => {
  switch (voicePath.value) {
    case 'webspeech': return 'success';
    case 'fallback': return 'warning';
    default: return 'default';
  }
});

const statusColor = computed(() => {
  switch (voiceStatus.value) {
    case 'idle': return 'default';
    case 'listening': return 'danger';
    case 'preview': return 'info';
    case 'uploading': return 'warning';
    case 'processing': return 'warning';
    case 'error': return 'danger';
    case 'unsupported': return 'danger';
    default: return 'default';
  }
});
</script>

<style scoped>
.demo-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: var(--space-10);
}

.demo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 var(--space-4);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 100;
}
.demo-title { font-size: var(--text-xl); font-weight: var(--font-bold); margin: 0; }
.header-spacer { width: 60px; }

.demo-intro {
  max-width: var(--content-max);
  margin: var(--space-4) auto 0;
  padding: 0 var(--space-4);
}
.intro-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.intro-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-base);
  color: var(--text-secondary);
}
.intro-num {
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: var(--brand-50);
  color: var(--brand-500);
  font-weight: var(--font-bold);
  font-size: var(--text-sm);
  flex-shrink: 0;
}

.voice-stage-card {
  max-width: var(--content-max);
  margin: var(--space-4) auto;
  margin-left: var(--space-4); margin-right: var(--space-4);
}

.debug-panel {
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 0 var(--space-4);
}
.panel-title { font-size: var(--text-base); font-weight: var(--font-bold); margin: 0; }
.debug-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
.debug-item { display: flex; align-items: center; gap: var(--space-2); }
.debug-label { font-size: var(--text-sm); color: var(--text-muted); min-width: 72px; }
.debug-value { font-size: var(--text-base); font-weight: var(--font-medium); }

.volume-bar-wrap {
  width: 80px; height: 8px;
  background: var(--gray-200);
  border-radius: 4px;
  overflow: hidden;
}
.volume-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--green-500), var(--amber-500), var(--red-500));
  border-radius: 4px; transition: width 0.1s ease;
}

.debug-audio {
  margin-top: var(--space-3);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.debug-error {
  margin-top: var(--space-3);
  padding: var(--space-3);
  background: var(--red-50);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  color: var(--red-700);
}

.debug-final {
  margin-top: var(--space-3);
  padding: var(--space-3);
  background: var(--green-50);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
}
.debug-final p {
  margin: var(--space-1) 0 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
