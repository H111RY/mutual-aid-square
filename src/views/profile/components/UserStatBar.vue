<template>
  <div class="stat-bar">
    <div class="stat-item">
      <span class="stat-num">{{ stats.total_posts }}</span>
      <span class="stat-label">发布</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <span class="stat-num resolved">{{ stats.resolved_posts }}</span>
      <span class="stat-label">已解决</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <span class="stat-num">{{ stats.favorited_posts }}</span>
      <span class="stat-label">收藏</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    default: () => ({ total_posts: 0, resolved_posts: 0, favorited_posts: 0 })
  }
});
</script>

<style scoped>
.stat-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  padding: var(--space-3) 0;
}
.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}
.stat-num {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}
.stat-num.resolved { color: var(--green-500); }
.stat-label {
  font-size: var(--text-base);
  color: var(--text-muted);
}
.stat-divider {
  width: 1px;
  height: var(--space-10);
  background: var(--border-light);
  flex-shrink: 0;
}
</style>
