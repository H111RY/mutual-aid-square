import cloudbase from '@cloudbase/js-sdk'
import { getItem, setItem, removeItem } from '@/storage/core'

let _app = null
let _auth = null
let _db = null
let _ = null
let _initError = null

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
   ── 匿名登录（为数据库操作提供 CloudBase 会话）──
   ================================================================== */
let _authPromise = null

async function ensureAuth() {
  ensureInit()
  if (_auth.hasLoginState()) return
  if (_authPromise) return _authPromise

  _authPromise = _auth.signInAnonymously().then(() => {
    _authPromise = null
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
   ── 测试模式用户身份（手机号 → uid）──
   ================================================================== */
export function getUserId() {
  const phone = getItem('login_phone', 'session')
  return phone ? 'phone_' + phone : null
}

export function setCurrentPhone(phone) {
  setItem('login_phone', phone, 'session')
}

export function clearCurrentPhone() {
  removeItem('login_phone', 'session')
}

export async function requireUserId() {
  await ensureAuth()
  const uid = getUserId()
  if (!uid) throw new Error('请先登录')
  return uid
}

/* ==================================================================
   ── 公开接口 ──
   ================================================================== */
export function isLoggedIn() {
  try {
    return !!getItem('login_phone', 'session')
  } catch {
    return false
  }
}

export async function getCurrentUser() {
  try {
    await ensureAuth()
    return getUserId() ? { uid: getUserId() } : null
  } catch {
    return null
  }
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

export { _, ensureAuth }

export default app
