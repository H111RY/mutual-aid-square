<template>
  <div class="demo-page">
    <!-- ====== 面包屑 ====== -->
    <div v-if="crumbs.length > 0" class="breadcrumb-bar">
      <template v-for="(c, idx) in crumbs" :key="idx">
        <router-link v-if="c.path" :to="c.path" class="breadcrumb-link">{{ c.title }}</router-link>
        <span v-else class="breadcrumb-current">{{ c.title }}</span>
        <span v-if="idx < crumbs.length - 1" class="breadcrumb-sep">/</span>
      </template>
    </div>

    <!-- ====== 顶部导航 ====== -->
    <header class="demo-header">
      <BaseButton variant="ghost" size="sm" @click="$router.push('/square')">← 返回广场</BaseButton>
      <h1 class="demo-title">存储设计演示</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- ====== 架构总览 ====== -->
    <div class="section">
      <BaseCard>
        <template #header><h2 class="section-title">存储架构总览</h2></template>
        <div class="arch-stack">
          <div class="arch-layer layer-app">
            <strong>应用层</strong>
            <span>Stores / Composables / Views</span>
          </div>
          <div class="arch-layer layer-api">
            <strong>存储 API 层</strong>
            <span>core.js (localStorage/sessionStorage) | cache.js (LRU+TTL) | db.js (IndexedDB)</span>
          </div>
          <div class="arch-layer layer-engine">
            <strong>浏览器引擎层</strong>
            <span>localStorage | sessionStorage | IndexedDB | Cache API</span>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- ====== 配额面板 ====== -->
    <div class="section">
      <BaseCard>
        <template #header>
          <div class="section-header-row">
            <h2 class="section-title">存储配额</h2>
            <BaseButton variant="ghost" size="sm" @click="refreshQuota">刷新</BaseButton>
          </div>
        </template>
        <div v-if="quota" class="quota-display">
          <div class="quota-bar-wrap">
            <div class="quota-bar-fill" :style="{ width: quota.percent + '%' }"></div>
          </div>
          <div class="quota-text">
            <span>{{ quota.usedMB }} MB / {{ quota.totalMB }} MB ({{ quota.percent }}%)</span>
          </div>
        </div>
        <div v-else class="quota-empty">获取配额信息中...</div>
      </BaseCard>
    </div>

    <!-- ====== localStorage 浏览器 ====== -->
    <div class="section">
      <BaseCard>
        <template #header>
          <div class="section-header-row">
            <h2 class="section-title">localStorage 浏览器</h2>
            <div class="section-header-actions">
              <BaseButton variant="ghost" size="sm" @click="refreshLS">刷新</BaseButton>
              <BaseButton variant="ghost" size="sm" color="danger" @click="clearAllLS">清空全部</BaseButton>
            </div>
          </div>
        </template>

        <div class="storage-grid">
          <div v-for="entry in lsEntries" :key="entry.key" class="storage-entry">
            <div class="storage-entry-head">
              <span class="storage-key mono">{{ entry.key }}</span>
              <span class="storage-size">{{ entry.size }}</span>
              <button class="storage-delete" @click="deleteLS(entry.key)">×</button>
            </div>
            <pre class="storage-value">{{ entry.display }}</pre>
            <div v-if="entry.ttl" class="storage-meta">
              <span>TTL: {{ entry.ttl }}</span>
              <span :class="entry.expired ? 'meta-expired' : 'meta-valid'">
                {{ entry.expired ? '已过期' : '有效' }}
              </span>
            </div>
          </div>
          <div v-if="lsEntries.length === 0" class="storage-empty">
            当前无 square_ 前缀的存储数据
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- ====== 读写测试 ====== -->
    <div class="section">
      <BaseCard>
        <template #header><h2 class="section-title">存储读写测试</h2></template>

        <div class="test-grid">
          <!-- 写入 -->
          <div class="test-panel">
            <h4 class="test-panel-title">写入测试</h4>
            <div class="test-form">
              <input v-model="testKey" class="test-input" placeholder="键名" />
              <input v-model="testValue" class="test-input" placeholder="值（字符串/JSON）" />
              <div class="test-row">
                <select v-model="testTTL" class="test-select">
                  <option :value="0">永不过期</option>
                  <option :value="5000">5 秒</option>
                  <option :value="30000">30 秒</option>
                  <option :value="60000">1 分钟</option>
                  <option :value="300000">5 分钟</option>
                </select>
                <select v-model="testEngine" class="test-select">
                  <option value="local">localStorage</option>
                  <option value="session">sessionStorage</option>
                </select>
              </div>
              <div class="test-btns">
                <BaseButton variant="primary" size="sm" @click="doSet">写入</BaseButton>
                <BaseButton variant="outline" size="sm" @click="doGet">读取</BaseButton>
                <BaseButton variant="outline" size="sm" @click="doRemove">删除</BaseButton>
              </div>
            </div>
            <div v-if="testResult !== null" class="test-result">
              <span class="test-result-label">结果：</span>
              <pre class="test-result-value">{{ testResult }}</pre>
            </div>
          </div>

          <!-- 批量操作 -->
          <div class="test-panel">
            <h4 class="test-panel-title">批量操作</h4>
            <div class="test-btns-vert">
              <BaseButton variant="outline" size="sm" @click="doBulkWrite(10)">写入 10 条随机数据</BaseButton>
              <BaseButton variant="outline" size="sm" @click="doBulkWrite(50)">写入 50 条随机数据</BaseButton>
              <BaseButton variant="outline" size="sm" color="danger" @click="doClearAll">清空所有 square_ 数据</BaseButton>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- ====== TTL 过期演示 ====== -->
    <div class="section">
      <BaseCard>
        <template #header><h2 class="section-title">TTL 过期演示</h2></template>
        <p class="section-desc">写入一个 5 秒后过期的值，观察自动失效：</p>
        <div class="ttl-demo">
          <BaseButton variant="primary" size="sm" @click="startTTLDemo" :disabled="ttlTimer !== null">
            {{ ttlTimer ? '倒计时中...' : '写入 5 秒 TTL 数据' }}
          </BaseButton>
          <div v-if="ttlTimer !== null" class="ttl-countdown">
            <span :class="ttlCountdown > 0 ? 'ttl-alive' : 'ttl-dead'">
              {{ ttlCountdown > 0 ? `剩余 ${ttlCountdown} 秒` : '已过期！读取返回 null' }}
            </span>
          </div>
          <BaseButton variant="outline" size="sm" @click="checkTTLValue" style="margin-left:8px">
            检查当前值
          </BaseButton>
          <span v-if="ttlChecked !== null" class="ttl-check-result">
            → {{ ttlChecked === null ? 'null (已过期)' : ttlChecked }}
          </span>
        </div>
      </BaseCard>
    </div>

    <!-- ====== 请求缓存状态 ====== -->
    <div class="section">
      <BaseCard>
        <template #header>
          <div class="section-header-row">
            <h2 class="section-title">请求缓存状态 (LRU + TTL)</h2>
            <BaseButton variant="ghost" size="sm" @click="refreshCache">刷新</BaseButton>
          </div>
        </template>
        <div v-if="cacheInfo" class="cache-info">
          <div class="cache-stats-row">
            <div class="cache-stat">
              <span class="cache-stat-num">{{ cacheInfo.size }}</span>
              <span class="cache-stat-label">缓存条目</span>
            </div>
            <div class="cache-stat">
              <span class="cache-stat-num">{{ cacheInfo.totalHits }}</span>
              <span class="cache-stat-label">总命中次数</span>
            </div>
            <div class="cache-stat">
              <span class="cache-stat-num">{{ cacheInfo.expired }}</span>
              <span class="cache-stat-label">已过期</span>
            </div>
            <div class="cache-stat">
              <span class="cache-stat-num">{{ cacheInfo.max }}</span>
              <span class="cache-stat-label">最大容量</span>
            </div>
          </div>

          <!-- 测试缓存 -->
          <div class="cache-test">
            <BaseButton variant="outline" size="sm" @click="testAPICache">模拟 API 请求（带缓存）</BaseButton>
            <span v-if="cacheTestResult" class="cache-test-result">{{ cacheTestResult }}</span>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- ====== IndexedDB 状态 ====== -->
    <div class="section">
      <BaseCard>
        <template #header>
          <div class="section-header-row">
            <h2 class="section-title">IndexedDB 状态</h2>
            <BaseButton variant="ghost" size="sm" @click="refreshIDB">刷新</BaseButton>
          </div>
        </template>
        <div v-if="idbStats" class="idb-grid">
          <div class="idb-stat">
            <span class="idb-stat-num">{{ idbStats.offlinePosts }}</span>
            <span class="idb-stat-label">离线帖子</span>
          </div>
          <div class="idb-stat">
            <span class="idb-stat-num">{{ idbStats.cachedBlobs }}</span>
            <span class="idb-stat-label">Blob 缓存</span>
          </div>
          <div class="idb-stat">
            <span class="idb-stat-num">{{ idbStats.apiSnapshots }}</span>
            <span class="idb-stat-label">API 快照</span>
          </div>
        </div>
        <div v-else class="idb-empty">
          <span v-if="idbError">{{ idbError }}</span>
          <span v-else>加载中...</span>
        </div>
        <div class="idb-actions">
          <BaseButton variant="outline" size="sm" @click="testOfflinePost">模拟离线发帖</BaseButton>
          <BaseButton variant="outline" size="sm" @click="testBlobCache">模拟 Blob 缓存</BaseButton>
          <BaseButton variant="outline" size="sm" @click="testSnapshot">模拟 API 快照</BaseButton>
        </div>
      </BaseCard>
    </div>

    <!-- ====== 跨标签同步测试 ====== -->
    <div class="section">
      <BaseCard>
        <template #header><h2 class="section-title">跨标签页同步</h2></template>
        <p class="section-desc">
          打开两个浏览器标签页到此演示页面，在其中一页写入数据，另一页将实时收到变更通知。
        </p>
        <div v-if="syncEvents.length === 0" class="sync-empty">等待 storage 事件...</div>
        <div v-else class="sync-list">
          <div v-for="(ev, idx) in syncEvents" :key="idx" class="sync-entry">
            <span class="sync-time">{{ ev.time }}</span>
            <span class="sync-key mono">{{ ev.key }}</span>
            <span class="sync-arrow">→</span>
            <span class="sync-val">{{ ev.newValue }}</span>
            <span class="sync-engine">{{ ev.engine }}</span>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useBreadcrumb } from '@/composables/useBreadcrumb';
