<template>
  <div class="demo-page">
    <!-- ====== 面包屑导航 ====== -->
    <div v-if="crumbs.length > 0" class="breadcrumb-bar">
      <template v-for="(c, idx) in crumbs" :key="idx">
        <template v-if="c.path">
          <router-link :to="c.path" class="breadcrumb-link">{{ c.title }}</router-link>
        </template>
        <template v-else>
          <span class="breadcrumb-current">{{ c.title }}</span>
        </template>
        <span v-if="idx < crumbs.length - 1" class="breadcrumb-sep">/</span>
      </template>
    </div>

    <!-- ====== 顶部导航 ====== -->
    <header class="demo-header">
      <BaseButton variant="ghost" size="sm" @click="$router.push('/square')">← 返回广场</BaseButton>
      <h1 class="demo-title">路由设计演示</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- ====== 当前路由信息 ====== -->
    <div class="section">
      <BaseCard>
        <template #header><h2 class="section-title">当前路由信息</h2></template>
        <div class="route-info-grid">
          <div class="info-item">
            <span class="info-label">fullPath</span>
            <span class="info-value mono">{{ route.fullPath }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">path</span>
            <span class="info-value mono">{{ route.path }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">name</span>
            <BaseBadge color="info">{{ route.name || '无' }}</BaseBadge>
          </div>
          <div class="info-item">
            <span class="info-label">params</span>
            <span class="info-value mono">{{ JSON.stringify(route.params) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">query</span>
            <span class="info-value mono">{{ JSON.stringify(route.query) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">hash</span>
            <span class="info-value mono">{{ route.hash || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">meta.title</span>
            <span class="info-value">{{ route.meta.title || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">meta.level</span>
            <BaseBadge :color="levelColor">{{ route.meta.level ?? '-' }}</BaseBadge>
          </div>
          <div class="info-item">
            <span class="info-label">meta.direction</span>
            <BaseBadge :color="route.meta.direction === 'forward' ? 'success' : 'warning'">
              {{ route.meta.direction || '-' }}
            </BaseBadge>
          </div>
          <div class="info-item">
            <span class="info-label">meta.keepAlive</span>
            <BaseBadge :color="route.meta.keepAlive ? 'info' : 'default'">
              {{ route.meta.keepAlive ? '是' : '否' }}
            </BaseBadge>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- ====== 完整路由表 ====== -->
    <div class="section">
      <BaseCard>
        <template #header><h2 class="section-title">完整路由表</h2></template>
        <div class="route-table-wrap">
          <table class="route-table">
            <thead>
              <tr>
                <th>路径</th>
                <th>名称</th>
                <th>标题</th>
                <th>层级</th>
                <th>keepAlive</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="r in routeList"
                :key="r.name"
                :class="{ 'current-route': r.name === route.name }"
              >
                <td class="mono">{{ r.path }}</td>
                <td>{{ r.name }}</td>
                <td>{{ r.title }}</td>
                <td>
                  <BaseBadge :color="levelBadgeColor(r.level)" size="sm">
                    L{{ r.level }}
                  </BaseBadge>
                </td>
                <td>
                  <BaseBadge :color="r.keepAlive ? 'info' : 'default'" size="sm">
                    {{ r.keepAlive ? '✓' : '-' }}
                  </BaseBadge>
                </td>
                <td class="action-cell">
                  <BaseButton
                    variant="ghost"
                    size="sm"
                    :disabled="r.name === route.name"
                    @click="$router.push(r.path)"
                  >前往</BaseButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </div>

    <!-- ====== 导航守卫流程 ====== -->
    <div class="section">
      <BaseCard>
        <template #header><h2 class="section-title">导航守卫执行流程</h2></template>
        <div class="guard-flow">
          <div class="guard-step">
            <div class="guard-step-num">1</div>
            <div class="guard-step-body">
              <strong class="guard-title">beforeEach（全局前置守卫）</strong>
              <p class="guard-desc">计算页面层级差 → 设置 direction（forward/back）→ 更新 document.title</p>
            </div>
          </div>
          <div class="guard-connector"></div>
          <div class="guard-step">
            <div class="guard-step-num">2</div>
            <div class="guard-step-body">
              <strong class="guard-title">beforeResolve（全局解析守卫）</strong>
              <p class="guard-desc">所有异步组件加载完毕，在此可做最终确认（当前未使用）</p>
            </div>
          </div>
          <div class="guard-connector"></div>
          <div class="guard-step">
            <div class="guard-step-num">3</div>
            <div class="guard-step-body">
              <strong class="guard-title">afterEach（全局后置钩子）</strong>
              <p class="guard-desc">页面已渲染 → 触发页面统计/埋点</p>
            </div>
          </div>
          <div class="guard-connector"></div>
          <div class="guard-step">
            <div class="guard-step-num">4</div>
            <div class="guard-step-body">
              <strong class="guard-title">scrollBehavior</strong>
              <p class="guard-desc">savedPosition 恢复滚动位置 / hash 锚点 / 新页面 top: 0</p>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- ====== 过渡动画测试 ====== -->
    <div class="section">
      <BaseCard>
        <template #header><h2 class="section-title">过渡动画测试</h2></template>
        <p class="section-desc">点击按钮触发不同层级页面的导航，观察页面切换动画：</p>
        <div class="anim-test-grid">
          <div class="anim-test-group">
            <span class="anim-test-label">同级 (L0→L0)</span>
            <div class="anim-test-btns">
              <BaseButton variant="outline" size="sm" @click="$router.push('/square')">/square</BaseButton>
            </div>
          </div>
          <div class="anim-test-group">
            <span class="anim-test-label">进入子页 (L0→L1)</span>
            <div class="anim-test-btns">
              <BaseButton variant="outline" size="sm" @click="$router.push('/square/publish')">发布信息</BaseButton>
              <BaseButton variant="outline" size="sm" @click="$router.push('/square/detail/1')">帖子详情</BaseButton>
            </div>
          </div>
          <div class="anim-test-group">
            <span class="anim-test-label">进入子页 (L1→L2)</span>
            <div class="anim-test-btns">
              <BaseButton variant="outline" size="sm" @click="$router.push('/demo/voice')">语音演示</BaseButton>
              <BaseButton variant="outline" size="sm" @click="$router.push('/demo/image')">图片演示</BaseButton>
              <BaseButton variant="outline" size="sm" @click="$router.push('/demo/state')">状态演示</BaseButton>
            </div>
          </div>
          <div class="anim-test-group">
            <span class="anim-test-label">404 页面</span>
            <div class="anim-test-btns">
              <BaseButton variant="outline" size="sm" @click="$router.push('/this-does-not-exist')">不存在的页面</BaseButton>
            </div>
          </div>
          <div class="anim-test-group">
            <span class="anim-test-label">程序化导航</span>
            <div class="anim-test-btns">
              <BaseButton variant="outline" size="sm" @click="testBack">$router.back()</BaseButton>
              <BaseButton variant="outline" size="sm" @click="$router.go(-1)">$router.go(-1)</BaseButton>
              <BaseButton variant="outline" size="sm" @click="$router.forward()">$router.forward()</BaseButton>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- ====== scrollBehavior 演示 ====== -->
    <div class="section">
      <BaseCard>
        <template #header><h2 class="section-title">scrollBehavior 演示</h2></template>
        <p class="section-desc">下方是一个可滚动区域，浏览后跳转到其他页面再返回，滚动位置会被恢复。</p>
        <div class="scroll-demo-box">
          <div
            v-for="i in 20"
            :key="i"
            :id="`item-${i}`"
            class="scroll-demo-item"
          >
            <span class="scroll-demo-num">{{ i }}</span>
            <span>滚动测试条目 — 浏览到此位置后跳转再返回，应恢复到此位置</span>
          </div>
        </div>
        <div class="scroll-actions">
          <BaseButton variant="outline" size="sm" @click="$router.push('/demo/voice')">跳转到语音演示</BaseButton>
          <BaseButton variant="outline" size="sm" @click="$router.push('/demo/state')">跳转到状态演示</BaseButton>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getRouteList } from '@/router';
import { useBreadcrumb } from '@/composables/useBreadcrumb';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';

const route = useRoute();
const router = useRouter();
const { crumbs } = useBreadcrumb();

const routeList = computed(() => getRouteList());

const levelColor = computed(() => {
  const l = route.meta.level ?? 0;
  if (l === 0) return 'info';
  if (l <= 1) return 'success';
  if (l <= 2) return 'warning';
  return 'default';
});

function levelBadgeColor(level) {
  if (level === 0) return 'info';
  if (level <= 1) return 'success';
  if (level <= 2) return 'warning';
  return 'default';
}

function testBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/square');
  }
}
</script>

<style scoped>
.demo-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: var(--space-10);
}

.demo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 var(--space-4);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 100;
}
.demo-title { font-size: var(--text-xl); font-weight: var(--font-bold); margin: 0; }
.header-spacer { width: 60px; }

/* ── 面包屑 ── */
.breadcrumb-bar {
  max-width: var(--content-max);
  margin: 0 auto;
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-wrap: wrap;
}
.breadcrumb-link {
  color: var(--brand-500);
  text-decoration: none;
}
.breadcrumb-link:hover { text-decoration: underline; }
.breadcrumb-current {
  color: var(--text-primary);
  font-weight: var(--font-medium);
}
.breadcrumb-sep {
  color: var(--text-muted);
  margin: 0 2px;
}

/* ── 分区 ── */
.section {
  max-width: var(--content-max);
  margin: var(--space-4) auto;
  padding: 0 var(--space-4);
}
.section-title { font-size: var(--text-lg); font-weight: var(--font-bold); margin: 0; }
.section-desc {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: var(--space-2) 0 var(--space-3);
}

/* ── 路由信息表 ── */
.route-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
}
@media (max-width: 640px) { .route-info-grid { grid-template-columns: 1fr; } }
.info-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) 0;
}
.info-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-family: monospace;
  min-width: 120px;
}
.info-value {
  font-size: var(--text-sm);
  color: var(--text-primary);
  word-break: break-all;
}
.info-value.mono { font-family: monospace; font-size: var(--text-xs); }

/* ── 路由表 ── */
.route-table-wrap {
  overflow-x: auto;
}
.route-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}
.route-table th {
  text-align: left;
  padding: var(--space-2) var(--space-3);
  background: var(--gray-100);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  white-space: nowrap;
}
.route-table td {
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--border-light);
}
.route-table .current-route {
  background: var(--brand-50);
}
.route-table .current-route td {
  font-weight: var(--font-medium);
}
.mono { font-family: monospace; font-size: var(--text-xs); }
.action-cell { white-space: nowrap; }

