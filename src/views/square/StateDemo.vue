<template>
  <div class="demo-page">
    <!-- ====== 顶部导航 ====== -->
    <header class="demo-header">
      <BaseButton variant="ghost" size="sm" @click="$router.push('/square')">← 返回广场</BaseButton>
      <h1 class="demo-title">状态管理演示</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- ====== 架构概览 ====== -->
    <div class="section">
      <BaseCard>
        <template #header><h2 class="section-title">架构总览</h2></template>
        <div class="arch-diagram">
          <!-- 三个 Store -->
          <div class="arch-row">
            <div class="arch-box store-box">
              <span class="arch-box-icon">🏪</span>
              <strong>useSquareStore</strong>
              <span class="arch-box-desc">帖子·分类·公告·点赞</span>
            </div>
            <div class="arch-box store-box">
              <span class="arch-box-icon">⚙️</span>
              <strong>useAppStore</strong>
              <span class="arch-box-desc">用户·Toast·Loading·主题</span>
            </div>
            <div class="arch-box store-box">
              <span class="arch-box-icon">📝</span>
              <strong>useDraftStore</strong>
              <span class="arch-box-desc">草稿·localStorage</span>
            </div>
          </div>

          <!-- 箭头 -->
          <div class="arch-arrow">▼ Pinia 响应式分发 ▼</div>

          <!-- Composables + Views -->
          <div class="arch-row arch-bottom">
            <div class="arch-box composable-box">
              <span class="arch-box-icon">🔌</span>
              <span>useVoiceInput</span>
            </div>
            <div class="arch-box composable-box">
              <span class="arch-box-icon">🖼️</span>
              <span>useImageUpload</span>
            </div>
            <div class="arch-box composable-box">
              <span class="arch-box-icon">📜</span>
              <span>useInfiniteScroll</span>
            </div>
            <div class="arch-box view-box">
              <span class="arch-box-icon">👁️</span>
              <span>Views</span>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- ====== 实时状态检查器 ====== -->
    <div class="section">
      <BaseCard>
        <template #header>
          <div class="section-header-row">
            <h2 class="section-title">状态快照</h2>
            <BaseBadge :color="storeChanged ? 'warning' : 'success'">
              {{ storeChanged ? '已变更' : '未变更' }}
            </BaseBadge>
          </div>
        </template>

        <div class="inspector-grid">
          <!-- useSquareStore -->
          <div class="inspector-column">
            <h3 class="inspector-name">
              useSquareStore
              <span class="store-size">{{ squareStore.$state | json }}</span>
            </h3>
            <div class="state-list">
              <div class="state-row">
                <span class="state-key">currentTab</span>
                <span class="state-val">{{ squareStore.currentTab }} ({{ squareStore.activeTabValue }})</span>
              </div>
              <div class="state-row">
                <span class="state-key">posts.length</span>
                <span class="state-val">{{ squareStore.posts.length }}</span>
              </div>
              <div class="state-row">
                <span class="state-key">page</span>
                <span class="state-val">{{ squareStore.page }}</span>
              </div>
              <div class="state-row">
                <span class="state-key">isLoading</span>
                <BaseBadge :color="squareStore.isLoading ? 'warning' : 'default'">{{ squareStore.isLoading }}</BaseBadge>
              </div>
              <div class="state-row">
                <span class="state-key">isEnd</span>
                <BaseBadge :color="squareStore.isEnd ? 'default' : 'info'">{{ squareStore.isEnd }}</BaseBadge>
              </div>
              <div class="state-row">
                <span class="state-key">fetchError</span>
                <span :class="squareStore.fetchError ? 'val-error' : 'state-val'">{{ squareStore.fetchError || '-' }}</span>
              </div>
              <div class="state-row">
                <span class="state-key">notices</span>
                <span class="state-val">{{ squareStore.notices.length }} 条</span>
              </div>
              <div class="state-row">
                <span class="state-key">isLargeFont</span>
                <BaseBadge :color="squareStore.isLargeFont ? 'info' : 'default'">{{ squareStore.isLargeFont }}</BaseBadge>
              </div>
              <div class="state-row">
                <span class="state-key">hasPublished</span>
                <BaseBadge :color="squareStore.hasPublished ? 'success' : 'default'">{{ squareStore.hasPublished }}</BaseBadge>
              </div>
            </div>
          </div>

          <!-- useAppStore -->
          <div class="inspector-column">
            <h3 class="inspector-name">useAppStore</h3>
            <div class="state-list">
              <div class="state-row">
                <span class="state-key">isLoggedIn</span>
                <BaseBadge :color="appStore.isLoggedIn ? 'success' : 'default'">{{ appStore.isLoggedIn }}</BaseBadge>
              </div>
              <div class="state-row">
                <span class="state-key">user.nickname</span>
                <span class="state-val">{{ appStore.user.nickname || '-' }}</span>
              </div>
              <div class="state-row">
                <span class="state-key">user.building</span>
                <span class="state-val">{{ appStore.user.building || '-' }}</span>
              </div>
              <div class="state-row">
                <span class="state-key">toasts</span>
                <span class="state-val">{{ appStore.toasts.length }} 个</span>
              </div>
              <div class="state-row">
                <span class="state-key">isGlobalLoading</span>
                <BaseBadge :color="appStore.isGlobalLoading ? 'warning' : 'default'">{{ appStore.isGlobalLoading }}</BaseBadge>
              </div>
              <div class="state-row">
                <span class="state-key">loadingStack</span>
                <span class="state-val">{{ appStore.loadingStack }}</span>
              </div>
              <div class="state-row">
                <span class="state-key">isOnline</span>
                <BaseBadge :color="appStore.isOnline ? 'success' : 'danger'">{{ appStore.isOnline }}</BaseBadge>
              </div>
              <div class="state-row">
                <span class="state-key">colorScheme</span>
                <span class="state-val">{{ appStore.colorScheme }} → {{ appStore.effectiveScheme }}</span>
              </div>
              <div class="state-row">
                <span class="state-key">sidebarVisible</span>
                <BaseBadge :color="appStore.sidebarVisible ? 'info' : 'default'">{{ appStore.sidebarVisible }}</BaseBadge>
              </div>
            </div>
          </div>

          <!-- useDraftStore -->
          <div class="inspector-column">
            <h3 class="inspector-name">useDraftStore</h3>
            <div class="state-list">
              <div class="state-row">
                <span class="state-key">draftCount</span>
                <span class="state-val">{{ draftStore.draftCount }}</span>
              </div>
              <div class="state-row" v-if="draftStore.drafts.length > 0">
                <span class="state-key">最新草稿</span>
                <span class="state-val">{{ draftStore.drafts[0]?.title || '-' }}</span>
              </div>
              <div v-if="draftStore.drafts.length === 0" class="state-empty">暂无草稿</div>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- ====== 操作面板 ====== -->
    <div class="section">
      <BaseCard>
        <template #header><h2 class="section-title">操作测试面板</h2></template>

        <div class="action-grid">
          <!-- SquareStore 操作 -->
          <div class="action-group">
            <h4 class="action-group-title">useSquareStore</h4>
            <div class="action-btns">
              <BaseButton variant="outline" size="sm" @click="squareStore.fetchPosts(true)">刷新帖子</BaseButton>
              <BaseButton variant="outline" size="sm" @click="squareStore.fetchNotices()">获取公告</BaseButton>
              <BaseButton variant="outline" size="sm" @click="squareStore.dismissNotices()">清除公告</BaseButton>
              <BaseButton variant="outline" size="sm" @click="squareStore.toggleFontMode()">
                {{ squareStore.isLargeFont ? '关闭' : '开启' }}大号字体
              </BaseButton>
              <BaseButton variant="outline" size="sm" @click="squareStore.switchTab((squareStore.currentTab + 1) % 4)">
                切换分类
              </BaseButton>
              <BaseButton variant="outline" size="sm" @click="squareStore.onPublished()">触发发布回调</BaseButton>
            </div>
          </div>

          <!-- AppStore 操作 -->
          <div class="action-group">
            <h4 class="action-group-title">useAppStore</h4>
            <div class="action-btns">
              <BaseButton variant="outline" size="sm" @click="appStore.setUser({ id:'u1', nickname:'老张', building:'3号楼', role:'resident' })">设置用户</BaseButton>
              <BaseButton variant="outline" size="sm" @click="appStore.clearUser()">清除用户</BaseButton>
              <BaseButton variant="outline" size="sm" @click="appStore.showToast('操作成功', 'success')">成功 Toast</BaseButton>
              <BaseButton variant="outline" size="sm" @click="appStore.showToast('网络异常', 'error')">错误 Toast</BaseButton>
              <BaseButton variant="outline" size="sm" @click="appStore.startLoading()">开始 Loading</BaseButton>
              <BaseButton variant="outline" size="sm" @click="appStore.stopLoading()">结束 Loading</BaseButton>
              <BaseButton variant="outline" size="sm" @click="appStore.toggleSidebar()">切换侧栏</BaseButton>
              <BaseButton
                v-for="s in ['light','dark','auto']"
                :key="s"
                :variant="appStore.colorScheme === s ? 'primary' : 'outline'"
                size="sm"
                @click="appStore.setColorScheme(s)"
              >主题: {{ s }}</BaseButton>
            </div>
          </div>

          <!-- DraftStore 操作 -->
          <div class="action-group">
            <h4 class="action-group-title">useDraftStore</h4>
            <div class="action-btns">
              <BaseButton variant="outline" size="sm" @click="draftStore.saveDraft({ category:'chat', content:'测试草稿内容：今天天气真好...', images:[] })">保存草稿</BaseButton>
              <BaseButton variant="outline" size="sm" @click="draftStore.saveDraft({ category:'help', content:'求助：楼下花园需要浇水', images:[] })">保存求助草稿</BaseButton>
              <BaseButton
                variant="outline" size="sm"
                @click="draftStore.drafts[0] && draftStore.removeDraft(draftStore.drafts[0].id)"
                :disabled="draftStore.drafts.length === 0"
              >删除最新草稿</BaseButton>
              <BaseButton
                variant="outline" size="sm"
                @click="draftStore.clearAllDrafts()"
                :disabled="draftStore.drafts.length === 0"
              >清空全部草稿</BaseButton>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- ====== 变更日志 ====== -->
    <div class="section">
      <BaseCard>
        <template #header>
          <div class="section-header-row">
            <h2 class="section-title">变更日志</h2>
            <BaseButton variant="ghost" size="sm" @click="changeLog = []">清空日志</BaseButton>
          </div>
        </template>
        <div v-if="changeLog.length === 0" class="log-empty">操作上方按钮，此处将记录每次状态变更</div>
        <div v-else class="log-list">
          <div v-for="(entry, idx) in changeLog" :key="idx" class="log-entry">
            <span class="log-time">{{ entry.time }}</span>
            <span class="log-store">{{ entry.store }}</span>
            <span class="log-action">{{ entry.action }}</span>
            <span class="log-detail">{{ entry.detail }}</span>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- ====== 数据流示意 ====== -->
    <div class="section">
      <BaseCard>
        <template #header><h2 class="section-title">数据流示意</h2></template>
        <div class="flow-diagram">
          <div class="flow-step">
            <span class="flow-num">1</span>
            <div class="flow-content">
              <strong>组件 dispatch Action</strong>
              <p>store.fetchPosts() / appStore.setUser()</p>
            </div>
          </div>
          <div class="flow-arrow">→</div>
          <div class="flow-step">
            <span class="flow-num">2</span>
            <div class="flow-content">
              <strong>Store 更新 State</strong>
              <p>ref / reactive 响应式变更</p>
            </div>
          </div>
          <div class="flow-arrow">→</div>
          <div class="flow-step">
            <span class="flow-num">3</span>
            <div class="flow-content">
              <strong>组件重新渲染</strong>
              <p>computed / watch 自动追踪依赖</p>
            </div>
          </div>
          <div class="flow-arrow">→</div>
          <div class="flow-step">
            <span class="flow-num">4</span>
            <div class="flow-content">
              <strong>持久化 / 副作用</strong>
              <p>localStorage / API 调用 / body class</p>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- ====== Toast 演示区 ====== -->
    <div class="toast-demo-area">
      <transition-group name="toast-slide">
        <div
          v-for="t in appStore.toasts"
          :key="t.id"
          :class="['demo-toast', 'toast-' + t.type]"
          @click="appStore.removeToast(t.id)"
        >
          <span class="toast-icon">{{ toastIcon(t.type) }}</span>
          <span>{{ t.message }}</span>
        </div>
      </transition-group>
    </div>

    <!-- ====== 全局 Loading 遮罩 ====== -->
    <transition name="fade">
      <div v-if="appStore.isGlobalLoading" class="global-loading-overlay">
        <div class="global-loading-spinner"></div>
        <span>加载中...</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useSquareStore } from '@/stores/square';
