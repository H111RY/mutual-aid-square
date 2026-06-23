import { db, getUserId, requireUserId } from '@/cloudbase'

/**
 * 发送短信验证码（测试模式：不真实发送，返回成功即可）
 * @param {string} phone 手机号
 * @returns {Promise<{ success: boolean }>}
 */
export async function sendSmsCode(phone) {
  // 测试环境不真实发送短信
  return { success: true }
}

/**
 * 验证码登录（测试模式：验证码固定为 123456）
 * 每个手机号对应独立账号，uid 格式为 phone_手机号
 *
 * @param {string} phone 手机号
 * @param {string} code 验证码
 * @returns {Promise<{ uid: string }>}
 */
export async function signInWithSms(phone, code) {
  if (code !== '123456') {
    throw new Error('验证码错误（测试环境请输入 123456）')
  }
  return { uid: 'phone_' + phone }
}

/**
 * 获取用户资料
 * @param {string} uid
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
  const uid = getUserId()
  if (!uid) throw new Error('未登录')

  const { data: docs } = await db.collection('users').where({ uid }).get()

  if (docs.length > 0) {
    await db.collection('users').doc(docs[0]._id).update(data)
  } else {
    await db.collection('users').add({ uid, phone: '', nickname: '', avatar: '', building: '', ...data })
  }

  return { success: true }
}
