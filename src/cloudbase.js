import cloudbase from '@cloudbase/js-sdk'

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

export const app = new Proxy({}, {
  get(_, prop) { ensureInit(); return _app[prop] }
})

export const auth = new Proxy({}, {
  get(_, prop) { ensureInit(); return _auth[prop].bind(_auth) }
})

export const db = new Proxy({}, {
  get(_, prop) { ensureInit(); return _db[prop].bind(_db) }
})

export { _ }

export function isLoggedIn() {
  try {
    ensureInit()
    return _auth.hasLoginState()
  } catch {
    return false
  }
}

export async function getCurrentUser() {
  try {
    ensureInit()
    const state = await _auth.getLoginState()
    return state?.user || null
  } catch {
    return null
  }
}

export default app