import { useAppStore } from '@/stores/app';
import { useDraftStore } from '@/stores/draft';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';

const squareStore = useSquareStore();
const appStore = useAppStore();
const draftStore = useDraftStore();

// ── 变更日志 ──
const changeLog = ref([]);
const storeChanged = ref(false);
let changeTimer = null;

function addLog(storeName, action, detail) {
  const now = new Date();
  const time = now.toLocaleTimeString('zh-CN', { hour12: false });
  changeLog.value.unshift({ time, store: storeName, action, detail });
  if (changeLog.value.length > 50) changeLog.value.pop();

  storeChanged.value = true;
  clearTimeout(changeTimer);
  changeTimer = setTimeout(() => { storeChanged.value = false; }, 2000);
}

// 监听 SquareStore
watch(() => squareStore.currentTab, v => addLog('square', 'switchTab', `→ ${v}`));
watch(() => squareStore.posts.length, (v, prev) => {
  if (prev !== undefined) addLog('square', 'fetchPosts', `posts: ${prev} → ${v}`);
});
watch(() => squareStore.notices.length, v => addLog('square', 'notices', `${v} 条公告`));
watch(() => squareStore.isLargeFont, v => addLog('square', 'toggleFontMode', v ? '大号字体' : '标准字体'));
watch(() => squareStore.hasPublished, v => { if (v) addLog('square', 'onPublished', '触发发布回调'); });
watch(() => squareStore.fetchError, v => { if (v) addLog('square', 'fetchError', v); });
watch(() => squareStore.isLoading, v => addLog('square', 'isLoading', String(v)));

