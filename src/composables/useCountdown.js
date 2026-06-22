import { ref, computed, onUnmounted } from 'vue';

/**
 * 验证码倒计时
 * @param {number} initialSeconds 倒计时秒数，默认 60
 * @returns {{ seconds, isCounting, start, stop }}
 */
export function useCountdown(initialSeconds = 60) {
  const seconds = ref(0);
  let timer = null;

  const isCounting = computed(() => seconds.value > 0);

  function start(n) {
    if (isCounting.value) return;
    seconds.value = n || initialSeconds;
    timer = setInterval(() => {
      seconds.value--;
      if (seconds.value <= 0) {
        clearInterval(timer);
        timer = null;
      }
    }, 1000);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    seconds.value = 0;
  }

  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });

  return { seconds, isCounting, start, stop };
}
