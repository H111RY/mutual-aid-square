import { getUserId, AV } from '@/leancloud'

/**
 * 获取用户资料
 * @param {string} uid
 * @returns {Promise<object|null>}
 */
export async function fetchProfile(uid) {
  const query = new AV.Query('users')
  query.equalTo('uid', uid)
  const doc = await query.first()
  if (!doc) return null
  return {
    id: uid,
    nickname: doc.get('nickname') || '',
    avatar: doc.get('avatar') || '',
    building: doc.get('building') || '',
    phone: doc.get('phone') || ''
  }
}

/**
 * 更新/创建用户资料
 * @param {object} data - { nickname, building, avatar, phone }
 */
export async function updateProfile(data) {
  const uid = getUserId()
  if (!uid) throw new Error('未登录')

  const query = new AV.Query('users')
  query.equalTo('uid', uid)
  const doc = await query.first()

  if (doc) {
    doc.set(data)
    await doc.save()
  } else {
    const obj = new AV.Object('users')
    obj.set({ uid, phone: '', nickname: '', avatar: '', building: '', ...data })
    await obj.save()
  }

  return { success: true }
}
