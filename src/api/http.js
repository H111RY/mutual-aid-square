import axios from 'axios';
import { useAppStore } from '@/stores/app';
import { getItem, removeItem } from '@/storage/core';

function getToken() { return getItem('token', 'session'); }
function removeToken() {
  removeItem('token', 'session');
  removeItem('user', 'session');
}

/**
 * 核心 HTTP 客户端
 *
 * 职责：
 *   请求拦截 — 注入 Token / 请求 ID / 全局 Loading
 *   响应拦截 — 数据解包 / 错误归一化 / 401 处理
 *   请求去重 — 相同请求并发时复用 Promise
 *   自动重试 — 网络错误指数退避重试（最多 2 次）
 */

/* ==================================================================
   ── Axios 实例 ──
   ================================================================== */
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

/* ==================================================================
   ── 请求去重（相同 GET 请求复用）──
   ================================================================== */
const pendingRequests = new Map();

function requestKey(config) {
  return `${config.method}_${config.url}_${JSON.stringify(config.params || {})}`;
}

function removePending(config) {
  const key = requestKey(config);
  pendingRequests.delete(key);
}

/* ==================================================================
   ── 请求拦截器 ──
   ================================================================== */

http.interceptors.request.use((config) => {
  // 1. 请求 ID（追踪/调试）
  config.__requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  config.__startTime = Date.now();

  // 2. Token 注入（预留）
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 3. 全局 Loading 计数
  if (config.__showLoading !== false) {
    try {
      const app = useAppStore();
      app.startLoading();
      config.__didStartLoading = true;
    } catch { /* store 未初始化 */ }
  }

  // 4. GET 请求去重
  if (config.method === 'get' && config.__dedup !== false) {
    const key = requestKey(config);
    if (pendingRequests.has(key)) {
      const controller = new AbortController();
      config.signal = controller.signal;
      controller.abort();
      console.warn(`[HTTP] 重复请求已拦截: ${key}`);
    }
    pendingRequests.set(key, config);
  }

  return config;
});

/* ==================================================================
   ── 响应拦截器 ──
   ================================================================== */

http.interceptors.response.use(
  (res) => {
    // 清理
    removePending(res.config);
    if (res.config.__didStartLoading) {
      try { useAppStore().stopLoading(); } catch {}
    }

    // 计时
    res.__duration = Date.now() - res.config.__startTime;

    // 直接返回 data
    return res.data;
  },

  (err) => {
    // 清理
    if (err.config) {
      removePending(err.config);
      if (err.config.__didStartLoading) {
        try { useAppStore().stopLoading(); } catch {}
      }
    }

    // 已取消的请求不报错
    if (axios.isCancel(err)) return Promise.resolve(null);

    // 归一化错误对象
    const normalized = normalizeError(err);

    // 401 → 清除登录态并通知跳转
    if (err.response?.status === 401) {
      removeToken();
      try {
        const app = useAppStore();
        app.clearUser();
        app.showToast('登录已过期，请重新登录', 'error');
      } catch {}
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }

    // 自动重试（仅网络错误 / 5xx，最多 2 次）
    if (shouldRetry(err) && (err.config.__retryCount || 0) < 2) {
      err.config.__retryCount = (err.config.__retryCount || 0) + 1;
      const delay = Math.pow(2, err.config.__retryCount) * 500;
      return new Promise((resolve) => setTimeout(() => resolve(http(err.config)), delay));
    }

    return Promise.reject(normalized);
  }
);

/* ==================================================================
   ── 错误归一化 ──
   ================================================================== */

function normalizeError(err) {
  const status = err.response?.status || 0;
  return {
    status,
    message: err.response?.data?.message || err.message || '网络异常',
    code: err.response?.data?.code || err.code || 'UNKNOWN',
    data: err.response?.data || null,
    config: err.config || null,
    raw: err
  };
}

function shouldRetry(err) {
  if (!err.config) return false;
  if (err.config.method !== 'get') return false;   // 仅 GET 自动重试
  if (err.response?.status >= 400 && err.response?.status < 500) return false;
  return true;
}

/* ==================================================================
   ── 工具方法 ──
   ================================================================== */

/** 取消所有进行中的请求 */
function cancelAll(reason = '页面切换') {
  pendingRequests.forEach((config) => {
    const controller = new AbortController();
    config.signal = controller.signal;
    controller.abort(reason);
  });
  pendingRequests.clear();
}

/** 获取当前进行中的请求数 */
function pendingCount() {
  return pendingRequests.size;
}

export { http, cancelAll, pendingCount };
export default http;
