<template>
  <div class="audio-visualizer" :class="`mode-${mode}`">
    <!-- 实时录音波形：基于 volume 驱动 -->
    <div v-if="mode === 'record'" class="bars-container">
      <span
        v-for="i in barCount"
        :key="i"
        class="vis-bar"
        :style="{ height: recordBarHeight(i) + 'px' }"
      ></span>
    </div>

    <!-- 播放波形：基于 audioContext 可视化或静态柱 -->
    <div v-else-if="mode === 'playback'" class="bars-container playback">
      <span
        v-for="i in barCount"
        :key="i"
        class="vis-bar playback-bar"
        :style="{
          height: playbackBarHeight(i) + 'px',
          background: i <= playedBars ? 'var(--brand-400)' : 'var(--gray-300)'
        }"
      ></span>
    </div>

    <!-- 上传进度条 -->
    <div v-else-if="mode === 'progress'" class="progress-container">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <span class="progress-text">{{ progress }}%</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  mode: {
    type: String,
    default: 'record',
    validator: v => ['record', 'playback', 'progress'].includes(v)
  },
  volume:    { type: Number, default: 0 },
  progress:  { type: Number, default: 0 },
  audioUrl:  { type: String, default: '' },
  playing:   { type: Boolean, default: false },
  duration:  { type: Number, default: 0 }
});

const emit = defineEmits(['playEnd']);

const barCount = 24;
const barHeights = ref(Array.from({ length: barCount }, () => 4));
const playedBars = ref(0);

// ── 录音模式：随机波动的柱状图（叠加 volume）──
function recordBarHeight(i) {
  const seed = Math.sin(Date.now() / 200 + i * 0.6) * 0.5 + 0.5;
  const base = props.volume * 0.7;
  return Math.max(4, base * seed + Math.random() * 8);
}

// ── 播放模式 ──
let audioEl = null;
let playTimer = null;

function playbackBarHeight(i) {
  return barHeights.value[i] || 4;
}

function generateFakeBars() {
  barHeights.value = Array.from({ length: barCount }, () =>
    Math.max(6, Math.random() * 48 + 12)
  );
}

function startPlaybackSimulation() {
  generateFakeBars();
  playedBars.value = 0;
  const stepTime = props.duration > 0 ? (props.duration * 1000) / barCount : 200;
  playTimer = setInterval(() => {
    if (playedBars.value < barCount) {
      playedBars.value++;
    } else {
      clearInterval(playTimer);
      playTimer = null;
      emit('playEnd');
    }
  }, stepTime);
}

function stopPlaybackSimulation() {
  if (playTimer) { clearInterval(playTimer); playTimer = null; }
}

watch(() => props.playing, (v) => {
  if (v) startPlaybackSimulation();
  else stopPlaybackSimulation();
});

watch(() => props.audioUrl, () => {
  if (props.audioUrl) generateFakeBars();
});

onMounted(() => {
  if (props.mode === 'playback' && props.audioUrl) generateFakeBars();
});

onUnmounted(() => stopPlaybackSimulation());
</script>

<style scoped>
.audio-visualizer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* ── 柱状波形 ── */
.bars-container {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  height: 64px;
  padding: var(--space-2) 0;
}

.vis-bar {
  width: 4px;
  border-radius: 2px;
  background: var(--brand-400);
  transition: height 0.12s ease;
  min-height: 4px;
}

/* 播放模式 */
.playback .vis-bar {
  transition: height 0.3s ease, background 0.3s ease;
}
.playback-bar {
  border-radius: 2px;
}

/* ── 进度条模式 ── */
.progress-container {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2) 0;
}

.progress-track {
  flex: 1;
  height: 10px;
  background: var(--gray-200);
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 5px;
  background: linear-gradient(90deg, var(--brand-400), var(--brand-500));
  transition: width 0.3s ease;
}

.progress-text {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--brand-500);
  min-width: 40px;
  text-align: right;
}
</style>