// 监听 AppStore
watch(() => appStore.user.id, v => addLog('app', 'setUser', v ? `id=${v}` : '已清除'));
watch(() => appStore.isGlobalLoading, v => addLog('app', 'isGlobalLoading', String(v)));
watch(() => appStore.sidebarVisible, v => addLog('app', 'sidebar', v ? '打开' : '关闭'));
watch(() => appStore.colorScheme, v => addLog('app', 'colorScheme', v));
watch(() => appStore.toasts.length, (v, prev) => {
  if (v > (prev || 0)) addLog('app', 'showToast', appStore.toasts[v - 1]?.message || '');
});

// 监听 DraftStore
watch(() => draftStore.draftCount, (v, prev) => {
  if (v > (prev || 0)) addLog('draft', 'saveDraft', draftStore.drafts[0]?.title || '');
  if (v < (prev || 0)) addLog('draft', 'removeDraft', `剩余 ${v} 条`);
});

function toastIcon(type) {
  switch (type) {
    case 'success': return '✅';
    case 'error': return '❌';
    case 'warning': return '⚠️';
    default: return 'ℹ️';
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

/* 分区 */
.section {
  max-width: var(--content-max);
  margin: var(--space-4) auto;
  padding: 0 var(--space-4);
}
.section-title { font-size: var(--text-lg); font-weight: var(--font-bold); margin: 0; }
.section-header-row { display: flex; align-items: center; justify-content: space-between; width: 100%; }

/* ====== 架构图 ====== */
.arch-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}
.arch-row {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  justify-content: center;
}
.arch-arrow {
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-weight: var(--font-semibold);
}
.arch-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 2px solid var(--border-normal);
  min-width: 130px;
  text-align: center;
}
.arch-box-icon { font-size: 24px; }
.arch-box-desc { font-size: var(--text-xs); color: var(--text-muted); }
.store-box { border-color: var(--brand-300); background: var(--brand-50); }
.composable-box { border-color: var(--green-300); background: var(--green-50); }
.view-box { border-color: var(--amber-300); background: var(--amber-50); }

