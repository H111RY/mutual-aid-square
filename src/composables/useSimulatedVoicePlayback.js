import { ref, onUnmounted } from 'vue';

/**
 * 模拟语音播放 — 完全在浏览器中运行
 *
 * 使用 Web Audio API 生成测试音频，演示：
 * - 播放/暂停/续播（从上次位置继续）
 * - 播放进度追踪
 * - 可调速播放（0.75x / 1x / 1.5x / 2x）
 * - 波形可视化数据
 * - 播放完成自动重置
 *
 * 无需后端，无需真实音频文件
 */
export function useSimulatedVoicePlayback() {
  const playingId = ref(null);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const progress = ref(0);
  const playbackRate = ref(1);
  const waveformData = ref([]);

  let audioCtx = null;
  let sourceNode = null;
  let gainNode = null;
  let audioBuffer = null;
  let startTime = 0;
  let pauseOffset = 0;
  let animationId = null;
  let onEndCallback = null;

  /* ── 生成模拟音频 buffer ── */
  function generateAudioBuffer(dur = 3) {
    const ctx = getAudioContext();
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * dur);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // 生成语音模拟波形：多频叠加 + 振幅包络
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // 包络：渐入 0.05s + 衰减
      const env = Math.min(1, t / 0.05) * Math.max(0, 1 - (t - dur * 0.7) / (dur * 0.3));
      // 基频 + 谐波，模拟人声
      const f0 = 180 + Math.sin(t * 3) * 40;
      const sig =
        Math.sin(2 * Math.PI * f0 * t) * 0.6 +
        Math.sin(2 * Math.PI * f0 * 2 * t) * 0.25 +
        Math.sin(2 * Math.PI * f0 * 3 * t) * 0.1 +
        (Math.random() - 0.5) * 0.05;
      data[i] = sig * env * 0.7;
    }

    // 生成波形数据（24 条柱）
    waveformData.value = Array.from({ length: 24 }, (_, i) => {
      const start = Math.floor((i / 24) * length);
      const end = Math.floor(((i + 1) / 24) * length);
      let rms = 0;
      for (let j = start; j < end; j++) rms += data[j] * data[j];
      rms = Math.sqrt(rms / (end - start));
      return Math.max(4, Math.min(56, rms * 200));
    });

    return buffer;
  }

  function getAudioContext() {
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  /* ── 播放 ── */
  function play(msgId, dur = 3, onEnd) {
    onEndCallback = onEnd || null;

    // 同一个 → 切换播放/暂停
    if (playingId.value === msgId && sourceNode) {
      if (isPlaying.value) {
        pause();
      } else {
        resume();
      }
      return;
    }

    // 停止旧的
    stop();

    const ctx = getAudioContext();
    audioBuffer = generateAudioBuffer(dur);
    duration.value = dur;
    playingId.value = msgId;
    pauseOffset = 0;
    progress.value = 0;
    currentTime.value = 0;

    startFrom(0);
  }

  function startFrom(offset) {
    const ctx = getAudioContext();
    if (!audioBuffer) return;

    sourceNode = ctx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.playbackRate.value = playbackRate.value;

    gainNode = ctx.createGain();
    gainNode.gain.value = 1;

    sourceNode.connect(gainNode);
    gainNode.connect(ctx.destination);

    sourceNode.onended = () => {
      if (progress.value >= 99.9) {
        isPlaying.value = false;
        progress.value = 0;
        currentTime.value = 0;
        playingId.value = null;
        cancelAnimationFrame(animationId);
        animationId = null;
        onEndCallback?.();
      }
    };

    startTime = ctx.currentTime;
    sourceNode.start(0, offset * playbackRate.value);
    isPlaying.value = true;
    pauseOffset = offset;
    startAnimating();
  }

  function pause() {
    if (!sourceNode || !isPlaying.value) return;
    // 计算已播放时长
    const ctx = getAudioContext();
    pauseOffset += (ctx.currentTime - startTime) * playbackRate.value;
    sourceNode.onended = null;
    sourceNode.stop(0);
    sourceNode.disconnect();
    sourceNode = null;
    gainNode?.disconnect();
    gainNode = null;
    isPlaying.value = false;
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  function resume() {
    if (!audioBuffer || isPlaying.value) return;
    startFrom(pauseOffset);
  }

  function stop() {
    if (sourceNode) {
      sourceNode.onended = null;
      try { sourceNode.stop(0); } catch { /* already stopped */ }
      sourceNode.disconnect();
      sourceNode = null;
    }
    gainNode?.disconnect();
    gainNode = null;
    isPlaying.value = false;
    playingId.value = null;
    currentTime.value = 0;
    progress.value = 0;
    pauseOffset = 0;
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  function startAnimating() {
    function tick() {
      if (!isPlaying.value || !audioBuffer) return;
      const ctx = getAudioContext();
      const elapsed = pauseOffset + (ctx.currentTime - startTime) * playbackRate.value;
      const dur = duration.value;
      currentTime.value = Math.min(elapsed, dur);
      progress.value = Math.min(100, (elapsed / dur) * 100);

      if (progress.value >= 99.9) {
        isPlaying.value = false;
        progress.value = 0;
        currentTime.value = 0;
        playingId.value = null;
        animationId = null;
        onEndCallback?.();
        return;
      }

      animationId = requestAnimationFrame(tick);
    }
    animationId = requestAnimationFrame(tick);
  }

  /* ── 调速 ── */
  function setPlaybackRate(rate) {
    playbackRate.value = rate;
    if (sourceNode && isPlaying.value) {
      sourceNode.playbackRate.value = rate;
    }
  }

  /* ── 拖拽进度 ── */
  function seekTo(percent) {
    const wasPlaying = isPlaying.value;
    if (sourceNode) {
      sourceNode.onended = null;
      try { sourceNode.stop(0); } catch { /* ok */ }
      sourceNode.disconnect();
      sourceNode = null;
    }
    gainNode?.disconnect();
    gainNode = null;
    isPlaying.value = false;
    cancelAnimationFrame(animationId);
    animationId = null;

    pauseOffset = (percent / 100) * duration.value;
    currentTime.value = pauseOffset;
    progress.value = percent;

    if (wasPlaying) {
      startFrom(pauseOffset);
    }
  }

  function destroy() {
    stop();
    if (audioCtx) { audioCtx.close().catch(() => {}); audioCtx = null; }
    audioBuffer = null;
    waveformData.value = [];
  }

  onUnmounted(destroy);

  return {
    playingId, isPlaying, currentTime, duration, progress,
    playbackRate, waveformData,
    play, pause, resume, stop, seekTo, setPlaybackRate, destroy
  };
}
