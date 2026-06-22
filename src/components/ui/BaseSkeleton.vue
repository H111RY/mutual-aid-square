<template>
  <div :class="['skeleton-wrap', variant]">
    <!-- 卡片骨架 -->
    <template v-if="variant === 'card'">
      <div v-for="i in count" :key="i" class="skeleton-card">
        <div class="sk-header">
          <div class="sk-avatar skeleton-shape"></div>
          <div class="sk-lines">
            <div class="sk-line w-40 skeleton-shape"></div>
            <div class="sk-line w-24 skeleton-shape"></div>
          </div>
        </div>
        <div class="sk-line w-full skeleton-shape"></div>
        <div class="sk-line w-full skeleton-shape"></div>
        <div class="sk-line w-60 skeleton-shape"></div>
      </div>
    </template>

    <!-- 列表骨架 -->
    <template v-else-if="variant === 'list'">
      <div v-for="i in count" :key="i" class="skeleton-list">
        <div class="sk-avatar skeleton-shape" style="width:44px;height:44px"></div>
        <div class="sk-lines">
          <div class="sk-line w-50 skeleton-shape"></div>
          <div class="sk-line w-80 skeleton-shape"></div>
        </div>
      </div>
    </template>

    <!-- 文本骨架 -->
    <template v-else>
      <div v-for="i in count" :key="i" class="sk-line" :style="{ width: widths[(i-1) % widths.length] }"></div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'text' },
  count:   { type: Number, default: 1 },
  widths:  { type: Array, default: () => ['100%', '80%', '60%'] }
});
</script>

<style scoped>
.skeleton-shape {
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  margin-bottom: var(--space-4);
  box-shadow: var(--shadow-xs);
}
.sk-header { display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-4); }
.sk-avatar { width: 52px; height: 52px; border-radius: var(--radius-full); flex-shrink: 0; }
.sk-lines  { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.sk-line   { height: 16px; margin-bottom: 8px; }
.sk-line.w-24 { width: 24%; }
.sk-line.w-40 { width: 40%; }
.sk-line.w-50 { width: 50%; }
.sk-line.w-60 { width: 60%; }
.sk-line.w-80 { width: 80%; }
.sk-line.w-full { width: 100%; }

.skeleton-list {
  display: flex; align-items: center; gap: var(--space-4);
  padding: var(--space-4); margin-bottom: var(--space-2);
}
</style>