import {
  getItem, setItem, removeItem, getAllKeys,
  clearAll, getQuota, onStorageChange
} from '@/storage/core';
import { cacheSet, cacheGet, cacheStats, cacheClear } from '@/storage/cache';
import { offlinePosts, blobCache, apiSnapshots, getDBStats } from '@/storage/db';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';

const { crumbs } = useBreadcrumb();

/* ── 配额 ── */
const quota = ref(null);
async function refreshQuota() { quota.value = await getQuota(); }

/* ── localStorage 浏览器 ── */
const lsEntries = ref([]);
function refreshLS() {
  const keys = getAllKeys('local');
  lsEntries.value = keys.map(key => {
    const raw = getItem(key, 'local');
    const size = new Blob([JSON.stringify(raw)]).size;
    return {
      key,
      display: typeof raw === 'object' ? JSON.stringify(raw, null, 2) : String(raw),
      size: size < 1024 ? size + ' B' : (size / 1024).toFixed(1) + ' KB',
      ttl: null,
      expired: false
    };
  });
}
function deleteLS(key) { removeItem(key, 'local'); refreshLS(); }
function clearAllLS() { clearAll('local'); refreshLS(); refreshQuota(); }

/* ── 读写测试 ── */
const testKey = ref('test_demo');
const testValue = ref('{"hello":"world"}');
const testTTL = ref(0);
const testEngine = ref('local');
const testResult = ref(null);
function doSet() {
  let value;
  try { value = JSON.parse(testValue.value); } catch { value = testValue.value; }
  const ok = setItem(testKey.value, value, { ttl: testTTL.value, engine: testEngine.value });
  testResult.value = ok ? '写入成功' : '写入失败（可能配额已满）';
  refreshLS();
  refreshQuota();
}
function doGet() {
  testResult.value = JSON.stringify(getItem(testKey.value, testEngine.value), null, 2);
}
function doRemove() {
  removeItem(testKey.value, testEngine.value);
  testResult.value = '已删除';
  refreshLS();
}
function doBulkWrite(n) {
  for (let i = 0; i < n; i++) {
    setItem(`bulk_test_${i}`, { index: i, data: 'x'.repeat(200), time: Date.now() });
  }
  refreshLS();
  refreshQuota();
}
function doClearAll() { clearAll(); refreshLS(); refreshQuota(); testResult.value = '已清空'; }

