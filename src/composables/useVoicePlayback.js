import { ref, onUnmounted } from 'vue';

/**
 * 语音消息播放控制
 * - 点击播放/暂停
 * - 支持暂停续播（从上次位置继续）
 * - 播放进度 + 时长倒计时
 * - 播放完毕自动重置
 */
export function useVoicePlayback() {
  const playingId = ref(null);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const progress = ref(0);

  let audio = null;

  function play(url, msgId) {
    // 同一个 → 切换播放/暂停
    if (playingId.value === msgId && audio) {
      if (audio.paused) {
        audio.play();
        isPlaying.value = true;
      } else {
        audio.pause();
        isPlaying.value = false;
      }
      return;
    }

    // 停止旧的
    stop();

    // 播放新的
    audio = new Audio(url);
    playingId.value = msgId;
    isPlaying.value = true;
    currentTime.value = 0;
    duration.value = 0;
    progress.value = 0;

    audio.ontimeupdate = () => {
      currentTime.value = audio.currentTime;
      if (audio.duration) {
        duration.value = audio.duration;
        progress.value = (audio.currentTime / audio.duration) * 100;
      }
    };

    audio.onloadedmetadata = () => {
      duration.value = audio.duration;
    };

    audio.onended = () => {
      isPlaying.value = false;
      progress.value = 0;
      currentTime.value = 0;
      playingId.value = null;
    };

    audio.onerror = () => {
      stop();
    };

    audio.play().catch(() => {
      stop();
    });
  }

  function stop() {
    if (audio) {
      audio.pause();
      audio.src = '';
      audio = null;
    }
    isPlaying.value = false;
    playingId.value = null;
    currentTime.value = 0;
    duration.value = 0;
    progress.value = 0;
  }

  function seekTo(percent) {
    if (audio && audio.duration) {
      audio.currentTime = (percent / 100) * audio.duration;
    }
  }

  onUnmounted(stop);

  return {
    playingId, isPlaying, currentTime, duration, progress,
    play, stop, seekTo
  };
}
