import AV from 'leancloud-storage'
import { getItem, setItem } from '@/storage/core'

let _initialized = false

function ensureInit() {
  if (_initialized) return

  const appId = import.meta.env.VITE_LEANCLOUD_APP_ID || 'Kf9fWu0MZf9h5qKtVamqqJo3-gzGzoHsz'
  const appKey = import.meta.env.VITE_LEANCLOUD_APP_KEY || 'mBJeuVSCbNkZcrfQCqodJwXr'
  const serverURL = import.meta.env.VITE_LEANCLOUD_SERVER_URL || 'https://kf9fwu0m.lc-cn-n1-shared.com'

  AV.init({ appId, appKey, serverURL })
  _initialized = true
}

/* ==================================================================
   ── 本地后备 UID ──
   ================================================================== */
function ensureLocalUid() {
  let uid = getItem('local_uid', 'local')
  if (!uid) {
    uid = 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
    setItem('local_uid', uid, 'local')
  }
  return uid
}

/* ==================================================================
   ── 自动匿名登录 ──
   ================================================================== */
async function initAuth() {
  ensureInit()

  try {
    const user = await AV.User.loginAnonymously()
    return user.id
  } catch {
    return ensureLocalUid()
  }
}

/* ==================================================================
   ── 获取当前用户 ID ──
   ================================================================== */
export function getUserId() {
  const user = AV.User.current()
  if (user) return user.id
  return ensureLocalUid()
}

/* ==================================================================
   ── 确保已认证（兼容旧的 requireUserId 调用）──
   ================================================================== */
export async function requireUserId() {
  const user = AV.User.current()
  if (user) return user.id
  return initAuth()
}

export { initAuth, AV }
export default AV
