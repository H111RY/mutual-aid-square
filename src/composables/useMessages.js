import { ref, nextTick, watch } from 'vue';

/**
 * 消息列表通用逻辑
 * - 自动滚动到底部（新消息到达）
 * - 滚动到顶部加载更多历史消息
 * - 用户手动上滑时不自动滚
 */
export function useMessages(listRef, messages) {
  const isNearBottom = ref(true);
  const isAtTop = ref(false);

  /* ── 监听用户滚动 ── */
  function onScroll(e) {
    const el = e.target;
    const threshold = 60;
    isNearBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    isAtTop.value = el.scrollTop < threshold;
  }

  /* ── 新消息到达时自动滚动 ── */
  watch(
    () => messages.value.length,
    () => {
      if (isNearBottom.value) {
        nextTick(() => scrollToBottom());
      }
    }
  );

  /* ── 滚动到底部 ── */
  function scrollToBottom(smooth = false) {
    nextTick(() => {
      const el = listRef.value?.$el || listRef.value;
      if (el) {
        el.scrollTop = el.scrollHeight;
        if (smooth) el.style.scrollBehavior = 'smooth';
        else el.style.scrollBehavior = 'auto';
      }
    });
  }

  /* ── 立即滚动到底部（首次加载） ── */
  function scrollToBottomInstant() {
    nextTick(() => {
      const el = listRef.value?.$el || listRef.value;
      if (el) {
        el.style.scrollBehavior = 'auto';
        el.scrollTop = el.scrollHeight;
      }
    });
  }

  return {
    isNearBottom, isAtTop,
    onScroll,
    scrollToBottom,
    scrollToBottomInstant
  };
}
