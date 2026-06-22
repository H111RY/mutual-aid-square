import http from './http';

const USE_MOCK = true;

/**
 * 发送短信验证码
 * @param {string} phone 手机号
 * @returns {Promise<{ success: boolean }>}
 */
export function sendSmsCode(phone) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true }), 500);
    });
  }
  return http.post('/auth/sms-code', { phone });
}

/**
 * 手机号 + 验证码登录
 * @param {string} phone 手机号
 * @param {string} code  6 位验证码
 * @returns {Promise<{ token: string, user: object }>}
 */
export function loginByPhone(phone, code) {
  if (USE_MOCK) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (code === '123456') {
          resolve({
            token: 'mock_token_' + Date.now(),
            user: {
              id: 'u_001',
              nickname: '邻里用户',
              avatar: '',
              building: '1号楼',
              role: 'resident'
            }
          });
        } else {
          reject({ message: '验证码错误' });
        }
      }, 800);
    });
  }
  return http.post('/auth/login/phone', { phone, code });
}
