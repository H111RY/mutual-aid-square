<template>
  <div class="not-found-page">
    <div class="nf-content">
      <!-- 大号 404 -->
      <div class="nf-code">
        <span class="nf-digit">4</span>
        <span class="nf-icon">🔍</span>
        <span class="nf-digit">4</span>
      </div>

      <h1 class="nf-title">页面未找到</h1>
      <p class="nf-desc">您访问的页面不存在或已被移除</p>
      <p class="nf-path">{{ currentPath }}</p>

      <div class="nf-actions">
        <BaseButton variant="primary" size="lg" @click="$router.push('/square')">
          返回广场首页
        </BaseButton>
        <BaseButton variant="outline" size="lg" @click="$router.back()">
          返回上一页
        </BaseButton>
      </div>

      <!-- 常用链接 -->
      <div class="nf-links">
        <span class="nf-links-label">常用链接：</span>
        <button class="nf-link" @click="$router.push('/square')">互助广场</button>
        <span class="nf-sep">|</span>
        <button class="nf-link" @click="$router.push('/square/publish')">发布信息</button>
        <span class="nf-sep">|</span>
        <button class="nf-link" @click="$router.push('/demo/route')">路由演示</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import BaseButton from '@/components/ui/BaseButton.vue';

const route = useRoute();
const currentPath = computed(() => route.fullPath);
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-page);
  padding: var(--space-4);
}

.nf-content {
  text-align: center;
  max-width: 480px;
}

.nf-code {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.nf-digit {
  font-size: 120px;
  font-weight: var(--font-bold);
  color: var(--brand-400);
  line-height: 1;
  user-select: none;
}

.nf-icon {
  font-size: 64px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-12px); }
}

.nf-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2);
}

.nf-desc {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin: 0 0 var(--space-1);
}

.nf-path {
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-family: monospace;
  margin: 0 0 var(--space-6);
  background: var(--gray-100);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  display: inline-block;
}

.nf-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: var(--space-6);
}

.nf-links {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.nf-links-label {
  margin-right: var(--space-1);
}

.nf-link {
  background: none;
  border: none;
  color: var(--brand-500);
  cursor: pointer;
  font-size: var(--text-sm);
  text-decoration: underline;
  padding: 0;
  font-family: inherit;
}

.nf-link:hover {
  color: var(--brand-600);
}

.nf-sep {
  margin: 0 var(--space-1);
  color: var(--border-normal);
}
</style>
