<template>
  <div class="realtime-page">
    <!-- ====== 顶部导航 ====== -->
    <header class="demo-header">
      <BaseButton variant="ghost" size="sm" @click="$router.back()">← 返回</BaseButton>
      <h1 class="demo-title">实时消息</h1>
      <BaseButton variant="secondary" size="sm" round @click="toggleFont">
        {{ square.isLargeFont ? '标准版' : 'A+ 大字版' }}
      </BaseButton>
    </header>

    <div class="demo-body">
      <!-- ================================================================
           架构概览
           ================================================================ -->
      <section class="demo-section">
        <h2 class="section-title">WebSocket 实时消息架构</h2>
        <BaseCard flat>
          <div class="arch-diagram">
            <div class="arch-row">
              <div class="arch-box client-box">
                <div class="arch-label">浏览器客户端</div>
                <div class="arch-detail">WebSocket API<br>EventSource 降级</div>
              </div>
              <div class="arch-arrow">
                <div class="arrow-line"></div>
                <div class="arrow-head">→</div>
                <div class="arrow-label">ws:// 升级握手</div>
              </div>
              <div class="arch-box server-box">
                <div class="arch-label">WebSocket Server</div>
                <div class="arch-detail">心跳 30s · 鉴权 Token<br>消息路由 · 广播</div>
              </div>
              <div class="arch-arrow">
                <div class="arrow-line"></div>
                <div class="arrow-head">←</div>
                <div class="arrow-label">实时推送</div>
              </div>
              <div class="arch-box client-box">
                <div class="arch-label">消息处理</div>
                <div class="arch-detail">乐观更新 · 已读标记<br>IndexedDB 缓存</div>
              </div>
            </div>
            <!-- 降级路径 -->
            <div class="fallback-path">
              <span class="fallback-tag">降级路径</span>
              <div class="dashed-arrow">- - - →</div>
              <div class="arch-box poll-box">
                <div class="arch-label">HTTP 轮询 (5s)</div>
                <div class="arch-detail">GET /api/chat/poll<br>增量拉取消息</div>
              </div>
            </div>
          </div>
        </BaseCard>
      </section>

      <!-- ================================================================
           连接状态机
           ================================================================ -->
      <section class="demo-section">
        <h2 class="section-title">连接状态机</h2>
        <BaseCard flat>
          <div class="state-machine">
            <div class="state-flow">
              <div v-for="(s, i) in states" :key="s.key" style="display:flex;align-items:center;gap:0">
                <div
                  :class="['state-node', { active: ws.connState.value === s.key }]"
                  :style="{ borderColor: s.color, background: ws.connState.value === s.key ? s.color + '18' : 'transparent' }"
                >
                  <span class="state-icon">{{ s.icon }}</span>
                  <span class="state-name">{{ s.label }}</span>
                  <span class="state-desc">{{ s.desc }}</span>
                </div>
                <div v-if="i < states.length - 1" class="state-connector">
                  <span class="connector-arrow">→</span>
                </div>
              </div>
            </div>
            <!-- 当前状态大指示 -->
            <div class="current-state" :style="{ color: currentStateDef.color }">
              <span class="current-icon">{{ currentStateDef.icon }}</span>
              <span class="current-label">{{ currentStateDef.label }}</span>
              <span class="current-duration" v-if="ws.connState.value === 'connected'">
                已连接 {{ fmtDuration(ws.connectionDuration.value) }}
              </span>
            </div>
          </div>
        </BaseCard>
      </section>

      <!-- ================================================================
           实时模拟聊天 + 控制面板
           ================================================================ -->
      <section class="demo-section">
        <h2 class="section-title">实时消息模拟</h2>

        <div class="realtime-layout">
          <!-- 左侧：聊天区 -->
          <div class="chat-panel">
            <BaseCard flat>
              <template #header>
                <div class="chat-panel-header">
                  <span>💬 模拟聊天</span>
                  <span :class="['conn-dot', ws.connState.value]"></span>
                </div>
              </template>

              <!-- 消息列表 -->
              <div class="msg-list" ref="msgListRef">
                <div v-if="ws.messages.value.length === 0" class="empty-msgs">
                  <BaseEmpty icon="💬" desc="连接后即可发送消息" />
                </div>
                <div
                  v-for="msg in ws.messages.value"
                  :key="msg._localId || msg.id"
                  :class="['msg-row', { mine: msg.sender_uid === 'me' }]"
                >
                  <div v-if="msg.sender_uid !== 'me'" class="msg-sender">{{ msg.sender?.nickname || '用户' }}</div>
                  <div :class="['msg-bubble', { mine: msg.sender_uid === 'me' }]">
                    <p class="msg-text">{{ msg.content }}</p>
                    <span :class="['msg-status', msg._status]">
                      <template v-if="msg._status === 'sending'">⏳ 发送中</template>
                      <template v-else-if="msg._status === 'sent'">✓ 已送达</template>
                      <template v-else-if="msg._status === 'read'">✓✓ 已读</template>
                      <template v-else-if="msg._status === 'failed'">
                        <span class="retry-link" @click="ws.retryMessage(msg)">⚠️ 重发</span>
                      </template>
                    </span>
                  </div>
                </div>
              </div>

              <!-- 输入栏 -->
              <template #footer>
                <div class="chat-input-row">
                  <input
                    v-model="inputText"
                    class="chat-input"
                    placeholder="输入消息..."
                    :disabled="ws.connState.value !== 'connected'"
                    @keyup.enter="sendMsg"
                  />
                  <BaseButton
                    variant="primary"
                    size="sm"
                    :disabled="ws.connState.value !== 'connected' || !inputText.trim()"
                    @click="sendMsg"
                  >发送</BaseButton>
                </div>
              </template>
            </BaseCard>
          </div>

          <!-- 右侧：控制面板 -->
          <div class="control-panel">
            <!-- 连接控制 -->
            <BaseCard flat style="margin-bottom:16px">
              <template #header><h4 style="margin:0;font-size:var(--text-lg)">连接控制</h4></template>
              <div class="ctrl-buttons">
                <BaseButton
                  v-if="ws.connState.value === 'disconnected'"
                  variant="primary" block @click="ws.connect()"
                >🔌 建立连接</BaseButton>
                <BaseButton
                  v-else-if="ws.connState.value === 'connecting'"
                  variant="primary" block loading
                >连接中...</BaseButton>
                <BaseButton
                  v-else
                  variant="danger" block @click="ws.disconnect()"
                >断开连接</BaseButton>
              </div>
              <div class="metrics-row">
                <div class="metric">
                  <span class="metric-value">{{ ws.latency.value }}ms</span>
                  <span class="metric-label">延迟</span>
                </div>
                <div class="metric">
                  <span class="metric-value">{{ ws.heartbeatsSent.value }}</span>
                  <span class="metric-label">心跳</span>
                </div>
                <div class="metric">
                  <span class="metric-value">{{ ws.reconnectAttempt.value }}</span>
                  <span class="metric-label">重连次数</span>
                </div>
              </div>
            </BaseCard>

            <!-- 故障注入 -->
            <BaseCard flat style="margin-bottom:16px">
              <template #header><h4 style="margin:0;font-size:var(--text-lg)">⚡ 故障注入</h4></template>
              <div class="fault-grid">
                <BaseButton variant="outline" size="sm" @click="ws.injectFault('reconnect')">网络中断</BaseButton>
                <BaseButton variant="outline" size="sm" @click="ws.injectFault('lag')">延迟飙升</BaseButton>
                <BaseButton variant="outline" size="sm" @click="ws.injectFault('packetloss')">模拟丢包</BaseButton>
                <BaseButton variant="outline" size="sm" @click="ws.injectFault('fallback')">降级轮询</BaseButton>
              </div>
            </BaseCard>

            <!-- 统计面板 -->
            <BaseCard flat>
              <template #header><h4 style="margin:0;font-size:var(--text-lg)">实时统计</h4></template>
              <div class="stats-list">
                <div class="stat-row">
                  <span>发送消息</span><span class="stat-val">{{ ws.messagesSent.value }}</span>
                </div>
                <div class="stat-row">
                  <span>接收消息</span><span class="stat-val">{{ ws.messagesReceived.value }}</span>
                </div>
                <div class="stat-row">
                  <span>丢包数</span><span class="stat-val" :style="{color: ws.packetsLost.value > 0 ? 'var(--red-500)' : ''}">{{ ws.packetsLost.value }}</span>
                </div>
                <div class="stat-row">
                  <span>心跳次数</span><span class="stat-val">{{ ws.heartbeatsSent.value }}</span>
                </div>
                <div class="stat-row">
                  <span>连接时长</span><span class="stat-val">{{ fmtDuration(ws.connectionDuration.value) }}</span>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>
      </section>

      <!-- ================================================================
           消息状态流转
           ================================================================ -->
      <section class="demo-section">
        <h2 class="section-title">消息状态流转</h2>
        <BaseCard flat>
          <div class="msg-flow">
            <div v-for="(s, i) in msgStates" :key="s.key" style="display:flex;align-items:center;gap:0">
              <div :class="['msg-state-node', s.key]">
                <span class="state-icon-lg">{{ s.icon }}</span>
                <span class="state-name-sm">{{ s.label }}</span>
                <span class="state-desc-sm">{{ s.desc }}</span>
              </div>
              <div v-if="i < msgStates.length - 1" class="state-connector">
                <span class="connector-arrow">→</span>
              </div>
            </div>
          </div>
        </BaseCard>
      </section>

      <!-- ================================================================
           事件日志
           ================================================================ -->
      <section class="demo-section">
        <h2 class="section-title">实时事件日志</h2>
        <BaseCard flat>
          <div class="log-header">
            <span>事件记录（最新在前）</span>
            <BaseButton variant="ghost" size="sm" @click="ws.eventLog.value = []">清空</BaseButton>
          </div>
          <div class="log-list" ref="logRef">
            <div
              v-for="entry in ws.eventLog.value"
              :key="entry.id"
              :class="['log-entry', entry.level]"
            >
              <span class="log-time">{{ entry.time }}</span>
              <span :class="['log-tag', entry.type]">{{ entry.type }}</span>
              <span class="log-detail">{{ entry.detail }}</span>
            </div>
            <div v-if="ws.eventLog.value.length === 0" class="log-empty">
              暂无事件，点击「建立连接」开始
            </div>
          </div>
        </BaseCard>
      </section>
    </div>

    <div class="safe-bottom"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useSquareStore } from '@/stores/square';
