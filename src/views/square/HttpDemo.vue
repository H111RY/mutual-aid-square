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
      <h1 class="demo-title">HTTP 请求设计演示</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- ====== 架构总览 ====== -->
    <div class="section">
      <BaseCard>
        <template #header><h2 class="section-title">HTTP 客户端架构</h2></template>
        <div class="arch-flow">
          <div class="arch-node">
            <span class="arch-node-icon">📤</span>
            <strong>请求拦截器</strong>
            <ul>
              <li>Token 注入</li>
              <li>请求 ID 追踪</li>
              <li>Loading 计数</li>
              <li>GET 去重</li>
            </ul>
          </div>
          <div class="arch-arrow">→</div>
          <div class="arch-node">
            <span class="arch-node-icon">🌐</span>
            <strong>Axios 实例</strong>
            <ul>
              <li>baseURL: /api</li>
              <li>timeout: 15s</li>
              <li>自动 Content-Type</li>
            </ul>
          </div>
          <div class="arch-arrow">→</div>
          <div class="arch-node">
            <span class="arch-node-icon">📥</span>
            <strong>响应拦截器</strong>
            <ul>
              <li>data 自动解包</li>
              <li>错误归一化</li>
              <li>401 检测</li>
              <li>GET 自动重试×2</li>
            </ul>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- ====== 请求构造器 ====== -->
    <div class="section">
      <BaseCard>
        <template #header><h2 class="section-title">请求构造器</h2></template>

        <!-- Method + URL -->
        <div class="builder-row">
          <div class="builder-method">
            <label class="builder-label">Method</label>
            <select v-model="reqMethod" class="builder-select">
              <option v-for="m in methods" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          <div class="builder-url">
            <label class="builder-label">URL</label>
            <input v-model="reqUrl" class="builder-input" placeholder="/square/posts?page=1" />
          </div>
          <div class="builder-send">
            <BaseButton variant="primary" size="md" @click="sendRequest" :disabled="sending">
              {{ sending ? '发送中...' : '发送请求' }}
            </BaseButton>
          </div>
        </div>

        <!-- Headers -->
        <div class="builder-section">
          <label class="builder-label">Headers</label>
          <div class="kv-editor">
            <div v-for="(h, idx) in reqHeaders" :key="idx" class="kv-row">
              <input v-model="h.key" placeholder="Key" class="kv-input" />
              <input v-model="h.value" placeholder="Value" class="kv-input" />
              <button class="kv-remove" @click="reqHeaders.splice(idx, 1)">×</button>
            </div>
            <BaseButton variant="ghost" size="sm" @click="reqHeaders.push({ key: '', value: '' })">+ 添加 Header</BaseButton>
          </div>
        </div>

        <!-- Body -->
        <div v-if="reqMethod !== 'GET' && reqMethod !== 'HEAD'" class="builder-section">
          <label class="builder-label">Body (JSON)</label>
          <textarea v-model="reqBody" class="builder-textarea" rows="5" placeholder='{"key": "value"}'></textarea>
        </div>
      </BaseCard>
    </div>

    <!-- ====== 快捷测试 ====== -->
    <div class="section">
      <BaseCard>
        <template #header><h2 class="section-title">快捷 API 测试</h2></template>
        <div class="quick-btns">
          <BaseButton variant="outline" size="sm" @click="quickTest('getPosts', { page:1, page_size:5 })">GET 帖子列表</BaseButton>
          <BaseButton variant="outline" size="sm" @click="quickTest('getNotices')">GET 公告</BaseButton>
          <BaseButton variant="outline" size="sm" @click="quickTest('getPostDetail', 1)">GET 帖子详情</BaseButton>
          <BaseButton variant="outline" size="sm" @click="quickTest('createPost', { category:'chat', content:'测试' })">POST 发帖</BaseButton>
          <BaseButton variant="outline" size="sm" @click="quickTest('likePost', 1)">POST 点赞</BaseButton>
          <BaseButton variant="outline" size="sm" @click="quickTest('getComments', 1)">GET 评论</BaseButton>
        </div>
      </BaseCard>
    </div>

    <!-- ====== 响应面板 ====== -->
    <div class="section" v-if="responseHistory.length > 0">
      <BaseCard>
        <template #header>
          <div class="section-header-row">
            <h2 class="section-title">请求历史</h2>
            <BaseButton variant="ghost" size="sm" @click="responseHistory = []">清空</BaseButton>
          </div>
        </template>

        <div class="response-list">
          <div v-for="(entry, idx) in responseHistory" :key="idx" class="response-entry" :class="'status-' + entry.statusClass">
            <!-- 摘要行 -->
            <div class="response-summary" @click="entry.expanded = !entry.expanded">
              <span :class="['resp-method', 'method-' + entry.method]">{{ entry.method }}</span>
              <span class="resp-url">{{ entry.url }}</span>
              <span :class="['resp-status', 'badge-' + entry.statusClass]">{{ entry.status || 'ERR' }}</span>
              <span class="resp-time">{{ entry.duration }}ms</span>
              <span class="resp-expand">{{ entry.expanded ? '▲' : '▼' }}</span>
            </div>

            <!-- 详情 -->
            <div v-if="entry.expanded" class="response-detail">
              <div class="detail-section">
                <span class="detail-label">Request ID</span>
                <span class="detail-value mono">{{ entry.requestId }}</span>
              </div>
              <div class="detail-section">
                <span class="detail-label">Request Headers</span>
                <pre class="detail-code">{{ JSON.stringify(entry.reqHeaders, null, 2) }}</pre>
              </div>
              <div v-if="entry.reqBody" class="detail-section">
                <span class="detail-label">Request Body</span>
                <pre class="detail-code">{{ formatBody(entry.reqBody) }}</pre>
              </div>
              <div class="detail-section">
                <span class="detail-label">Response Body</span>
                <pre :class="['detail-code', entry.ok ? '' : 'code-error']">{{ formatBody(entry.resBody) }}</pre>
              </div>
              <div v-if="entry.errorMessage" class="detail-error">
                <strong>错误消息：</strong>{{ entry.errorMessage }}
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- ====== 拦截器流程 ====== -->
    <div class="section">
      <BaseCard>
        <template #header><h2 class="section-title">拦截器执行流程</h2></template>
        <div class="interceptor-flow">
          <div class="if-step request">
            <div class="if-step-head">Request Interceptor</div>
            <div class="if-step-items">
              <span class="if-item">config.__requestId</span>
              <span class="if-arrow">→</span>
              <span class="if-item">Token 注入</span>
              <span class="if-arrow">→</span>
              <span class="if-item">Loading++</span>
              <span class="if-arrow">→</span>
              <span class="if-item">GET 去重检查</span>
            </div>
          </div>
          <div class="if-connector">↓ 发送请求 ↓</div>
          <div class="if-step response">
            <div class="if-step-head">Response Interceptor</div>
            <div class="if-step-items">
              <span class="if-item">清理 pending</span>
              <span class="if-arrow">→</span>
              <span class="if-item">Loading--</span>
              <span class="if-arrow">→</span>
              <span class="if-item">res.data 解包</span>
              <span class="if-arrow">→</span>
              <span class="if-item">error 归一化</span>
              <span class="if-arrow">→</span>
              <span class="if-item">5xx? 重试×2</span>
              <span class="if-arrow">→</span>
              <span class="if-item">401? 清Token</span>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useBreadcrumb } from '@/composables/useBreadcrumb';
