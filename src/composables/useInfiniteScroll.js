import { ref, onMounted, onUnmounted } from 'vue';

/**
 * 无限滚动 composable
 * 使用 IntersectionObserver 监听哨兵元素
 */
export function useInfiniteScroll(loadFn, options = {}) {
  const { threshold = 0.1, rootMargin = '200px' } = options;
  const sentinel = ref(null);
  const observer = ref(null);

  onMounted(() => {
    if (!sentinel.value) return;

    observer.value = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        loadFn();
      }
    }, { threshold, rootMargin });

    observer.value.observe(sentinel.value);
  });

  onUnmounted(() => {
    if (observer.value) {
      observer.value.disconnect();
    }
  });

  return { sentinel };
}