/* ====== 状态检查器 ====== */
.inspector-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}
@media (max-width: 768px) {
  .inspector-grid { grid-template-columns: 1fr; }
  .flow-diagram { flex-direction: column; }
  .flow-arrow { transform: rotate(90deg); }
}
.inspector-name {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--brand-600);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--border-light);
  margin: 0 0 var(--space-2);
}
.store-size { font-weight: var(--font-normal); color: var(--text-muted); font-size: var(--text-xs); }

.state-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.state-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
}
.state-key {
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-family: monospace;
}
.state-val {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}
.val-error { font-size: var(--text-sm); color: var(--red-500); }
.state-empty { font-size: var(--text-sm); color: var(--text-muted); text-align: center; padding: var(--space-3); }

/* ====== 操作面板 ====== */
.action-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.action-group-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  margin: 0 0 var(--space-2);
}
.action-btns {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

/* ====== 变更日志 ====== */
.log-empty {
  font-size: var(--text-sm);
  color: var(--text-muted);
  text-align: center;
  padding: var(--space-4);
}
.log-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 300px;
  overflow-y: auto;
}
.log-entry {
  display: flex;
  gap: var(--space-2);
  padding: 4px 8px;
  font-size: var(--text-xs);
  font-family: monospace;
  background: var(--gray-50);
  border-radius: 4px;
  align-items: baseline;
}
.log-time { color: var(--text-muted); flex-shrink: 0; }
.log-store { color: var(--brand-500); font-weight: var(--font-bold); flex-shrink: 0; min-width: 48px; }
.log-action { color: var(--text-primary); flex-shrink: 0; min-width: 80px; }
.log-detail { color: var(--text-secondary); word-break: break-all; }

