import { computed } from 'vue';
import { useRoute } from 'vue-router';

/**
 * 面包屑 — 自动从路由 meta 生成
 *
 * 使用方式：
 *   const { crumbs } = useBreadcrumb();
 *   // crumbs = [{ title: '互助广场', path: '/square' }, { title: '发布信息' }]
 */
export function useBreadcrumb() {
  const route = useRoute();

  const crumbs = computed(() => {
    const items = [];
    const { matched } = route;

    for (const record of matched) {
      const title = record.meta?.title;
      if (!title) continue;

      // 404 不参与面包屑
      if (record.name === 'NotFound') continue;

      // 首页作为根节点
      if (record.name === 'SquareHome') {
        items.push({ title: '首页', path: '/square' });
        continue;
      }

      items.push({
        title,
        path: record.name ? route.fullPath : undefined
      });
    }

    // 如果只有首页一条且就在首页，则不显示面包屑
    if (items.length === 1 && items[0].path === '/square' && route.path === '/square') {
      return [];
    }

    return items;
  });

  return { crumbs };
}