import { useSimulatedWebSocket } from '@/composables/useSimulatedWebSocket';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseEmpty from '@/components/ui/BaseEmpty.vue';

const square = useSquareStore();

function toggleFont() { square.toggleFontMode(); }

/* ── 模拟 WebSocket ── */
const ws = useSimulatedWebSocket({
  connectDelay: 800,
  heartbeatInterval: 4000,
  autoStart: false
});

/* ── 状态机定义 ── */
const states = [
  { key: 'disconnected', label: '断开', icon: '⚫', desc: '未建立连接', color: '#999' },
  { key: 'connecting',   label: '连接中', icon: '🟡', desc: 'TCP 握手 + 升级', color: '#F5A623' },
  { key: 'connected',    label: '已连接', icon: '🟢', desc: '全双工通信', color: '#2E7D32' },
  { key: 'reconnecting', label: '重连中', icon: '🟠', desc: '指数退避 1s→16s', color: '#E65100' },
  { key: 'fallback',     label: '降级轮询', icon: '🔵', desc: 'HTTP 5s 轮询', color: '#1565C0' }
];

const currentStateDef = computed(() =>
  states.find(s => s.key === ws.connState.value) || states[0]
);

/* ── 消息状态流 ── */
const msgStates = [
  { key: 'sending',  icon: '⏳', label: '发送中', desc: '乐观插入本地列表' },
  { key: 'sent',     icon: '✓', label: '已送达', desc: '服务端确认接收' },
  { key: 'delivered',icon: '✓✓', label: '已投递', desc: '推送到对方设备' },
  { key: 'read',     icon: '👁', label: '已读', desc: '对方已查看' },
  { key: 'failed',   icon: '⚠️', label: '失败', desc: '可点击重试' }
];