import http from '@/api/http';
import * as squareApi from '@/api/square';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';

const { crumbs } = useBreadcrumb();

/* ── 请求构造器 ── */
const methods = ['GET', 'POST', 'PUT', 'DELETE'];
const reqMethod = ref('GET');
const reqUrl = ref('/square/posts');
const reqBody = ref('');
const reqHeaders = ref([{ key: 'Content-Type', value: 'application/json' }]);
const sending = ref(false);

/* ── 请求历史 ── */
const responseHistory = ref([]);

async function sendRequest() {
  if (!reqUrl.value.trim()) return;
  sending.value = true;

  const startTime = Date.now();
  const url = reqUrl.value.trim();
  const method = reqMethod.value.toLowerCase();
  const headers = {};
  reqHeaders.value.forEach(h => { if (h.key) headers[h.key] = h.value; });

  let body = null;
  if (reqBody.value.trim()) {
    try { body = JSON.parse(reqBody.value); } catch { body = reqBody.value; }
  }

  const entry = {
    id: Date.now(),
    method: reqMethod.value,
    url,
    reqHeaders: { ...headers },
    reqBody: body,
    status: null,
    statusClass: 'info',
    resBody: null,
    duration: 0,
    ok: false,
    requestId: '',
    errorMessage: '',
    expanded: false
  };

  try {
    const config = { headers };
    const res = await http({ method, url, data: body, ...(method === 'get' ? { params: body } : {}) });
    entry.status = 200;
    entry.statusClass = 'success';
    entry.resBody = res;
    entry.ok = true;
    entry.requestId = res?.__requestId || '';
  } catch (err) {
    entry.status = err.status || 0;
    entry.statusClass = err.status >= 500 ? 'error' : err.status >= 400 ? 'warning' : 'error';
    entry.resBody = err.data || err.message;
    entry.errorMessage = err.message || '请求失败';
    entry.requestId = err.config?.__requestId || '';
  }

  entry.duration = Date.now() - startTime;
  responseHistory.value.unshift(entry);
  if (responseHistory.value.length > 50) responseHistory.value.pop();
  sending.value = false;
}

