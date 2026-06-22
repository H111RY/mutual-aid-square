<template>
  <div
    :class="['voice-bubble', { mine }]"
    @click="handlePlay"
  >
    <span :class="['play-btn', { playing: isPlaying && playingId === msg.id }]">
      {{ isPlaying && playingId === msg.id ? '⏸' : '▶️' }}
    </span>
    <div class="wave-bar">
      <div class="wave-track" :style="{ width: waveWidth }">
        <span v-for="i in 12" :key="i" class="wave-line" :style="{ animationDelay: i * 0.08 + 's' }"></span>
      </div>
    </div>
    <span class="duration">{{ fmtDuration }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useVoicePlayback } from '@/composables/useVoicePlayback';

const props = defineProps({
  msg: { type: Object, required: true },
  mine: { type: Boolean, default: false }
});

const { playingId, isPlaying, progress, play } = useVoicePlayback();

const fmtDuration = computed(() => {
  const d = props.msg.extra?.duration || 0;
  if (!d) return '';
  const m = Math.floor(d / 60);
  const s = Math.floor(d % 60);
  return m > 0 ? `${m}′${s}″` : `${s}″`;
});

const waveWidth = computed(() => {
  return isPlaying.value && playingId.value === props.msg.id ? `${progress.value}%` : '100%';
});

function handlePlay() {
  play(props.msg.content, props.msg.id);
}
</script>

<style scoped>
.voice-bubble {
  display: flex; align-items: center; gap: var(--space-2);
  min-width: 140px; max-width: 240px;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--gray-100); cursor: pointer;
  user-select: none; -webkit-tap-highlight-color: transparent;
}
.voice-bubble.mine { background: var(--brand-100); }

.play-btn {
  font-size: 24px; min-width: var(--tap-min); min-height: var(--tap-min);
  display: flex; align-items: center; justify-content: center;
  transition: transform var(--duration-fast);
}
.play-btn.playing { animation: pulse-btn 0.6s ease-in-out infinite; }
@keyframes pulse-btn { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }

.wave-bar {
  flex: 1; height: 24px; overflow: hidden; position: relative;
}
.wave-track {
  display: flex; align-items: center; gap: 2px; height: 100%;
  transition: width 0.3s ease;
}
.wave-line {
  width: 3px; height: 8px; background: var(--brand-400); border-radius: 2px;
  animation: wave 0.6s ease-in-out infinite alternate;
}
@keyframes wave { 0% { height: 6px; } 100% { height: 20px; } }

.duration {
  font-size: var(--text-xs); color: var(--text-muted); white-space: nowrap;
  min-width: 32px; text-align: center;
}
</style>