/* ── 聊天输入 ── */
const inputText = ref('');
const msgListRef = ref(null);
const logRef = ref(null);

function sendMsg() {
  const text = inputText.value.trim();
  if (!text || ws.connState.value !== 'connected') return;
  ws.sendMessage(text);
  inputText.value = '';
  nextTick(() => scrollMsgBottom());
}

function scrollMsgBottom() {
  nextTick(() => {
    const el = msgListRef.value;
    if (el) el.scrollTop = el.scrollHeight;
  });
}

// 新消息自动滚底
watch(() => ws.messages.value.length, () => scrollMsgBottom());

/* ── 时间格式化 ── */
function fmtDuration(sec) {
  if (sec < 60) return sec + 's';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + 'm' + s + 's';
}

/* ── 初始化 ── */
onMounted(() => {
  // 自动连接展示效果
  setTimeout(() => ws.connect(), 500);
});
</script>

<style scoped>
.realtime-page { min-height: 100vh; background: var(--bg-page); padding-bottom: 80px; }

.demo-header {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  height: var(--header-height); padding: 0 var(--space-4);
  background: var(--bg-card); border-bottom: 1px solid var(--border-light);
}
.demo-title { font-size: var(--text-xl); font-weight: var(--font-bold); margin: 0; }

.demo-body { max-width: 960px; margin: 0 auto; padding: var(--space-4); }