/* ── 快捷测试 ── */
async function quickTest(fnName, arg) {
  const fn = squareApi[fnName];
  if (!fn) return;

  // 更新构造器显示
  const endpointMap = {
    getPosts: ['GET', '/square/posts'],
    getNotices: ['GET', '/square/notices'],
    getPostDetail: ['GET', `/square/posts/${arg}`],
    createPost: ['POST', '/square/posts'],
    likePost: ['POST', `/square/posts/${arg}/like`],
    getComments: ['GET', `/square/posts/${arg}/comments`]
  };
  const [method, url] = endpointMap[fnName] || ['GET', url];
  reqMethod.value = method;
  reqUrl.value = url;
  if (fnName === 'createPost') reqBody.value = JSON.stringify(arg, null, 2);
  else reqBody.value = '';

  sending.value = true;
  const start = Date.now();
  const entry = {
    id: Date.now(), method, url,
    reqHeaders: { 'Content-Type': 'application/json' },
    reqBody: fnName === 'createPost' ? arg : null,
    status: null, statusClass: 'info',
    resBody: null, duration: 0, ok: false,
    requestId: '', errorMessage: '', expanded: false
  };

  try {
    const res = await fn(arg);
    entry.status = 200;
    entry.statusClass = 'success';
    entry.resBody = res;
    entry.ok = true;
  } catch (err) {
    entry.status = err.status || 0;
    entry.statusClass = err.status >= 500 ? 'error' : err.status >= 400 ? 'warning' : 'error';
    entry.resBody = err.data || err.message;
    entry.errorMessage = err.message || '请求失败';
  }

  entry.duration = Date.now() - start;
  responseHistory.value.unshift(entry);
  sending.value = false;
}

function formatBody(body) {
  if (body === null || body === undefined) return 'null';
  if (typeof body === 'string') {
    try { return JSON.stringify(JSON.parse(body), null, 2); } catch { return body; }
  }
  return JSON.stringify(body, null, 2);
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
  display: flex; align-items: center; gap: var(--space-1); flex-wrap: wrap;
}
.breadcrumb-link { color: var(--brand-500); text-decoration: none; }
.breadcrumb-link:hover { text-decoration: underline; }
.breadcrumb-current { color: var(--text-primary); font-weight: var(--font-medium); }
.breadcrumb-sep { color: var(--text-muted); margin: 0 2px; }

/* ── 分区 ── */
.section {
  max-width: var(--content-max);
  margin: var(--space-4) auto;
  padding: 0 var(--space-4);
}
.section-title { font-size: var(--text-lg); font-weight: var(--font-bold); margin: 0; }
.section-header-row { display: flex; align-items: center; justify-content: space-between; width: 100%; }

/* ── 架构流程 ── */
.arch-flow {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}
.arch-node {
  flex: 1;
  min-width: 170px;
  max-width: 240px;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--gray-50);
  border: 2px solid var(--border-normal);
  text-align: center;
}
.arch-node-icon { font-size: 28px; display: block; margin-bottom: var(--space-2); }
.arch-node strong { font-size: var(--text-base); color: var(--text-primary); }
.arch-node ul {
  list-style: none; padding: 0; margin: var(--space-2) 0 0;
  font-size: var(--text-xs); color: var(--text-muted);
}
.arch-node li { padding: 2px 0; }
.arch-arrow {
  font-size: var(--text-2xl); color: var(--brand-400);
  display: flex; align-items: center; padding-top: 40px;
  flex-shrink: 0;
}

/* ── 构造器 ── */
.builder-row {
  display: flex; align-items: flex-end; gap: var(--space-3);
  flex-wrap: wrap;
}
.builder-label {
  display: block; font-size: var(--text-xs); color: var(--text-muted);
  margin-bottom: 4px; font-weight: var(--font-semibold);
}
.builder-method { flex-shrink: 0; }
.builder-url { flex: 1; min-width: 200px; }
.builder-select, .builder-input {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-base); border: 1px solid var(--border-normal);
  border-radius: var(--radius-sm); font-family: inherit;
  outline: none; background: var(--bg-card);
}
.builder-select:focus, .builder-input:focus { border-color: var(--brand-400); }
.builder-input { width: 100%; box-sizing: border-box; font-family: monospace; }
.builder-select { min-width: 100px; }

