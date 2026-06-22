import { ref, onUnmounted } from 'vue';

/**
 * 模拟 WebSocket — 完全在浏览器中运行
 *
 * 用于实时消息演示，无需后端：
 * - 模拟连接/断开/重连/降级轮询
 * - 模拟心跳 ping/pong
 * - 模拟消息收发延迟（50-500ms）
 * - 可注入故障场景（丢包/延迟/断开）
 * - 提供完整的连接状态机
 */

const CONNECTION_STATES = ['disconnected', 'connecting', 'connected', 'reconnecting', 'fallback'];

export function useSimulatedWebSocket(opts = {}) {
  const {
    connectDelay = 600,
    messageDelay = { min: 80, max: 300 },
    heartbeatInterval = 5000,
    autoStart = false
  } = opts;

  /* ── 状态 ── */
  const connState = ref('disconnected'); // disconnected | connecting | connected | reconnecting | fallback
  const latency = ref(0);
  const reconnectAttempt = ref(0);
  const reconnectDelay = ref(0);
  const heartbeatsSent = ref(0);
  const messagesSent = ref(0);
  const messagesReceived = ref(0);
  const packetsLost = ref(0);
  const connectionDuration = ref(0);
  const isFallbackPolling = ref(false);

  /* ── 事件日志 ── */
  const eventLog = ref([]);

  /* ── 消息列表 ── */
  const messages = ref([]);

  /* ── 处理器 ── */
  let messageHandler = null;
  let statusHandler = null;

  /* ── 定时器 ── */
  let heartbeatTimer = null;
  let pollTimer = null;
  let reconnectTimer = null;
  let durationTimer = null;
  let destroyed = false;

  /* ── 模拟延迟 ── */
  function randomDelay() {
    return messageDelay.min + Math.random() * (messageDelay.max - messageDelay.min);
  }

  function simDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms || randomDelay()));
  }

  /* ── 写日志 ── */
  function log(type, detail = '', level = 'info') {
    const entry = {
      id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      type,
      detail,
      level
    };
    eventLog.value.unshift(entry);
    if (eventLog.value.length > 200) eventLog.value.pop();
    return entry;
  }

  /* ── 连接 ── */
  function setState(state) {
    connState.value = state;
    isFallbackPolling.value = state === 'fallback';
    if (statusHandler) statusHandler({ state, attempt: reconnectAttempt.value, delay: reconnectDelay.value });
  }

  async function connect() {
    if (destroyed) return;
    if (connState.value === 'connected' || connState.value === 'connecting') return;

    setState('connecting');
    log('ws', '正在建立 WebSocket 连接...', 'info');
    reconnectAttempt.value = 0;

    await simDelay(connectDelay);

    if (destroyed) return;

    // 连接成功
    setState('connected');
    reconnectAttempt.value = 0;
    log('ws', 'WebSocket 连接已建立 ✓', 'success');
    latency.value = Math.floor(Math.random() * 40) + 10;
    messagesSent.value = 0;
    messagesReceived.value = 0;
    packetsLost.value = 0;

    // 启动心跳
    startHeartbeat();
    // 启动时长计时
    startDurationTimer();
    // 停止轮询
    stopPolling();
  }

  /* ── 断开 ── */
  function disconnect() {
    stopHeartbeat();
    stopDurationTimer();
    stopPolling();
    clearTimeout(reconnectTimer);
    setState('disconnected');
    log('ws', 'WebSocket 连接已断开', 'error');
  }

  /* ── 心跳 ── */
  function startHeartbeat() {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      if (connState.value === 'connected') {
        heartbeatsSent.value++;
        latency.value = Math.floor(Math.random() * 35) + 8;
        log('ping', `心跳 ping #${heartbeatsSent.value} → pong ${latency.value}ms`, 'info');
      }
    }, heartbeatInterval);
  }

  function stopHeartbeat() {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }

  /* ── 连接时长 ── */
  function startDurationTimer() {
    stopDurationTimer();
    connectionDuration.value = 0;
    durationTimer = setInterval(() => {
      if (connState.value === 'connected') {
        connectionDuration.value++;
      }
    }, 1000);
  }

  function stopDurationTimer() {
    clearInterval(durationTimer);
    durationTimer = null;
  }

  /* ── 重连 ── */
  function simulateReconnect() {
    if (connState.value !== 'connected') return;
    stopHeartbeat();
    stopDurationTimer();
    setState('reconnecting');
    reconnectAttempt.value = 1;
    const delay = reconnectDelay.value || 1000;
    log('ws', `连接中断，${delay}ms 后尝试重连（第 ${reconnectAttempt.value} 次）...`, 'warning');

    reconnectTimer = setTimeout(() => {
      if (destroyed) return;
      // 80% 概率重连成功
      if (Math.random() < 0.8 || reconnectAttempt.value >= 3) {
        setState('connected');
        reconnectAttempt.value = 0;
        log('ws', `重连成功 ✓（第 ${reconnectAttempt.value || 1} 次尝试）`, 'success');
        startHeartbeat();
        startDurationTimer();
      } else if (reconnectAttempt.value < 3) {
        reconnectAttempt.value++;
        reconnectDelay.value = Math.min(reconnectDelay.value * 2 || 2000, 16000);
        log('ws', `重连失败，${reconnectDelay.value}ms 后再次尝试（第 ${reconnectAttempt.value} 次）`, 'warning');
        reconnectTimer = setTimeout(() => {
          setState('connected');
          reconnectAttempt.value = 0;
          log('ws', '重连成功 ✓', 'success');
          startHeartbeat();
          startDurationTimer();
        }, reconnectDelay.value);
      } else {
        // 降级轮询
        setState('fallback');
        log('ws', '重连 3 次失败，降级为 HTTP 轮询（每 5s）', 'error');
        startPolling();
      }
    }, delay);
  }

  /* ── 降级轮询 ── */
  function startPolling() {
    stopPolling();
    setState('fallback');
    log('poll', '启动降级轮询（每 5 秒）', 'warning');
    pollTimer = setInterval(() => {
      if (destroyed) return;
      latency.value = Math.floor(Math.random() * 120) + 80;
      log('poll', `轮询请求 → 响应 ${latency.value}ms`, 'info');
      // 模拟收到消息
      if (Math.random() < 0.4 && messages.value.length < 20) {
        const msg = generateBotMessage();
        messages.value.push(msg);
        messagesReceived.value++;
        log('recv', `[轮询收到] ${msg.content.slice(0, 30)}`, 'info');
      }
    }, 5000);
    // 立即执行一次
    setTimeout(() => {
      log('poll', '轮询请求 → 无新消息', 'info');
    }, 500);
  }

  function stopPolling() {
    clearInterval(pollTimer);
    pollTimer = null;
    isFallbackPolling.value = false;
  }

  /* ── 发送消息 ── */
  async function sendMessage(content, type = 'text') {
    if (connState.value !== 'connected') {
      log('send', '发送失败：未连接', 'error');
      return null;
    }

    const msg = {
      id: 'msg_' + Date.now(),
      _localId: 'local_' + Math.random().toString(36).slice(2, 8),
      sender_uid: 'me',
      msg_type: type,
      content,
      _status: 'sending',
      created_at: new Date().toISOString()
    };

    messages.value.push(msg);
    messagesSent.value++;
    log('send', `[发送中] ${content.slice(0, 30)}`, 'info');

    // 模拟发送延迟
    await simDelay();

    // 模拟丢包（5% 概率）
    if (Math.random() < 0.05) {
      const idx = messages.value.findIndex(m => m._localId === msg._localId);
      if (idx !== -1) messages.value[idx]._status = 'failed';
      packetsLost.value++;
      log('send', `[发送失败] ${content.slice(0, 30)} — 网络丢包`, 'error');
      return null;
    }

    // 发送成功
    const idx = messages.value.findIndex(m => m._localId === msg._localId);
    if (idx !== -1) {
      messages.value[idx]._status = 'sent';
      messages.value[idx].id = 'msg_' + Date.now();
    }
    log('send', `[已送达] ${content.slice(0, 30)}`, 'success');

    // 模拟对方回复（延迟 300-1500ms）
    setTimeout(() => {
      if (destroyed || connState.value !== 'connected') return;
      const reply = generateBotMessage();
      messages.value.push(reply);
      messagesReceived.value++;
      log('recv', `[新消息] ${reply.content.slice(0, 30)}`, 'info');
      // 已读回执
      if (idx !== -1 && messages.value[idx]) {
        messages.value[idx]._status = 'read';
        log('read', `消息已读: ${content.slice(0, 20)}`, 'info');
      }
    }, 400 + Math.random() * 1200);

    return msg;
  }

  function retryMessage(msg) {
    if (!msg) return;
    const idx = messages.value.findIndex(m => m._localId === msg._localId);
    if (idx !== -1) messages.value[idx]._status = 'sending';
    sendMessage(msg.content, msg.msg_type);
  }

  /* ── 模拟对方消息 ── */
  function generateBotMessage() {
    const bots = [
      { uid: 'u1', nickname: '王阿姨', avatar: '', building: '3号楼' },
      { uid: 'u2', nickname: '李大伯', avatar: '', building: '5号楼2单元' },
      { uid: 'u3', nickname: '社区居委会', avatar: '', building: '服务中心' }
    ];
    const texts = [
      '好的，谢谢你的帮助！',
      '请问明天下午方便吗？',
      '我也遇到了类似的问题，可以一起讨论。',
      '社区通知：明天下午3点有义诊活动。',
      '收到，我确认一下时间安排。',
      '太好了，这样就很方便了！',
      '麻烦发一下具体的位置信息。',
      '我这边还有个问题想请教一下。'
    ];
    const sender = bots[Math.floor(Math.random() * bots.length)];
    return {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      _localId: 'remote_' + Math.random().toString(36).slice(2, 8),
      sender_uid: sender.uid,
      sender,
      msg_type: 'text',
      content: texts[Math.floor(Math.random() * texts.length)],
      _status: 'sent',
      created_at: new Date().toISOString()
    };
  }

  /* ── 注入故障 ── */
  function injectFault(type) {
    switch (type) {
      case 'disconnect':
        disconnect();
        log('fault', '⚡ 故障注入：强制断开连接', 'error');
        break;
      case 'reconnect':
        log('fault', '⚡ 故障注入：模拟网络中断后重连', 'warning');
        simulateReconnect();
        break;
      case 'lag':
        latency.value = Math.floor(Math.random() * 400) + 200;
        log('fault', `⚡ 故障注入：网络延迟飙升 ${latency.value}ms`, 'warning');
        break;
      case 'packetloss':
        packetsLost.value += Math.floor(Math.random() * 3) + 1;
        log('fault', `⚡ 故障注入：模拟丢包（累计 ${packetsLost.value}）`, 'warning');
        break;
      case 'fallback':
        setState('fallback');
        log('fault', '⚡ 故障注入：强制降级为 HTTP 轮询', 'warning');
        startPolling();
        break;
    }
  }

  /* ── 注册处理器 ── */
  function onMessage(fn) { messageHandler = fn; }
  function onStatus(fn) { statusHandler = fn; }

  /* ── 清理 ── */
  function destroy() {
    destroyed = true;
    stopHeartbeat();
    stopDurationTimer();
    stopPolling();
    clearTimeout(reconnectTimer);
    eventLog.value = [];
    messages.value = [];
    setState('disconnected');
  }

  onUnmounted(destroy);

  return {
    // 状态
    connState, latency, reconnectAttempt, reconnectDelay,
    heartbeatsSent, messagesSent, messagesReceived, packetsLost,
    connectionDuration, isFallbackPolling,
    // 数据
    eventLog, messages,
    // 操作
    connect, disconnect, sendMessage, retryMessage,
    simulateReconnect, injectFault,
    // 回调
    onMessage, onStatus,
    // 清理
    destroy
  };
}