/* ====== 数据流示意 ====== */
.flow-diagram {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}
.flow-step {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.flow-num {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--brand-400);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: var(--font-bold);
  font-size: var(--text-sm);
  flex-shrink: 0;
}
.flow-content {
  text-align: left;
}
.flow-content strong {
  font-size: var(--text-sm);
  color: var(--text-primary);
}
.flow-content p {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin: 2px 0 0;
}
.flow-arrow {
  font-size: var(--text-xl);
  color: var(--brand-400);
  font-weight: var(--font-bold);
}

/* ====== Toast 演示区 ====== */
.toast-demo-area {
  position: fixed;
  top: 80px;
  right: var(--space-4);
  z-index: 9998;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  pointer-events: none;
}
.demo-toast {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  box-shadow: var(--shadow-md);
  pointer-events: auto;
  cursor: pointer;
  min-width: 200px;
}
.toast-info    { background: var(--brand-500); color: #fff; }
.toast-success { background: var(--green-500); color: #fff; }
.toast-error   { background: var(--red-500); color: #fff; }
.toast-warning { background: var(--amber-500); color: #fff; }

.toast-slide-enter-active { transition: all 0.3s ease; }
.toast-slide-leave-active { transition: all 0.2s ease; }
.toast-slide-enter-from { opacity: 0; transform: translateX(60px); }
.toast-slide-leave-to   { opacity: 0; transform: translateX(60px); }

/* ====== 全局 Loading ====== */
.global-loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9997;
  background: rgba(255,255,255,0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  font-size: var(--text-lg);
  color: var(--brand-600);
}
.global-loading-spinner {
  width: 48px; height: 48px;
  border: 4px solid var(--gray-200);
  border-top-color: var(--brand-400);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.fade-enter-active,
.fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