.builder-section { margin-top: var(--space-3); }
.builder-textarea {
  width: 100%; box-sizing: border-box;
  padding: var(--space-3); font-size: var(--text-sm);
  border: 1px solid var(--border-normal); border-radius: var(--radius-sm);
  font-family: monospace; outline: none; resize: vertical; background: var(--bg-card);
}
.builder-textarea:focus { border-color: var(--brand-400); }

/* KV 编辑器 */
.kv-editor { display: flex; flex-direction: column; gap: var(--space-1); }
.kv-row { display: flex; gap: var(--space-2); align-items: center; }
.kv-input {
  flex: 1; padding: var(--space-1) var(--space-2);
  font-size: var(--text-sm); border: 1px solid var(--border-normal);
  border-radius: var(--radius-sm); font-family: monospace; outline: none; background: var(--bg-card);
}
.kv-input:focus { border-color: var(--brand-400); }
.kv-remove {
  width: 28px; height: 28px; border-radius: 50%;
  border: none; background: var(--gray-200); color: var(--text-secondary);
  cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;
}

/* ── 快捷测试 ── */
.quick-btns { display: flex; flex-wrap: wrap; gap: var(--space-2); }

/* ── 响应列表 ── */
.response-list { display: flex; flex-direction: column; gap: 4px; }
.response-entry { border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--border-light); }
.response-summary {
  display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2) var(--space-3);
  cursor: pointer; transition: background var(--duration-fast);
}
.response-summary:hover { background: var(--gray-50); }

.resp-method {
  font-size: var(--text-xs); font-weight: var(--font-bold);
  padding: 2px 8px; border-radius: 4px;
  min-width: 48px; text-align: center; font-family: monospace;
}
.method-GET    { background: var(--green-100); color: var(--green-700); }
.method-POST   { background: var(--brand-100); color: var(--brand-700); }
.method-PUT    { background: var(--amber-100); color: var(--amber-700); }
.method-DELETE { background: var(--red-100); color: var(--red-700); }

.resp-url {
  flex: 1; font-size: var(--text-sm); color: var(--text-primary);
  font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.resp-status {
  font-size: var(--text-xs); font-weight: var(--font-bold);
  padding: 2px 8px; border-radius: 4px; font-family: monospace; min-width: 36px; text-align: center;
}
.badge-success { background: var(--green-100); color: var(--green-700); }
.badge-warning { background: var(--amber-100); color: var(--amber-700); }
.badge-error   { background: var(--red-100); color: var(--red-700); }
.badge-info    { background: var(--gray-100); color: var(--text-muted); }

.resp-time { font-size: var(--text-xs); color: var(--text-muted); font-family: monospace; min-width: 50px; }
.resp-expand { font-size: var(--text-xs); color: var(--text-muted); }

/* 详情 */
.response-detail {
  padding: var(--space-3); border-top: 1px solid var(--border-light);
  background: var(--gray-50);
}
.detail-section { margin-bottom: var(--space-2); }
.detail-label {
  font-size: var(--text-xs); color: var(--text-muted); font-weight: var(--font-semibold);
  display: block; margin-bottom: 4px;
}
.detail-value.mono { font-family: monospace; font-size: var(--text-xs); }
.detail-code {
  margin: 0; padding: var(--space-2) var(--space-3);
  background: #1e1e2e; color: #cdd6f4;
  border-radius: var(--radius-sm); font-size: var(--text-xs);
  font-family: monospace; overflow-x: auto; max-height: 300px; overflow-y: auto;
  white-space: pre-wrap; word-break: break-all;
}
.code-error { border-left: 3px solid var(--red-500); }
.detail-error {
  font-size: var(--text-sm); color: var(--red-600);
  padding: var(--space-2); background: var(--red-50); border-radius: var(--radius-sm);
}

/* ── 拦截器流程 ── */
.interceptor-flow { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); }
.if-step {
  width: 100%; max-width: 700px;
  padding: var(--space-4); border-radius: var(--radius-md);
  border: 2px solid var(--border-normal);
}
.if-step.request { border-color: var(--blue-300); background: var(--blue-50); }
.if-step.response { border-color: var(--green-300); background: var(--green-50); }
.if-step-head { font-weight: var(--font-bold); font-size: var(--text-base); margin-bottom: var(--space-2); }
.if-step-items { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-1); font-size: var(--text-xs); }
.if-item {
  background: #fff; padding: 3px 10px; border-radius: var(--radius-full);
  color: var(--text-primary); font-family: monospace; white-space: nowrap;
}
.if-arrow { color: var(--text-muted); font-size: var(--text-xs); }
.if-connector {
  font-size: var(--text-sm); color: var(--text-muted);
  font-weight: var(--font-semibold);
}
</style>