/* ── TTL 演示 ── */
const ttlTimer = ref(null);
const ttlCountdown = ref(5);
const ttlChecked = ref(null);
let ttlInterval = null;

function startTTLDemo() {
  setItem('ttl_demo', { msg: '我将在 5 秒后过期' }, { ttl: 5000 });
  ttlCountdown.value = 5;
  ttlChecked.value = null;
  let count = 5;
  ttlTimer.value = setInterval(() => {
    count--;
    ttlCountdown.value = count;
    if (count <= 0) {
      clearInterval(ttlTimer.value);
      ttlTimer.value = null;
    }
  }, 1000);
  refreshLS();
}

function checkTTLValue() {
  ttlChecked.value = getItem('ttl_demo');
}

onUnmounted(() => { if (ttlInterval) clearInterval(ttlInterval); });

/* ── 缓存 ── */
const cacheInfo = ref(null);
const cacheTestResult = ref('');

function refreshCache() { cacheInfo.value = cacheStats(); }

let cacheCallCount = 0;
function testAPICache() {
  cacheCallCount++;
  const key = 'api_test_posts_page1';
  const cached = cacheGet(key);
  if (cached) {
    cacheTestResult.value = `✅ 缓存命中！（第 ${cacheCallCount} 次调用，未真正请求 API）`;
  } else {
    cacheSet(key, { list: [{ id: 1, title: '模拟帖子' }], total: 1 }, { ttl: 10000 });
    cacheSet(`api_test_posts_page1_hit_${cacheCallCount}`, true, { ttl: 60000 });
    cacheTestResult.value = `🆕 首次请求，已写入缓存。再次点击将命中缓存`;
  }
  refreshCache();
}