.section-title {
  font-size: var(--text-2xl); font-weight: var(--font-bold);
  margin: 0 0 var(--space-4); color: var(--text-primary);
}

/* ====== 架构图 ====== */
.arch-diagram { padding: var(--space-4); }
.arch-row {
  display: flex; align-items: center; justify-content: center;
  gap: var(--space-2); flex-wrap: wrap;
}
.arch-box {
  border: 2px solid var(--border-normal); border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4); text-align: center;
  min-width: 120px;
}
.client-box { border-color: var(--brand-400); background: var(--brand-50); }
.server-box { border-color: var(--green-500); background: var(--green-50); }
.poll-box  { border-color: var(--amber-500); border-style: dashed; background: var(--amber-50); }
.arch-label { font-size: var(--text-sm); font-weight: var(--font-bold); color: var(--text-primary); }
.arch-detail { font-size: var(--text-xs); color: var(--text-muted); margin-top: 4px; }

.arch-arrow { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 60px; }
.arrow-head { font-size: 20px; color: var(--brand-400); line-height: 1; }
.arrow-label { font-size: 10px; color: var(--text-muted); white-space: nowrap; }

.fallback-path {
  display: flex; align-items: center; justify-content: center;
  gap: var(--space-3); margin-top: var(--space-4); padding-top: var(--space-3);
  border-top: 1px dashed var(--border-light);
}
.fallback-tag { font-size: var(--text-xs); color: var(--amber-700); background: var(--amber-50); padding: 2px 8px; border-radius: var(--radius-full); }
.dashed-arrow { color: var(--text-muted); font-size: var(--text-sm); }

/* ====== 状态机 ====== */
.state-machine { padding: var(--space-4); }
.state-flow { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 0; margin-bottom: var(--space-6); }
.state-node {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: var(--space-3) var(--space-4); border: 2px solid var(--border-normal);
  border-radius: var(--radius-md); min-width: 80px; text-align: center;
  transition: all var(--duration-normal);
}
.state-node.active { transform: scale(1.08); box-shadow: var(--shadow-md); }
.state-icon { font-size: 24px; }
.state-name { font-size: var(--text-sm); font-weight: var(--font-bold); }
.state-desc { font-size: 10px; color: var(--text-muted); }
.state-connector { padding: 0 4px; }
.connector-arrow { font-size: 18px; color: var(--text-muted); }

.current-state {
  display: flex; align-items: center; justify-content: center; gap: var(--space-2);
  font-size: var(--text-xl); font-weight: var(--font-bold); padding: var(--space-4);
  background: var(--gray-50); border-radius: var(--radius-md);
}
.current-icon { font-size: 28px; }
.current-duration { font-size: var(--text-sm); color: var(--text-muted); font-weight: var(--font-normal); }

/* ====== 聊天 + 控制面板布局 ====== */
.realtime-layout {
  display: grid; grid-template-columns: 1fr 300px; gap: var(--space-4);
}
@media (max-width: 800px) {
  .realtime-layout { grid-template-columns: 1fr; }
}

