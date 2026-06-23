import axios from 'axios'
import { useAppStore } from '@/stores/app'

/**
 * 核心 HTTP 客户端
 *
 * 职责：
 *   请求拦截 — 请求 ID / 全局 Loading
 *   响应拦截 — 数据解包 / 错误归一化
 *   请求去重 — 相同请求并发时复用 Promise
 *   自动重试 — 网络错误指数退避重试（最多 2 次）
 *
 * 注：LeanCloud 管理自己的认证，此 http 实例仅用于非 AV 的 API 调用
 */

/* ==================================================================
   ── Axios 实例 ──
   ================================================================== */
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

/* ==================================================================
   ── 请求去重（相同 GET 请求复用）──
   ================================================================== */
const pendingRequests = new Map()

function requestKey(config) {
  return `${config.method}_${config.url}_${JSON.stringify(config.params || {})}`
}

function removePending(config) {
  const key = requestKey(config)
  pendingRequests.delete(key)
}

/* ==================================================================
   ── 请求拦截器 ──
   ================================================================== */

http.interceptors.request.use((config) => {
  config.__requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  config.__startTime = Date.now()

  if (config.__showLoading !== false) {
    try {
      const app = useAppStore()
      app.startLoading()
      config.__didStartLoading = true
    } catch { /* store 未初始化 */ }
  }

  if (config.method === 'get' && config.__dedup !== false) {
    const key = requestKey(config)
    if (pendingRequests.has(key)) {
      const controller = new AbortController()
      config.signal = controller.signal
      controller.abort()
      console.warn(`[HTTP] 重复请求已拦截: ${key}`)
    }
    pendingRequests.set(key, config)
  }

  return config
})

/* ==================================================================
   ── 响应拦截器 ──
   ================================================================== */

http.interceptors.response.use(
  (res) => {
    removePending(res.config)
    if (res.config.__didStartLoading) {
      try { useAppStore().stopLoading() } catch {}
    }
    res.__duration = Date.now() - res.config.__startTime
    return res.data
  },

  (err) => {
    if (err.config) {
      removePending(err.config)
      if (err.config.__didStartLoading) {
        try { useAppStore().stopLoading() } catch {}
      }
    }

    if (axios.isCancel(err)) return Promise.resolve(null)

    const normalized = normalizeError(err)

    if (shouldRetry(err) && (err.config.__retryCount || 0) < 2) {
      err.config.__retryCount = (err.config.__retryCount || 0) + 1
      const delay = Math.pow(2, err.config.__retryCount) * 500
      return new Promise((resolve) => setTimeout(() => resolve(http(err.config)), delay))
    }

    return Promise.reject(normalized)
  }
)

function normalizeError(err) {
  const status = err.response?.status || 0
  return {
    status,
    message: err.response?.data?.message || err.message || '网络异常',
    code: err.response?.data?.code || err.code || 'UNKNOWN',
    data: err.response?.data || null,
    config: err.config || null,
    raw: err
  }
}

function shouldRetry(err) {
  if (!err.config) return false
  if (err.config.method !== 'get') return false
  if (err.response?.status >= 400 && err.response?.status < 500) return false
  return true
}

function cancelAll(reason = '页面切换') {
  pendingRequests.forEach((config) => {
    const controller = new AbortController()
    config.signal = controller.signal
    controller.abort(reason)
  })
  pendingRequests.clear()
}

function pendingCount() {
  return pendingRequests.size
}

export { http, cancelAll, pendingCount }
export default http