/* ── IndexedDB ── */
const idbStats = ref(null);
const idbError = ref('');

async function refreshIDB() {
  try {
    idbStats.value = await getDBStats();
    idbError.value = '';
  } catch (e) {
    idbError.value = 'IndexedDB 不可用：' + e.message;
  }
}

async function testOfflinePost() {
  try {
    const id = await offlinePosts.add({ category: 'chat', content: '离线测试帖子 ' + Date.now() });
    idbStats.value = await getDBStats();
    testResult.value = '离线帖子已保存，id=' + id;
  } catch (e) { testResult.value = '失败: ' + e.message; }
}

async function testBlobCache() {
  try {
    const blob = new Blob(['Hello IndexedDB ' + Date.now()], { type: 'text/plain' });
    await blobCache.set('test_blob', blob);
    const retrieved = await blobCache.get('test_blob');
    const text = retrieved ? await retrieved.text() : 'null';
    testResult.value = 'Blob 缓存: ' + text;
    refreshIDB();
  } catch (e) { testResult.value = '失败: ' + e.message; }
}

async function testSnapshot() {
  try {
    await apiSnapshots.set('snap_test', { data: [1, 2, 3], timestamp: Date.now() }, 30000);
    const snap = await apiSnapshots.get('snap_test');
    testResult.value = '快照内容: ' + JSON.stringify(snap);
    refreshIDB();
  } catch (e) { testResult.value = '失败: ' + e.message; }
}

/* ── 跨标签同步 ── */
const syncEvents = ref([]);
let unsubStorage = null;

onMounted(() => {
  refreshQuota();
  refreshLS();
  refreshCache();
  refreshIDB();

  unsubStorage = onStorageChange((ev) => {
    syncEvents.value.unshift({
      time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      ...ev
    });
    if (syncEvents.value.length > 20) syncEvents.value.pop();
    refreshLS();
  });
});