/* ====== 聊天面板 ====== */
.chat-panel-header {
  display: flex; align-items: center; justify-content: space-between;
  font-size: var(--text-lg); font-weight: var(--font-semibold);
}
.conn-dot {
  width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
}
.conn-dot.disconnected  { background: #999; }
.conn-dot.connecting    { background: #F5A623; animation: pulse-dot 0.8s ease-in-out infinite; }
.conn-dot.connected     { background: #2E7D32; }
.conn-dot.reconnecting  { background: #E65100; animation: pulse-dot 0.5s ease-in-out infinite; }
.conn-dot.fallback      { background: #1565C0; animation: pulse-dot 1.5s ease-in-out infinite; }
@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

.msg-list {
  height: 360px; overflow-y: auto; padding: var(--space-3);
  background: var(--gray-50);
}
.empty-msgs { display: flex; align-items: center; justify-content: center; height: 100%; }

.msg-row { margin-bottom: var(--space-3); }
.msg-row.mine { display: flex; flex-direction: column; align-items: flex-end; }
.msg-sender { font-size: var(--text-xs); color: var(--text-muted); margin-bottom: 2px; padding-left: 4px; }

.msg-bubble {
  display: inline-block; max-width: 75%;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--bg-card); box-shadow: var(--shadow-xs);
}
.msg-bubble.mine { background: var(--brand-400); color: #fff; }
.msg-text { font-size: var(--text-base); line-height: var(--leading-relaxed); margin: 0; white-space: pre-wrap; word-break: break-word; }

.msg-status {
  display: block; font-size: 10px; margin-top: 4px; opacity: 0.7; text-align: right;
}
.msg-status.sending { color: var(--text-muted); }
.msg-status.failed { color: var(--red-500); }
.msg-status.read { color: var(--green-500); }
.retry-link { cursor: pointer; text-decoration: underline; }

.chat-input-row {
  display: flex; gap: var(--space-2); padding: var(--space-2) 0;
}
.chat-input {
  flex: 1; padding: var(--space-2) var(--space-3);
  font-size: var(--text-base); font-family: inherit;
  border: 1px solid var(--border-light); border-radius: var(--radius-md);
  outline: none; min-height: var(--tap-min);
}
.chat-input:focus { border-color: var(--brand-400); }

/* ====== 控制面板 ====== */
.ctrl-buttons { margin-bottom: var(--space-4); }

.metrics-row { display: flex; gap: var(--space-2); }
.metric {
  flex: 1; text-align: center; padding: var(--space-2);
  background: var(--gray-50); border-radius: var(--radius-sm);
}
.metric-value { display: block; font-size: var(--text-xl); font-weight: var(--font-bold); color: var(--brand-400); }
.metric-label { display: block; font-size: 11px; color: var(--text-muted); margin-top: 2px; }

.fault-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); }

.stats-list { display: flex; flex-direction: column; gap: var(--space-2); }
.stat-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: var(--text-sm); padding: var(--space-1) 0;
  border-bottom: 1px solid var(--border-light);
}
.stat-val { font-weight: var(--font-bold); color: var(--brand-400); }

/* ====== 消息状态流 ====== */
.msg-flow {
  display: flex; align-items: center; justify-content: center;
  flex-wrap: wrap; padding: var(--space-4);
}
.msg-state-node {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: var(--space-3) var(--space-4); border-radius: var(--radius-md);
  min-width: 80px; text-align: center; border: 2px solid var(--border-light);
}
.msg-state-node.sending  { border-color: var(--text-muted); }
.msg-state-node.sent     { border-color: var(--brand-400); background: var(--brand-50); }
.msg-state-node.delivered{ border-color: var(--blue-500); background: var(--blue-50); }
.msg-state-node.read     { border-color: var(--green-500); background: var(--green-50); }
.msg-state-node.failed   { border-color: var(--red-500); background: var(--red-50); }
.state-icon-lg { font-size: 28px; }
.state-name-sm { font-size: var(--text-sm); font-weight: var(--font-bold); }
.state-desc-sm { font-size: 10px; color: var(--text-muted); }

/* ====== 事件日志 ====== */
.log-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: var(--space-3); font-weight: var(--font-semibold);
}
.log-list {
  max-height: 300px; overflow-y: auto; background: #1a1a2e; border-radius: var(--radius-sm);
  padding: var(--space-3); font-family: 'Courier New', monospace;
}
.log-entry {
  display: flex; gap: var(--space-2); padding: 3px 0;
  font-size: 12px; line-height: 1.6; border-bottom: 1px solid rgba(255,255,255,0.05);
}
.log-entry.success .log-detail { color: #4CAF50; }
.log-entry.error .log-detail { color: #EF5350; }
.log-entry.warning .log-detail { color: #FFB74D; }
.log-entry.info .log-detail { color: #90CAF9; }

.log-time { color: #666; min-width: 70px; flex-shrink: 0; }
.log-tag {
  min-width: 40px; flex-shrink: 0; text-align: center;
  padding: 0 4px; border-radius: 3px; font-size: 10px; font-weight: bold;
}
.log-tag.ws    { background: #1565C0; color: #fff; }
.log-tag.ping  { background: #2E7D32; color: #fff; }
.log-tag.send  { background: #4A90D9; color: #fff; }
.log-tag.recv  { background: #7B1FA2; color: #fff; }
.log-tag.read  { background: #00838F; color: #fff; }
.log-tag.poll  { background: #E65100; color: #fff; }
.log-tag.fault { background: #C62828; color: #fff; }
.log-detail { color: #B0BEC5; flex: 1; }
.log-empty { color: #555; text-align: center; padding: var(--space-8); }

.safe-bottom { height: 60px; }
</style>
