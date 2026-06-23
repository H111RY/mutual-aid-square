import { auth, db } from '@/cloudbase'

/**
 * 发送短信验证码
 * @param {string} phone 手机号（不加 +86 前缀）
 * @returns {Promise<{ verificationInfo: object }>}
 */
export async function sendSmsCode(phone) {
  const phoneNumber = '+86 ' + phone
  const verificationInfo = await auth.getVerification({ phone_number: phoneNumber })
  return { success: true, verificationInfo }
}

/**
 * 短信验证码登录（自动注册新用户）
 * @param {string} phone 手机号
 * @param {string} code 验证码
 * @param {object} verificationInfo 从 sendSmsCode 获取
 * @returns {Promise<{ user: object }>}
 */
export async function signInWithSms(phone, code, verificationInfo) {
  const phoneNumber = '+86 ' + phone
  const loginState = await auth.signInWithSms({
    verificationInfo,
    verificationCode: code,
    phoneNum: phoneNumber
  })
  return { user: loginState.user }
}

/**
 * 获取当前登录用户资料
 * @returns {Promise<object|null>}
 */
export async function fetchProfile(uid) {
  const { data } = await db.collection('users').where({ uid }).get()
  if (data.length === 0) return null
  const doc = data[0]
  return {
    id: uid,
    nickname: doc.nickname || '',
    avatar: doc.avatar || '',
    building: doc.building || '',
    phone: doc.phone || ''
  }
}

/**
 * 更新/创建用户资料
 * @param {object} data - { nickname, building, avatar, phone }
 */
export async function updateProfile(data) {
  const loginState = await auth.getLoginState()
  if (!loginState) throw new Error('未登录')

  const uid = loginState.user.uid
  const { data: docs } = await db.collection('users').where({ uid }).get()

  if (docs.length > 0) {
    await db.collection('users').doc(docs[0]._id).update(data)
  } else {
    await db.collection('users').add({ uid, phone: '', nickname: '', avatar: '', building: '', ...data })
  }

  return { success: true }
}
