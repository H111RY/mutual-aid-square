import cloudbase from '@cloudbase/js-sdk'

const envId = import.meta.env.VITE_CLOUDBASE_ENV_ID
const region = import.meta.env.VITE_CLOUDBASE_REGION || 'ap-shanghai'

const app = cloudbase.init({ env: envId || '', region })

export const auth = app.auth({ persistence: 'local' })
export const db = app.database()
export const _ = db.command

export function isLoggedIn() {
  return auth.hasLoginState()
}

export async function getCurrentUser() {
  const state = await auth.getLoginState()
  return state?.user || null
}

export { app }
export default app
