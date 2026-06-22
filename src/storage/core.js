/**
 * 核心存储抽象层
 *
 * 提供类型安全的 localStorage / sessionStorage 封装，支持：
 *   - JSON 自动序列化/反序列化
 *   - TTL 过期机制
 *   - 命名空间隔离（默认前缀 square_）
 *   - 配额溢出处理
 *   - 默认值回退
 *   - 跨标签页同步（storage 事件）
 */

const NS = 'square_';
const PREFIX_RE = /^square_/;

/* ==================================================================
   ── 底层读写 ──
   ================================================================== */

function rawGet(store, key) {
  try { return store.getItem(NS + key); } catch { return null; }
}

function rawSet(store, key, value) {
  try { store.setItem(NS + key, value); return true; }
  catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.error(`[Storage] 配额已满，无法写入 "${key}"`);
      return false;
    }
    throw e;
  }
}

function rawRemove(store, key) {
  try { store.removeItem(NS + key); } catch {}
}

/* ==================================================================
   ── 公共 API ──
   ================================================================== */

/**
 * 读取值
 *
 * @param {string} key          — 存储键（自动加 square_ 前缀）
 * @param {string} [engine='local'] — 'local' | 'session'
 * @returns {any} 反序列化后的值，不存在或过期返回 null
 */
export function getItem(key, engine = 'local') {
  const store = engine === 'session' ? sessionStorage : localStorage;
  const raw = rawGet(store, key);
  if (raw === null) return null;

  try {
    const parsed = JSON.parse(raw);

    // TTL 检查（包装格式 { __t: timestamp, __x: expiry_ms, __v: value }）
    if (parsed && typeof parsed === 'object' && '__v' in parsed && '__x' in parsed) {
      if (parsed.__x > 0 && Date.now() - parsed.__t > parsed.__x) {
        rawRemove(store, key);
        return null;
      }
      return parsed.__v;
    }

    return parsed;
  } catch {
    return raw;  // 非 JSON 格式直接返回原始字符串
  }
}

/**
 * 写入值
 *
 * @param {string} key
 * @param {any}    value
 * @param {object} [opts]
 * @param {number} [opts.ttl]        — 过期时间（毫秒），0 或省略表示永不过期
 * @param {string} [opts.engine='local']
 * @returns {boolean} 是否写入成功
 */
export function setItem(key, value, opts = {}) {
  const { ttl = 0, engine = 'local' } = opts;
  const store = engine === 'session' ? sessionStorage : localStorage;

  let payload;
  if (ttl > 0) {
    payload = JSON.stringify({ __t: Date.now(), __x: ttl, __v: value });
  } else {
    payload = JSON.stringify(value);
  }

  return rawSet(store, key, payload);
}

/**
 * 删除
 */
export function removeItem(key, engine = 'local') {
  const store = engine === 'session' ? sessionStorage : localStorage;
  rawRemove(store, key);
}

/**
 * 获取所有 square_ 开头的键
 */
export function getAllKeys(engine = 'local') {
  const store = engine === 'session' ? sessionStorage : localStorage;
  const keys = [];
  try {
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i);
      if (k && PREFIX_RE.test(k)) keys.push(k.replace(PREFIX_RE, ''));
    }
  } catch {}
  return keys;
}

/**
 * 清空所有 square_ 前缀的键
 */
export function clearAll(engine = 'local') {
  const keys = getAllKeys(engine);
  keys.forEach(k => removeItem(k, engine));
}

/**
 * 获取存储使用量估算
 */
export async function getQuota() {
  if ('storage' in navigator && navigator.storage.estimate) {
    const { usage, quota } = await navigator.storage.estimate();
    return {
      used: usage || 0,
      total: quota || 0,
      usedMB: ((usage || 0) / 1024 / 1024).toFixed(1),
      totalMB: ((quota || 0) / 1024 / 1024).toFixed(1),
      percent: quota ? ((usage / quota) * 100).toFixed(1) : 0
    };
  }
  return null;
}

/**
 * 订阅跨标签页同步
 *
 * @param {Function} callback — ({ key, oldValue, newValue, engine }) => void
 * @returns {Function} 取消订阅函数
 */
export function onStorageChange(callback) {
  function handler(e) {
    if (!e.key || !PREFIX_RE.test(e.key)) return;
    callback({
      key: e.key.replace(PREFIX_RE, ''),
      oldValue: tryParse(e.oldValue),
      newValue: tryParse(e.newValue),
      engine: e.storageArea === sessionStorage ? 'session' : 'local'
    });
  }
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

function tryParse(v) {
  if (v === null || v === undefined) return null;
  try { return JSON.parse(v); } catch { return v; }
}
