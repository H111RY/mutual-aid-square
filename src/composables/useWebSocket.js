import { ref, onUnmounted } from 'vue';
import { getItem } from '@/storage/core';

/**
 * WebSocket 连接管理
 * - 心跳保活（30s ping / 60s pong 超时）
 * - 指数退避重连（1s → 2s → 4s → 8s → 16s）
 * - 降级轮询（连接失败时自动切换 5s 轮询）
 */
export function useWebSocket(opts = {}) {
  const {
    url = '/ws/chat',
    heartbeatMs = 30000,
    reconnectBase = 1000,
    reconnectMax = 16000,
    pollInterval = 5000
  } = opts;

  const isConnected = ref(false);
  const isFallbackPoll = ref(false);
  const lastError = ref('');

  let ws = null;
  let heartbeatTimer = null;
  let pongTimer = null;
  let reconnectAttempts = 0;
  let reconnectTimer = null;
  let pollTimer = null;
  let destroyed = false;

  const onMessageHandlers = [];
  const onStatusHandlers = [];

  function onMessage(fn) { onMessageHandlers.push(fn); }
  function onStatus(fn) { onStatusHandlers.push(fn); }

  /* ── WebSocket 连接 ── */
  function connect() {
    if (destroyed) return;
    try {
      const token = getItem('token', 'session');
      const wsUrl = `${import.meta.env.VITE_WS_BASE || 'ws://localhost:8080'}${url}?token=${token || ''}`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        isConnected.value = true;
        isFallbackPoll.value = false;
        lastError.value = '';
        reconnectAttempts = 0;
        stopPolling();
        startHeartbeat();
        onStatusHandlers.forEach(fn => fn({ connected: true, fallback: false }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessageHandlers.forEach(fn => fn(data));
        } catch {}
      };

      ws.onclose = () => {
        isConnected.value = false;
        stopHeartbeat();
        if (!destroyed) scheduleReconnect();
      };

      ws.onerror = () => {
        lastError.value = 'WebSocket 连接失败';
        ws?.close();
      };

    } catch (err) {
      lastError.value = err.message || '连接异常';
      startFallbackPolling();
    }
  }

  /* ── 心跳 ── */
  function startHeartbeat() {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
        pongTimer = setTimeout(() => {
          ws?.close();
        }, heartbeatMs * 2);
      }
    }, heartbeatMs);
  }

  function stopHeartbeat() {
    clearInterval(heartbeatTimer);
    clearTimeout(pongTimer);
    heartbeatTimer = null;
    pongTimer = null;
  }

  /* ── 重连（指数退避） ── */
  function scheduleReconnect() {
    if (destroyed) return;
    const delay = Math.min(reconnectBase * Math.pow(2, reconnectAttempts), reconnectMax);
    reconnectAttempts++;
    onStatusHandlers.forEach(fn => fn({ connected: false, fallback: false, reconnecting: true, delay }));
    reconnectTimer = setTimeout(() => {
      connect();
      if (reconnectAttempts >= 4) {
        // 重连 4 次仍失败 → 降级轮询
        startFallbackPolling();
      }
    }, delay);
  }

  /* ── 降级轮询 ── */
  function startFallbackPolling() {
    if (isFallbackPoll.value || destroyed) return;
    isFallbackPoll.value = true;
    onStatusHandlers.forEach(fn => fn({ connected: false, fallback: true }));
    pollTimer = setInterval(() => {
      onStatusHandlers.forEach(fn => fn({ poll: true }));
    }, pollInterval);
  }

  function stopPolling() {
    clearInterval(pollTimer);
    pollTimer = null;
    isFallbackPoll.value = false;
  }

  /* ── 发送消息 ── */
  function send(data) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    }
    return false;
  }

  /* ── 断开 ── */
  function disconnect() {
    destroyed = true;
    stopHeartbeat();
    stopPolling();
    clearTimeout(reconnectTimer);
    ws?.close();
    ws = null;
    isConnected.value = false;
  }

  onUnmounted(disconnect);

  return {
    isConnected, isFallbackPoll, lastError,
    connect, disconnect, send,
    onMessage, onStatus
  };
}