/* ── 守卫流程 ── */
.guard-flow {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.guard-step {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
}
.guard-step-num {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--brand-400);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: var(--font-bold);
  font-size: var(--text-sm);
  flex-shrink: 0;
}
.guard-step-body {
  flex: 1;
  padding-bottom: var(--space-3);
}
.guard-title {
  font-size: var(--text-base);
  color: var(--text-primary);
}
.guard-desc {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 2px 0 0;
}
.guard-connector {
  width: 2px;
  height: 16px;
  background: var(--border-normal);
  margin-left: 15px;
}

/* ── 动画测试 ── */
.anim-test-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.anim-test-group {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.anim-test-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
  min-width: 120px;
  font-weight: var(--font-medium);
}
.anim-test-btns {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

/* ── scrollBehavior 演示 ── */
.scroll-demo-box {
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid var(--border-normal);
  border-radius: var(--radius-md);
  padding: var(--space-2);
  background: var(--gray-50);
  margin-bottom: var(--space-3);
}
.scroll-demo-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--border-light);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
.scroll-demo-item:last-child { border-bottom: none; }
.scroll-demo-num {
  width: 24px; height: 24px;
  border-radius: 50%;
  background: var(--brand-100);
  color: var(--brand-600);
  display: flex; align-items: center; justify-content: center;
  font-weight: var(--font-bold);
  font-size: var(--text-xs);
  flex-shrink: 0;
}
.scroll-actions {
  display: flex;
  gap: var(--space-2);
}
</style>