onUnmounted(() => { if (unsubStorage) unsubStorage(); });
</script>

<style scoped>
.demo-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: var(--space-10);
}

.demo-header {
  display: flex; align-items: center; justify-content: space-between;
  height: var(--header-height); padding: 0 var(--space-4);
  background: var(--bg-card); border-bottom: 1px solid var(--border-light);
  position: sticky; top: 0; z-index: 100;
}
.demo-title { font-size: var(--text-xl); font-weight: var(--font-bold); margin: 0; }
.header-spacer { width: 60px; }

/* ── 面包屑 ── */
.breadcrumb-bar {
  max-width: var(--content-max); margin: 0 auto;
  padding: var(--space-2) var(--space-4); font-size: var(--text-sm);
  display: flex; align-items: center; gap: var(--space-1); flex-wrap: wrap;
}
.breadcrumb-link { color: var(--brand-500); text-decoration: none; }
.breadcrumb-link:hover { text-decoration: underline; }
.breadcrumb-current { color: var(--text-primary); font-weight: var(--font-medium); }
.breadcrumb-sep { color: var(--text-muted); margin: 0 2px; }

/* ── 分区 ── */
.section { max-width: var(--content-max); margin: var(--space-4) auto; padding: 0 var(--space-4); }
.section-title { font-size: var(--text-lg); font-weight: var(--font-bold); margin: 0; }
.section-desc { font-size: var(--text-sm); color: var(--text-muted); margin: var(--space-2) 0 var(--space-3); }
.section-header-row { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.section-header-actions { display: flex; gap: var(--space-2); }

/* ── 架构栈 ── */
.arch-stack { display: flex; flex-direction: column; gap: var(--space-3); }
.arch-layer {
  padding: var(--space-4); border-radius: var(--radius-md); text-align: center;
  display: flex; flex-direction: column; gap: 4px;
}
.arch-layer strong { font-size: var(--text-base); }
.arch-layer span { font-size: var(--text-sm); color: var(--text-muted); }
.layer-app { background: var(--brand-50); border: 2px solid var(--brand-300); }
.layer-api { background: var(--green-50); border: 2px solid var(--green-300); }
.layer-engine { background: var(--gray-50); border: 2px solid var(--border-normal); }

/* ── 配额 ── */
.quota-display { display: flex; flex-direction: column; gap: var(--space-2); }
.quota-bar-wrap {
  height: 16px; background: var(--gray-200); border-radius: 8px; overflow: hidden;
}
.quota-bar-fill {
  height: 100%; border-radius: 8px;
  background: linear-gradient(90deg, var(--green-400), var(--amber-400), var(--red-400));
  transition: width 0.5s ease;
  min-width: 4px;
}
.quota-text { font-size: var(--text-sm); color: var(--text-muted); text-align: center; }
.quota-empty { font-size: var(--text-sm); color: var(--text-muted); text-align: center; padding: var(--space-2); }

/* ── localStorage 浏览器 ── */
.storage-grid { display: flex; flex-direction: column; gap: var(--space-2); }
.storage-entry {
  border: 1px solid var(--border-light); border-radius: var(--radius-sm); overflow: hidden;
}
.storage-entry-head {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-2) var(--space-3); background: var(--gray-50);
}
.storage-key { flex: 1; font-size: var(--text-sm); color: var(--brand-600); font-weight: var(--font-semibold); }
.storage-size { font-size: var(--text-xs); color: var(--text-muted); }
.storage-delete {
  width: 24px; height: 24px; border-radius: 50%; border: none;
  background: var(--red-100); color: var(--red-600); cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 14px;
}
.storage-value {
  margin: 0; padding: var(--space-2) var(--space-3);
  font-size: var(--text-xs); font-family: monospace;
  white-space: pre-wrap; word-break: break-all; max-height: 120px; overflow-y: auto;
}
.storage-meta {
  display: flex; gap: var(--space-3); padding: 4px var(--space-3);
  font-size: var(--text-xs); color: var(--text-muted);
}
.meta-valid { color: var(--green-600); }
.meta-expired { color: var(--red-500); }
.storage-empty { font-size: var(--text-sm); color: var(--text-muted); text-align: center; padding: var(--space-4); }

