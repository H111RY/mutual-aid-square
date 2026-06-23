import cloudbase from '@cloudbase/js-sdk'
import { getItem, setItem } from '@/storage/core'

let _app = null
let _auth = null
let _db = null
let _ = null
let _userId = null
let _initError = null
let _authPromise = null

function ensureInit() {
  if (_app) return
  if (_initError) throw _initError

  const envId = import.meta.env.VITE_CLOUDBASE_ENV_ID
  if (!envId) {
    _initError = new Error('未配置 VITE_CLOUDBASE_ENV_ID')
    throw _initError
  }

  try {
    const region = import.meta.env.VITE_CLOUDBASE_REGION || 'ap-shanghai'
    _app = cloudbase.init({ env: envId, region })
    _auth = _app.auth({ persistence: 'local' })
    _db = _app.database()
    _ = _db.command
  } catch (err) {
    _initError = err
    throw err
  }
}

/* ==================================================================
   ── 本地后备 UID（CloudBase 不可用时使用）──
   ================================================================== */
function ensureLocalUid() {
  if (_userId) return
  _userId = getItem('local_uid', 'local')
  if (!_userId) {
    _userId = 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
    setItem('local_uid', _userId, 'local')
  }
}

/* ==================================================================
   ── 初始化认证（应用启动时调用一次）──
   ================================================================== */
async function initAuth() {
  // 始终先有本地后备 UID
  ensureLocalUid()

  try {
    ensureInit()

    if (!_auth.hasLoginState()) {
      if (_authPromise) {
        await _authPromise
      } else {
        _authPromise = _auth.signInAnonymously()
        await _authPromise
        _authPromise = null
      }
    }

    if (_auth.hasLoginState()) {
      _userId = _auth.getLoginState().user.uid
    }
  } catch {
    // CloudBase 不可用，保持本地后备 UID
  }

  return _userId
}

/* ==================================================================
   ── 确保认证（数据库操作前调用）──
   ================================================================== */
async function ensureAuth() {
  ensureInit()
  if (_auth.hasLoginState()) return
  if (_authPromise) return _authPromise

  _authPromise = _auth.signInAnonymously().then(() => {
    _authPromise = null
    if (_auth.hasLoginState()) {
      _userId = _auth.getLoginState().user.uid
    }
  }).catch(err => {
    _authPromise = null
    const msg = err.message || err.toString()
    if (msg.includes('network') || msg.includes('Network') || msg.includes('fetch')) {
      throw new Error('网络请求失败，请确认已在 CloudBase 控制台 → 安全配置 → 添加安全域名：' + window.location.origin)
    }
    throw err
  })

  return _authPromise
}

/* ==================================================================
   ── 用户 ID ──
   ================================================================== */
export function getUserId() {
  if (!_userId) ensureLocalUid()
  return _userId
}

export async function requireUserId() {
  await ensureAuth()
  return getUserId()
}

/* ==================================================================
   ── 公开接口 ──
   ================================================================== */
export function isLoggedIn() {
  return true  // 匿名访问始终可用
}

export async function getCurrentUser() {
  try {
    await ensureAuth()
  } catch {}
  return { uid: getUserId() }
}

/* ==================================================================
   ── Proxy 导出（惰性初始化）──
   ================================================================== */
export const app = new Proxy({}, {
  get(_, prop) { ensureInit(); return _app[prop] }
})

export const auth = new Proxy({}, {
  get(_, prop) { ensureInit(); return _auth[prop].bind(_auth) }
})

export const db = new Proxy({}, {
  get(_, prop) { ensureInit(); return _db[prop].bind(_db) }
})

export { _, ensureAuth, initAuth }

export default app