/* ── 测试表单 ── */
.test-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
@media (max-width: 640px) { .test-grid { grid-template-columns: 1fr; } }
.test-panel { display: flex; flex-direction: column; gap: var(--space-3); }
.test-panel-title { font-size: var(--text-sm); font-weight: var(--font-semibold); margin: 0; }
.test-form { display: flex; flex-direction: column; gap: var(--space-2); }
.test-row { display: flex; gap: var(--space-2); }
.test-input, .test-select {
  padding: var(--space-2) var(--space-3); font-size: var(--text-sm);
  border: 1px solid var(--border-normal); border-radius: var(--radius-sm);
  font-family: inherit; outline: none; background: var(--bg-card);
}
.test-input:focus, .test-select:focus { border-color: var(--brand-400); }
.test-btns { display: flex; gap: var(--space-2); flex-wrap: wrap; }
.test-btns-vert { display: flex; flex-direction: column; gap: var(--space-2); }
.test-result { margin-top: var(--space-2); font-size: var(--text-sm); }
.test-result-label { color: var(--text-muted); }
.test-result-value {
  margin: 4px 0 0; padding: var(--space-2); background: var(--gray-50);
  border-radius: var(--radius-sm); font-size: var(--text-xs); font-family: monospace;
  max-height: 150px; overflow-y: auto; white-space: pre-wrap; word-break: break-all;
}

/* ── TTL 演示 ── */
.ttl-demo { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
.ttl-countdown { font-size: var(--text-base); font-weight: var(--font-semibold); }
.ttl-alive { color: var(--green-600); }
.ttl-dead { color: var(--red-500); }
.ttl-check-result { font-size: var(--text-sm); color: var(--text-primary); font-family: monospace; }

/* ── 缓存 ── */
.cache-info { display: flex; flex-direction: column; gap: var(--space-3); }
.cache-stats-row { display: flex; gap: var(--space-4); flex-wrap: wrap; }
.cache-stat {
  display: flex; flex-direction: column; align-items: center;
  padding: var(--space-3) var(--space-4); background: var(--gray-50);
  border-radius: var(--radius-md); min-width: 80px;
}
.cache-stat-num { font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--brand-500); }
.cache-stat-label { font-size: var(--text-xs); color: var(--text-muted); }
.cache-test { display: flex; align-items: center; gap: var(--space-3); }
.cache-test-result { font-size: var(--text-sm); color: var(--text-primary); }

/* ── IndexedDB ── */
.idb-grid { display: flex; gap: var(--space-4); flex-wrap: wrap; }
.idb-stat {
  display: flex; flex-direction: column; align-items: center;
  padding: var(--space-3) var(--space-4); background: var(--gray-50);
  border-radius: var(--radius-md); min-width: 80px;
}
.idb-stat-num { font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--green-500); }
.idb-stat-label { font-size: var(--text-xs); color: var(--text-muted); }
.idb-empty { font-size: var(--text-sm); color: var(--text-muted); padding: var(--space-2); }
.idb-actions { display: flex; gap: var(--space-2); flex-wrap: wrap; margin-top: var(--space-3); }

/* ── 跨标签同步 ── */
.sync-empty { font-size: var(--text-sm); color: var(--text-muted); text-align: center; padding: var(--space-3); }
.sync-list { display: flex; flex-direction: column; gap: 2px; max-height: 200px; overflow-y: auto; }
.sync-entry {
  display: flex; gap: var(--space-2); padding: 4px 8px;
  font-size: var(--text-xs); font-family: monospace; background: var(--gray-50); border-radius: 4px;
}
.sync-time { color: var(--text-muted); }
.sync-key { color: var(--brand-500); font-weight: var(--font-bold); }
.sync-arrow { color: var(--text-muted); }
.sync-val { color: var(--text-primary); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sync-engine { color: var(--text-muted); }

.mono { font-family: monospace; }
</style>
